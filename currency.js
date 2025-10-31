// currency.js
import '../style.css';
console.log('Currency Converter loaded!');

// Замените YOUR_API_KEY на ваш реальный ключ с https://app.exchangerate-api.com/
const API_KEY = 'bf31e578c173d628fb6c7373'; // ← ОБЯЗАТЕЛЬНО ВСТАВЬТЕ СВОЙ КЛЮЧ
const BASE_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}`;

const amountInput = document.getElementById('amount');
const fromCurrency = document.getElementById('fromCurrency');
const toCurrency = document.getElementById('toCurrency');
const convertBtn = document.getElementById('convertBtn');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const result = document.getElementById('result');
const resultAmount = document.getElementById('resultAmount');
const exchangeRate = document.getElementById('exchangeRate');
const lastUpdate = document.getElementById('lastUpdate');

async function convertCurrency() {
  const amount = parseFloat(amountInput.value);
  const from = fromCurrency.value;
  const to = toCurrency.value;

  if (isNaN(amount) || amount <= 0) {
    showError('Введите корректную сумму');
    return;
  }

  // Скрываем предыдущие результаты
  loading.style.display = 'block';
  error.style.display = 'none';
  result.style.display = 'none';

  try {
    // Запрашиваем курсы относительно базовой валюты (from)
    const response = await fetch(`${BASE_URL}/latest/${from}`);
    
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error_type === 'invalid-key'
        ? 'Неверный API-ключ. Проверьте ключ на https://app.exchangerate-api.com/'
        : `Ошибка API: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    if (data.result !== 'success') {
      throw new Error(data['error-type'] || 'Неизвестная ошибка API');
    }

    if (!data.conversion_rates || !data.conversion_rates[to]) {
      throw new Error(`Курс для ${to} не найден`);
    }

    const rate = data.conversion_rates[to];
    const convertedAmount = (amount * rate).toFixed(2);
    const lastUpdateDate = new Date(data.time_last_update_utc).toLocaleString('ru-RU');

    displayResult(amount, from, convertedAmount, to, rate, lastUpdateDate);
  } catch (err) {
    showError(err.message || 'Не удалось выполнить конвертацию');
  } finally {
    loading.style.display = 'none';
  }
}

function displayResult(amount, from, converted, to, rate, updateTime) {
  resultAmount.textContent = `${amount} ${from} = ${converted} ${to}`;
  exchangeRate.textContent = `Курс: 1 ${from} = ${parseFloat(rate).toFixed(4)} ${to}`;
  lastUpdate.textContent = `Обновлено: ${updateTime}`;
  result.style.display = 'block';
}

function showError(message) {
  error.textContent = message;
  error.style.display = 'block';
}

// Обработчики
convertBtn.addEventListener('click', convertCurrency);

amountInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') convertCurrency();
});

[fromCurrency, toCurrency].forEach(select => {
  select.addEventListener('change', () => {
    if (result.style.display === 'block') {
      convertCurrency();
    }
  });
});

// Загружаем первый результат при старте (опционально)
convertCurrency();
