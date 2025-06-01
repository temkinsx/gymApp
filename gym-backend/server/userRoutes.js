// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const multer = require('multer');
const path = require('path');

// Настройка хранилища для загрузки фото паспорта
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/passports/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const timestamp = Date.now();
    const phone = req.body.phoneNumber || 'unknown';
    cb(null, `${phone}_${timestamp}${ext}`);
  }
});
const upload = multer({ storage });

// Проверка, существует ли пользователь по номеру телефона
router.post('/check', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    if (!phoneNumber)
      return res.status(400).json({ message: 'Phone number is required' });

    const user = await User.findOne({ phoneNumber });
    res.json({ exists: !!user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Регистрация нового пользователя
router.post('/register', async (req, res) => {
  try {
    const { phoneNumber, fullName, birthDate, passport } = req.body;
    if (!phoneNumber)
      return res.status(400).json({ message: 'Phone number is required' });

    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser)
      return res.status(400).json({ message: 'User already exists' });

    const user = new User({
      phoneNumber,
      fullName,
      birthDate,
      passport,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await user.save();
    res.status(201).json(user);
  } catch (error) {
    console.error('Ошибка при регистрации:', error);
    res.status(500).json({ message: error.message });
  }
});

// Авторизация (пример)
router.post('/login', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    if (!phoneNumber)
      return res.status(400).json({ message: 'Phone number is required' });

    const user = await User.findOne({ phoneNumber });
    if (!user)
      return res.status(404).json({ message: 'User not found' });

    // Здесь можно сгенерировать и вернуть токен, если используется JWT
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Обновление ФИО и даты рождения по номеру телефона
router.post('/update-name', async (req, res) => {
  try {
    const { phoneNumber, name, surname, patronymic, birthDate } = req.body;
    if (!phoneNumber)
      return res.status(400).json({ message: 'Phone number is required' });

    const fullName = [surname, name, patronymic].filter(Boolean).join(' ').trim();
    const parsedBirthDate = new Date(birthDate);

    const user = await User.findOneAndUpdate(
      { phoneNumber },
      {
        fullName,
        birthDate: parsedBirthDate,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!user)
      return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- Здесь добавляем маршрут для обновления паспорта ---
router.post(
  '/update-passport',
  upload.single('passportPhoto'),
  async (req, res) => {
    try {
      const { phoneNumber, series, number, issueDate, deptCode, address } = req.body;
      if (!phoneNumber)
        return res.status(400).json({ message: 'Phone number is required' });

      const user = await User.findOne({ phoneNumber });
      if (!user)
        return res.status(404).json({ message: 'User not found' });

      // Обновляем паспортные данные
      user.passport = {
        number: `${series}${number}`,   // «1234» + «567890»
        issuedBy: deptCode,             // код подразделения «123-456»
        issueDate: new Date(issueDate)  // ожидаем «YYYY-MM-DD»
      };

      // Если нужно сохранять адрес отдельно:
      // user.address = address;

      // Сохраняем путь к фото, если оно было загружено
      if (req.file) {
        user.passportPhotoUrl = `/uploads/passports/${req.file.filename}`;
      }

      user.updatedAt = new Date();
      await user.save();
      res.json(user);
    } catch (error) {
      console.error('Ошибка при обновлении паспорта:', error);
      res.status(500).json({ message: error.message });
    }
  }
);
// --- Конец блока update-passport ---

// Получение статуса подписки
router.get('/:id/subscription-status', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.subscription)
      return res.json({ active: false });

    const now = new Date();
    const isActive = new Date(user.subscription.endDate) > now;
    res.json({ active: isActive, ...user.subscription });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Получение данных пользователя
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Получение всех пользователей
router.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Обновление подписки пользователя
router.patch('/update-subscription/:id', async (req, res) => {
  try {
    const { plan, durationInMonths } = req.body;
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + durationInMonths);

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          subscription: {
            plan,
            duration: `${durationInMonths} мес.`,
            startDate,
            endDate
          },
          updatedAt: new Date()
        }
      },
      { new: true }
    );
    if (!user)
      return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Получение пользователя по номеру телефона
router.get('/phone/:phone', async (req, res) => {
  try {
    const user = await User.findOne({ phoneNumber: req.params.phone });
    if (!user)
      return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
