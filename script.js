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

function sendTelegramMessage(message) {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    // Вариант 1: Использование fetch напрямую (может работать, если нет CORS-блокировки)
    fetch(url, {
        method: 'POST',
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
            if (response.ok) {
                console.log("✅ Уведомление успешно доставлено в Telegram!");
                return response.json();
            } else {
                console.warn("⚠️ Прямая отправка не удалась, пробуем через прокси...");
                // Вариант 2: Использование прокси (запасной вариант)
                sendViaProxy(message);
            }
        })
        .catch(error => {
            console.warn("⚠️ Ошибка прямой отправки:", error);
            // Вариант 2: Использование прокси (запасной вариант)
            sendViaProxy(message);
        });
}

function sendViaProxy(message) {
    // Прокси-сервисы для обхода CORS (попробуй разные, если первый не работает)
    const proxyServices = [
        'https://cors-anywhere.herokuapp.com/',
        'https://api.allorigins.win/raw?url=',
        'https://corsproxy.io?'
    ];

    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    // Пробуем первый прокси
    const proxyUrl = proxyServices[0] + encodeURIComponent(url);

    fetch(proxyUrl, {
        method: 'POST',
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
            if (response.ok) {
                console.log("✅ Уведомление доставлено через прокси!");
            } else {
                console.error("❌ Ошибка отправки через прокси:", response.status);
                // Вариант 3: Альтернативный способ - создание ссылки для ручного открытия в Telegram
                showManualTelegramLink(message);
            }
        })
        .catch(error => {
            console.error("❌ Ошибка отправки через прокси:", error);
            // Вариант 3: Альтернативный способ - создание ссылки для ручного открытия в Telegram
            showManualTelegramLink(message);
        });
}

function showManualTelegramLink(message) {
    // Создаём ссылку для ручного открытия в Telegram
    const encodedMessage = encodeURIComponent(message);
    const botLink = `https://t.me/${TELEGRAM_BOT_TOKEN.split(':')[0]}?start=${encodedMessage}`;

    console.log("📱 Откройте Telegram и отправьте сообщение вручную:");
    console.log(`Сообщение: ${message}`);
    console.log(`Или используйте ссылку: ${botLink}`);

    // Показываем уведомление пользователю (опционально)
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
