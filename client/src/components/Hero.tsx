import { ArrowDown } from "lucide-react";

const Hero = () => {
  return (
    <section id="main" className="py-12 md:py-20 bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Отправляйте донаты просто так
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            Иногда приятно просто поделиться с кем-то. Без причины. Просто так.
          </p>
          <div className="inline-block animate-bounce bg-white p-2 rounded-full shadow-lg mb-12">
            <ArrowDown className="text-primary h-5 w-5" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
