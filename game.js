function new2dCanvas(id, width, height) {
  const canvas = document.getElementById(id);
  const ctx = canvas.getContext("2d");
  canvas.width = width;
  canvas.height = height;
  return [canvas, ctx];
}

const [canvas, ctx] = new2dCanvas("play-area", 800, 500);

const pressed = {
  up: false,
  down: false,
  left: false,
  right: false,
};

window.addEventListener("keydown", (e) => {
  switch (e.code) {
    case "ArrowUp":
      pressed.up = true;
      break;
    case "ArrowDown":
      pressed.down = true;
      break;
    case "ArrowRight":
      pressed.right = true;
      break;
    case "ArrowLeft":
      pressed.left = true;
      break;
    default:
      break;
  }
});

window.addEventListener("keyup", (e) => {
  switch (e.code) {
    case "ArrowUp":
      pressed.up = false;
      break;
    case "ArrowDown":
      pressed.down = false;
      break;
    case "ArrowRight":
      pressed.right = false;
      break;
    case "ArrowLeft":
      pressed.left = false;
      break;
    default:
      break;
  }
});

const FPS = 60;
const settings = {
  fps: FPS,
  fpsInterval: 1000 / FPS,
  cellSize: 40,
  pacmanR: 15,
};

class Boundary {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = settings.cellSize;
    this.h = settings.cellSize;
  }

  draw() {
    ctx.fillStyle = "blue";
    ctx.fillRect(this.x, this.y, this.w, this.h);
  }
}

class Player {
  constructor(x, y, velocity) {
    this.x = x;
    this.y = y;
    this.velocity = velocity;
    this.r = settings.pacmanR;
  }

  draw() {
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  }

  update() {
    if (pressed.right) this.x += this.velocity.x;
    if (pressed.left) this.x -= this.velocity.x;
    if (pressed.down) this.y += this.velocity.y;
    if (pressed.up) this.y -= this.velocity.y;

    for (let i = 0; i < boundaries.length; i++) {
      const bound = boundaries[i];
      if (
        this.y - this.r <= bound.y + bound.h &&
        this.x + this.r >= bound.x &&
        this.y + this.r >= bound.y &&
        this.x - this.r <= bound.x + bound.w
      ) {
        console.log("collision");
      }
    }
  }
}

const map = [
  ["-", "-", "-", "-", "-", "-"],
  ["-", " ", " ", " ", " ", "-"],
  ["-", " ", " ", " ", " ", "-"],
  ["-", " ", " ", " ", " ", "-"],
  ["-", " ", " ", " ", " ", "-"],
  ["-", " ", "-", " ", " ", "-"],
  ["-", " ", " ", " ", " ", "-"],
  ["-", " ", " ", " ", " ", "-"],
  ["-", " ", " ", " ", " ", "-"],
  ["-", " ", " ", " ", " ", "-"],
  ["-", " ", " ", " ", " ", "-"],
  ["-", "-", "-", "-", "-", "-"],
];

const boundaries = [];
const player = new Player(
  settings.cellSize + settings.cellSize / 2,
  settings.cellSize + settings.cellSize / 2,
  { x: 5, y: 5 }
);

(function setUpMap() {
  const { cellSize } = settings;
  map.forEach((row, i) => {
    row.forEach((cell, j) => {
      switch (cell) {
        case "-":
          boundaries.push(new Boundary(j * cellSize, i * cellSize));
          break;
        default:
          break;
      }
    });
  });
})();

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < boundaries.length; i++) {
    boundaries[i].draw();
  }
  player.draw();
  player.update();
}

let stop = false,
  now,
  lastFrame;

(function startAnimating() {
  lastFrame = window.performance.now();
  animate();
})();

function animate(newtime) {
  if (stop) return;
  requestAnimationFrame(animate);
  now = newtime;
  const elapsed = now - lastFrame;
  if (elapsed > settings.fpsInterval) {
    lastFrame = now - (elapsed % settings.fpsInterval);
    update();
  }
}
