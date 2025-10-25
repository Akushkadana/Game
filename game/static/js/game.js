// === ЭЛЕМЕНТЫ ===
const gameArea = document.getElementById('gameArea');
const scoreElement = document.getElementById('score');
const timerElement = document.getElementById('timer');
const livesElement = document.getElementById('lives');
const blackholeAvoidedElement = document.getElementById('blackhole-avoided');
const finalScoreElement = document.getElementById('finalScore');
const gameOverScreen = document.getElementById('gameOver');
const pausedScreen = document.getElementById('paused');

// === ПЕРЕМЕННЫЕ ===
let player, stars = [], meteors = [], blackHole = null;
let score = 0, timer = 0, lives = 3, blackHolesAvoided = 0;
let gameRunning = false, paused = false;
let blackHoleTimer = 0;
const WIDTH = 400, HEIGHT = 600;

// === УПРАВЛЕНИЕ ===
const keys = {};
window.addEventListener('keydown', e => {
    keys[e.key] = true;
    if (e.key === 'p' || e.key === 'P') togglePause();
});
window.addEventListener('keyup', e => keys[e.key] = false);

function togglePause() {
    if (!gameRunning) return;
    paused = !paused;
    pausedScreen.classList.toggle('hidden');
}

// === ФОРМАТ ВРЕМЕНИ ===
function formatTime(seconds) {
    const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    return `${mins}:${secs}`;
}

// === СОЗДАНИЕ ЭМОДЗИ ===
function createEmoji(text, className, x, y) {
    const el = document.createElement('div');
    el.textContent = text;
    el.className = `emoji ${className}`;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    gameArea.appendChild(el);
    return el;
}

// === ОБЪЕКТЫ ===
function spawnStar() {
    const x = Math.random() * (WIDTH - 50) + 25;
    const el = createEmoji('⭐', 'star', x, -40);
    stars.push({ el, x, y: -40, speed: 1.5 });
}

function spawnMeteor() {
    const x = Math.random() * (WIDTH - 50) + 25;
    const el = createEmoji('☄️', 'meteor', x, -20);
    meteors.push({ el, x, y: -20, speed: 0.2 + Math.random() * 1 });
}

function spawnBlackHole() {
    if (blackHole) return;
    const x = Math.random() * (WIDTH - 100) + 50;
    const el = createEmoji('🕳️', 'blackhole', x, -100);
    blackHole = { el, x, y: -100, speed: 2 };
    blackHoleTimer = 0;
}

function spawnPlayer() {
    player = createEmoji('🚀', 'rocket', 180, 500);
}

// === СТАРТ ИГРЫ ===
function startGame() {
    // ПОЛНЫЙ СБРОС
    document.querySelectorAll('.emoji').forEach(el => el.remove());
    stars = []; meteors = []; blackHole = null;
    score = 0; timer = 0; lives = 3; blackHolesAvoided = 0; blackHoleTimer = 0;
    scoreElement.textContent = '0';
    timerElement.textContent = '00:00';
    livesElement.textContent = '❤️❤️❤️';
    blackholeAvoidedElement.textContent = '0';
    gameOverScreen.classList.add('hidden');

    document.getElementById('startScreen').remove();
    document.getElementById('gameContainer').classList.remove('hidden');

    gameRunning = true;
    spawnPlayer();
    initGame();
    requestAnimationFrame(gameLoop);
}

function initGame() {
    for (let i = 0; i < 5; i++) {
        setTimeout(spawnStar, i * 300);
    }
    setTimeout(spawnMeteor, 800);
}

// === КОЛЛИЗИЯ ===
function collision(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy) < 45;
}

// === ОСНОВНОЙ ЦИКЛ ===
function gameLoop() {
    if (!player || !gameRunning || paused) {
        if (gameRunning && !paused) requestAnimationFrame(gameLoop);
        return;
    }

    // Движение ракеты
    if ((keys['ArrowLeft'] || keys['a']) && player.offsetLeft > 0) {
        player.style.left = (player.offsetLeft - 7) + 'px';
    }
    if ((keys['ArrowRight'] || keys['d']) && player.offsetLeft < WIDTH - 60) {
        player.style.left = (player.offsetLeft + 7) + 'px';
    }

    // Таймер
    timer++;
    timerElement.textContent = formatTime(Math.floor(timer / 60));

    // БОНУС КАЖДЫЕ 30 СЕКУНД
    if (timer % 1800 === 0 && timer > 0) {
        score += 100;
        scoreElement.textContent = score;
    }

    // Спавн
    if (Math.random() < 0.04) spawnStar();
    if (Math.random() < 0.03) spawnMeteor();
    blackHoleTimer++;
    if (blackHoleTimer > 500 && Math.random() < 0.05) spawnBlackHole();

    // Звёзды (+5)
    stars = stars.filter(s => {
        s.y += s.speed;
        s.el.style.top = s.y + 'px';
        if (s.y > HEIGHT) { s.el.remove(); return false; }

        if (collision({ x: player.offsetLeft + 25, y: player.offsetTop + 25 }, { x: s.x + 15, y: s.y + 15 })) {
            score += 5;
            scoreElement.textContent = score;
            s.el.remove();
            return false;
        }
        return true;
    });

    // Метеоры (-1 жизнь)
    meteors = meteors.filter(m => {
        m.y += m.speed;
        m.el.style.top = m.y + 'px';
        if (m.y > HEIGHT) { m.el.remove(); return false; }

        if (collision({ x: player.offsetLeft + 25, y: player.offsetTop + 25 }, { x: m.x + 20, y: m.y + 20 })) {
            lives--;
            livesElement.textContent = '❤️'.repeat(lives);
            m.el.remove();
            if (lives <= 0) endGame();
            return false;
        }
        return true;
    });

    // ЧЁРНАЯ ДЫРА — ПОПАДАНИЕ = КОНЕЦ!
    if (blackHole) {
        blackHole.y += blackHole.speed;
        blackHole.el.style.top = blackHole.y + 'px';

        if (collision({ x: player.offsetLeft + 25, y: player.offsetTop + 25 }, { x: blackHole.x + 40, y: blackHole.y + 40 })) {
            endGame(); // ← КОНЕЦ ИГРЫ!
            return;
        }

        if (blackHole.y > HEIGHT) {
            blackHole.el.remove();
            blackHole = null;
            blackHolesAvoided++;
            blackholeAvoidedElement.textContent = blackHolesAvoided;
            score += 50;
            scoreElement.textContent = score;
        }
    }

    requestAnimationFrame(gameLoop);
}

// === КОНЕЦ ИГРЫ ===
function endGame() {
    gameRunning = false;
    finalScoreElement.textContent = score;
    gameOverScreen.classList.remove('hidden');
}

// === ПЕРЕЗАПУСК (СЧЁТ = 0) ===
function restart() {
    startGame();
}

// === СОХРАНЕНИЕ ===
function saveScore() {
    const name = document.getElementById('playerName').value || "Аноним";
    fetch('/save-score/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, score })
    }).then(() => alert('Рекорд сохранён!'));
}