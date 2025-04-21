import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const TelegramBotSection = () => {
  return (
    <section className="py-16 bg-gradient-to-br from-primary/10 to-accent/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:flex items-center justify-between">
          <div className="lg:w-1/2 mb-10 lg:mb-0">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Наш Телеграм-бот</h2>
            <p className="text-lg text-gray-600 mb-6">
              Хотите отправлять донаты прямо из Телеграма? Наш бот позволяет делать это быстро и удобно.
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-green-100 text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <p className="ml-3 text-gray-600">Простой интерфейс и быстрые платежи</p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-green-100 text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <p className="ml-3 text-gray-600">Уведомления о статусе платежа</p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-green-100 text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <p className="ml-3 text-gray-600">Интеграция с YooMoney для безопасных платежей</p>
              </li>
            </ul>
            <Button 
              asChild
              className="inline-flex items-center px-6 py-3"
            >
              <a 
                href="https://t.me/your_bot_name" 
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.568 7.383c-.12.54-.54.674-1.09.42l-3.004-2.214-1.447 1.394c-.166.168-.296.307-.605.307l.213-3.072 5.56-5.023c.242-.214-.054-.332-.373-.118l-6.869 4.326-2.962-.924c-.64-.214-.657-.64.137-.954l11.574-4.455c.532-.196.993.13.815.926z"/>
                </svg>
                Открыть бота
              </a>
            </Button>
          </div>
          <div className="lg:w-2/5">
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
              <div className="bg-[#0088cc] px-4 py-3 flex items-center">
                <div className="w-8 h-8 bg-white rounded-full mr-3 flex items-center justify-center">
                  <svg className="h-4 w-4 text-[#0088cc]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.568 7.383c-.12.54-.54.674-1.09.42l-3.004-2.214-1.447 1.394c-.166.168-.296.307-.605.307l.213-3.072 5.56-5.023c.242-.214-.054-.332-.373-.118l-6.869 4.326-2.962-.924c-.64-.214-.657-.64.137-.954l11.574-4.455c.532-.196.993.13.815.926z"/>
                  </svg>
                </div>
                <h3 className="text-white font-medium">Просто Донат Бот</h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                  <p className="text-gray-800">Привет! Я бот для отправки донатов. Чем могу помочь?</p>
                </div>
                <div className="flex justify-end">
                  <div className="bg-[#eeffde] rounded-lg p-3 max-w-[80%]">
                    <p className="text-gray-800">Хочу отправить донат</p>
                  </div>
                </div>
                <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                  <p className="text-gray-800">Отлично! Выберите сумму или введите свою:</p>
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    <button className="bg-white px-2 py-1 rounded text-sm border border-gray-300">100 ₽</button>
                    <button className="bg-white px-2 py-1 rounded text-sm border border-gray-300">300 ₽</button>
                    <button className="bg-white px-2 py-1 rounded text-sm border border-gray-300">500 ₽</button>
                    <button className="bg-white px-2 py-1 rounded text-sm border border-gray-300">1000 ₽</button>
                    <button className="bg-white px-2 py-1 rounded text-sm border border-gray-300">2000 ₽</button>
                    <button className="bg-white px-2 py-1 rounded text-sm border border-gray-300">Другая</button>
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-200 p-3 flex">
                <input 
                  type="text" 
                  placeholder="Сообщение..." 
                  className="w-full bg-gray-100 rounded-full px-4 py-2 focus:outline-none focus:ring-1 focus:ring-primary text-sm" 
                />
                <button className="ml-2 w-8 h-8 flex items-center justify-center rounded-full bg-[#0088cc]">
                  <svg className="h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TelegramBotSection;
