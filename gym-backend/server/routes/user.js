const express = require('express');
const router = express.Router();
const User = require('../models/User');

// регистрация
router.post('/register', async (req, res) => {
  const { fullName, phoneNumber, birthDate, passport } = req.body;
  try {
    const existing = await User.findOne({ phoneNumber });
    if (existing) return res.status(400).json({ message: 'Пользователь уже существует' });

    const user = await User.create({ fullName, phoneNumber, birthDate, passport });
    res.status(201).json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// обновление подписки
router.post('/subscribe', async (req, res) => {
  const { phoneNumber, plan, durationInMonths } = req.body;
  const now = new Date();
  const endDate = new Date(now);
  endDate.setMonth(endDate.getMonth() + durationInMonths);

  try {
    const user = await User.findOneAndUpdate(
      { phoneNumber },
      {
        subscription: {
          plan,
          duration: `${durationInMonths} мес.`,
          startDate: now,
          endDate: endDate
        }
      },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'Пользователь не найден' });
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
