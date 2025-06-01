# Gym Management Application

Полнофункциональное мобильное приложение для управления спортзалом, построенное на React Native с Node.js backend API.

## Описание проекта

Система управления спортзалом, включающая мобильное приложение для клиентов и REST API для обработки данных. Приложение обеспечивает регистрацию пользователей, управление профилями, систему подписок и интеграцию с платежными системами.

## Архитектура проекта

```
gymApp/
├── gym-backend/                 # Backend API сервер
│   └── server/
│       ├── controllers/         # Контроллеры API
│       ├── models/             # Модели данных (Mongoose)
│       ├── routes/             # Маршруты API
│       ├── uploads/            # Загруженные файлы
│       ├── server.js           # Главный файл сервера
│       ├── package.json        # Зависимости backend
│       └── Dockerfile          # Docker конфигурация
├── screens/                    # Экраны React Native
├── navigation/                 # Навигация приложения
├── assets/                     # Ресурсы приложения
├── App.js                      # Главный компонент приложения
├── package.json               # Зависимости frontend
└── docker-compose.yml         # Полная Docker конфигурация
```

## Технологический стек

### Frontend (React Native)
- **Framework**: React Native с Expo
- **Navigation**: React Navigation
- **UI Components**: Custom React Native components
- **State Management**: React Hooks

### Backend (Node.js)
- **Runtime**: Node.js 18+
- **Framework**: Express.js 5.1
- **Database**: MongoDB с Mongoose ODM
- **File Upload**: Multer middleware
- **CORS**: Настроен для кроссдоменных запросов

### DevOps
- **Containerization**: Docker и Docker Compose
- **Version Control**: Git с GitHub
- **Environment**: dotenv для конфигурации

## Функциональность

### Пользовательские возможности
- Регистрация и авторизация по номеру телефона
- Управление личным профилем
- Загрузка паспортных данных и фотографий
- Просмотр расписания тренировок
- Управление подписками на услуги спортзала
- Обработка платежей

### Административные функции
- Управление пользователями через API
- Мониторинг подписок
- Обработка загруженных документов
- Система отчетности

## Установка и запуск

### Предварительные требования
- Node.js версии 18 или выше
- MongoDB (локально или удаленно)
- Expo CLI для разработки React Native
- Docker (опционально)

### Локальная разработка

#### Backend (развертывание на сервере)
```bash
cd gym-backend/server
npm install
cp .env.example .env  # настройте переменные окружения
npm start
```

#### Frontend (локальная разработка)
```bash
npm install
npm start
# или
expo start
```

**Примечание**: Frontend приложение предназначено для локальной разработки и тестирования на мобильных устройствах через Expo. Backend API развертывается на продакшн сервере для обеспечения доступа к данным.

### Docker развертывание

#### Быстрый старт
```bash
docker-compose up -d
```

#### Отдельные сервисы
```bash
# Backend
cd gym-backend/server
docker build -t gym-backend .
docker run -p 5000:5000 --env-file .env gym-backend

# MongoDB
docker run -d -p 27017:27017 --name gym-mongo mongo:latest
```

## Конфигурация

### Переменные окружения Backend

Создайте файл `.env` в папке `gym-backend/server/`:

```env
MONGO_URI=mongodb://localhost:27017/gym
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_here
```

### Переменные окружения Frontend (локальная разработка)

```env
API_BASE_URL=http://your-server-ip:5000
EXPO_PUBLIC_API_URL=http://your-server-ip:5000/api
```

**Примечание**: Замените `your-server-ip` на IP-адрес сервера, где развернут backend API.

## API Documentation

### Базовый URL
```
http://localhost:5000/api/users
```

### Основные эндпоинты

#### Аутентификация
- `POST /check` - Проверка существования пользователя
- `POST /register` - Регистрация нового пользователя
- `POST /login` - Авторизация пользователя

#### Управление профилем
- `POST /update-name` - Обновление персональных данных
- `POST /update-passport` - Обновление паспортных данных (с загрузкой фото)
- `GET /:id` - Получение пользователя по ID
- `GET /phone/:phone` - Получение пользователя по телефону

#### Подписки
- `PATCH /update-subscription/:id` - Обновление подписки
- `GET /:id/subscription-status` - Статус подписки

Подробная документация API доступна в [gym-backend/README.md](./gym-backend/README.md)

## Структура базы данных

### Модель пользователя
```javascript
{
  name: String,              // Имя
  surname: String,           // Фамилия
  patronymic: String,        // Отчество
  phoneNumber: String,       // Телефон (уникальный)
  birthDate: Date,           // Дата рождения
  passport: {
    number: String,          // Серия + номер
    issuedBy: String,        // Код подразделения
    issueDate: Date         // Дата выдачи
  },
  subscription: {
    plan: String,            // План подписки
    duration: String,        // Длительность
    startDate: Date,         // Дата начала
    endDate: Date           // Дата окончания
  },
  passportPhotoUrl: String,  // Путь к фото паспорта
  createdAt: Date,          // Дата создания
  updatedAt: Date           // Дата обновления
}
```

## Экраны приложения

- **StartScreen** - Стартовый экран с выбором действий
- **RegisterCodeScreen** - Ввод номера телефона
- **RegisterNameScreen** - Ввод персональных данных
- **RegisterPassportScreen** - Загрузка паспортных данных
- **HomeScreen** - Главный экран пользователя
- **ProfileScreen** - Профиль пользователя
- **ScheduleScreen** - Расписание тренировок
- **PaymentScreen** - Обработка платежей

## Разработка

### Структура кода Frontend
```javascript
// App.js - главная точка входа
export default function App() {
  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}
```

### Добавление новых экранов
1. Создайте компонент в папке `screens/`
2. Добавьте маршрут в `navigation/AppNavigator.js`
3. Импортируйте необходимые зависимости

### API интеграция
```javascript
const API_BASE_URL = 'http://localhost:5000/api';

const registerUser = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/users/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  return response.json();
};
```

## Тестирование

### Backend тестирование
```bash
cd gym-backend/server
npm test  # планируется реализация
```

### Frontend тестирование
```bash
npm test  # планируется реализация
```

## Развертывание

### Production Backend (на сервере)
```bash
cd gym-backend/server
docker build -t gym-backend:latest .
docker run -d --name gym-api -p 5000:5000 gym-backend:latest
```

### Frontend (локальная разработка и тестирование)
```bash
expo start  # для разработки
expo build:android  # сборка APK для Android
expo build:ios      # сборка для iOS (требует macOS)
```

**Архитектура развертывания**: Backend API размещается на продакшн сервере для обеспечения стабильной работы и доступности данных, в то время как React Native приложение используется для локальной разработки и тестирования на мобильных устройствах через Expo.

## Безопасность

### Реализованные меры
- Валидация входных данных на уровне API
- Уникальность номеров телефонов
- Безопасная загрузка файлов с ограничениями
- CORS политики для API
- Централизованная обработка ошибок

### Планируемые улучшения
- JWT аутентификация
- Rate limiting
- Шифрование чувствительных данных
- HTTPS в production

## Мониторинг и логирование

- Логирование подключений к базе данных
- Отслеживание API запросов
- Мониторинг ошибок приложения
- Метрики производительности



## Лицензия

Проект разработан в рамках учебной практики. Все права защищены.

## Техническая поддержка

При возникновении проблем:
1. Проверьте логи сервера и приложения
2. Убедитесь в корректности переменных окружения
3. Проверьте соединение с базой данных
4. Обратитесь к документации API

## Планы развития

### Краткосрочные цели
- Внедрение автоматического тестирования
- Улучшение UX/UI дизайна
- Оптимизация производительности API
- Добавление push-уведомлений

### Долгосрочные цели
- Интеграция с фитнес-трекерами
- Система тренировочных программ
- Социальные функции
- Аналитика и отчетность
- Многоязычная поддержка

---

**Автор**: temkinsx  
**Версия**: 1.0.0  
**Последнее обновление**: Июнь 2025
