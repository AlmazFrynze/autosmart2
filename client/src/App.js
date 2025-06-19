import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import SmartSearch from './components/SmartSearch';
import AutoQuiz from './components/AutoQuiz';

function App() {
  const [cars, setCars] = useState([]);
  const [filter, setFilter] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCar, setSelectedCar] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [newCar, setNewCar] = useState({
    brand: '',
    model: '',
    year: '',
    price: '',
    description: '',
    mileage: '',
    engineVolume: '',
    enginePower: '',
    transmission: '',
    driveType: '',
    bodyType: '',
    color: '',
    condition: '',
    owners: '',
    images: [],
    imagePreviews: [],
    existingImages: []
  });
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [isInspectorFormVisible, setIsInspectorFormVisible] = useState(false);
  const [inspectorRequest, setInspectorRequest] = useState({
    name: '',
    phone: '',
    preferredDate: '',
    preferredTime: '',
    address: '',
    comments: ''
  });
  const [isAuthVisible, setIsAuthVisible] = useState(false);
  const [user, setUser] = useState(null);
  const [isUserProfileVisible, setIsUserProfileVisible] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [isSmartSearchVisible, setIsSmartSearchVisible] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isAutoQuizVisible, setIsAutoQuizVisible] = useState(false);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [originalCars, setOriginalCars] = useState([]);

  // Новые состояния для расширенной фильтрации и сортировки
  const [filterCriteria, setFilterCriteria] = useState({
    brand: '',
    priceMin: '',
    priceMax: '',
    yearMin: '',
    yearMax: ''
  });
  const [sortCriteria, setSortCriteria] = useState({
    sortBy: 'createdAt', // По умолчанию сортируем по дате создания
    order: 'desc' // По умолчанию по убыванию
  });

  const [filteredCars, setFilteredCars] = useState([]);

  // Популярные бренды
  const popularBrands = [
    { id: 'lada', name: 'LADA (ВАЗ)', logo: '/public/images/logos/lada.svg' },
    { id: 'bmw', name: 'BMW', logo: '/public/images/logos/bmw.svg' },
    { id: 'audi', name: 'Audi', logo: '/public/images/logos/audi.svg' },
    { id: 'ford', name: 'Ford', logo: '/public/images/logos/ford.svg' },
    { id: 'hyundai', name: 'Hyundai', logo: '/public/images/logos/hyundai.svg' },
    { id: 'kia', name: 'KIA', logo: '/public/images/logos/kia.svg' },
    { id: 'mercedes', name: 'Mercedes-Benz', logo: '/public/images/logos/mercedes.svg' },
    { id: 'skoda', name: 'Skoda', logo: '/public/images/logos/skoda.svg' },
    { id: 'toyota', name: 'Toyota', logo: '/public/images/logos/toyota.svg' },
    { id: 'volkswagen', name: 'Volkswagen', logo: '/public/images/logos/volkswagen.svg' },
    { id: 'chevrolet', name: 'Chevrolet', logo: '/public/images/logos/chevrolet.svg' },
  ];

  // Справочники для полей выбора
  const transmissionTypes = ['Механическая', 'Автоматическая', 'Роботизированная', 'Вариатор'];
  const driveTypes = ['Передний', 'Задний', 'Полный'];
  const bodyTypes = ['Седан', 'Хэтчбек', 'Универсал', 'Внедорожник', 'Купе', 'Кабриолет'];
  const conditions = ['Новый', 'Отличное', 'Хорошее', 'Требует ремонта'];

  // Стиль для полей ввода
  const inputStyle = {
    padding: '1rem',
    fontSize: '1.05rem',
    borderRadius: '10px',
    border: '1.5px solid #e5e5e5',
    width: '100%',
    background: '#fafbff',
    boxShadow: '0 2px 8px rgba(44,62,143,0.04)',
    transition: 'border 0.2s, box-shadow 0.2s',
    outline: 'none',
  };

  // Получаем список автомобилей с сервера при загрузке компонента или изменении фильтров/сортировки
  useEffect(() => {
    const fetchCars = async () => {
      // Формируем строку запроса с параметрами фильтрации и сортировки
      const queryParams = new URLSearchParams(filterCriteria);
      queryParams.append('sortBy', sortCriteria.sortBy);
      queryParams.append('order', sortCriteria.order);

      // Удаляем пустые параметры
      for (let key of queryParams.keys()) {
        if (!queryParams.get(key)) {
          queryParams.delete(key);
        }
      }
      
      const url = `http://localhost:5000/api/cars?${queryParams.toString()}`;
      console.log('Fetching cars from URL:', url);

      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Не удалось загрузить список автомобилей');
        }
        const data = await response.json();
        setCars(data);
      } catch (error) {
        console.error('Error fetching cars:', error);
      }
    };

    fetchCars();
  }, [filterCriteria, sortCriteria]); // Эффект запускается при изменении фильтров или сортировки

  useEffect(() => {
    // Проверяем наличие токена при загрузке
    const token = localStorage.getItem('token');
    if (token) {
      fetch('http://localhost:5000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(response => response.json())
        .then(data => {
          if (data.user) {
            setUser(data.user);
          }
        })
        .catch(error => {
          console.error('Error checking auth:', error);
          localStorage.removeItem('token');
        });
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCar(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };


  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newPreviews = [];
    const newImages = [];

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result);
        newImages.push(file);
        
        if (newPreviews.length === files.length) {
          setNewCar(prevState => ({
            ...prevState,
            images: [...prevState.images, ...newImages],
            imagePreviews: [...prevState.imagePreviews, ...newPreviews]
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setNewCar(prevState => ({
      ...prevState,
      images: prevState.images.filter((_, i) => i !== index),
      imagePreviews: prevState.imagePreviews.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Необходимо авторизоваться');
      return;
    }

    // Проверяем, что есть хотя бы одно изображение (старое или новое)
    if ((!(newCar.images && newCar.images.length) && !(newCar.existingImages && newCar.existingImages.length))) {
      alert('Необходимо загрузить хотя бы одну фотографию');
      return;
    }

    const isEdit = editingCar && editingCar._id;
    const method = isEdit ? 'PUT' : 'POST';
    const url = isEdit ? `http://localhost:5000/api/cars/${editingCar._id}` : 'http://localhost:5000/api/cars';

    const formData = new FormData();
    Object.entries(newCar).forEach(([key, value]) => {
      if (key !== 'images' && key !== 'imagePreviews' && key !== 'existingImages') {
        formData.append(key, value);
      }
    });
    // Добавляем новые изображения
    newCar.images.forEach((image) => {
      formData.append('images', image);
    });
    // Добавляем старые изображения (имена файлов)
    newCar.existingImages.forEach((img) => {
      formData.append('existingImages', img);
    });

    fetch(url, {
      method,
      body: formData,
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
      .then(async response => {
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Сервер вернул некорректный ответ');
        }
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Ошибка при отправке данных');
        }
        return data;
      })
      .then(data => {
        if (isEdit) {
          setCars(cars.map(car => (car._id === editingCar._id ? data : car)));
          setEditingCar(null);
        } else {
          setCars(prevCars => [...prevCars, data]);
        }
        setNewCar({
          brand: '',
          model: '',
          year: '',
          price: '',
          description: '',
          mileage: '',
          engineVolume: '',
          enginePower: '',
          transmission: '',
          driveType: '',
          bodyType: '',
          color: '',
          condition: '',
          owners: '',
          images: [],
          imagePreviews: [],
          existingImages: []
        });
        setIsFormVisible(false);
      })
      .catch(error => {
        console.error('Error adding or updating car:', error);
        alert(error.message || 'Ошибка при добавлении или обновлении автомобиля. Попробуйте еще раз.');
      });
  };

  const handleDelete = (id) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Необходимо авторизоваться');
      return;
    }

    fetch(`http://localhost:5000/api/cars/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(() => {
        setCars(cars.filter(car => car._id !== id));
      })
      .catch(error => {
        console.error('Error deleting car:', error);
        alert('Ошибка при удалении автомобиля');
      });
  };

  const handleEdit = (car) => {
    setNewCar({
      brand: car.brand || '',
      model: car.model || '',
      year: car.year || '',
      price: car.price || '',
      description: car.description || '',
      mileage: car.mileage || '',
      engineVolume: car.engineVolume || '',
      enginePower: car.enginePower || '',
      transmission: car.transmission || '',
      driveType: car.driveType || '',
      bodyType: car.bodyType || '',
      color: car.color || '',
      condition: car.condition || '',
      owners: car.owners || '',
      images: [],
      imagePreviews: car.images?.map(image => getImageUrl(image)) || [],
      existingImages: car.images || []
    });
    setEditingCar(car);
    setIsFormVisible(true);
    closeCarDetails();
  };

  const handleCarClick = (car) => {
    setSelectedCar(car);
    setCurrentImageIndex(0);
  };

  const closeCarDetails = () => {
    setSelectedCar(null);
  };


  useEffect(() => {
  
    let filtered = cars;
    if (activeTab === 'new') {
      filtered = cars.filter(car => car.condition && car.condition.toLowerCase() === 'новый');
    } else if (activeTab === 'used') {
      filtered = cars.filter(car => car.condition && car.condition.toLowerCase() !== 'новый');
    }

    // Применяем поиск к отфильтрованным по вкладкам автомобилям
    if (searchQuery) {
      filtered = filtered.filter(car => (car.brand + ' ' + car.model).toLowerCase().includes(searchQuery.toLowerCase()));
    }

    setFilteredCars(filtered);
  }, [cars, activeTab, searchQuery]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('/public/')) {
      return `http://localhost:5000${imagePath}`;
    }
    return `http://localhost:5000/uploads/${imagePath}`;
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const handleBrandSelect = (brandId) => {
    // При выборе бренда из популярных, обновляем состояние фильтра
    setFilterCriteria(prevState => ({
      ...prevState,
      brand: prevState.brand === brandId ? '' : brandId // Сброс фильтра при повторном нажатии
    }));
    // Возможно, сбросить другие фильтры или поиск при выборе бренда, по вашему усмотрению
    // setSearchQuery('');
    // setFilterCriteria(prevState => ({ ...prevState, priceMin: '', priceMax: '', yearMin: '', yearMax: '' }));
  };

  const handleTabChange = (tab) => {
    // Логика переключения вкладок может быть переработана с учетом новой фильтрации
    // Пока оставим как есть, но в будущем, возможно, потребуется изменить способ фильтрации по состоянию/пробегу
    setActiveTab(tab);
  };

  const openAddForm = () => {
    setEditingCar(null);
    setNewCar({
      brand: '',
      model: '',
      year: '',
      price: '',
      description: '',
      mileage: '',
      engineVolume: '',
      enginePower: '',
      transmission: '',
      driveType: '',
      bodyType: '',
      color: '',
      condition: '',
      owners: '',
      images: [],
      imagePreviews: [],
      existingImages: []
    });
    setIsFormVisible(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleInspectorSubmit = (e) => {
    e.preventDefault();
    // Здесь будет логика отправки заявки на сервер
    alert('Заявка на осмотр автомобиля успешно отправлена! Наш специалист свяжется с вами в ближайшее время.');
    setIsInspectorFormVisible(false);
    setInspectorRequest({
      name: '',
      phone: '',
      preferredDate: '',
      preferredTime: '',
      address: '',
      comments: ''
    });
  };

  const handleInspectorInputChange = (e) => {
    const { name, value } = e.target;
    setInspectorRequest(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleLogin = (data) => {
    localStorage.setItem('token', data.token);
    setUser(data.user);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Новые обработчики для изменения расширенных фильтров и сортировки
  const handleFilterInputChange = (e) => {
    const { name, value } = e.target;
    setFilterCriteria(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSortChange = (e) => {
    const { name, value } = e.target;
    setSortCriteria(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const nextImage = (e) => {
    e.stopPropagation();
    if (selectedCar.images?.length > 0) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === selectedCar.images.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const prevImage = (e) => {
    e.stopPropagation();
    if (selectedCar.images?.length > 0) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === 0 ? selectedCar.images.length - 1 : prevIndex - 1
      );
    }
  };

  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#fff',
      minHeight: '100vh'
    }}>
      {/* Верхняя панель */}
      <div style={{
        backgroundColor: '#324293',
        color: 'white',
        padding: 0,
        minHeight: '60px',
        boxShadow: '0 2px 8px rgba(44,62,143,0.07)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 2rem',
          height: '60px',
        }}>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', height: '60px' }}>
            <a href="#" 
              onClick={() => handleTabChange('all')}
              style={{ 
                color: 'white', 
                textDecoration: 'none',
                borderBottom: activeTab === 'all' ? '2px solid white' : 'none',
                paddingBottom: '2px',
                fontWeight: 'bold',
                fontSize: '1.05rem',
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                letterSpacing: '0.01em',
              }}>
              Все
            </a>
            <a href="#" 
              onClick={() => handleTabChange('new')}
              style={{ 
                color: 'white', 
                textDecoration: 'none',
                borderBottom: activeTab === 'new' ? '2px solid white' : 'none',
                paddingBottom: '2px',
                fontWeight: 'bold',
                fontSize: '1.05rem',
                height: '60px',
                display: 'flex',
                alignItems: 'center',
              }}>
              Новые
            </a>
            <a href="#" 
              onClick={() => handleTabChange('used')}
              style={{ 
                color: 'white', 
                textDecoration: 'none',
                borderBottom: activeTab === 'used' ? '2px solid white' : 'none',
                paddingBottom: '2px',
                fontWeight: 'bold',
                fontSize: '1.05rem',
                height: '60px',
                display: 'flex',
                alignItems: 'center',
              }}>
              С пробегом
            </a>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', height: '60px' }}>
            {user ? (
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '1rem', height: '60px' }}>
                {/* Сначала меню пользователя */}
                <button
                  onClick={() => setIsUserMenuOpen((open) => !open)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    margin: 0,
                    outline: 'none',
                    minWidth: 0,
                  }}
                >
                  <span style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: '#2c3e8f',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    marginRight: 8,
                    boxShadow: '0 2px 8px rgba(44,62,143,0.10)',
                  }}>
                    {user.name ? user.name[0].toUpperCase() : '?'}
                  </span>
                  <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.05rem', marginRight: 4, letterSpacing: '0.01em' }}>
                    {user.name}
                  </span>
                  <span style={{ color: '#fff', fontSize: '1.1rem', transition: 'transform 0.2s', transform: isUserMenuOpen ? 'rotate(180deg)' : 'none', marginLeft: 2 }}>
                    ▼
                  </span>
                </button>
                {isUserMenuOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '120%',
                      left: 0,
                      background: 'white',
                      border: '1px solid #e5e5e5',
                      borderRadius: 10,
                      boxShadow: '0 8px 32px rgba(44,62,143,0.18)',
                      minWidth: 180,
                      zIndex: 100,
                      padding: '0.5rem 0',
                      display: 'flex',
                      flexDirection: 'column',
                      animation: 'fadeInMenu 0.18s',
                    }}
                  >
                    <button
                      onClick={() => {
                        setIsUserProfileVisible(true);
                        setIsUserMenuOpen(false);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        textAlign: 'left',
                        padding: '0.85rem 1.5rem',
                        fontSize: '1.05rem',
                        color: '#2c3e8f',
                        cursor: 'pointer',
                        width: '100%',
                        outline: 'none',
                        transition: 'background 0.2s',
                        borderRadius: 8,
                      }}
                      onMouseOver={e => e.currentTarget.style.background = '#f5f5f5'}
                      onMouseOut={e => e.currentTarget.style.background = 'none'}
                    >
                      Мой профиль
                    </button>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsUserMenuOpen(false);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        textAlign: 'left',
                        padding: '0.85rem 1.5rem',
                        fontSize: '1.05rem',
                        color: '#dc3545',
                        cursor: 'pointer',
                        width: '100%',
                        outline: 'none',
                        transition: 'background 0.2s',
                        borderRadius: 8,
                      }}
                      onMouseOver={e => e.currentTarget.style.background = '#f5f5f5'}
                      onMouseOut={e => e.currentTarget.style.background = 'none'}
                    >
                      Выйти
                    </button>
                  </div>
                )}
                {/* Затем кнопка разместить объявление */}
                <button
                  style={{
                    padding: '0.7rem 1.3rem',
                    backgroundColor: '#4caf50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '1.05rem',
                    boxShadow: '0 2px 8px rgba(76,175,80,0.13)',
                    transition: 'all 0.2s',
                    outline: 'none',
                    marginLeft: '1.2rem',
                  }}
                  onMouseOver={e => { e.currentTarget.style.backgroundColor = '#388e3c'; }}
                  onMouseOut={e => { e.currentTarget.style.backgroundColor = '#4caf50'; }}
                  onClick={openAddForm}
                >
                  + Разместить объявление
                </button>
                {/* Кнопка умного подбора */}
                <button
                  onClick={() => setIsSmartSearchVisible(true)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#2c3e8f',
                    color: 'white',
                    border: '1px solid #2c3e8f',
                    borderRadius: '8px',
                    marginLeft: '1.2rem',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 8px rgba(44,62,143,0.10)',
                    transition: 'all 0.2s',
                    outline: 'none',
                    whiteSpace: 'nowrap',
                    minWidth: '140px',
                  }}
                  onMouseOver={e => { e.currentTarget.style.backgroundColor = '#1a2b6b'; }}
                  onMouseOut={e => { e.currentTarget.style.backgroundColor = '#2c3e8f'; }}
                >
                  Умный подбор
                </button>
                <button
                  onClick={() => setIsAutoQuizVisible(true)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#ffb300',
                    color: '#222',
                    border: '1px solid #ffb300',
                    borderRadius: '8px',
                    marginLeft: '0.7rem',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 8px rgba(255,179,0,0.10)',
                    transition: 'all 0.2s',
                    outline: 'none',
                    whiteSpace: 'nowrap',
                    minWidth: '140px',
                  }}
                  onMouseOver={e => { e.currentTarget.style.backgroundColor = '#ff9800'; }}
                  onMouseOut={e => { e.currentTarget.style.backgroundColor = '#ffb300'; }}
                >
                  Авто-квиз
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setIsAuthVisible(true)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: 'white',
                    color: '#2c3e8f',
                    border: '2px solid #2c3e8f',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 8px rgba(44,62,143,0.07)',
                    transition: 'all 0.2s',
                    outline: 'none'
                  }}
                  onMouseOver={e => { e.currentTarget.style.backgroundColor = '#2c3e8f'; e.currentTarget.style.color = 'white'; }}
                  onMouseOut={e => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = '#2c3e8f'; }}
                >
                  Войти
                </button>
                {/* Кнопка умного подбора для неавторизованных */}
                <button
                  onClick={() => setIsSmartSearchVisible(true)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#2c3e8f',
                    color: 'white',
                    border: '1px solid #2c3e8f',
                    borderRadius: '8px',
                    marginLeft: '1.2rem',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 8px rgba(44,62,143,0.10)',
                    transition: 'all 0.2s',
                    outline: 'none',
                    whiteSpace: 'nowrap',
                    minWidth: '140px',
                  }}
                  onMouseOver={e => { e.currentTarget.style.backgroundColor = '#1a2b6b'; }}
                  onMouseOut={e => { e.currentTarget.style.backgroundColor = '#2c3e8f'; }}
                >
                  Умный подбор
                </button>
                <button
                  onClick={() => setIsAutoQuizVisible(true)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#ffb300',
                    color: '#222',
                    border: '1px solid #ffb300',
                    borderRadius: '8px',
                    marginLeft: '0.7rem',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 8px rgba(255,179,0,0.10)',
                    transition: 'all 0.2s',
                    outline: 'none',
                    whiteSpace: 'nowrap',
                    minWidth: '140px',
                  }}
                  onMouseOver={e => { e.currentTarget.style.backgroundColor = '#ff9800'; }}
                  onMouseOut={e => { e.currentTarget.style.backgroundColor = '#ffb300'; }}
                >
                  Авто-квиз
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Основная навигация */}
      <header style={{
        backgroundColor: '#fff',
        borderBottom: '1px solid #e5e5e5',
        padding: '1rem 0',
        position: 'relative',
        minHeight: '80px',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 1rem',
          position: 'relative',
          minHeight: '80px',
        }}>
          {/* Логотип слева */}
          <h1 style={{ 
            color: '#2c3e8f', 
            margin: 0, 
            fontSize: '1.5rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            flex: '0 0 auto',
            zIndex: 2,
          }} onClick={() => {
            setSelectedBrand(null);
            setActiveTab('all');
            setSearchQuery('');
            window.location.href = '/';
          }}>
            AutoSmart
          </h1>
          {/* Поиск строго по центру и больше */}
          <div style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: '500px',
            display: 'flex',
            alignItems: 'center',
            zIndex: 1,
          }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
              <input
                type="text"
                placeholder="Поиск по объявлениям"
                value={searchQuery}
                onChange={handleSearch}
                onFocus={e => e.target.style.outline = '2px solid #2c3e8f'}
                onBlur={e => e.target.style.outline = 'none'}
                style={{
                  width: '100%',
                  padding: '1.2rem 1.2rem 1.2rem 2.8rem',
                  fontSize: '1.15rem',
                  border: 'none',
                  borderRadius: '16px',
                  background: '#fff',
                  minWidth: 0,
                  boxShadow: '0 4px 24px rgba(44,62,143,0.10)',
                  color: '#222',
                  transition: 'box-shadow 0.2s, border 0.2s',
                }}
                autoComplete="off"
              />
              <span style={{
                position: 'absolute',
                left: '0.7rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#2c3e8f',
                fontSize: '1.4rem',
                fontWeight: 'bold',
                pointerEvents: 'none',
              }}>
                🔍
              </span>
              <style>{`
                input[placeholder]::placeholder {
                  color: #888;
                  opacity: 1;
                  font-size: 1.13rem;
                }
              `}</style>
            </div>
          </div>
        </div>
      </header>

      {/* Основной контент */}
      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem 1rem'
      }}>
        {isSmartSearchVisible ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>Умный подбор автомобиля</h2>
              <button
                onClick={() => setIsSmartSearchVisible(false)}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#f5f5f5',
                  color: '#333',
                  border: '1px solid #e5e5e5',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                Вернуться к списку
              </button>
            </div>
            <SmartSearch 
              cars={cars} 
              onSelectCar={handleCarClick}
            />
          </div>
        ) : (
          <>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginBottom: '1rem'
            }}>
              Хорошие машины продаются здесь
            </h2>
            <p style={{
              color: '#666',
              marginBottom: '2rem'
            }}>
              Легковые автомобили
            </p>

            {/* Кнопка для отображения фильтров */}
            <button
              onClick={() => setIsFilterVisible(!isFilterVisible)}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#f5f5f5',
                color: '#333',
                border: '1px solid #e5e5e5',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                marginBottom: '1.5rem'
              }}
            >
              {isFilterVisible ? 'Скрыть фильтры' : 'Показать фильтры'}
            </button>

            {/* Форма добавления объявления */}
            {isFormVisible && (
              <div style={{
                backgroundColor: '#fff',
                padding: '1.5rem',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                marginBottom: '2rem',
                border: '1px solid #e5e5e5'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '1rem'
                }}>
                  <h2 style={{ margin: 0 }}>
                    {editingCar ? 'Редактирование объявления' : 'Новое объявление'}
                  </h2>
                  <button
                    onClick={() => setIsFormVisible(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '1.5rem',
                      cursor: 'pointer',
                      color: '#666'
                    }}
                  >
                    ×
                  </button>
                </div>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <input
                      type="text"
                      name="brand"
                      placeholder="Марка"
                      value={newCar.brand}
                      onChange={handleInputChange}
                      required
                      style={{
                        padding: '0.75rem',
                        fontSize: '1rem',
                        border: '1px solid #e5e5e5',
                        borderRadius: '6px',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                        transition: 'all 0.2s',
                        outline: 'none'
                      }}
                    />
                    <input
                      type="text"
                      name="model"
                      placeholder="Модель"
                      value={newCar.model}
                      onChange={handleInputChange}
                      required
                      style={{
                        padding: '0.75rem',
                        fontSize: '1rem',
                        border: '1px solid #e5e5e5',
                        borderRadius: '6px',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                        transition: 'all 0.2s',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <input
                      type="number"
                      name="year"
                      placeholder="Год выпуска"
                      value={newCar.year}
                      onChange={handleInputChange}
                      required
                      style={{
                        padding: '0.75rem',
                        fontSize: '1rem',
                        border: '1px solid #e5e5e5',
                        borderRadius: '6px',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                        transition: 'all 0.2s',
                        outline: 'none'
                      }}
                    />
                    <input
                      type="number"
                      name="price"
                      placeholder="Цена"
                      value={newCar.price}
                      onChange={handleInputChange}
                      required
                      style={{
                        padding: '0.75rem',
                        fontSize: '1rem',
                        border: '1px solid #e5e5e5',
                        borderRadius: '6px',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                        transition: 'all 0.2s',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <input
                      type="number"
                      name="mileage"
                      placeholder="Пробег (км)"
                      value={newCar.mileage}
                      onChange={handleInputChange}
                      style={{
                        padding: '0.75rem',
                        fontSize: '1rem',
                        border: '1px solid #e5e5e5',
                        borderRadius: '6px',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                        transition: 'all 0.2s',
                        outline: 'none'
                      }}
                    />
                    <select
                      name="transmission"
                      value={newCar.transmission}
                      onChange={handleInputChange}
                      style={{
                        padding: '0.75rem',
                        fontSize: '1rem',
                        border: '1px solid #e5e5e5',
                        borderRadius: '6px',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                        transition: 'all 0.2s',
                        outline: 'none'
                      }}
                    >
                      <option value="">Коробка передач</option>
                      {transmissionTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <input
                      type="text"
                      name="engineVolume"
                      placeholder="Объем двигателя (л)"
                      value={newCar.engineVolume}
                      onChange={handleInputChange}
                      style={{
                        padding: '0.75rem',
                        fontSize: '1rem',
                        border: '1px solid #e5e5e5',
                        borderRadius: '6px',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                        transition: 'all 0.2s',
                        outline: 'none'
                      }}
                    />
                    <input
                      type="text"
                      name="enginePower"
                      placeholder="Мощность (л.с.)"
                      value={newCar.enginePower}
                      onChange={handleInputChange}
                      style={{
                        padding: '0.75rem',
                        fontSize: '1rem',
                        border: '1px solid #e5e5e5',
                        borderRadius: '6px',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                        transition: 'all 0.2s',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <select
                      name="driveType"
                      value={newCar.driveType}
                      onChange={handleInputChange}
                      style={{
                        padding: '0.75rem',
                        fontSize: '1rem',
                        border: '1px solid #e5e5e5',
                        borderRadius: '6px',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                        transition: 'all 0.2s',
                        outline: 'none'
                      }}
                    >
                      <option value="">Привод</option>
                      {driveTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <select
                      name="bodyType"
                      value={newCar.bodyType}
                      onChange={handleInputChange}
                      style={{
                        padding: '0.75rem',
                        fontSize: '1rem',
                        border: '1px solid #e5e5e5',
                        borderRadius: '6px',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                        transition: 'all 0.2s',
                        outline: 'none'
                      }}
                    >
                      <option value="">Тип кузова</option>
                      {bodyTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <input
                      type="text"
                      name="color"
                      placeholder="Цвет"
                      value={newCar.color}
                      onChange={handleInputChange}
                      style={{
                        padding: '0.75rem',
                        fontSize: '1rem',
                        border: '1px solid #e5e5e5',
                        borderRadius: '6px',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                        transition: 'all 0.2s',
                        outline: 'none'
                      }}
                    />
                    <select
                      name="condition"
                      value={newCar.condition}
                      onChange={handleInputChange}
                      style={{
                        padding: '0.75rem',
                        fontSize: '1rem',
                        border: '1px solid #e5e5e5',
                        borderRadius: '6px',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                        transition: 'all 0.2s',
                        outline: 'none'
                      }}
                    >
                      <option value="">Состояние</option>
                      {['Новый', 'Отличное', 'Хорошее', 'Требует ремонта'].map(condition => (
                        <option key={condition} value={condition}>{condition}</option>
                      ))}
                    </select>
                  </div>
                  <input
                    type="number"
                    name="owners"
                    placeholder="Количество владельцев"
                    value={newCar.owners}
                    onChange={handleInputChange}
                    style={{
                      padding: '0.75rem',
                      fontSize: '1rem',
                      border: '1px solid #e5e5e5',
                      borderRadius: '6px',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                      transition: 'all 0.2s',
                      outline: 'none'
                    }}
                  />
                  <textarea
                    name="description"
                    placeholder="Описание"
                    value={newCar.description}
                    onChange={handleInputChange}
                    required
                    style={{
                      padding: '0.75rem',
                      fontSize: '1rem',
                      border: '1px solid #e5e5e5',
                      borderRadius: '6px',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                      transition: 'all 0.2s',
                      outline: 'none',
                      minHeight: '100px',
                      resize: 'vertical'
                    }}
                  />
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      required={newCar.images.length === 0 && newCar.existingImages.length === 0}
                      style={{ marginBottom: '1rem' }}
                    />
                    {/* СТАРЫЕ ФОТОГРАФИИ */}
                    {newCar.existingImages && newCar.existingImages.length > 0 && (
                      <div style={{ marginBottom: '0.5rem' }}>
                        {newCar.existingImages.map((img, index) => (
                          <div key={img+index} style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
                            <img
                              src={getImageUrl(img)}
                              alt={`Фото ${index + 1}`}
                              style={{
                                maxWidth: '100px',
                                maxHeight: '80px',
                                objectFit: 'contain',
                                marginRight: '0.5rem'
                              }}
                            />
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                setNewCar(prev => ({
                                  ...prev,
                                  existingImages: prev.existingImages.filter((_, i) => i !== index)
                                }));
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#dc3545',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                padding: '0.25rem 0.5rem'
                              }}
                            >
                              Удалить
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    {/* НОВЫЕ ФОТОГРАФИИ */}
                    {newCar.imagePreviews.length > 0 && (
                      <div style={{ marginBottom: '0.5rem' }}>
                        {newCar.imagePreviews.map((preview, index) => (
                          <div key={preview+index} style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
                            <img
                              src={preview}
                              alt={`Предпросмотр ${index + 1}`}
                              style={{
                                maxWidth: '100px',
                                maxHeight: '80px',
                                objectFit: 'contain',
                                marginRight: '0.5rem'
                              }}
                            />
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                removeImage(index);
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#dc3545',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                padding: '0.25rem 0.5rem'
                              }}
                            >
                              Удалить
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => setIsFormVisible(false)}
                      style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#fff',
                        color: '#666',
                        border: '1px solid #e5e5e5',
                        borderRadius: '6px',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                        transition: 'all 0.2s',
                        outline: 'none'
                      }}
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#4caf50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        boxShadow: '0 2px 8px rgba(76,175,80,0.13)',
                        transition: 'all 0.2s',
                        outline: 'none'
                      }}
                    >
                      {editingCar ? 'Сохранить' : 'Опубликовать'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Популярные бренды */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              {popularBrands.map(brand => {
                // Подсчитываем количество автомобилей для каждого бренда
                const count = cars.filter(car => 
                  car.brand.toLowerCase().includes(brand.name.toLowerCase()) ||
                  brand.name.toLowerCase().includes(car.brand.toLowerCase())
                ).length;
                
                // Показываем бренд только если есть хотя бы один автомобиль
                if (count > 0) {
                  return (
                    <button
                      key={brand.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '1rem',
                        border: '1px solid #e5e5e5',
                        borderRadius: '8px',
                        backgroundColor: selectedBrand === brand.id ? '#f5f5f5' : 'white',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }
                      }}
                      onClick={() => handleBrandSelect(brand.id)}
                    >
                      <div style={{
                        width: '60px',
                        height: '60px',
                        marginBottom: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <img
                          src={`http://localhost:5000${brand.logo}`}
                          alt={brand.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain'
                          }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'http://localhost:5000/public/images/no-image.svg';
                          }}
                        />
                      </div>
                      <span style={{ 
                        fontSize: '0.9rem', 
                        fontWeight: 'bold',
                        textAlign: 'center',
                        marginBottom: '0.25rem'
                      }}>
                        {brand.name}
                      </span>
                      <span style={{ 
                        fontSize: '0.8rem', 
                        color: '#666',
                        backgroundColor: '#f5f5f5',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px'
                      }}>
                        {count}
                      </span>
                    </button>
                  );
                }
                return null;
              })}
            </div>

            {/* Новые блоки для расширенной фильтрации и сортировки */}
            {isFilterVisible && (
              <div style={{
                backgroundColor: '#fff',
                padding: '1rem',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                marginBottom: '1.5rem',
                border: '1px solid #e5e5e5',
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem',
                flexWrap: 'wrap'
              }}>
                {/* Фильтр по цене */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: '#666', fontSize: '0.9rem' }}>Цена:</span>
                  <input
                    type="number"
                    name="priceMin"
                    placeholder="от"
                    value={filterCriteria.priceMin}
                    onChange={handleFilterInputChange}
                    style={{
                      ...inputStyle,
                      width: '100px',
                      padding: '0.5rem',
                      fontSize: '0.9rem'
                    }}
                  />
                  <span style={{ color: '#666' }}>-</span>
                  <input
                    type="number"
                    name="priceMax"
                    placeholder="до"
                    value={filterCriteria.priceMax}
                    onChange={handleFilterInputChange}
                    style={{
                      ...inputStyle,
                      width: '100px',
                      padding: '0.5rem',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>

                {/* Фильтр по году выпуска */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: '#666', fontSize: '0.9rem' }}>Год:</span>
                  <input
                    type="number"
                    name="yearMin"
                    placeholder="от"
                    value={filterCriteria.yearMin}
                    onChange={handleFilterInputChange}
                    style={{
                      ...inputStyle,
                      width: '80px',
                      padding: '0.5rem',
                      fontSize: '0.9rem'
                    }}
                  />
                  <span style={{ color: '#666' }}>-</span>
                  <input
                    type="number"
                    name="yearMax"
                    placeholder="до"
                    value={filterCriteria.yearMax}
                    onChange={handleFilterInputChange}
                    style={{
                      ...inputStyle,
                      width: '80px',
                      padding: '0.5rem',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>

                {/* Сортировка */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: '#666', fontSize: '0.9rem' }}>Сортировка:</span>
                  <select
                    name="sortBy"
                    value={sortCriteria.sortBy}
                    onChange={handleSortChange}
                    style={{
                      ...inputStyle,
                      width: '150px',
                      padding: '0.5rem',
                      fontSize: '0.9rem'
                    }}
                  >
                    <option value="createdAt">По дате</option>
                    <option value="price">По цене</option>
                    <option value="year">По году</option>
                  </select>
                  <select
                    name="order"
                    value={sortCriteria.order}
                    onChange={handleSortChange}
                    style={{
                      ...inputStyle,
                      width: '120px',
                      padding: '0.5rem',
                      fontSize: '0.9rem'
                    }}
                  >
                    <option value="desc">По убыванию</option>
                    <option value="asc">По возрастанию</option>
                  </select>
                </div>
              </div>
            )}

            {/* Модальное окно с подробной информацией об автомобиле */}
            {selectedCar && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1000
              }} onClick={closeCarDetails}>
                <div style={{
                  backgroundColor: '#fff',
                  borderRadius: '8px',
                  padding: '2rem',
                  maxWidth: '800px',
                  width: '90%',
                  maxHeight: '90vh',
                  overflowY: 'auto',
                  position: 'relative'
                }} onClick={e => e.stopPropagation()}>
                  <button
                    onClick={closeCarDetails}
                    style={{
                      position: 'absolute',
                      top: '1rem',
                      right: '1rem',
                      background: 'none',
                      border: 'none',
                      fontSize: '1.5rem',
                      cursor: 'pointer',
                      color: '#666'
                    }}
                  >
                    ×
                  </button>
                  
                  <div style={{ marginBottom: '2rem' }}>
                    <div style={{
                      position: 'relative',
                      width: '100%',
                      height: '400px',
                      marginBottom: '1rem'
                    }}>
                      {selectedCar.images?.length > 0 ? (
                        <>
                          <img
                            src={getImageUrl(selectedCar.images[currentImageIndex])}
                            alt={`${selectedCar.brand} ${selectedCar.model} - фото ${currentImageIndex + 1}`}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain',
                              borderRadius: '4px'
                            }}
                          />
                          {selectedCar.images.length > 1 && (
                            <>
                              <button
                                onClick={prevImage}
                                style={{
                                  position: 'absolute',
                                  left: '1rem',
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  background: 'rgba(0, 0, 0, 0.5)',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '50%',
                                  width: '40px',
                                  height: '40px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '1.5rem'
                                }}
                              >
                                ‹
                              </button>
                              <button
                                onClick={nextImage}
                                style={{
                                  position: 'absolute',
                                  right: '1rem',
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  background: 'rgba(0, 0, 0, 0.5)',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '50%',
                                  width: '40px',
                                  height: '40px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '1.5rem'
                                }}
                              >
                                ›
                              </button>
                              <div style={{
                                position: 'absolute',
                                bottom: '1rem',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                background: 'rgba(0, 0, 0, 0.5)',
                                color: 'white',
                                padding: '0.5rem 1rem',
                                borderRadius: '20px',
                                fontSize: '0.9rem'
                              }}>
                                {currentImageIndex + 1} / {selectedCar.images.length}
                              </div>
                            </>
                          )}
                        </>
                      ) : (
                        <div style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: '#f5f5f5',
                          borderRadius: '4px',
                          color: '#666',
                          fontSize: '1.2rem'
                        }}>
                          Нет фотографий
                        </div>
                      )}
                    </div>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                      gap: '0.5rem'
                    }}>
                      {selectedCar.images?.map((image, index) => (
                        <img
                          key={image+index}
                          src={getImageUrl(image)}
                          alt={`${selectedCar.brand} ${selectedCar.model} - фото ${index + 1}`}
                          style={{
                            width: '100%',
                            height: '80px',
                            objectFit: 'cover',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            border: index === currentImageIndex ? '2px solid #2c3e8f' : 'none'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentImageIndex(index);
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <h2 style={{ 
                    fontSize: '2rem', 
                    marginBottom: '1rem' 
                  }}>
                    {selectedCar.brand} {selectedCar.model}
                  </h2>

                  {selectedCar.sellerId && selectedCar.sellerId.name && (
                    <div
                      style={{ fontSize: '1rem', color: '#888', marginBottom: '1rem', cursor: 'pointer', textDecoration: 'underline' }}
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedSeller(selectedCar.sellerId);
                      }}
                    >
                      Продавец: {selectedCar.sellerId.name}
                    </div>
                  )}

                  <div style={{ 
                    fontSize: '1.5rem', 
                    color: '#333',
                    marginBottom: '1.5rem' 
                  }}>
                    {Number(selectedCar.price).toLocaleString()} ₽
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '1rem',
                    marginBottom: '2rem'
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ color: '#666' }}>Год выпуска</div>
                      <div>{selectedCar.year}</div>
                    </div>
                    {selectedCar.mileage > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ color: '#666' }}>Пробег</div>
                        <div>{Number(selectedCar.mileage).toLocaleString()} км</div>
                      </div>
                    )}
                    {selectedCar.engineVolume && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ color: '#666' }}>Двигатель</div>
                        <div>{selectedCar.engineVolume} л</div>
                      </div>
                    )}
                    {selectedCar.enginePower && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ color: '#666' }}>Мощность</div>
                        <div>{selectedCar.enginePower} л.с.</div>
                      </div>
                    )}
                    {selectedCar.transmission && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ color: '#666' }}>Коробка</div>
                        <div>{selectedCar.transmission}</div>
                      </div>
                    )}
                    {selectedCar.driveType && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ color: '#666' }}>Привод</div>
                        <div>{selectedCar.driveType}</div>
                      </div>
                    )}
                    {selectedCar.bodyType && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ color: '#666' }}>Тип кузова</div>
                        <div>{selectedCar.bodyType}</div>
                      </div>
                    )}
                    {selectedCar.color && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ color: '#666' }}>Цвет</div>
                        <div>{selectedCar.color}</div>
                      </div>
                    )}
                    {selectedCar.condition && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ color: '#666' }}>Состояние</div>
                        <div>{selectedCar.condition}</div>
                      </div>
                    )}
                  </div>

                  {selectedCar.description && (
                    <div style={{ marginBottom: '2rem' }}>
                      <h3 style={{ 
                        marginBottom: '1rem',
                        fontSize: '1.2rem',
                        color: '#333'
                      }}>Описание</h3>
                      <p style={{ 
                        whiteSpace: 'pre-wrap',
                        color: '#333',
                        lineHeight: '1.5'
                      }}>
                        {selectedCar.description}
                      </p>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                    <button
                      onClick={() => handleEdit(selectedCar)}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        backgroundColor: '#f5f5f5',
                        border: '1px solid #e5e5e5',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                      }}
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={() => setIsInspectorFormVisible(true)}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        backgroundColor: '#4caf50',
                        border: 'none',
                        color: 'white',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                      }}
                    >
                      Вызвать автоподборщика
                    </button>
                    <button
                      onClick={() => setIsChatVisible(true)}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        backgroundColor: '#2c3e8f',
                        border: 'none',
                        color: 'white',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                      }}
                    >
                      Открыть чат с продавцом
                    </button>
                    <button
                      onClick={() => {
                        handleDelete(selectedCar._id);
                        closeCarDetails();
                      }}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        backgroundColor: '#fff',
                        border: '1px solid #dc3545',
                        color: '#dc3545',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                      }}
                    >
                      Удалить
                    </button>
                  </div>

                  {/* Форма вызова автоподборщика */}
                  {isInspectorFormVisible && (
                    <div style={{
                      position: 'fixed',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      zIndex: 1100
                    }}>
                      <div style={{
                        backgroundColor: '#fff',
                        borderRadius: '8px',
                        padding: '2rem',
                        maxWidth: '500px',
                        width: '90%',
                        position: 'relative'
                      }}>
                        <button
                          onClick={() => setIsInspectorFormVisible(false)}
                          style={{
                            position: 'absolute',
                            top: '1rem',
                            right: '1rem',
                            background: 'none',
                            border: 'none',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            color: '#666'
                          }}
                        >
                          ×
                        </button>

                        <h3 style={{ marginBottom: '1.5rem' }}>Вызов автоподборщика</h3>
                        <p style={{ marginBottom: '1.5rem', color: '#666' }}>
                          Наш специалист приедет на указанный адрес и проведет профессиональный осмотр автомобиля.
                          Стоимость услуги: 2000 ₽
                        </p>

                        <form onSubmit={handleInspectorSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          <input
                            type="text"
                            name="name"
                            placeholder="Ваше имя"
                            value={inspectorRequest.name}
                            onChange={handleInspectorInputChange}
                            required
                            style={inputStyle}
                          />
                          <input
                            type="tel"
                            name="phone"
                            placeholder="Номер телефона"
                            value={inspectorRequest.phone}
                            onChange={handleInspectorInputChange}
                            required
                            style={inputStyle}
                          />
                          <input
                            type="date"
                            name="preferredDate"
                            value={inspectorRequest.preferredDate}
                            onChange={handleInspectorInputChange}
                            required
                            style={inputStyle}
                          />
                          <input
                            type="time"
                            name="preferredTime"
                            value={inspectorRequest.preferredTime}
                            onChange={handleInspectorInputChange}
                            required
                            style={inputStyle}
                          />
                          <input
                            type="text"
                            name="address"
                            placeholder="Адрес осмотра"
                            value={inspectorRequest.address}
                            onChange={handleInspectorInputChange}
                            required
                            style={inputStyle}
                          />
                          <textarea
                            name="comments"
                            placeholder="Дополнительные комментарии"
                            value={inspectorRequest.comments}
                            onChange={handleInspectorInputChange}
                            style={{
                              ...inputStyle,
                              minHeight: '100px',
                              resize: 'vertical'
                            }}
                          />
                          <button
                            type="submit"
                            style={{
                              padding: '0.75rem',
                              backgroundColor: '#4caf50',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.9rem',
                              fontWeight: 'bold'
                            }}
                          >
                            Отправить заявку
                          </button>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Модальное окно чата */}
            {isChatVisible && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 3000
              }}>
                <div style={{
                  background: '#fff',
                  borderRadius: 12,
                  padding: 24,
                  minWidth: 350,
                  maxWidth: 420,
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  height: 500
                }}>
                  <div style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: 12 }}>Чат с продавцом</div>
                  <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    border: '1px solid #eee',
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 12,
                    background: '#f9fafd'
                  }}>
                    {chatMessages.length === 0 && <div style={{ color: '#888' }}>Нет сообщений</div>}
                    {chatMessages.map((msg, idx) => (
                      <div key={idx} style={{
                        textAlign: msg.from === 'user' ? 'right' : 'left',
                        marginBottom: 8
                      }}>
                        <span style={{
                          display: 'inline-block',
                          background: msg.from === 'user' ? '#e3e9f7' : '#d0f5e8',
                          color: '#222',
                          borderRadius: 8,
                          padding: '6px 12px',
                          maxWidth: 220
                        }}>
                          {msg.text}
                        </span>
                        <div style={{ fontSize: '0.75rem', color: '#aaa' }}>
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      if (!chatInput.trim()) return;
                      setChatMessages([...chatMessages, { from: 'user', text: chatInput, timestamp: Date.now() }]);
                      setChatInput('');
                    }}
                    style={{ display: 'flex', gap: 8 }}
                  >
                    <input
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      placeholder="Введите сообщение..."
                      style={{ flex: 1, padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
                    />
                    <button type="submit" style={{
                      background: '#2c3e8f', color: '#fff', border: 'none', borderRadius: 6, padding: '0 18px', fontWeight: 'bold'
                    }}>Отправить</button>
                    <button type="button" onClick={() => setIsChatVisible(false)} style={{
                      background: '#eee', color: '#333', border: 'none', borderRadius: 6, padding: '0 12px'
                    }}>×</button>
                  </form>
                </div>
              </div>
            )}

            {/* Список автомобилей */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.5rem'
            }}>
              {filteredCars.length > 0 ? (
                filteredCars.map(car => (
                  <div 
                    key={car.id || car._id || car.model+car.year+car.price}
                    onClick={() => handleCarClick(car)}
                    style={{
                      backgroundColor: '#fff',
                      border: 'none',
                      borderRadius: '16px',
                      boxShadow: '0 4px 24px rgba(44,62,143,0.10)',
                      overflow: 'hidden',
                      transition: 'transform 0.18s, box-shadow 0.18s',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      '&:hover': {
                        transform: 'translateY(-4px) scale(1.03)',
                        boxShadow: '0 8px 32px rgba(44,62,143,0.13)'
                      }
                    }}
                  >
                    <div style={{
                      width: '100%',
                      paddingTop: '75%', // Aspect ratio 4:3
                      position: 'relative',
                    }}>
                      {car.images?.[0] && (
                        <img 
                          src={getImageUrl(car.images[0])}
                          alt={`${car.brand} ${car.model}`} 
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      )}
                      {car.images?.length > 1 && (
                        <div style={{
                          position: 'absolute',
                          top: '0.5rem',
                          right: '0.5rem',
                          background: 'rgba(0, 0, 0, 0.5)',
                          color: 'white',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.8rem'
                        }}>
                          {car.images.length} фото
                        </div>
                      )}
                    </div>
                    <div style={{ padding: '1rem', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ marginBottom: '0.5rem' }}>
                        <h3 style={{
                          margin: '0',
                          fontSize: '1.1rem',
                          color: '#333',
                          fontWeight: 'bold'
                        }}>
                          {car.brand} {car.model}
                        </h3>
                        <div style={{
                          fontSize: '1.25rem',
                          fontWeight: 'bold',
                          color: '#2c3e8f'
                        }}>
                          {Number(car.price).toLocaleString()} ₽
                        </div>
                        {car.sellerId && car.sellerId.name && (
                          <div
                            style={{ fontSize: '0.85rem', color: '#888', marginTop: '0.25rem', cursor: 'pointer', textDecoration: 'underline' }}
                            onClick={e => {
                              e.stopPropagation();
                              setSelectedSeller(car.sellerId);
                            }}
                          >
                            Продавец: {car.sellerId.name}
                          </div>
                        )}
                      </div>
                      
                      <div style={{
                        fontSize: '0.9rem',
                        color: '#666',
                        marginBottom: '1rem',
                        flexGrow: 1
                      }}>
                        <div>{car.year} год</div>
                        {car.mileage > 0 && <div>{Number(car.mileage).toLocaleString()} км</div>}
                        {car.engineVolume && car.enginePower && (
                          <div>{car.engineVolume} л / {car.enginePower} л.с.</div>
                        )}
                        {car.transmission && <div>{car.transmission}</div>}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{
                  gridColumn: '1 / -1',
                  textAlign: 'center',
                  padding: '2rem',
                  backgroundColor: '#fff',
                  border: '1px solid #e5e5e5',
                  borderRadius: '8px'
                }}>
                  <p style={{ color: '#666', fontSize: '1.1rem' }}>Автомобили не найдены.</p>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {isAuthVisible && (
        <Auth
          onLogin={handleLogin}
          onClose={() => setIsAuthVisible(false)}
        />
      )}

      {/* Модальное окно профиля пользователя */}
      {isUserProfileVisible && user && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }} onClick={() => setIsUserProfileVisible(false)}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '8px',
            padding: '2rem',
            maxWidth: '400px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto',
            position: 'relative'
          }} onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setIsUserProfileVisible(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#666'
              }}
            >
              ×
            </button>

            <h2 style={{ marginBottom: '1.5rem' }}>Мой профиль</h2>
            <div>
              <p><strong>Имя:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              {user.phone && <p><strong>Телефон:</strong> {user.phone}</p>}
              {user.city && <p><strong>Город:</strong> {user.city}</p>}
              <p><strong>Статус:</strong> {user.isAdmin ? 'Администратор' : 'Пользователь'}</p>
              <p><strong>Дата регистрации:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно продавца */}
      {selectedSeller && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1200
        }} onClick={() => setSelectedSeller(null)}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '8px',
            padding: '2rem',
            maxWidth: '400px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto',
            position: 'relative'
          }} onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setSelectedSeller(null)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#666'
              }}
            >
              ×
            </button>
            <h2 style={{ marginBottom: '1.5rem' }}>Данные продавца</h2>
            <div>
              <p><strong>Имя:</strong> {selectedSeller.name}</p>
              {selectedSeller.email && <p><strong>Email:</strong> {selectedSeller.email}</p>}
              {selectedSeller.phone && <p><strong>Телефон:</strong> {selectedSeller.phone}</p>}
              {selectedSeller.city && <p><strong>Город:</strong> {selectedSeller.city}</p>}
              <p><strong>Дата регистрации:</strong> {selectedSeller.createdAt ? new Date(selectedSeller.createdAt).toLocaleDateString() : '-'}</p>
            </div>
          </div>
        </div>
      )}

      {isAutoQuizVisible && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 2000
        }}>
          <AutoQuiz
            cars={cars}
            onSelectCar={(car) => {
              setSelectedCar(car);
              setIsAutoQuizVisible(false);
            }}
            onClose={() => setIsAutoQuizVisible(false)}
          />
        </div>
      )}
    </div>
  );
}

export default App;
