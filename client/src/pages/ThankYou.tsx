import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

const ThankYou = () => {
  const [location] = useLocation();
  const [amount, setAmount] = useState<string>("0");
  const [currentDate, setCurrentDate] = useState<string>("");

  useEffect(() => {
    // Get amount from URL query parameters
    const params = new URLSearchParams(location.split("?")[1]);
    const amountParam = params.get("amount");
    
    if (amountParam) {
      setAmount(amountParam);
    }

    // Set current date
    const today = new Date();
    setCurrentDate(today.toLocaleDateString("ru-RU"));
  }, [location]);

  return (
    <section className="py-16 bg-gray-50 min-h-screen flex items-center">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardContent className="p-6 sm:p-8">
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 mx-auto rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="text-green-600 h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Спасибо за ваш донат!</h3>
              <p className="text-gray-600 mb-6">Ваш платеж был успешно обработан.</p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6 max-w-xs mx-auto">
                <div className="flex justify-between">
                  <span className="text-gray-600">Сумма:</span>
                  <span className="font-semibold">{amount} ₽</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-gray-600">Дата:</span>
                  <span className="font-semibold">{currentDate}</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <Link href="/">
                  <a className="inline-block text-primary hover:text-primary-dark font-medium">
                    Сделать еще один донат
                  </a>
                </Link>
                <div className="pt-2">
                  <p className="text-sm text-gray-500">Хотите делать донаты через Telegram?</p>
                  <Button
                    variant="link"
                    asChild
                    className="mt-2 text-primary hover:text-primary-dark font-medium"
                  >
                    <a 
                      href="https://t.me/your_bot_name" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center"
                    >
                      <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.568 7.383c-.12.54-.54.674-1.09.42l-3.004-2.214-1.447 1.394c-.166.168-.296.307-.605.307l.213-3.072 5.56-5.023c.242-.214-.054-.332-.373-.118l-6.869 4.326-2.962-.924c-.64-.214-.657-.64.137-.954l11.574-4.455c.532-.196.993.13.815.926z"/>
                      </svg>
                      Открыть Телеграм-бот
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default ThankYou;
