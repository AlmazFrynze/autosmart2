import React, { useState } from 'react';

const SmartSearch = ({ cars, onSelectCar }) => {
  const [searchCriteria, setSearchCriteria] = useState({
    budget: '',
    purpose: '',
    drivingStyle: '',
    familySize: '',
    cityUsage: '',
    highwayUsage: '',
    fuelEconomy: '',
    comfort: '',
    sportiness: '',
    reliability: ''
  });

  const [selectedCars, setSelectedCars] = useState([]);
  const [showComparison, setShowComparison] = useState(false);

  const purposes = [
    'Семейный автомобиль',
    'Городской автомобиль',
    'Внедорожник',
    'Спортивный автомобиль',
    'Экономичный автомобиль',
    'Премиум автомобиль'
  ];

  const drivingStyles = [
    'Спокойный',
    'Умеренный',
    'Агрессивный'
  ];

  const handleCriteriaChange = (e) => {
    const { name, value } = e.target;
    setSearchCriteria(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateCarScore = (car) => {
    let score = 0;
    
    // Бюджет
    if (car.price <= searchCriteria.budget) {
      score += 10;
    }

    // Цель использования
    if (searchCriteria.purpose === 'Семейный автомобиль') {
      if (car.bodyType === 'Универсал' || car.bodyType === 'Внедорожник') score += 5;
      if (car.engineVolume >= 2.0) score += 3;
    } else if (searchCriteria.purpose === 'Городской автомобиль') {
      if (car.bodyType === 'Хэтчбек' || car.bodyType === 'Седан') score += 5;
      if (car.engineVolume <= 1.6) score += 3;
    }

    // Стиль вождения
    if (searchCriteria.drivingStyle === 'Спокойный') {
      if (car.transmission === 'Автоматическая') score += 5;
    } else if (searchCriteria.drivingStyle === 'Агрессивный') {
      if (car.enginePower >= 200) score += 5;
      if (car.transmission === 'Механическая') score += 3;
    }

    // Использование в городе
    if (searchCriteria.cityUsage === 'Часто') {
      if (car.engineVolume <= 1.6) score += 5;
      if (car.transmission === 'Автоматическая') score += 3;
    }

    // Использование на трассе
    if (searchCriteria.highwayUsage === 'Часто') {
      if (car.engineVolume >= 2.0) score += 5;
      if (car.enginePower >= 150) score += 3;
    }

    // Экономичность
    if (searchCriteria.fuelEconomy === 'Важна') {
      if (car.engineVolume <= 1.6) score += 5;
      if (car.transmission === 'Автоматическая') score += 3;
    }

    // Комфорт
    if (searchCriteria.comfort === 'Важен') {
      if (car.transmission === 'Автоматическая') score += 5;
      if (car.bodyType === 'Седан' || car.bodyType === 'Универсал') score += 3;
    }

    // Спортивность
    if (searchCriteria.sportiness === 'Важна') {
      if (car.enginePower >= 200) score += 5;
      if (car.transmission === 'Механическая') score += 3;
    }

    // Надежность
    if (searchCriteria.reliability === 'Важна') {
      if (car.year >= 2020) score += 5;
      if (car.mileage <= 50000) score += 3;
    }

    return score;
  };

  const getRecommendedCars = () => {
    return cars
      .filter(car => !searchCriteria.budget || car.price <= searchCriteria.budget)
      .map(car => ({
        ...car,
        score: calculateCarScore(car)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  };

  const addToComparison = (car) => {
    if (selectedCars.length < 5 && !selectedCars.find(c => c._id === car._id)) {
      setSelectedCars([...selectedCars, car]);
    }
  };

  const removeFromComparison = (carId) => {
    setSelectedCars(selectedCars.filter(car => car._id !== carId));
  };

  return (
    <div style={{ padding: '2rem', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h2 style={{ marginBottom: '1.5rem', color: '#2c3e8f' }}>Умный подбор автомобиля</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#666' }}>Бюджет (₽)</label>
          <input
            type="number"
            name="budget"
            value={searchCriteria.budget}
            onChange={handleCriteriaChange}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #e5e5e5',
              borderRadius: '4px'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#666' }}>Цель использования</label>
          <select
            name="purpose"
            value={searchCriteria.purpose}
            onChange={handleCriteriaChange}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #e5e5e5',
              borderRadius: '4px'
            }}
          >
            <option value="">Выберите цель</option>
            {purposes.map(purpose => (
              <option key={purpose} value={purpose}>{purpose}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#666' }}>Стиль вождения</label>
          <select
            name="drivingStyle"
            value={searchCriteria.drivingStyle}
            onChange={handleCriteriaChange}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #e5e5e5',
              borderRadius: '4px'
            }}
          >
            <option value="">Выберите стиль</option>
            {drivingStyles.map(style => (
              <option key={style} value={style}>{style}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#666' }}>Использование в городе</label>
          <select
            name="cityUsage"
            value={searchCriteria.cityUsage}
            onChange={handleCriteriaChange}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #e5e5e5',
              borderRadius: '4px'
            }}
          >
            <option value="">Выберите частоту</option>
            <option value="Часто">Часто</option>
            <option value="Иногда">Иногда</option>
            <option value="Редко">Редко</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#666' }}>Использование на трассе</label>
          <select
            name="highwayUsage"
            value={searchCriteria.highwayUsage}
            onChange={handleCriteriaChange}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #e5e5e5',
              borderRadius: '4px'
            }}
          >
            <option value="">Выберите частоту</option>
            <option value="Часто">Часто</option>
            <option value="Иногда">Иногда</option>
            <option value="Редко">Редко</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#666' }}>Экономичность</label>
          <select
            name="fuelEconomy"
            value={searchCriteria.fuelEconomy}
            onChange={handleCriteriaChange}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #e5e5e5',
              borderRadius: '4px'
            }}
          >
            <option value="">Выберите важность</option>
            <option value="Важна">Важна</option>
            <option value="Не важна">Не важна</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#666' }}>Комфорт</label>
          <select
            name="comfort"
            value={searchCriteria.comfort}
            onChange={handleCriteriaChange}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #e5e5e5',
              borderRadius: '4px'
            }}
          >
            <option value="">Выберите важность</option>
            <option value="Важен">Важен</option>
            <option value="Не важен">Не важен</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#666' }}>Спортивность</label>
          <select
            name="sportiness"
            value={searchCriteria.sportiness}
            onChange={handleCriteriaChange}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #e5e5e5',
              borderRadius: '4px'
            }}
          >
            <option value="">Выберите важность</option>
            <option value="Важна">Важна</option>
            <option value="Не важна">Не важна</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#666' }}>Надежность</label>
          <select
            name="reliability"
            value={searchCriteria.reliability}
            onChange={handleCriteriaChange}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #e5e5e5',
              borderRadius: '4px'
            }}
          >
            <option value="">Выберите важность</option>
            <option value="Важна">Важна</option>
            <option value="Не важна">Не важна</option>
          </select>
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', color: '#2c3e8f' }}>Рекомендуемые автомобили</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {getRecommendedCars().map(car => (
            <div
              key={car._id}
              style={{
                border: '1px solid #e5e5e5',
                borderRadius: '8px',
                padding: '1rem',
                backgroundColor: '#fff'
              }}
            >
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0' }}>{car.brand} {car.model}</h4>
                <div style={{ color: '#2c3e8f', fontWeight: 'bold' }}>
                  {Number(car.price).toLocaleString()} ₽
                </div>
                <div style={{ color: '#666', fontSize: '0.9rem' }}>
                  {car.year} год • {car.mileage} км
                </div>
                <div style={{ color: '#666', fontSize: '0.9rem' }}>
                  {car.engineVolume} л • {car.enginePower} л.с.
                </div>
                <div style={{ color: '#666', fontSize: '0.9rem' }}>
                  {car.transmission} • {car.driveType}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => onSelectCar(car)}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    backgroundColor: '#2c3e8f',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Подробнее
                </button>
                <button
                  onClick={() => addToComparison(car)}
                  disabled={selectedCars.length >= 5}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    backgroundColor: '#4caf50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    opacity: selectedCars.length >= 5 ? 0.5 : 1
                  }}
                >
                  Сравнить
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedCars.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, color: '#2c3e8f' }}>Сравнение автомобилей</h3>
            <button
              onClick={() => setShowComparison(!showComparison)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#2c3e8f',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {showComparison ? 'Скрыть сравнение' : 'Показать сравнение'}
            </button>
          </div>

          {showComparison && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '1rem', border: '1px solid #e5e5e5', backgroundColor: '#f5f5f5' }}>Параметр</th>
                    {selectedCars.map(car => (
                      <th key={car._id} style={{ padding: '1rem', border: '1px solid #e5e5e5', backgroundColor: '#f5f5f5' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <img
                            src={car.images?.[0] ? `http://localhost:5000/uploads/${car.images[0]}` : 'http://localhost:5000/public/images/no-image.svg'}
                            alt={`${car.brand} ${car.model}`}
                            style={{ width: '100px', height: '75px', objectFit: 'cover', marginBottom: '0.5rem' }}
                          />
                          <div>{car.brand} {car.model}</div>
                          <div style={{ color: '#2c3e8f', fontWeight: 'bold' }}>
                            {Number(car.price).toLocaleString()} ₽
                          </div>
                          <button
                            onClick={() => removeFromComparison(car._id)}
                            style={{
                              marginTop: '0.5rem',
                              padding: '0.25rem 0.5rem',
                              backgroundColor: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            Убрать
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '1rem', border: '1px solid #e5e5e5', backgroundColor: '#f5f5f5' }}>Год выпуска</td>
                    {selectedCars.map(car => (
                      <td key={car._id} style={{ padding: '1rem', border: '1px solid #e5e5e5' }}>{car.year}</td>
                    ))}
                  </tr>
                  <tr>
                    <td style={{ padding: '1rem', border: '1px solid #e5e5e5', backgroundColor: '#f5f5f5' }}>Пробег</td>
                    {selectedCars.map(car => (
                      <td key={car._id} style={{ padding: '1rem', border: '1px solid #e5e5e5' }}>{Number(car.mileage).toLocaleString()} км</td>
                    ))}
                  </tr>
                  <tr>
                    <td style={{ padding: '1rem', border: '1px solid #e5e5e5', backgroundColor: '#f5f5f5' }}>Двигатель</td>
                    {selectedCars.map(car => (
                      <td key={car._id} style={{ padding: '1rem', border: '1px solid #e5e5e5' }}>{car.engineVolume} л / {car.enginePower} л.с.</td>
                    ))}
                  </tr>
                  <tr>
                    <td style={{ padding: '1rem', border: '1px solid #e5e5e5', backgroundColor: '#f5f5f5' }}>Коробка передач</td>
                    {selectedCars.map(car => (
                      <td key={car._id} style={{ padding: '1rem', border: '1px solid #e5e5e5' }}>{car.transmission}</td>
                    ))}
                  </tr>
                  <tr>
                    <td style={{ padding: '1rem', border: '1px solid #e5e5e5', backgroundColor: '#f5f5f5' }}>Привод</td>
                    {selectedCars.map(car => (
                      <td key={car._id} style={{ padding: '1rem', border: '1px solid #e5e5e5' }}>{car.driveType}</td>
                    ))}
                  </tr>
                  <tr>
                    <td style={{ padding: '1rem', border: '1px solid #e5e5e5', backgroundColor: '#f5f5f5' }}>Тип кузова</td>
                    {selectedCars.map(car => (
                      <td key={car._id} style={{ padding: '1rem', border: '1px solid #e5e5e5' }}>{car.bodyType}</td>
                    ))}
                  </tr>
                  <tr>
                    <td style={{ padding: '1rem', border: '1px solid #e5e5e5', backgroundColor: '#f5f5f5' }}>Цвет</td>
                    {selectedCars.map(car => (
                      <td key={car._id} style={{ padding: '1rem', border: '1px solid #e5e5e5' }}>{car.color}</td>
                    ))}
                  </tr>
                  <tr>
                    <td style={{ padding: '1rem', border: '1px solid #e5e5e5', backgroundColor: '#f5f5f5' }}>Состояние</td>
                    {selectedCars.map(car => (
                      <td key={car._id} style={{ padding: '1rem', border: '1px solid #e5e5e5' }}>{car.condition}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SmartSearch; 