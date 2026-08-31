const board = document.querySelector("#snake-board");
const status = document.querySelector("#snake-status");
const panel = document.querySelector(".snake-panel");

const width = 25;
const height = 11;
const vectors = [
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
  { x: 0, y: -1 },
];

let snake;
let direction;
let apple;
let walls;
let score;
let run = 0;
let stepsBeforeCrash;
let seekingWall;
let crashed;

function samePosition(a, b) {
  return a.x === b.x && a.y === b.y;
}

function isInside(point) {
  return point.x >= 0 && point.x < width && point.y >= 0 && point.y < height;
}

function isWall(point) {
  return walls.some((wall) => samePosition(wall, point));
}

function nextPoint(vector) {
  return { x: snake[0].x + vector.x, y: snake[0].y + vector.y };
}

function isReverse(vector) {
  return vector.x === -direction.x && vector.y === -direction.y;
}

function isSafe(vector) {
  const next = nextPoint(vector);
  return isInside(next) && !isWall(next) && !snake.slice(0, -1).some((part) => samePosition(part, next));
}

function generateWalls() {
  walls = [];
  const candidates = Array.from({ length: height - 2 }, (_, index) => index + 1)
    .filter((row) => row !== 5)
    .sort(() => Math.random() - 0.5);
  let rows = [];

  for (const row of candidates) {
    if (rows.every((selected) => Math.abs(selected - row) >= 3)) rows.push(row);
    if (rows.length === 3) break;
  }

  if (rows.length < 3) rows = [1, 4, 7];

  const leftCount = Math.random() < 0.5 ? 1 : 2;
  const maximumLength = Math.floor(width * (2 / 3));

  rows.forEach((y, index) => {
    const length = 3 + Math.floor(Math.random() * (maximumLength - 2));
    const fromLeft = index < leftCount;
    for (let offset = 0; offset < length; offset += 1) {
      walls.push({ x: fromLeft ? offset : width - 1 - offset, y });
    }
  });
}

function placeApple() {
  const open = [];
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const point = { x, y };
      if (!snake.some((part) => samePosition(part, point)) && !isWall(point)) open.push(point);
    }
  }
  apple = open[Math.floor(Math.random() * open.length)];
}

function render(headCharacter = "O") {
  const cells = Array.from({ length: height }, () => Array(width).fill(" "));
  walls.forEach((wall) => {
    cells[wall.y][wall.x] = "=";
  });
  cells[apple.y][apple.x] = "*";
  snake.slice().reverse().forEach((part, index) => {
    if (isInside(part)) cells[part.y][part.x] = index === snake.length - 1 ? headCharacter : "o";
  });

  const edge = `+${"-".repeat(width)}+`;
  board.textContent = [edge, ...cells.map((row) => `|${row.join("")}|`), edge].join("\n");
}

function chooseWallDirection() {
  const head = snake[0];
  const choices = vectors
    .filter((vector) => !isReverse(vector))
    .map((vector) => {
      let distance;
      if (vector.x < 0) distance = head.x;
      if (vector.x > 0) distance = width - 1 - head.x;
      if (vector.y < 0) distance = head.y;
      if (vector.y > 0) distance = height - 1 - head.y;
      return { vector, distance };
    })
    .sort((a, b) => a.distance - b.distance);
  return choices[0].vector;
}

function reset() {
  run += 1;
  score = 0;
  direction = vectors[0];
  snake = [
    { x: 8, y: 5 },
    { x: 7, y: 5 },
    { x: 6, y: 5 },
    { x: 5, y: 5 },
  ];
  generateWalls();
  stepsBeforeCrash = 25 + Math.floor(Math.random() * 34);
  seekingWall = false;
  crashed = false;
  panel.classList.remove("is-crashed");
  status.textContent = `SCORE ${String(score).padStart(3, "0")}`;
  placeApple();
  render();
}

function crash() {
  crashed = true;
  panel.classList.add("is-crashed");
  status.textContent = "WALL HIT // RESET";
  render("X");
  window.setTimeout(reset, 1250);
}

function tick() {
  if (crashed) return;

  if (!seekingWall) {
    const safeDirections = vectors.filter((vector) => !isReverse(vector) && isSafe(vector));
    if (!isSafe(direction) || Math.random() < 0.28) {
      direction = safeDirections[Math.floor(Math.random() * safeDirections.length)] || direction;
    }
    stepsBeforeCrash -= 1;
    if (stepsBeforeCrash <= 0) {
      seekingWall = true;
      direction = chooseWallDirection();
    }
  }

  const next = nextPoint(direction);
  if (!isInside(next) || isWall(next)) {
    crash();
    return;
  }

  snake.unshift(next);
  if (samePosition(next, apple)) {
    score += 1;
    status.textContent = `SCORE ${String(score).padStart(3, "0")}`;
    placeApple();
  } else {
    snake.pop();
  }
  render();
}

reset();

if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  window.setInterval(tick, 145);
}
