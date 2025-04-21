import { useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// Define the donation form schema
const donationFormSchema = z.object({
  amount: z.coerce.number().min(10, {
    message: "Минимальная сумма доната - 10 ₽",
  }).max(100000, {
    message: "Максимальная сумма доната - 100,000 ₽",
  }),
  name: z.string().optional(),
  message: z.string().optional(),
});

type DonationFormValues = z.infer<typeof donationFormSchema>;

const predefinedAmounts = [100, 300, 500, 1000, 2000, 5000];

const DonationForm = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(500);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Initialize form with default values
  const form = useForm<DonationFormValues>({
    resolver: zodResolver(donationFormSchema),
    defaultValues: {
      amount: 500,
      name: "",
      message: "",
    },
  });

  // Handle amount selection
  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    form.setValue("amount", amount);
  };

  // State for payment method
  const [paymentMethod, setPaymentMethod] = useState<"yoomoney" | "crypto">("yoomoney");

  // Initialize payment mutation
  const initPaymentMutation = useMutation({
    mutationFn: async (data: { amount: number, paymentMethod: "yoomoney" | "crypto" }) => {
      const response = await apiRequest('POST', '/api/donate/init', data);
      return response.json();
    },
    onSuccess: (data) => {
      setPaymentId(data.paymentId);
      setStep(2);
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: "Не удалось инициализировать платеж. Пожалуйста, попробуйте снова.",
        variant: "destructive",
      });
    },
  });

  // Submit donation info mutation
  const submitDonationInfoMutation = useMutation({
    mutationFn: async (data: { paymentId: string; name?: string; message?: string }) => {
      const response = await apiRequest('POST', '/api/donate/update-info', data);
      return response.json();
    },
    onSuccess: () => {
      // After submitting info, process the payment by redirecting to YooMoney
      if (paymentId) {
        checkPaymentStatus(paymentId);
      }
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить информацию о донате. Пожалуйста, попробуйте снова.",
        variant: "destructive",
      });
    },
  });

  // Proceed to payment step
  const handleContinueToPayment = () => {
    const amount = form.getValues("amount");
    if (!amount || amount < 10) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, выберите сумму или введите свою (минимум 10 ₽)",
        variant: "destructive",
      });
      return;
    }
    
    // Initialize payment with selected payment method
    initPaymentMutation.mutate({ amount, paymentMethod });
  };

  // Process payment after submitting the form
  const onSubmit = (values: DonationFormValues) => {
    if (!paymentId) {
      toast({
        title: "Ошибка",
        description: "Идентификатор платежа не найден. Пожалуйста, начните заново.",
        variant: "destructive",
      });
      return;
    }

    // Submit donation info
    submitDonationInfoMutation.mutate({
      paymentId,
      name: values.name,
      message: values.message,
    });
  };

  // Check payment status and redirect if successful
  const checkPaymentStatus = async (paymentId: string) => {
    try {
      const response = await fetch(`/api/donate/status/${paymentId}`);
      const data = await response.json();

      if (data.status === "completed") {
        // Payment successful, redirect to thank you page
        navigate(`/thank-you?amount=${form.getValues("amount")}`);
      } else if (data.status === "pending") {
        if (paymentMethod === "crypto" && data.cryptoAddress) {
          // If crypto payment and we have an address, show it
          toast({
            title: "Оплата криптовалютой",
            description: `Для завершения платежа отправьте необходимую сумму на адрес: ${data.cryptoAddress}`,
          });
          // Redirect to payment URL if provided by cryptobot
          if (data.paymentUrl) {
            window.open(data.paymentUrl, "_blank");
          }
        } else {
          // Redirect to YooMoney for payment
          window.location.href = data.paymentUrl;
        }
      } else {
        // Payment failed
        toast({
          title: "Ошибка платежа",
          description: data.error || "Не удалось обработать платеж. Пожалуйста, попробуйте снова.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось проверить статус платежа. Пожалуйста, попробуйте снова.",
        variant: "destructive",
      });
    }
  };

  // Reset form and go back to step 1
  const handleGoBack = () => {
    setStep(1);
  };

  return (
    <section className="py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {/* Step 1: Amount Selection */}
            {step === 1 && (
              <div className="p-6 sm:p-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">Выберите сумму доната</h3>
                
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {predefinedAmounts.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => handleAmountSelect(amount)}
                      className={`py-3 px-4 rounded-lg text-center font-medium transition focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                        selectedAmount === amount
                          ? "bg-primary/10 hover:bg-primary/15"
                          : "bg-gray-100 hover:bg-primary/10"
                      }`}
                    >
                      {amount} ₽
                    </button>
                  ))}
                </div>
                
                <div className="mb-6">
                  <label htmlFor="customAmount" className="block text-sm font-medium text-gray-700 mb-2">
                    Другая сумма:
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">₽</span>
                    </div>
                    <Input
                      type="number"
                      id="customAmount"
                      placeholder="Введите сумму"
                      min="10"
                      max="100000"
                      className="pl-10"
                      value={selectedAmount !== null ? selectedAmount : ""}
                      onChange={(e) => {
                        const value = e.target.value !== "" ? parseInt(e.target.value, 10) : null;
                        setSelectedAmount(value);
                        if (value !== null) {
                          form.setValue("amount", value);
                        }
                      }}
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <p className="block text-sm font-medium text-gray-700 mb-2">
                    Способ оплаты:
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("yoomoney")}
                      className={`flex items-center justify-center py-3 px-4 rounded-lg text-center font-medium transition focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                        paymentMethod === "yoomoney"
                          ? "bg-primary/10 hover:bg-primary/15"
                          : "bg-gray-100 hover:bg-primary/10"
                      }`}
                    >
                      <img 
                        src="https://yoomoney.ru/i/html-letters/yoomoney-icon.png" 
                        alt="YooMoney" 
                        className="h-5 w-5 mr-2" 
                      />
                      YooMoney
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("crypto")}
                      className={`flex items-center justify-center py-3 px-4 rounded-lg text-center font-medium transition focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                        paymentMethod === "crypto"
                          ? "bg-primary/10 hover:bg-primary/15"
                          : "bg-gray-100 hover:bg-primary/10"
                      }`}
                    >
                      <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23.6 12l-2.2-2.2-1.1-1.1-2.2-2.2-1.1-1.1L14.9 3l-1-1L12 0 9.1 3 7.9 4.1 5.7 6.4 4.5 7.5 2.3 9.8l-1 1L0 12l2.3 2.3 1.1 1.1 2.2 2.2 1.1 1.1 2.2 2.2 1 1.1.1.1.9.9 3 3 2.9-3 1.1-1.1 2.2-2.2 1.1-1.1 2.2-2.2 1.1-1.1.1-.1 1-.9L24 12h-.4zm-7.9 2.3L14.6 15l-2.3 2.3h-.6l-2.4-2.4-1.1-1.1L7 12.7l1.1-1.1 2.3-2.3L12 7.7l3.7 3.7 1.1 1.1-1.1 1.1 1.1 1.1-1.1-1.4z"/>
                      </svg>
                      Криптовалюта
                    </button>
                  </div>
                </div>
                
                <Button 
                  className="w-full py-6"
                  onClick={handleContinueToPayment}
                  disabled={initPaymentMutation.isPending}
                >
                  {initPaymentMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                      Обработка...
                    </>
                  ) : (
                    "Продолжить"
                  )}
                </Button>
              </div>
            )}
            
            {/* Step 2: Payment Information */}
            {step === 2 && (
              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-800">Информация для оплаты</h3>
                  <button 
                    onClick={handleGoBack}
                    className="text-sm text-gray-500 hover:text-primary flex items-center transition"
                  >
                    <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="19" y1="12" x2="5" y2="12"></line>
                      <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                    Назад
                  </button>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Сумма доната:</span>
                    <span className="font-semibold">{form.getValues("amount")} ₽</span>
                  </div>
                </div>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ваше имя (необязательно)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Как вас зовут?" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Сообщение (необязательно)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Хотите что-то написать?" 
                              {...field} 
                              rows={3}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="mt-6">
                      <div className="flex items-center mb-4">
                        {paymentMethod === "yoomoney" ? (
                          <>
                            <div className="h-12 w-12 mr-3">
                              <img 
                                src="https://yoomoney.ru/i/html-letters/yoomoney-icon.png" 
                                alt="YooMoney" 
                                className="h-full w-full object-contain" 
                              />
                            </div>
                            <div>
                              <h4 className="font-medium">YooMoney</h4>
                              <p className="text-sm text-gray-500">Оплата с помощью карты или кошелька</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="h-12 w-12 mr-3 flex items-center justify-center">
                              <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M23.6 12l-2.2-2.2-1.1-1.1-2.2-2.2-1.1-1.1L14.9 3l-1-1L12 0 9.1 3 7.9 4.1 5.7 6.4 4.5 7.5 2.3 9.8l-1 1L0 12l2.3 2.3 1.1 1.1 2.2 2.2 1.1 1.1 2.2 2.2 1 1.1.1.1.9.9 3 3 2.9-3 1.1-1.1 2.2-2.2 1.1-1.1 2.2-2.2 1.1-1.1.1-.1 1-.9L24 12h-.4zm-7.9 2.3L14.6 15l-2.3 2.3h-.6l-2.4-2.4-1.1-1.1L7 12.7l1.1-1.1 2.3-2.3L12 7.7l3.7 3.7 1.1 1.1-1.1 1.1 1.1 1.1-1.1-1.4z"/>
                              </svg>
                            </div>
                            <div>
                              <h4 className="font-medium">Криптовалюта</h4>
                              <p className="text-sm text-gray-500">Оплата через @cryptobot</p>
                            </div>
                          </>
                        )}
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full py-6"
                        disabled={submitDonationInfoMutation.isPending}
                      >
                        {submitDonationInfoMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                            Обработка...
                          </>
                        ) : (
                          "Отправить донат"
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default DonationForm;
