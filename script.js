const menuButton = document.querySelector(".menu-btn");
const topNav = document.querySelector(".top-nav");
const revealItems = document.querySelectorAll(".reveal");
const yearEl = document.getElementById("year");
const pageId = document.body.dataset.page;
const typingTargets = document.querySelectorAll("[data-typing]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (menuButton && topNav) {
  menuButton.addEventListener("click", () => {
    const isOpen = topNav.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });

  topNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      topNav.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
    });
  });
}

if (pageId) {
  const activeLink = document.querySelector(`[data-nav="${pageId}"]`);
  if (activeLink) {
    activeLink.classList.add("active");
    activeLink.setAttribute("aria-current", "page");
  }
}

if (revealItems.length > 0 && !reduceMotion) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    },
    { threshold: 0.15 }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

function typeText(target, text, delay = 38) {
  let index = 0;
  target.textContent = "";

  const tick = () => {
    if (index >= text.length) {
      return;
    }

    target.textContent += text[index];
    index += 1;
    window.setTimeout(tick, delay);
  };

  tick();
}

typingTargets.forEach((target) => {
  const text = target.dataset.text || "";

  if (reduceMotion) {
    target.textContent = text;
    return;
  }

  typeText(target, text);
});

function initSnakeGame() {
  const canvas = document.getElementById("snake-canvas");
  const scoreEl = document.getElementById("snake-score");
  const overlayEl = document.getElementById("snake-overlay");
  const overlayScoreEl = document.getElementById("snake-over-score");
  const restartBtn = document.getElementById("snake-restart");

  if (!canvas || !scoreEl || !overlayEl || !overlayScoreEl || !restartBtn) {
    return;
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }

  const gridSize = 24;
  const cellSize = canvas.width / gridSize;
  const initialTickMs = 120;

  let snake = [];
  let direction = { x: 1, y: 0 };
  let queuedDirection = { x: 1, y: 0 };
  let apple = { x: 0, y: 0 };
  let score = 0;
  let tickTimer = null;
  let hasStarted = false;
  let isGameOver = false;

  function formatScore(value) {
    return String(value).padStart(3, "0");
  }

  function updateScoreText() {
    scoreEl.textContent = `SCORE [${formatScore(score)}]`;
  }

  function randomApplePosition() {
    let position = { x: 0, y: 0 };
    let isOnSnake = true;

    while (isOnSnake) {
      position = {
        x: Math.floor(Math.random() * gridSize),
        y: Math.floor(Math.random() * gridSize),
      };
      isOnSnake = snake.some(
        (segment) => segment.x === position.x && segment.y === position.y
      );
    }

    return position;
  }

  function drawCell(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
  }

  function drawGrid() {
    ctx.strokeStyle = "rgba(31, 82, 31, 0.35)";
    ctx.lineWidth = 1;

    for (let i = 0; i <= gridSize; i += 1) {
      const pos = i * cellSize;
      ctx.beginPath();
      ctx.moveTo(pos, 0);
      ctx.lineTo(pos, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, pos);
      ctx.lineTo(canvas.width, pos);
      ctx.stroke();
    }
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawGrid();

    drawCell(apple.x, apple.y, "#ffb000");

    snake.forEach((segment, index) => {
      const segmentColor = index === 0 ? "#33ff00" : "#1f9f13";
      drawCell(segment.x, segment.y, segmentColor);
    });
  }

  function stopGameLoop() {
    if (tickTimer !== null) {
      window.clearInterval(tickTimer);
      tickTimer = null;
    }
  }

  function handleGameOver() {
    isGameOver = true;
    stopGameLoop();
    overlayScoreEl.textContent = `APPLES EATEN [${score}]`;
    overlayEl.hidden = false;
  }

  function step() {
    direction = queuedDirection;

    const head = snake[0];
    const nextHead = {
      x: head.x + direction.x,
      y: head.y + direction.y,
    };

    const hitsWall =
      nextHead.x < 0 ||
      nextHead.x >= gridSize ||
      nextHead.y < 0 ||
      nextHead.y >= gridSize;

    const hitsSelf = snake.some(
      (segment) => segment.x === nextHead.x && segment.y === nextHead.y
    );

    if (hitsWall || hitsSelf) {
      handleGameOver();
      return;
    }

    snake.unshift(nextHead);

    if (nextHead.x === apple.x && nextHead.y === apple.y) {
      score += 1;
      updateScoreText();
      apple = randomApplePosition();
    } else {
      snake.pop();
    }

    render();
  }

  function startGameLoop() {
    stopGameLoop();
    tickTimer = window.setInterval(step, initialTickMs);
  }

  function resetGame() {
    snake = [
      { x: 12, y: 12 },
      { x: 11, y: 12 },
      { x: 10, y: 12 },
    ];
    direction = { x: 1, y: 0 };
    queuedDirection = { x: 1, y: 0 };
    apple = randomApplePosition();
    score = 0;
    hasStarted = false;
    isGameOver = false;
    overlayEl.hidden = true;
    updateScoreText();
    render();
  }

  function updateDirection(nextDirection) {
    if (isGameOver) {
      return;
    }

    const isReverse =
      nextDirection.x === -direction.x && nextDirection.y === -direction.y;

    if (isReverse) {
      return;
    }

    queuedDirection = nextDirection;

    if (!hasStarted) {
      hasStarted = true;
      startGameLoop();
    }
  }

  document.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    const inputMap = {
      arrowup: { x: 0, y: -1 },
      w: { x: 0, y: -1 },
      arrowdown: { x: 0, y: 1 },
      s: { x: 0, y: 1 },
      arrowleft: { x: -1, y: 0 },
      a: { x: -1, y: 0 },
      arrowright: { x: 1, y: 0 },
      d: { x: 1, y: 0 },
    };

    const nextDirection = inputMap[key];
    if (!nextDirection) {
      return;
    }

    event.preventDefault();
    updateDirection(nextDirection);
  });

  restartBtn.addEventListener("click", () => {
    resetGame();
  });

  resetGame();
}

if (pageId === "game-1") {
  initSnakeGame();
}

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}
