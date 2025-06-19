const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auth, carOwner } = require('../middleware/auth');
const carController = require('../controllers/carController');

// Пути к файлам и папкам
const uploadsDir = path.join(__dirname, '..', 'uploads');
const publicDir = path.join(__dirname, '..', 'public');
const imagesDir = path.join(publicDir, 'images');
const dataFile = path.join(__dirname, '..', 'data', 'cars.json');
const defaultImagePath = '/public/images/no-image.svg';

// Создаем необходимые директории
[uploadsDir, publicDir, imagesDir, path.dirname(dataFile)].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Функция для сохранения данных в файл
const saveData = (data) => {
  try {
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
    console.log('Данные успешно сохранены в файл');
  } catch (error) {
    console.error('Ошибка при сохранении данных:', error);
  }
};

// Функция для загрузки данных из файла
const loadData = () => {
  try {
    if (fs.existsSync(dataFile)) {
      const data = fs.readFileSync(dataFile, 'utf8');
      const cars = JSON.parse(data);
      if (Array.isArray(cars) && cars.length > 0) {
        return cars;
      }
    }
    // Демонстрационные данные при первом запуске или если файл пустой
    const initialData = [
      {
        id: 1,
        brand: 'Toyota',
        model: 'Camry',
        year: 2020,
        price: 2500000,
        description: 'Отличное состояние, один владелец, полная комплектация',
        mileage: 45000,
        engineVolume: '2.5',
        enginePower: 200,
        transmission: 'Автоматическая',
        driveType: 'Передний',
        bodyType: 'Седан',
        color: 'Белый',
        condition: 'Отличное',
        owners: 1,
        images: []
      },
      {
        id: 2,
        brand: 'BMW',
        model: 'X5',
        year: 2021,
        price: 5900000,
        description: 'Максимальная комплектация, панорамная крыша, кожаный салон',
        mileage: 25000,
        engineVolume: '3.0',
        enginePower: 340,
        transmission: 'Автоматическая',
        driveType: 'Полный',
        bodyType: 'Внедорожник',
        color: 'Черный',
        condition: 'Отличное',
        owners: 1,
        images: []
      },
      {
        id: 3,
        brand: 'Lada',
        model: 'Vesta',
        year: 2022,
        price: 1200000,
        description: 'Новый автомобиль, гарантия дилера, комплектация Luxe',
        mileage: 0,
        engineVolume: '1.6',
        enginePower: 106,
        transmission: 'Механическая',
        driveType: 'Передний',
        bodyType: 'Седан',
        color: 'Серебристый',
        condition: 'Новый',
        owners: 0,
        images: []
      }
    ];
    saveData(initialData);
    return initialData;
  } catch (error) {
    console.error('Ошибка при загрузке данных:', error);
    return [];
  }
};

let cars = loadData();

// Настройка multer для загрузки изображений
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Только изображения!'));
  }
});

// Публичные маршруты
router.get('/', carController.getAllCars);
router.get('/:id', carController.getCarById);
router.get('/seller/:sellerId', carController.getSellerCars);

// Защищенные маршруты
router.post('/', auth, upload.array('images', 10), carController.createCar);
router.put('/:id', auth, carOwner, upload.array('images', 10), carController.updateCar);
router.delete('/:id', auth, carOwner, carController.deleteCar);

module.exports = router;