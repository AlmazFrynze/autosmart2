const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

async function initAdmin() {
  try {
    // Подключаемся к MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Проверяем, существует ли уже администратор
    const adminExists = await User.findOne({ isAdmin: true });
    
    if (!adminExists) {
      // Создаем администратора
      const admin = new User({
        name: 'Администратор',
        email: 'admin@autosmart.ru',
        password: 'admin123', // Это пароль по умолчанию
        isAdmin: true
      });

      // Хешируем пароль
      const salt = await bcrypt.genSalt(10);
      admin.password = await bcrypt.hash(admin.password, salt);

      // Сохраняем администратора
      await admin.save();
      console.log('Администратор успешно создан!');
      console.log('Email: admin@autosmart.ru');
      console.log('Пароль: admin123');
    } else {
      console.log('Администратор уже существует');
    }

    // Закрываем соединение с базой данных
    await mongoose.connection.close();
  } catch (err) {
    console.error('Ошибка при создании администратора:', err);
    process.exit(1);
  }
}

initAdmin(); 