// НАСТРОЙКА ТЕЛЕГРАМА: Вставь свои данные между кавычек
const TELEGRAM_BOT_TOKEN = "8866971736:AAE_RK-nArz8qKzFOEbvb8TcMiVmmrQrPLs";
const TELEGRAM_CHAT_ID = "436845760";

document.addEventListener("DOMContentLoaded", () => {
    const firstStep = document.getElementById('step1');
    if (firstStep) firstStep.classList.add('active');

    const noBtn = document.getElementById('noBtn');
    if (noBtn) {
        noBtn.addEventListener('mouseenter', handleButtonRun);
        noBtn.addEventListener('mousemove', handleButtonRun);
        noBtn.addEventListener('touchstart', handleButtonRun);
    }

    const dateInput = document.getElementById('date');
    if (dateInput) {
        dateInput.addEventListener('click', () => dateInput.showPicker());
    }

    const timeInput = document.getElementById('time');
    if (timeInput) {
        timeInput.addEventListener('click', () => timeInput.showPicker());
    }
});

let starStepIndex = 0;
let lastMoveTime = 0;

function handleButtonRun(event) {
    const now = Date.now();
    if (now - lastMoveTime < 150) return;
    lastMoveTime = now;
    moveButton();
}

function moveButton() {
    const noBtn = document.getElementById('noBtn');
    const isMobile = window.innerWidth <= 450;
    let starPath;

    if (isMobile) {
        starPath = [
            { x: -10, y: -165 }, { x: 75, y: 60 }, { x: -10, y: -105 },
            { x: 95, y: -50 }, { x: -15, y: -10 }, { x: 60, y: 85 }, { x: 70, y: -115 }
        ];
    } else {
        starPath = [
            { x: 10, y: -145 }, { x: 110, y: 60 }, { x: -20, y: -105 },
            { x: 120, y: -50 }, { x: -25, y: -10 }, { x: 70, y: 85 }, { x: 110, y: -115 }
        ];
    }

    const nextVertex = starPath[starStepIndex % starPath.length];
    starStepIndex++;
    noBtn.style.transform = `translate(${nextVertex.x}%, ${nextVertex.y}%)`;
}

function goToStep(nextStepNumber) {
    const currentStep = document.querySelector('.container.active');
    const nextStep = document.getElementById(`step${nextStepNumber}`);
    if (!currentStep || !nextStep) return;

    currentStep.classList.add('fade-out');
    setTimeout(() => {
        currentStep.classList.add('hidden');
        currentStep.classList.remove('active', 'fade-out');
        nextStep.classList.remove('hidden');

        if (nextStepNumber === 2) {
            const todayStr = new Date().toLocaleDateString('en-CA');
            document.getElementById('date').min = todayStr;
        }

        setTimeout(() => { nextStep.classList.add('active'); }, 20);
    }, 550);
}

function triggerError(element, message) {
    element.innerText = message;
    element.style.display = 'block';
    element.style.animation = 'none';
    element.offsetHeight;
    element.style.animation = 'shake 0.4s ease-in-out';
}

function validateDate() {
    const dateInput = document.getElementById('date');
    const errorElement = document.getElementById('dateError');
    if (!dateInput.value) {
        triggerError(errorElement, "Пожалуйста, выбери дату встречки! 😉");
        return;
    }

    const selectedDate = new Date(dateInput.value).setHours(0, 0, 0, 0);
    const todayDate = new Date().setHours(0, 0, 0, 0);
    if (selectedDate !== todayDate) {
        triggerError(errorElement, "Может лучше сегодня?");
        return;
    }

    errorElement.style.display = 'none';
    goToStep(3);
}

function validateTime() {
    const timeInput = document.getElementById('time');
    const errorElement = document.getElementById('timeError');
    if (!timeInput.value) {
        triggerError(errorElement, "Укажи время, чтобы я спланировал! ⏰");
        return;
    }

    const timeValue = timeInput.value;
    if (timeValue < "19:00") {
        triggerError(errorElement, "Я же буду на работе 💻");
        return;
    }
    if (timeValue > "23:30") {
        triggerError(errorElement, "Слишком поздно, хочу спать 😴");
        return;
    }

    errorElement.style.display = 'none';
    goToStep(4);
}

function selectLocation(element, value) {
    const errorElement = document.getElementById('errorMsg');
    if (value !== 'Просмотр сериала дома') {
        document.querySelectorAll('.location-card').forEach(card => card.classList.remove('selected'));
        document.getElementById('place').value = '';
        triggerError(errorElement, "Ты хорошо подумала? Попробуй ещё раз... 🙄");
        return;
    }

    document.querySelectorAll('.location-card').forEach(card => card.classList.remove('selected'));
    element.classList.add('selected');
    document.getElementById('place').value = value;
    errorElement.style.display = 'none';
}

// Функция для отправки через Webhook (рекомендуемый способ)
function sendTelegramMessage(message) {
    // Проверяем, что токен и чат ID заданы
    if (!TELEGRAM_BOT_TOKEN || TELEGRAM_BOT_TOKEN === "YOUR_BOT_TOKEN") {
        console.error("❌ Токен бота не задан!");
        showFallbackMessage(message);
        return;
    }
    
    if (!TELEGRAM_CHAT_ID || TELEGRAM_CHAT_ID === "YOUR_CHAT_ID") {
        console.error("❌ Chat ID не задан!");
        showFallbackMessage(message);
        return;
    }

    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    // Пробуем отправить через fetch с режимом no-cors
    fetch(url, {
        method: 'POST',
        mode: 'no-cors', // Важно для обхода CORS
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: 'HTML'
        })
    })
    .then(response => {
        // При режиме no-cors ответ всегда будет opaque
        // Поэтому мы не можем проверить статус
        console.log("📤 Запрос отправлен в Telegram API");
        console.log("ℹ️ В режиме no-cors мы не можем получить ответ");
        console.log("🔍 Проверьте Telegram бота, должно прийти сообщение");
        
        // Отображаем информацию пользователю
        showSuccessMessage();
    })
    .catch(error => {
        console.error("❌ Ошибка отправки:", error);
        // Если fetch не работает, пробуем альтернативный способ
        sendTelegramMessageViaImage(message);
    });
}

// Альтернативный способ: через отправку изображения (работает через img тег)
function sendTelegramMessageViaImage(message) {
    console.log("📤 Пробуем отправить через Image...");
    
    // Кодируем сообщение в URL
    const encodedMessage = encodeURIComponent(message);
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${TELEGRAM_CHAT_ID}&text=${encodedMessage}&parse_mode=HTML`;
    
    // Создаем img с src на API Telegram
    const img = new Image();
    img.onload = function() {
        console.log("✅ Уведомление отправлено через Image!");
        showSuccessMessage();
    };
    img.onerror = function() {
        console.log("⚠️ Image метод не сработал, пробуем через ссылку");
        // Показываем ссылку для ручной отправки
        showManualLink(message);
    };
    img.src = url;
    img.style.display = 'none';
    document.body.appendChild(img);
    setTimeout(() => {
        document.body.removeChild(img);
    }, 2000);
}

// Показать успешное сообщение
function showSuccessMessage() {
    const errorMsg = document.getElementById('errorMsg');
    if (errorMsg) {
        errorMsg.textContent = "✅ Свидание запланировано! ❤️";
        errorMsg.style.display = 'block';
        errorMsg.style.color = '#4CAF50';
        setTimeout(() => {
            errorMsg.style.display = 'none';
        }, 3000);
    }
}

// Показать ссылку для ручной отправки
function showManualLink(message) {
    const encodedMessage = encodeURIComponent(message);
    const botUsername = TELEGRAM_BOT_TOKEN.split(':')[0];
    
    console.log("📱 Отправьте сообщение вручную:");
    console.log(`Сообщение: ${message}`);
    console.log(`Chat ID: ${TELEGRAM_CHAT_ID}`);
    console.log(`Токен: ${TELEGRAM_BOT_TOKEN}`);
    console.log(`Ссылка на бота: https://t.me/${botUsername}`);
    
    // Показываем диалог с инструкцией
    const errorMsg = document.getElementById('errorMsg');
    if (errorMsg) {
        errorMsg.innerHTML = `
            📱 <b>Не удалось отправить автоматически</b><br>
            Напишите боту вручную:<br>
            <small>@${botUsername}</small>
        `;
        errorMsg.style.display = 'block';
        errorMsg.style.color = '#FF6B35';
        errorMsg.style.padding = '15px';
        errorMsg.style.background = '#FFF3E0';
        errorMsg.style.borderRadius = '12px';
        errorMsg.style.marginTop = '10px';
    }
}

// Запасной вариант (если ничего не работает)
function showFallbackMessage(message) {
    console.log("ℹ️ Используем запасной вариант - показываем данные в консоли");
    console.log("📝 Сообщение для отправки:", message);
    showManualLink(message);
}

function finishSelection() {
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const place = document.getElementById('place').value;
    const errorElement = document.getElementById('errorMsg');
    if (!place) {
        triggerError(errorElement, "Выбор очевиден, нажми на сериал дома! 😉");
        return;
    }

    const formattedDate = new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
    document.getElementById('summaryBox').innerHTML = `
        <div class="summary-item">
            <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <span class="summary-label">${formattedDate}</span>
        </div>
        <div class="summary-item">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            <span class="summary-label">В ${time}</span>
        </div>
        <div class="summary-item">
            <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            <span class="summary-label">${place}</span>
        </div>`;

    const message = `❤️ Ура! Она согласилась на свидание!\n\n📅 Дата: ${formattedDate}\n⏰ Время: в ${time}\n📍 Место: ${place}`;

    // Отправка сообщения в Telegram
    sendTelegramMessage(message);

    goToStep(5);
}
