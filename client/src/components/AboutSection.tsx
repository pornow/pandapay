import { Zap, ShieldCheck } from "lucide-react";

const AboutSection = () => {
  return (
    <section id="about" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">О проекте</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Просто Донат — это платформа, которая позволяет отправлять деньги просто так, 
            без особой причины. Иногда приятно поделиться с кем-то, не ожидая ничего взамен.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gray-50 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-primary/10 mx-auto rounded-full flex items-center justify-center mb-4">
              <Zap className="text-primary h-5 w-5" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Просто и быстро</h3>
            <p className="text-gray-600">Отправляйте донаты в несколько кликов, без лишних сложностей.</p>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-secondary/10 mx-auto rounded-full flex items-center justify-center mb-4">
              <ShieldCheck className="text-secondary h-5 w-5" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Безопасно</h3>
            <p className="text-gray-600">Мы используем надежную платежную систему YooMoney для защиты ваших платежей.</p>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-accent/10 mx-auto rounded-full flex items-center justify-center mb-4">
              <svg className="h-5 w-5 text-accent" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.568 7.383c-.12.54-.54.674-1.09.42l-3.004-2.214-1.447 1.394c-.166.168-.296.307-.605.307l.213-3.072 5.56-5.023c.242-.214-.054-.332-.373-.118l-6.869 4.326-2.962-.924c-.64-.214-.657-.64.137-.954l11.574-4.455c.532-.196.993.13.815.926z"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3">Удобный бот</h3>
            <p className="text-gray-600">Отправляйте донаты через наш Телеграм-бот, не покидая мессенджер.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
