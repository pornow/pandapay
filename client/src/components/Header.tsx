import { Link } from "wouter";
import { Gift } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <Link href="/">
          <a className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Gift className="text-white h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold text-gray-800">Просто Донат</h1>
          </a>
        </Link>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link href="/">
                <a className="text-gray-600 hover:text-primary transition">Главная</a>
              </Link>
            </li>
            <li>
              <Link href="/about">
                <a className="text-gray-600 hover:text-primary transition">О проекте</a>
              </Link>
            </li>
            <li>
              <Link href="/statistics">
                <a className="text-gray-600 hover:text-primary transition">Статистика</a>
              </Link>
            </li>
            <li>
              <a 
                href="https://t.me/your_bot_name" 
                className="text-primary font-medium hover:text-primary-dark transition flex items-center"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.568 7.383c-.12.54-.54.674-1.09.42l-3.004-2.214-1.447 1.394c-.166.168-.296.307-.605.307l.213-3.072 5.56-5.023c.242-.214-.054-.332-.373-.118l-6.869 4.326-2.962-.924c-.64-.214-.657-.64.137-.954l11.574-4.455c.532-.196.993.13.815.926z"/>
                </svg>
                Телеграм-бот
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
