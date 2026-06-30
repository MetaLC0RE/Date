// НАСТРОЙКА VK: Вставь свои данные
const VK_ACCESS_TOKEN = "vk1.a.0Hu_H4o5D1z7R3itbO_mDkdsuIgjIB72QqA94aqoZfr1DT0qEU32gV5SfuGZZ3YwWNJgvm4pxQuPWKBlNoFvzWX_rrF62y1QC9Q86KnSOhpp0ITssXIJgsgNZDcsSBrhxMwPYDjWiGih8jnDuV7Q06aqqbNNvuPH-XkL_VFrFN2xcwS1eg4hyJha_brpB2aVsPK6KeWHgZgjkdVEOtb5dA"; // Токен сообщества или пользователя
const VK_GROUP_ID = "239961092"; // ID группы (без минуса)
const VK_USER_ID = "425176416"; // ID пользователя для личных сообщений

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

// ✅ ФУНКЦИЯ ОТПРАВКИ В VK
function sendVKMessage(message) {
    const webhookUrl = "https://hook.us2.make.com/9lecwvuhc6wxem8zw42twjb9it84ym3f";

    const randomId = Math.floor(Math.random() * 1000000);
    const peerId = 425176416; // Ваш ID (вставьте свой)

    fetch(webhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            text: message,
            peer_id: peerId,      // ← жестко задано
            random_id: randomId
        })
    })
}

// ✅ ПОКАЗ УСПЕШНОГО СООБЩЕНИЯ
function showSuccessMessage(text) {
    const errorMsg = document.getElementById('errorMsg');
    if (errorMsg) {
        errorMsg.textContent = text;
        errorMsg.style.display = 'block';
        errorMsg.style.color = '#4CAF50';
        errorMsg.style.background = 'transparent';
        errorMsg.style.padding = '0';
        setTimeout(() => {
            errorMsg.style.display = 'none';
        }, 5000);
    }
}

// ✅ ЗАВЕРШЕНИЕ ВЫБОРА
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

    // Отправка в VK
    sendVKMessage(message);

    goToStep(5);
}
