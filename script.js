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
  const startOverlayEl = document.getElementById("snake-start-overlay");
  const startBtn = document.getElementById("snake-start");
  const overlayEl = document.getElementById("snake-overlay");
  const overlayScoreEl = document.getElementById("snake-over-score");
  const restartBtn = document.getElementById("snake-restart");

  if (
    !canvas ||
    !scoreEl ||
    !startOverlayEl ||
    !startBtn ||
    !overlayEl ||
    !overlayScoreEl ||
    !restartBtn
  ) {
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
    overlayEl.classList.add("is-visible");
    overlayEl.setAttribute("aria-hidden", "false");
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
    hasStarted = true;
    startOverlayEl.classList.remove("is-visible");
    startOverlayEl.setAttribute("aria-hidden", "true");
  }

  function resetGame({ showStartOverlay }) {
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
    overlayEl.classList.remove("is-visible");
    overlayEl.setAttribute("aria-hidden", "true");
    if (showStartOverlay) {
      startOverlayEl.classList.add("is-visible");
      startOverlayEl.setAttribute("aria-hidden", "false");
    } else {
      startOverlayEl.classList.remove("is-visible");
      startOverlayEl.setAttribute("aria-hidden", "true");
    }
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
    resetGame({ showStartOverlay: false });
    startGameLoop();
  });

  startBtn.addEventListener("click", () => {
    if (hasStarted || isGameOver) {
      return;
    }
    startBtn.blur();
    startGameLoop();
  });

  resetGame({ showStartOverlay: true });
}

if (pageId === "game-1") {
  initSnakeGame();
}

function initGlyphGuardGame() {
  const canvas = document.getElementById("glyph-canvas");
  const scoreEl = document.getElementById("glyph-score");
  const waveEl = document.getElementById("glyph-wave");
  const energyEl = document.getElementById("glyph-energy");
  const livesEl = document.getElementById("glyph-lives");
  const startOverlayEl = document.getElementById("glyph-start-overlay");
  const startBtn = document.getElementById("glyph-start");
  const overlayEl = document.getElementById("glyph-overlay");
  const overlayScoreEl = document.getElementById("glyph-over-score");
  const restartBtn = document.getElementById("glyph-restart");

  if (
    !canvas ||
    !scoreEl ||
    !waveEl ||
    !energyEl ||
    !livesEl ||
    !startOverlayEl ||
    !startBtn ||
    !overlayEl ||
    !overlayScoreEl ||
    !restartBtn
  ) {
    return;
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }

  const gridSize = 12;
  const cellSize = canvas.width / gridSize;
  const turretCost = 8;
  const sellRefund = 4;
  const tickMs = 1000 / 30;
  const dt = 1 / 30;

  const path = [
    { x: 0, y: 5 },
    { x: 1, y: 5 },
    { x: 2, y: 5 },
    { x: 3, y: 5 },
    { x: 3, y: 4 },
    { x: 3, y: 3 },
    { x: 4, y: 3 },
    { x: 5, y: 3 },
    { x: 6, y: 3 },
    { x: 7, y: 3 },
    { x: 8, y: 3 },
    { x: 8, y: 4 },
    { x: 8, y: 5 },
    { x: 8, y: 6 },
    { x: 9, y: 6 },
    { x: 10, y: 6 },
    { x: 11, y: 6 },
  ];

  const pathKeySet = new Set(path.map((node) => `${node.x},${node.y}`));

  let turrets = [];
  let enemies = [];
  let wave = 1;
  let score = 0;
  let energy = 20;
  let lives = 10;
  let enemiesToSpawn = 0;
  let spawnTimer = 0;
  let gameLoopTimer = null;
  let hasStarted = false;
  let isGameOver = false;

  function formatNumber(value, size) {
    return String(value).padStart(size, "0");
  }

  function updateHud() {
    scoreEl.textContent = `SCORE [${formatNumber(score, 4)}]`;
    waveEl.textContent = `WAVE [${formatNumber(wave, 2)}]`;
    energyEl.textContent = `ENERGY [${formatNumber(energy, 2)}]`;
    livesEl.textContent = `LIVES [${formatNumber(Math.max(lives, 0), 2)}]`;
    livesEl.classList.toggle("error", lives <= 3);
  }

  function worldPosFromPath(pathIndex, progress) {
    const current = path[pathIndex];
    const next = path[Math.min(pathIndex + 1, path.length - 1)];
    const mix = Math.min(Math.max(progress, 0), 1);
    return {
      x: (current.x + (next.x - current.x) * mix + 0.5) * cellSize,
      y: (current.y + (next.y - current.y) * mix + 0.5) * cellSize,
    };
  }

  function spawnEnemy() {
    const hp = 2 + Math.floor((wave - 1) * 0.6);
    const speed = 1.3 + Math.min(0.9, (wave - 1) * 0.06);
    enemies.push({
      pathIndex: 0,
      progress: 0,
      hp,
      maxHp: hp,
      speed,
      reward: 2,
    });
  }

  function startWave(level) {
    wave = level;
    enemiesToSpawn = 5 + level * 2;
    spawnTimer = 0;
    energy += 4 + Math.floor(level * 0.5);
    updateHud();
  }

  function drawGrid() {
    ctx.strokeStyle = "rgba(31, 82, 31, 0.32)";
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

  function drawPath() {
    path.forEach((node) => {
      ctx.fillStyle = "rgba(255, 176, 0, 0.16)";
      ctx.fillRect(node.x * cellSize, node.y * cellSize, cellSize, cellSize);
    });
  }

  function drawTurrets() {
    turrets.forEach((turret) => {
      const x = turret.x * cellSize;
      const y = turret.y * cellSize;
      ctx.fillStyle = "#33ff00";
      ctx.fillRect(x + 6, y + 6, cellSize - 12, cellSize - 12);
      ctx.strokeStyle = "#0a0a0a";
      ctx.strokeRect(x + 10, y + 10, cellSize - 20, cellSize - 20);
    });
  }

  function drawEnemies() {
    enemies.forEach((enemy) => {
      const pos = worldPosFromPath(enemy.pathIndex, enemy.progress);
      const radius = cellSize * 0.24;
      ctx.fillStyle = "#ffb000";
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
      ctx.fill();

      const hpBarWidth = cellSize * 0.6;
      const hpBarX = pos.x - hpBarWidth / 2;
      const hpBarY = pos.y - radius - 9;
      ctx.fillStyle = "rgba(255, 51, 51, 0.45)";
      ctx.fillRect(hpBarX, hpBarY, hpBarWidth, 4);
      ctx.fillStyle = "#33ff00";
      ctx.fillRect(hpBarX, hpBarY, hpBarWidth * (enemy.hp / enemy.maxHp), 4);
    });
  }

  function render() {
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawPath();
    drawGrid();
    drawTurrets();
    drawEnemies();
  }

  function stopLoop() {
    if (gameLoopTimer !== null) {
      window.clearInterval(gameLoopTimer);
      gameLoopTimer = null;
    }
  }

  function showGameOver() {
    isGameOver = true;
    stopLoop();
    overlayScoreEl.textContent = `FINAL SCORE [${formatNumber(score, 4)}]`;
    overlayEl.classList.add("is-visible");
    overlayEl.setAttribute("aria-hidden", "false");
  }

  function updateEnemies() {
    const survivors = [];

    enemies.forEach((enemy) => {
      enemy.progress += enemy.speed * dt;

      while (enemy.progress >= 1 && enemy.pathIndex < path.length - 1) {
        enemy.progress -= 1;
        enemy.pathIndex += 1;
      }

      if (enemy.pathIndex >= path.length - 1 && enemy.progress >= 1) {
        lives -= 1;
        updateHud();
        return;
      }

      survivors.push(enemy);
    });

    enemies = survivors;

    if (lives <= 0 && !isGameOver) {
      showGameOver();
    }
  }

  function updateTurrets() {
    turrets.forEach((turret) => {
      turret.cooldown -= 1;
      if (turret.cooldown > 0) {
        return;
      }

      const turretPosX = (turret.x + 0.5) * cellSize;
      const turretPosY = (turret.y + 0.5) * cellSize;
      const rangePx = cellSize * 2.8;
      let targetEnemy = null;
      let targetDist = Number.POSITIVE_INFINITY;

      enemies.forEach((enemy) => {
        const pos = worldPosFromPath(enemy.pathIndex, enemy.progress);
        const dx = pos.x - turretPosX;
        const dy = pos.y - turretPosY;
        const dist = Math.hypot(dx, dy);
        if (dist <= rangePx && dist < targetDist) {
          targetEnemy = enemy;
          targetDist = dist;
        }
      });

      if (!targetEnemy) {
        return;
      }

      targetEnemy.hp -= 1;
      turret.cooldown = 15;
    });

    const aliveEnemies = [];
    enemies.forEach((enemy) => {
      if (enemy.hp <= 0) {
        score += 10;
        energy += enemy.reward;
      } else {
        aliveEnemies.push(enemy);
      }
    });
    enemies = aliveEnemies;
    updateHud();
  }

  function updateSpawns() {
    if (enemiesToSpawn > 0) {
      if (spawnTimer <= 0) {
        spawnEnemy();
        enemiesToSpawn -= 1;
        spawnTimer = Math.max(8, 34 - wave);
      } else {
        spawnTimer -= 1;
      }
      return;
    }

    if (enemies.length === 0 && !isGameOver) {
      startWave(wave + 1);
    }
  }

  function step() {
    if (!hasStarted || isGameOver) {
      return;
    }

    updateSpawns();
    updateEnemies();
    if (isGameOver) {
      render();
      return;
    }
    updateTurrets();
    render();
  }

  function startLoop() {
    if (hasStarted || isGameOver) {
      return;
    }
    hasStarted = true;
    startOverlayEl.classList.remove("is-visible");
    startOverlayEl.setAttribute("aria-hidden", "true");
    stopLoop();
    gameLoopTimer = window.setInterval(step, tickMs);
  }

  function resetGame(showStartOverlay) {
    stopLoop();
    turrets = [];
    enemies = [];
    wave = 1;
    score = 0;
    energy = 20;
    lives = 10;
    enemiesToSpawn = 0;
    spawnTimer = 0;
    hasStarted = false;
    isGameOver = false;
    overlayEl.classList.remove("is-visible");
    overlayEl.setAttribute("aria-hidden", "true");

    if (showStartOverlay) {
      startOverlayEl.classList.add("is-visible");
      startOverlayEl.setAttribute("aria-hidden", "false");
    } else {
      startOverlayEl.classList.remove("is-visible");
      startOverlayEl.setAttribute("aria-hidden", "true");
    }

    startWave(1);
    render();
  }

  function findTurretIndex(x, y) {
    return turrets.findIndex((turret) => turret.x === x && turret.y === y);
  }

  canvas.addEventListener("click", (event) => {
    if (!hasStarted || isGameOver) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.floor(((event.clientX - rect.left) * scaleX) / cellSize);
    const y = Math.floor(((event.clientY - rect.top) * scaleY) / cellSize);

    if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) {
      return;
    }

    if (pathKeySet.has(`${x},${y}`)) {
      return;
    }

    const turretIndex = findTurretIndex(x, y);
    if (turretIndex !== -1) {
      turrets.splice(turretIndex, 1);
      energy += sellRefund;
      updateHud();
      render();
      return;
    }

    if (energy < turretCost) {
      return;
    }

    energy -= turretCost;
    turrets.push({ x, y, cooldown: 8 });
    updateHud();
    render();
  });

  startBtn.addEventListener("click", () => {
    startBtn.blur();
    startLoop();
  });

  restartBtn.addEventListener("click", () => {
    resetGame(false);
    startLoop();
  });

  resetGame(true);
}

if (pageId === "game-2") {
  initGlyphGuardGame();
}

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}
