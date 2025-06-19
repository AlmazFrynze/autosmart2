const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Регистрация пользователя
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Проверяем, существует ли пользователь
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: 'Пользователь уже существует' });
    }

    // Создаем нового пользователя
    user = new User({
      name,
      email,
      password,
      phone
    });

    await user.save();

    // Создаем токен
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при регистрации' });
  }
};

// Авторизация пользователя
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Ищем пользователя
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Неверный email или пароль' });
    }

    // Проверяем пароль
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Неверный email или пароль' });
    }

    // Создаем токен
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при авторизации' });
  }
};

// Получение информации о текущем пользователе
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении данных пользователя' });
  }
};

// Обновление профиля пользователя
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (phone) user.phone = phone;

    await user.save();

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      isAdmin: user.isAdmin
    });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при обновлении профиля' });
  }
}; 