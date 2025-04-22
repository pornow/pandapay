import { z } from 'zod';

// Define a shape of the YooMoney API response
const yooMoneyPaymentResponseSchema = z.object({
  status: z.enum(['success', 'pending', 'error']),
  payment_id: z.string().optional(),
  payment_url: z.string().optional(),
  error: z.string().optional(),
});

type YooMoneyPaymentResponse = z.infer<typeof yooMoneyPaymentResponseSchema>;

// YooMoney API class to handle payment operations
export class YooMoneyAPI {
  private walletNumber: string;
  private returnUrl: string;

  constructor(walletNumber: string, returnUrl: string) {
    this.walletNumber = walletNumber;
    this.returnUrl = returnUrl;
  }

  /**
   * Create a payment request in the YooMoney system
   * 
   * @param amount Amount in rubles
   * @param description Payment description
   * @returns Payment data with URL to redirect user
   */
  async createPayment(amount: number, description: string = "Донат"): Promise<YooMoneyPaymentResponse> {
    try {
      // Convert amount to kopecks (YooMoney uses kopecks)
      const amountInKopecks = Math.round(amount * 100);
      
      // In a real implementation, we would be making an actual API call to YooMoney
      // For the purpose of this demo, we'll simulate a successful API response
      // In production, replace with actual API call to YooMoney
      
      // If wallet number is not provided, simulate success response
      if (!this.walletNumber) {
        console.log('Warning: YooMoney wallet number not provided. Using mock response.');
      }
      
      // Generate a unique payment ID
      const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      // Create a direct payment URL with wallet number
      // This uses YooMoney's quickpay form which doesn't require API integration
      const encodedDescription = encodeURIComponent(description);
      const paymentURL = this.walletNumber 
        ? `https://yoomoney.ru/quickpay/button-widget?targets=${encodedDescription}&default-sum=${amount}&button-text=12&any-card-payment-type=on&button-size=m&button-color=orange&successURL=${encodeURIComponent(this.returnUrl)}&quickpay=small&account=${this.walletNumber}`
        : `https://yoomoney.ru/checkout/payments/v2/contract?orderId=${paymentId}`;
      
      // Simulate API response based on a successful request
      const response: YooMoneyPaymentResponse = {
        status: 'success',
        payment_id: paymentId,
        payment_url: paymentURL,
      };
      
      // Parse and validate response
      return yooMoneyPaymentResponseSchema.parse(response);
    } catch (error) {
      console.error('YooMoney API error:', error);
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Check payment status in YooMoney system
   * 
   * @param paymentId The ID of the payment to check
   * @returns Current payment status
   */
  async checkPaymentStatus(paymentId: string): Promise<YooMoneyPaymentResponse> {
    try {
      // In a real implementation, we would be making an actual API call to YooMoney
      // to check the payment status
      
      // For the purpose of this demo, we'll simulate a successful status check
      // In production, replace with actual API call to YooMoney
      
      // Simulate API response with a successful payment status
      const response: YooMoneyPaymentResponse = {
        status: 'success',
        payment_id: paymentId,
      };
      
      // Parse and validate response
      return yooMoneyPaymentResponseSchema.parse(response);
    } catch (error) {
      console.error('YooMoney API error checking payment status:', error);
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
}

// Create an instance of the YooMoney API
export const yooMoneyAPI = new YooMoneyAPI(
  process.env.YOOMONEY_WALLET_NUMBER || '',
  process.env.RETURN_URL || 'http://localhost:5000/thank-you'
);
