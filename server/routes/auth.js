const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// Регистрация
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Проверяем, существует ли пользователь
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'Пользователь уже существует' });
    }

    // Создаем нового пользователя
    user = new User({
      name,
      email,
      password,
      isAdmin: false // По умолчанию пользователь не является администратором
    });

    // Хешируем пароль
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Сохраняем пользователя
    await user.save();

    // Создаем JWT токен
    const payload = {
      user: {
        id: user.id,
        isAdmin: user.isAdmin
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin
          }
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Ошибка сервера');
  }
});

// Вход
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Проверяем, существует ли пользователь
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Неверные учетные данные' });
    }

    // Проверяем пароль
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Неверные учетные данные' });
    }

    // Создаем JWT токен
    const payload = {
      user: {
        id: user.id,
        isAdmin: user.isAdmin
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin
          }
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Ошибка сервера');
  }
});

// Получение информации о текущем пользователе
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({ user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Ошибка сервера');
  }
});

module.exports = router; 