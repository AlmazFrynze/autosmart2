import React, { useState } from 'react';

const questions = [
  {
    key: 'price',
    question: 'Какой у вас бюджет?',
    type: 'number',
    placeholder: 'Например, 1000000',
  },
  {
    key: 'bodyType',
    question: 'Какой тип кузова предпочитаете?',
    type: 'select',
    options: ['Седан', 'Хэтчбек', 'Универсал', 'Внедорожник', 'Купе', 'Кабриолет'],
    placeholder: 'Выберите тип кузова',
  },
  {
    key: 'transmission',
    question: 'Какую коробку передач хотите?',
    type: 'select',
    options: ['Механическая', 'Автоматическая', 'Роботизированная', 'Вариатор'],
    placeholder: 'Выберите коробку передач',
  },
  {
    key: 'year',
    question: 'Минимальный год выпуска?',
    type: 'number',
    placeholder: 'Например, 2015',
  },
  {
    key: 'mileage',
    question: 'Максимальный пробег (км)?',
    type: 'number',
    placeholder: 'Например, 100000',
  },
];

export default function AutoQuiz({ cars, onSelectCar, onClose }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  // Новый стиль для модального окна
  const modalStyle = {
    background: 'linear-gradient(120deg, #f8fafc 0%, #e3e9f7 100%)',
    borderRadius: 24,
    padding: '2.5rem 2.5rem 2rem 2.5rem',
    maxWidth: 720,
    minWidth: 420,
    width: '100%',
    boxShadow: '0 8px 40px rgba(44,62,143,0.18)',
    margin: '0 auto',
    position: 'relative',
    border: '1.5px solid #e5e5e5',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    animation: 'fadeInQuiz 0.25s',
  };

  // Новый стиль для кнопок
  const buttonStyle = {
    padding: '0.9rem 2.2rem',
    borderRadius: 12,
    border: 'none',
    fontWeight: 'bold',
    fontSize: '1.08rem',
    cursor: 'pointer',
    transition: 'background 0.18s, color 0.18s',
    boxShadow: '0 2px 8px rgba(44,62,143,0.07)',
  };

  // Новый стиль для инпутов и селектов
  const inputStyle = {
    padding: '1.1rem',
    fontSize: '1.08rem',
    borderRadius: 10,
    border: '1.5px solid #cfd8e3',
    width: '100%',
    background: '#fafdff',
    marginBottom: 18,
    outline: 'none',
    boxShadow: '0 2px 8px rgba(44,62,143,0.04)',
    transition: 'border 0.2s, box-shadow 0.2s',
  };

  // Новый стиль для заголовка
  const titleStyle = {
    marginBottom: 24,
    fontSize: '2.1rem',
    fontWeight: 'bold',
    color: '#2c3e8f',
    textAlign: 'center',
    letterSpacing: '0.01em',
  };

  // Новый стиль для вопроса
  const questionStyle = {
    marginBottom: 24,
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
  };

  // Новый стиль для списка результатов
  const resultListStyle = {
    listStyle: 'none',
    padding: 0,
    width: '100%',
    maxHeight: 350,
    overflowY: 'auto',
    marginBottom: 24,
  };

  // Новый стиль для карточки результата
  const resultCardStyle = {
    marginBottom: 18,
    borderRadius: 12,
    background: '#fff',
    boxShadow: '0 2px 8px rgba(44,62,143,0.07)',
    padding: '1.2rem 1.5rem',
    border: '1px solid #e5e5e5',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  };

  // Новый стиль для кнопки "Подробнее"
  const detailsBtnStyle = {
    ...buttonStyle,
    background: '#324293',
    color: '#fff',
    marginTop: 8,
    fontSize: '1rem',
    border: 'none',
  };

  // Новый стиль для блока кнопок
  const btnBlockStyle = {
    display: 'flex',
    gap: 16,
    justifyContent: 'center',
    marginTop: 12,
  };

  // Новый стиль для кнопки "Закрыть"
  const closeBtnStyle = {
    ...buttonStyle,
    background: '#eee',
    color: '#333',
    border: 'none',
  };

  // Новый стиль для кнопки "Пройти заново"
  const restartBtnStyle = {
    ...buttonStyle,
    background: '#fff',
    color: '#324293',
    border: '1.5px solid #324293',
  };

  // Новый стиль для кнопки "Назад"
  const backBtnStyle = {
    ...buttonStyle,
    background: '#fff',
    color: '#324293',
    border: '1.5px solid #324293',
  };

  // Новый стиль для кнопки "Далее/Показать результат"
  const nextBtnStyle = {
    ...buttonStyle,
    background: '#324293',
    color: '#fff',
    border: 'none',
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAnswers((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      // Фильтрация машин по ответам
      let filtered = cars;
      if (answers.price) filtered = filtered.filter(car => Number(car.price) <= Number(answers.price));
      if (answers.bodyType) filtered = filtered.filter(car => car.bodyType === answers.bodyType);
      if (answers.transmission) filtered = filtered.filter(car => car.transmission === answers.transmission);
      if (answers.year) filtered = filtered.filter(car => Number(car.year) >= Number(answers.year));
      if (answers.mileage) filtered = filtered.filter(car => Number(car.mileage) <= Number(answers.mileage));
      setResult(filtered);
    }
  };

  const handleRestart = () => {
    setStep(0);
    setAnswers({});
    setResult(null);
  };

  if (result) {
    return (
      <div style={modalStyle}>
        <div style={titleStyle}>Результаты подбора</div>
        {result.length > 0 ? (
          <ul style={resultListStyle}>
            {result.map(car => (
              <li key={car._id || car.id} style={resultCardStyle}>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#2c3e8f' }}>{car.brand} {car.model} ({car.year})</div>
                <div>Цена: <b>{Number(car.price).toLocaleString()} ₽</b></div>
                <div>Кузов: {car.bodyType}, Коробка: {car.transmission}</div>
                <button onClick={() => onSelectCar(car)} style={detailsBtnStyle}>Подробнее</button>
              </li>
            ))}
          </ul>
        ) : (
          <div style={{ color: '#dc3545', marginBottom: 24, fontSize: '1.1rem', textAlign: 'center' }}>Нет подходящих автомобилей.</div>
        )}
        <div style={btnBlockStyle}>
          <button onClick={handleRestart} style={restartBtnStyle}>Пройти заново</button>
          <button onClick={onClose} style={closeBtnStyle}>Закрыть</button>
        </div>
      </div>
    );
  }

  const q = questions[step];

  return (
    <form onSubmit={handleNext} style={modalStyle}>
      <div style={titleStyle}>Авто-квиз: подбор автомобиля</div>
      <div style={{ color: '#888', fontSize: '1.05rem', marginBottom: 10 }}>Вопрос {step + 1} из {questions.length}</div>
      <div style={questionStyle}>{q.question}</div>
      {q.type === 'select' ? (
        <select name={q.key} value={answers[q.key] || ''} onChange={handleChange} required style={inputStyle}>
          <option value="">{q.placeholder}</option>
          {q.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      ) : (
        <input type={q.type} name={q.key} value={answers[q.key] || ''} onChange={handleChange} placeholder={q.placeholder} required style={inputStyle} />
      )}
      <div style={btnBlockStyle}>
        {step > 0 && <button type="button" onClick={() => setStep(step - 1)} style={backBtnStyle}>Назад</button>}
        <button type="submit" style={nextBtnStyle}>{step === questions.length - 1 ? 'Показать результат' : 'Далее'}</button>
        <button type="button" onClick={onClose} style={closeBtnStyle}>Отмена</button>
      </div>
    </form>
  );
} 