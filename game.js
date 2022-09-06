function new2dCanvas(id, width, height) {
  const canvas = document.getElementById(id);
  const ctx = canvas.getContext("2d");
  canvas.width = width;
  canvas.height = height;
  return [canvas, ctx];
}

const [canvas, ctx] = new2dCanvas("play-area", 800, 480);

const pressed = {
  up: { key: "ArrowUp", is: false },
  down: { key: "ArrowDown", is: false },
  left: { key: "ArrowLeft", is: false },
  right: { key: "ArrowRight", is: false },
  last: "",
};

const FPS = 60;
const settings = {
  fps: FPS,
  fpsInterval: 1000 / FPS,
  cellSize: 40,
  pacmanR: 15,
  pacmanSpeed: 3,
  borderOffset: 3,
};

function isCircleRectCollision(c, r) {
  return (
    c.y - c.r + c.velocity.y - settings.borderOffset <= r.y + r.h &&
    c.x + c.r + c.velocity.x + settings.borderOffset >= r.x &&
    c.y + c.r + c.velocity.y + settings.borderOffset >= r.y &&
    c.x - c.r + c.velocity.x - settings.borderOffset <= r.x + r.w
  );
}

window.addEventListener("keydown", (e) => {
  switch (e.code) {
    case "ArrowUp":
      pressed.up.is = true;
      break;
    case "ArrowDown":
      pressed.down.is = true;
      break;
    case "ArrowRight":
      pressed.right.is = true;
      break;
    case "ArrowLeft":
      pressed.left.is = true;
      break;
    default:
      break;
  }
  pressed.last = e.code;
});

window.addEventListener("keyup", (e) => {
  switch (e.code) {
    case "ArrowUp":
      pressed.up.is = false;
      break;
    case "ArrowDown":
      pressed.down.is = false;
      break;
    case "ArrowRight":
      pressed.right.is = false;
      break;
    case "ArrowLeft":
      pressed.left.is = false;
      break;
    default:
      break;
  }
});

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
  static speed = settings.pacmanSpeed;
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.velocity = { x: 0, y: 0 };
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
    console.log({ x: this.x });
    switch (pressed.last) {
      case pressed.right.key:
        if (this.willCollideWithABoundary(Player.speed, 0)) {
          this.velocity.x = 0;
        } else {
          this.velocity.x = Player.speed;
          this.velocity.y = 0;
        }
        break;
      case pressed.left.key:
        if (this.willCollideWithABoundary(-Player.speed, 0)) {
          this.velocity.x = 0;
        } else {
          this.velocity.x = -Player.speed;
          this.velocity.y = 0;
        }
        break;
      case pressed.down.key:
        if (this.willCollideWithABoundary(0, Player.speed)) {
          this.velocity.y = 0;
        } else {
          this.velocity.x = 0;
          this.velocity.y = Player.speed;
        }
        break;
      case pressed.up.key:
        if (this.willCollideWithABoundary(0, -Player.speed)) {
          this.velocity.y = 0;
        } else {
          this.velocity.x = 0;
          this.velocity.y = -Player.speed;
        }
        break;
      default:
        break;
    }

    if (this.willCollideWithABoundary(this.velocity.x, this.velocity.y)) {
      this.velocity.x = 0;
      this.velocity.y = 0;
    }

    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }

  willCollideWithABoundary(xv, yv) {
    for (let i = 0; i < boundaries.length; i++)
      if (
        isCircleRectCollision(
          { ...this, velocity: { x: xv, y: yv } },
          boundaries[i]
        )
      )
        return true;
    return false;
  }
}

const map = [
  ["-", "-", "-", "-", "-", "-", "-"],
  ["-", " ", " ", " ", " ", " ", "-"],
  ["-", " ", "-", " ", "-", " ", "-"],
  ["-", " ", " ", " ", " ", " ", "-"],
  ["-", " ", " ", " ", " ", " ", "-"],
  ["-", " ", "-", " ", " ", " ", "-"],
  ["-", " ", " ", " ", " ", " ", "-"],
  ["-", " ", " ", " ", " ", " ", "-"],
  ["-", " ", " ", " ", " ", " ", "-"],
  ["-", " ", " ", " ", " ", " ", "-"],
  ["-", " ", " ", " ", " ", " ", "-"],
  ["-", "-", "-", "-", "-", "-", "-"],
];

const boundaries = [];
const player = new Player(
  settings.cellSize + settings.cellSize / 2,
  settings.cellSize + settings.cellSize / 2,
  { x: 0, y: 0 }
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
