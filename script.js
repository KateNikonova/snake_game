const canvas = document.getElementById('game-board');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const restartButton = document.getElementById('restart-btn');

// Константы
const GRID_SIZE = 20;
const TILE_COUNT = canvas.width / GRID_SIZE;

// Переменные игры
let snake = [{x: 10, y: 10}]; // Начальная позиция змейки
let food = generateFood(); // Генерируем первую еду
let direction = {x: 0, y: 0}; // Начальное направление
let lastDirection = {x: 0, y: 0}; // Предыдущее направление
let score = 0;
let gameOver = false;
let gameSpeed = 150; // Скорость игры (мс)
let gameLoopId;

// Функция обновления состояния игры
function update() {
    // Сохраняем текущее направление перед изменением
    lastDirection = {...direction};

    // Рассчитываем новую позицию головы
    const head = {...snake[0]};
    head.x += direction.x;
    head.y += direction.y;

    // Проверка столкновения со стеной
    if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
        gameOver = true;
        return;
    }

    // Проверка столкновения с самой собой
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver = true;
            return;
        }
    }

    // Добавляем новую голову
    snake.unshift(head);

    // Проверка, съела ли змейка еду
    if (head.x === food.x && head.y === food.y) {
    // Увеличиваем счет
    score += 10;
    scoreElement.textContent = score;

    // Добавляем анимацию пульсации
    scoreElement.classList.add('pulse');
    setTimeout(() => scoreElement.classList.remove('pulse'), 500);

    // Генерируем новую еду
    food = generateFood();

    // Увеличиваем скорость игры каждые 50 очков
    if (score % 50 === 0 && gameSpeed > 50) {
        gameSpeed -= 10;
    }
} else {
        // Если еда не съедена, удаляем хвост
        snake.pop();
    }
}

function draw() {
    // Очищаем холст с легким градиентом
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#a5d6a7');
    gradient.addColorStop(1, '#c8e6c9');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Рисуем сетку
    drawGrid();

    // Рисуем реалистичное яблоко
    drawApple(food.x * GRID_SIZE + GRID_SIZE / 2, food.y * GRID_SIZE + GRID_SIZE / 2);

    // Рисуем зеленую змейку
    snake.forEach((segment, index) => {
        const isHead = index === 0;
        const segmentSize = isHead ? GRID_SIZE - 2 : GRID_SIZE - 4;
        const offset = isHead ? 1 : 2;

        if (isHead) {
            // Голова змейки - темно-зеленая
            ctx.fillStyle = '#1b5e20';
            ctx.beginPath();
            ctx.arc(
                segment.x * GRID_SIZE + GRID_SIZE / 2,
                segment.y * GRID_SIZE + GRID_SIZE / 2,
                segmentSize / 2,
                0,
                Math.PI * 2
            );
            ctx.fill();

            // Глаза змейки
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(
                segment.x * GRID_SIZE + GRID_SIZE / 3,
                segment.y * GRID_SIZE + GRID_SIZE / 3,
                GRID_SIZE / 8,
                0,
                Math.PI * 2
            );
            ctx.arc(
                segment.x * GRID_SIZE + 2 * GRID_SIZE / 3,
                segment.y * GRID_SIZE + GRID_SIZE / 3,
                GRID_SIZE / 8,
                0,
                Math.PI * 2
            );
            ctx.fill();

            // Зрачки
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(
                segment.x * GRID_SIZE + GRID_SIZE / 3,
                segment.y * GRID_SIZE + GRID_SIZE / 3,
                GRID_SIZE / 16,
                0,
                Math.PI * 2
            );
            ctx.arc(
                segment.x * GRID_SIZE + 2 * GRID_SIZE / 3,
                segment.y * GRID_SIZE + GRID_SIZE / 3,
                GRID_SIZE / 16,
                0,
                Math.PI * 2
            );
            ctx.fill();
        } else {
            // Тело змейки с зеленым градиентом
            const gradient = ctx.createLinearGradient(
                segment.x * GRID_SIZE + offset,
                segment.y * GRID_SIZE + offset,
                segment.x * GRID_SIZE + offset + segmentSize,
                segment.y * GRID_SIZE + offset + segmentSize
            );
            gradient.addColorStop(0, '#4caf50');
            gradient.addColorStop(1, '#388e3c');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.roundRect(
                segment.x * GRID_SIZE + offset,
                segment.y * GRID_SIZE + offset,
                segmentSize,
                segmentSize,
                8
            );
            ctx.fill();

            // Легкая тень для объема
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    });
}

function drawApple(x, y) {
    const radius = GRID_SIZE / 2 - 2;

    // Основное яблоко
    ctx.fillStyle = '#ff5252';
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    // Блик
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(x - radius/3, y - radius/3, radius/4, 0, Math.PI * 2);
    ctx.fill();

    // Тень
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.arc(x + radius/4, y + radius/4, radius/6, 0, Math.PI * 2);
    ctx.fill();

    // Черенок
    ctx.strokeStyle = '#795548';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y - radius);
    ctx.lineTo(x, y - radius - 5);
    ctx.stroke();

    // Листик
    ctx.fillStyle = '#4caf50';
    ctx.beginPath();
    ctx.ellipse(x - 2, y - radius - 2, 3, 5, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
}

function drawGrid() {
    ctx.strokeStyle = 'rgba(104, 159, 56, 0.2)';
    ctx.lineWidth = 1;

    for (let i = 0; i <= TILE_COUNT; i++) {
        // Вертикальные линии
        ctx.beginPath();
        ctx.moveTo(i * GRID_SIZE, 0);
        ctx.lineTo(i * GRID_SIZE, canvas.height);
        ctx.stroke();

        // Горизонтальные линии
        ctx.beginPath();
        ctx.moveTo(0, i * GRID_SIZE);
        ctx.lineTo(canvas.width, i * GRID_SIZE);
        ctx.stroke();
    }
}

// Функция генерации еды
function generateFood() {
    let newFood;
    let foodOnSnake;

    // Генерируем еду, пока не найдем позицию, не занятую змейкой
    do {
        foodOnSnake = false;
        newFood = {
            x: Math.floor(Math.random() * TILE_COUNT),
            y: Math.floor(Math.random() * TILE_COUNT)
        };

        // Проверяем, не на змейке ли еда
        for (const segment of snake) {
            if (segment.x === newFood.x && segment.y === newFood.y) {
                foodOnSnake = true;
                break;
            }
        }
    } while (foodOnSnake);

    return newFood;
}

// Функция отрисовки экрана "Game Over"
function drawGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'white';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 40);

    ctx.font = '24px Arial';
    ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
}

// Главный игровой цикл
function mainGameLoop() {
    if (gameOver) {
        drawGameOver();
        return;
    }

    update();
    draw();

    // Запускаем следующий кадр с текущей скоростью
    clearTimeout(gameLoopId);
    gameLoopId = setTimeout(mainGameLoop, gameSpeed);
}

// Обработка нажатий клавиш
document.addEventListener('keydown', (event) => {
    // Предотвращаем движение в противоположном направлении
    switch (event.key) {
        case 'ArrowUp':
            if (lastDirection.y !== 1) { // Не позволяем двигаться вниз, если сейчас движемся вверх
                direction = {x: 0, y: -1};
            }
            break;
        case 'ArrowDown':
            if (lastDirection.y !== -1) { // Не позволяем двигаться вверх, если сейчас движемся вниз
                direction = {x: 0, y: 1};
            }
            break;
        case 'ArrowLeft':
            if (lastDirection.x !== 1) { // Не позволяем двигаться вправо, если сейчас движемся влево
                direction = {x: -1, y: 0};
            }
            break;
        case 'ArrowRight':
            if (lastDirection.x !== -1) { // Не позволяем двигаться влево, если сейчас движемся вправо
                direction = {x: 1, y: 0};
            }
            break;
    }
});

// Кнопка перезапуска игры
restartButton.addEventListener('click', () => {
    resetGame();
    mainGameLoop();
});

// Функция сброса игры
function resetGame() {
    snake = [{x: 10, y: 10}];
    food = generateFood();
    direction = {x: 0, y: 0};
    lastDirection = {x: 0, y: 0};
    score = 0;
    scoreElement.textContent = score;
    gameOver = false;
    gameSpeed = 150;
}

// Запускаем игру
resetGame();
mainGameLoop();