import TelegramBot from 'node-telegram-bot-api';
import { yooMoneyAPI } from './yoomoney-api';
import { cryptoBotAPI } from './cryptobot-api';
import { storage } from './storage';

export class TelegramBotService {
  private bot: TelegramBot;
  private isInitialized: boolean = false;

  constructor(token: string, options: TelegramBot.ConstructorOptions = {}) {
    if (!token) {
      console.warn('Telegram bot token not provided. Bot will not be initialized.');
      // Create a dummy bot for type compatibility
      this.bot = new TelegramBot(token || 'dummy', { polling: false });
      // Don't need to override methods for a dummy bot
      return;
    }

    // Create the bot instance
    this.bot = new TelegramBot(token, options);
    this.isInitialized = true;
  }

  /**
   * Initialize the bot and set up command handlers
   */
  public start(): void {
    if (!this.isInitialized) {
      console.warn('Telegram bot not initialized. Skipping start.');
      return;
    }

    console.log('Starting Telegram bot...');

    // Handle the /start command
    this.bot.onText(/\/start/, (msg: TelegramBot.Message) => {
      const chatId = msg.chat.id;
      const message = 'Привет! Я бот для отправки донатов. Чем могу помочь?\n\n' +
                     'Используйте команду /donate чтобы отправить донат.';
      
      this.bot.sendMessage(chatId, message);
    });

    // Handle the /donate command
    this.bot.onText(/\/donate/, (msg: TelegramBot.Message) => {
      const chatId = msg.chat.id;
      this.sendDonationOptions(chatId);
    });

    // Handle callback queries (button presses)
    this.bot.on('callback_query', async (callbackQuery: TelegramBot.CallbackQuery) => {
      const chatId = callbackQuery.message?.chat.id;
      if (!chatId) return;

      const data = callbackQuery.data || '';
      
      if (data.startsWith('amount_')) {
        const amount = parseInt(data.replace('amount_', ''), 10);
        await this.handleAmountSelection(chatId, amount);
      } else if (data === 'custom_amount') {
        await this.requestCustomAmount(chatId);
      } else if (data === 'payment_yoomoney') {
        await this.handlePaymentMethodSelection(chatId, 'yoomoney');
      } else if (data === 'payment_crypto') {
        await this.handlePaymentMethodSelection(chatId, 'crypto');
      } else if (data === 'comment_skip') {
        await this.handleCommentInput(chatId, null);
      } else if (data === 'confirm_payment') {
        await this.processPayment(chatId);
      } else if (data === 'cancel_payment') {
        this.resetUserState(chatId);
        await this.bot.sendMessage(chatId, 'Донат отменен. Для начала заново используйте команду /donate');
      }
    });

    // Handle regular messages for custom amount input or comments
    this.bot.on('message', async (msg: TelegramBot.Message) => {
      if (!msg.text) return;
      
      const chatId = msg.chat.id;
      const userState = this.userStates.get(chatId);
      
      // Command messages are handled separately
      if (msg.text.startsWith('/')) return;
      
      // Handle based on current state
      if (!userState || userState.step === 'amount') {
        // Assume it's a custom amount input
        if (/^\d+$/.test(msg.text)) {
          const amount = parseInt(msg.text, 10);
          
          if (amount >= 10 && amount <= 100000) {
            await this.handleAmountSelection(chatId, amount);
          } else {
            this.bot.sendMessage(chatId, 'Пожалуйста, введите сумму от 10₽ до 100,000₽.');
          }
        }
      } else if (userState.step === 'comment') {
        // Handle comment input
        const comment = msg.text.toLowerCase() === 'нет' ? null : msg.text;
        await this.handleCommentInput(chatId, comment);
      }
    });

    console.log('Telegram bot started successfully');
  }

  // User state to track donation process 
  private userStates: Map<number, {
    step: 'amount' | 'payment_method' | 'comment' | 'confirm',
    amount?: number,
    paymentMethod?: 'yoomoney' | 'crypto',
    comment?: string
  }> = new Map();

  /**
   * Reset user state
   */
  private resetUserState(chatId: number): void {
    this.userStates.set(chatId, { step: 'amount' });
  }

  /**
   * Send donation amount options to the user
   */
  private async sendDonationOptions(chatId: number): Promise<void> {
    // Reset user state
    this.resetUserState(chatId);
    
    const message = 'Выберите сумму доната или введите свою:';
    
    const keyboard = {
      inline_keyboard: [
        [
          { text: '100₽', callback_data: 'amount_100' },
          { text: '300₽', callback_data: 'amount_300' },
          { text: '500₽', callback_data: 'amount_500' }
        ],
        [
          { text: '1000₽', callback_data: 'amount_1000' },
          { text: '2000₽', callback_data: 'amount_2000' },
          { text: 'Другая', callback_data: 'custom_amount' }
        ]
      ]
    };
    
    await this.bot.sendMessage(chatId, message, {
      reply_markup: keyboard
    });
  }

  /**
   * Request a custom donation amount from the user
   */
  private async requestCustomAmount(chatId: number): Promise<void> {
    await this.bot.sendMessage(
      chatId, 
      'Введите сумму доната (от 10₽ до 100,000₽):'
    );
  }

  /**
   * Handle the selected donation amount and ask for payment method
   */
  private async handleAmountSelection(chatId: number, amount: number): Promise<void> {
    // Update user state
    const userState = this.userStates.get(chatId) || { step: 'amount' };
    userState.amount = amount;
    userState.step = 'payment_method';
    this.userStates.set(chatId, userState);
    
    // Ask for payment method
    const message = `Выбрана сумма: ${amount}₽\n\nВыберите способ оплаты:`;
    
    const keyboard = {
      inline_keyboard: [
        [
          { text: 'YooMoney (карта/кошелек)', callback_data: 'payment_yoomoney' },
          { text: 'Криптовалюта', callback_data: 'payment_crypto' }
        ]
      ]
    };
    
    await this.bot.sendMessage(chatId, message, {
      reply_markup: keyboard
    });
  }
  
  /**
   * Handle payment method selection
   */
  private async handlePaymentMethodSelection(chatId: number, method: 'yoomoney' | 'crypto'): Promise<void> {
    // Update user state
    const userState = this.userStates.get(chatId);
    if (!userState || !userState.amount) {
      await this.bot.sendMessage(chatId, 'Что-то пошло не так. Пожалуйста, начните заново с команды /donate');
      return;
    }
    
    userState.paymentMethod = method;
    userState.step = 'comment';
    this.userStates.set(chatId, userState);
    
    // Ask for comment
    await this.bot.sendMessage(
      chatId,
      'Хотите оставить комментарий к донату? Если нет, отправьте "нет" или нажмите кнопку.',
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Без комментария', callback_data: 'comment_skip' }]
          ]
        }
      }
    );
  }
  
  /**
   * Handle comment input
   */
  private async handleCommentInput(chatId: number, comment: string | null): Promise<void> {
    // Update user state
    const userState = this.userStates.get(chatId);
    if (!userState || !userState.amount || !userState.paymentMethod) {
      await this.bot.sendMessage(chatId, 'Что-то пошло не так. Пожалуйста, начните заново с команды /donate');
      return;
    }
    
    userState.comment = comment || undefined;
    userState.step = 'confirm';
    this.userStates.set(chatId, userState);
    
    // Show confirmation
    let message = `Подтвердите донат:\n\nСумма: ${userState.amount}₽\nСпособ оплаты: ${userState.paymentMethod === 'yoomoney' ? 'YooMoney' : 'Криптовалюта'}`;
    
    if (userState.comment) {
      message += `\nКомментарий: ${userState.comment}`;
    }
    
    await this.bot.sendMessage(chatId, message, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: 'Подтвердить', callback_data: 'confirm_payment' },
            { text: 'Отмена', callback_data: 'cancel_payment' }
          ]
        ]
      }
    });
  }
  
  /**
   * Process the payment after confirmation
   */
  private async processPayment(chatId: number): Promise<void> {
    const userState = this.userStates.get(chatId);
    if (!userState || !userState.amount || !userState.paymentMethod) {
      await this.bot.sendMessage(chatId, 'Что-то пошло не так. Пожалуйста, начните заново с команды /donate');
      return;
    }
    
    const { amount, paymentMethod, comment } = userState;
    
    try {
      if (paymentMethod === 'yoomoney') {
        await this.processYooMoneyPayment(chatId, amount, comment);
      } else {
        await this.processCryptoPayment(chatId, amount, comment);
      }
      
      // Reset user state after successful payment creation
      this.resetUserState(chatId);
    } catch (error) {
      console.error('Error processing payment:', error);
      await this.bot.sendMessage(chatId, 'Произошла ошибка при создании платежа. Пожалуйста, попробуйте позже.');
    }
  }
  
  /**
   * Process YooMoney payment
   */
  private async processYooMoneyPayment(chatId: number, amount: number, comment?: string): Promise<void> {
    const description = comment ? `Донат через Telegram: ${comment}` : 'Донат через Telegram';
    const paymentResponse = await yooMoneyAPI.createPayment(amount, description);
    
    if (paymentResponse.status === 'success' && paymentResponse.payment_url && paymentResponse.payment_id) {
      // Save the donation in our system
      await storage.createDonation({
        amount: amount * 100, // Store in kopecks
        paymentId: paymentResponse.payment_id,
        source: 'telegram',
        status: 'pending',
        name: undefined,
        message: comment,
        paymentMethod: 'yoomoney',
        cryptoAddress: undefined
      });
      
      // Send the payment link to the user
      const message = `Отлично! Для оплаты доната в размере ${amount}₽, перейдите по ссылке:\n${paymentResponse.payment_url}`;
      
      await this.bot.sendMessage(chatId, message);
    } else {
      throw new Error(paymentResponse.error || 'Не удалось создать платеж');
    }
  }
  
  /**
   * Process crypto payment
   */
  private async processCryptoPayment(chatId: number, amount: number, comment?: string): Promise<void> {
    const description = comment ? `Донат через Telegram: ${comment}` : 'Донат через Telegram';
    const paymentResponse = await cryptoBotAPI.createPayment(amount, description);
    
    if (paymentResponse.status === 'pending' && paymentResponse.invoiceId) {
      // Save the donation in our system
      await storage.createDonation({
        amount: amount * 100, // Store in kopecks
        paymentId: paymentResponse.invoiceId,
        source: 'telegram',
        status: 'pending',
        name: undefined,
        message: comment,
        paymentMethod: 'crypto',
        cryptoAddress: paymentResponse.cryptoAddress
      });
      
      // Send the payment link to the user
      let message = `Отлично! Для оплаты доната в размере ${amount}₽ через криптовалюту, `;
      
      if (paymentResponse.paymentUrl) {
        message += `перейдите по ссылке:\n${paymentResponse.paymentUrl}`;
      } else if (paymentResponse.cryptoAddress) {
        message += `отправьте средства на адрес:\n${paymentResponse.cryptoAddress}`;
        if (paymentResponse.currency) {
          message += `\nВалюта: ${paymentResponse.currency}`;
        }
      }
      
      await this.bot.sendMessage(chatId, message);
    } else {
      throw new Error(paymentResponse.error || 'Не удалось создать криптоплатеж');
    }
  }
}

// Create the bot instance
export const telegramBot = new TelegramBotService(
  process.env.TELEGRAM_BOT_TOKEN || '',
  {
    polling: process.env.NODE_ENV === 'production'
  }
);
