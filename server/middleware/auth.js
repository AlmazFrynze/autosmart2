const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Car = require('../models/Car');

// Middleware для проверки аутентификации
exports.auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('Auth middleware: Received token -', token);
    
    if (!token) {
      return res.status(401).json({ error: 'Требуется авторизация' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Auth middleware: Decoded token payload -', decoded);
    const user = await User.findById(decoded.user.id);
    console.log('Auth middleware: User found by ID -', user);

    if (!user) {
      return res.status(401).json({ error: 'Пользователь не найден' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Ошибка авторизации' });
  }
};

// Middleware для проверки прав администратора
exports.admin = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: 'Доступ запрещен' });
  }
  next();
};

// Middleware для проверки прав на редактирование автомобиля
exports.carOwner = async (req, res, next) => {
  try {
    const car = await Car.findById(req.params.id);
    
    if (!car) {
      return res.status(404).json({ error: 'Автомобиль не найден' });
    }

    if (car.sellerId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    req.car = car;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}; 