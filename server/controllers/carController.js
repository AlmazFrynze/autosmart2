const Car = require('../models/Car');
const User = require('../models/User');
const fs = require('fs').promises;
const path = require('path');

// Пути к файлам
const dataFile = path.join(__dirname, '..', 'data', 'cars.json');

// Функция для загрузки данных из файла
const loadDataFromFile = async () => {
  try {
    if (await fs.exists(dataFile)) {
      const data = await fs.readFile(dataFile, 'utf8');
      const cars = JSON.parse(data);
      if (Array.isArray(cars) && cars.length > 0) {
        // Добавляем временные ID, если их нет (для совместимости со старыми данными)
        return cars.map(car => ({ ...car, _id: car._id || car.id }));
      }
    }
    return [];
  } catch (error) {
    console.error('Ошибка при загрузке данных из файла:', error);
    return [];
  }
};

// Получение всех автомобилей с информацией о продавцах
exports.getAllCars = async (req, res) => {
  try {
    const {
      brand,
      priceMin,
      priceMax,
      yearMin,
      yearMax,
      sortBy = 'createdAt', // По умолчанию сортируем по дате создания
      order = 'desc' // По умолчанию по убыванию
    } = req.query;

    let filter = {};
    if (brand) {
      // Используем регулярное выражение для поиска марки без учета регистра
      filter.brand = { $regex: brand, $options: 'i' };
    }
    if (priceMin) {
      filter.price = { ...filter.price, $gte: parseInt(priceMin) };
    }
    if (priceMax) {
      filter.price = { ...filter.price, $lte: parseInt(priceMax) };
    }
    if (yearMin) {
      filter.year = { ...filter.year, $gte: parseInt(yearMin) };
    }
    if (yearMax) {
      filter.year = { ...filter.year, $lte: parseInt(yearMax) };
    }

    let sortOptions = {};
    if (sortBy) {
      sortOptions[sortBy] = order === 'asc' ? 1 : -1;
    }

    let cars = await Car.find(filter)
      .sort(sortOptions)
      .populate('sellerId', 'name createdAt');

    if (cars.length === 0) {
      // Если в базе данных нет автомобилей, загружаем из JSON файла (без фильтрации и сортировки)
      // В реальном приложении тут лучше тоже применить фильтрацию/сортировку
      // или добавить начальные данные в базу навсегда
      cars = await loadDataFromFile();
    }

    res.json(cars);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении автомобилей' });
  }
};

// Получение автомобиля по ID
exports.getCarById = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id).populate('sellerId', 'name createdAt');
    if (!car) {
      return res.status(404).json({ error: 'Автомобиль не найден' });
    }
    res.json(car);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении автомобиля' });
  }
};

// Создание нового автомобиля
exports.createCar = async (req, res) => {
  try {
    const carData = {
      ...req.body,
      sellerId: req.user._id
    };

    // Сохраняем массив изображений
    if (req.files && req.files.length > 0) {
      carData.images = req.files.map(file => file.filename);
    } else {
      carData.images = [];
    }

    const car = new Car(carData);
    await car.save();
    const populatedCar = await Car.findById(car._id).populate('sellerId', 'name createdAt');
    res.status(201).json(populatedCar);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при создании автомобиля' });
  }
};

// Обновление автомобиля
exports.updateCar = async (req, res) => {
  try {
    const carData = { ...req.body };
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ error: 'Автомобиль не найден' });
    }
    // Собираем итоговый массив изображений: существующие + новые
    let images = [];
    if (req.body.existingImages) {
      if (Array.isArray(req.body.existingImages)) {
        images = req.body.existingImages;
      } else {
        images = [req.body.existingImages];
      }
    }
    if (req.files && req.files.length > 0) {
      images = images.concat(req.files.map(file => file.filename));
    }
    carData.images = images;
    const updatedCar = await Car.findByIdAndUpdate(
      req.params.id,
      carData,
      { new: true }
    ).populate('sellerId', 'name createdAt');
    res.json(updatedCar);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при обновлении автомобиля' });
  }
};

// Удаление автомобиля
exports.deleteCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ error: 'Автомобиль не найден' });
    }

    // Удаляем все изображения автомобиля
    if (car.images && car.images.length > 0) {
      for (const image of car.images) {
        const imagePath = path.join(__dirname, '../uploads', image);
        try {
          await fs.unlink(imagePath);
        } catch (error) {
          console.error('Ошибка при удалении изображения:', error);
        }
      }
    }

    await Car.findByIdAndDelete(req.params.id);
    res.json({ message: 'Автомобиль успешно удален' });
  } catch (error) {
    console.error('Ошибка при удалении автомобиля:', error);
    res.status(500).json({ error: 'Ошибка при удалении автомобиля' });
  }
};

// Получение автомобилей продавца
exports.getSellerCars = async (req, res) => {
  try {
    const cars = await Car.find({ sellerId: req.params.sellerId })
      .populate('sellerId', 'name createdAt');
    res.json(cars);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении автомобилей продавца' });
  }
}; 