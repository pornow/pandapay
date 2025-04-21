# Платформа для Донатов

Платформа для приема пожертвований, включающая Telegram-бота и веб-сайт с интеграцией YooMoney и CryptoBot.

## Функциональность

- Веб-интерфейс для отправки донатов
- Telegram-бот для приема платежей
- Интеграция с YooMoney (через номер кошелька)
- Интеграция с @cryptobot для криптовалютных платежей
- Возможность оставлять комментарии
- Статистика по донатам

## Технический стек

- Frontend: React, TypeScript, TailwindCSS, Shadcn/ui
- Backend: Node.js, Express
- Хранение данных: In-memory (можно заменить на PostgreSQL)
- API: YooMoney API, CryptoBot API

## Переменные окружения

Для работы системы необходимы следующие переменные окружения:

- `CRYPTO_BOT_API_KEY` - API-ключ от @cryptobot в Telegram
- `TELEGRAM_BOT_TOKEN` - токен от Telegram бота
- `YOOMONEY_WALLET_NUMBER` - номер кошелька YooMoney
- `RETURN_URL` - URL для возврата после оплаты (по умолчанию "http://localhost:5000/thank-you")

## Перенос на другой хостинг

### 1. Экспорт проекта

Для переноса проекта с Replit на другой хостинг:

1. Скачайте все файлы проекта, используя кнопку "Download as zip" на Replit или через git:

```bash
git clone <URL репозитория>
```

### 2. Настройка локальной среды

1. Установите Node.js (рекомендуется версия 18 или выше)
2. Установите зависимости:

```bash
npm install
```

### 3. Настройка переменных окружения

Создайте файл `.env` в корне проекта со следующим содержимым:

```
CRYPTO_BOT_API_KEY=ваш_ключ_от_cryptobot
TELEGRAM_BOT_TOKEN=ваш_токен_телеграм_бота
YOOMONEY_WALLET_NUMBER=ваш_номер_кошелька_yoomoney
RETURN_URL=https://ваш_домен/thank-you
```

### 4. Запуск на локальной машине

Для запуска в режиме разработки:

```bash
npm run dev
```

Для сборки и запуска в production:

```bash
npm run build
npm start
```

### 5. Деплой на VPS (Virtual Private Server)

Если вы используете VPS (например, DigitalOcean, Linode, AWS EC2):

1. Загрузите файлы на сервер:

```bash
scp -r ./project user@server:/path/to/destination
```

2. Установите Node.js и зависимости на сервере
3. Настройте переменные окружения
4. Запустите приложение с помощью процесс-менеджера PM2:

```bash
npm install -g pm2
pm2 start npm --name "donation-platform" -- start
pm2 save
pm2 startup
```

### 6. Деплой на хостинг-платформы

#### Heroku

1. Создайте файл `Procfile` в корне проекта:

```
web: npm start
```

2. Инициализируйте git и развернитесь на Heroku:

```bash
git init
heroku create
git add .
git commit -m "Initial commit"
git push heroku main
```

3. Настройте переменные окружения через панель управления Heroku или CLI:

```bash
heroku config:set CRYPTO_BOT_API_KEY=ваш_ключ
heroku config:set TELEGRAM_BOT_TOKEN=ваш_токен
heroku config:set YOOMONEY_WALLET_NUMBER=ваш_номер_кошелька
heroku config:set RETURN_URL=https://your-app.herokuapp.com/thank-you
```

#### Vercel

1. Установите Vercel CLI:

```bash
npm install -g vercel
```

2. Разверните проект:

```bash
vercel
```

3. Настройте переменные окружения через интерфейс Vercel или CLI:

```bash
vercel env add CRYPTO_BOT_API_KEY
vercel env add TELEGRAM_BOT_TOKEN
vercel env add YOOMONEY_WALLET_NUMBER
vercel env add RETURN_URL
```

### 7. Дополнительные настройки

При переносе на продакшн хостинг рекомендуется:

1. Настроить HTTPS для безопасных платежей
2. Настроить домен для вашего приложения
3. Перейти с in-memory хранилища на базу данных PostgreSQL или MongoDB
4. Настроить мониторинг и логирование

## Обслуживание

1. Обновите токены и ключи API при необходимости
2. Регулярно обновляйте зависимости:

```bash
npm update
```

3. Следите за работой Telegram-бота
4. Мониторьте статистику донатов

При возникновении вопросов или проблем, обращайтесь к документации используемых API или создайте issue в репозитории проекта.