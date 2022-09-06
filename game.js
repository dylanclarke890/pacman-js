function new2dCanvas(id, width, height) {
  const canvas = document.getElementById(id);
  const ctx = canvas.getContext("2d");
  canvas.width = width;
  canvas.height = height;
  return [canvas, ctx];
}

const [canvas, ctx] = new2dCanvas("play-area", 800, 520);

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
  pelletR: 3,
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
  constructor(x, y, image) {
    this.x = x;
    this.y = y;
    this.w = settings.cellSize;
    this.h = settings.cellSize;
    this.image = image;
  }

  draw() {
    ctx.drawImage(this.image, this.x, this.y);
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

class Pellet {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.r = settings.pelletR;
  }

  draw() {
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  }
}

const map = [
  ["1", "-", "-", "-", "-", "-", "-", "-", "-", "-", "2"],
  ["|", ".", ".", ".", ".", ".", ".", ".", ".", ".", "|"],
  ["|", ".", "b", ".", "[", "7", "]", ".", "b", ".", "|"],
  ["|", ".", ".", ".", ".", "_", ".", ".", ".", ".", "|"],
  ["|", ".", "[", "]", ".", ".", ".", "[", "]", ".", "|"],
  ["|", ".", ".", ".", ".", "^", ".", ".", ".", ".", "|"],
  ["|", ".", "b", ".", "[", "+", "]", ".", "b", ".", "|"],
  ["|", ".", ".", ".", ".", "_", ".", ".", ".", ".", "|"],
  ["|", ".", "[", "]", ".", ".", ".", "[", "]", ".", "|"],
  ["|", ".", ".", ".", ".", "^", ".", ".", ".", ".", "|"],
  ["|", ".", "b", ".", "[", "5", "]", ".", "b", ".", "|"],
  ["|", ".", ".", ".", ".", ".", ".", ".", ".", ".", "|"],
  ["3", "-", "-", "-", "-", "-", "-", "-", "-", "-", "4"],
];

const boundaries = [];
const pellets = [];
const player = new Player(
  settings.cellSize + settings.cellSize / 2,
  settings.cellSize + settings.cellSize / 2,
  { x: 0, y: 0 }
);

const assets = {
  block: "./assets/block.png",
  cap: {
    top: "./assets/capTop.png",
    right: "./assets/capRight.png",
    left: "./assets/capLeft.png",
    bottom: "./assets/capBottom.png",
  },
  pipe: {
    horizontal: "./assets/pipeHorizontal.png",
    vertical: "./assets/pipeVertical.png",
    cross: "./assets/pipeCross.png",
    bottomRight: "./assets/pipeCornerBR.png",
    bottomLeft: "./assets/pipeCornerBL.png",
    topRight: "./assets/pipeCornerTR.png",
    topLeft: "./assets/pipeCornerTL.png",
  },
  pipeConnector: {
    top: "./assets/pipeConnectorTop.png",
    right: "./assets/pipeConnectorRight.png",
    left: "./assets/pipeConnectorLeft.png",
    bottom: "./assets/pipeConnectorBottom.png",
    downwards: "./assets/pipeConnectorDownwards.png",
  },
};

function newImage(src) {
  const img = new Image();
  img.src = src;
  return img;
}

(function setUpMap() {
  const { cellSize } = settings;
  map.forEach((row, i) => {
    row.forEach((cell, j) => {
      const x = j * cellSize,
        y = i * cellSize;
      switch (cell) {
        case "-":
          boundaries.push(new Boundary(x, y, newImage(assets.pipe.horizontal)));
          break;
        case "|":
          boundaries.push(new Boundary(x, y, newImage(assets.pipe.vertical)));
          break;
        case "1":
          boundaries.push(new Boundary(x, y, newImage(assets.pipe.topLeft)));
          break;
        case "2":
          boundaries.push(new Boundary(x, y, newImage(assets.pipe.topRight)));
          break;
        case "3":
          boundaries.push(new Boundary(x, y, newImage(assets.pipe.bottomLeft)));
          break;
        case "4":
          boundaries.push(
            new Boundary(x, y, newImage(assets.pipe.bottomRight))
          );
          break;
        case "b":
          boundaries.push(new Boundary(x, y, newImage(assets.block)));
          break;
        case "[":
          boundaries.push(new Boundary(x, y, newImage(assets.cap.left)));
          break;
        case "]":
          boundaries.push(new Boundary(x, y, newImage(assets.cap.right)));
          break;
        case "_":
          boundaries.push(new Boundary(x, y, newImage(assets.cap.bottom)));
          break;
        case "^":
          boundaries.push(new Boundary(x, y, newImage(assets.cap.top)));
          break;
        case "+":
          boundaries.push(new Boundary(x, y, newImage(assets.pipe.cross)));
          break;
        case "5":
          boundaries.push(
            new Boundary(x, y, newImage(assets.pipeConnector.top))
          );
          break;
        case "6":
          boundaries.push(
            new Boundary(x, y, newImage(assets.pipeConnector.right))
          );
          break;
        case "7":
          boundaries.push(
            new Boundary(x, y, newImage(assets.pipeConnector.bottom))
          );
          break;
        case "8":
          boundaries.push(
            new Boundary(x, y, newImage(assets.pipeConnector.left))
          );
          break;
        case ".":
          pellets.push(new Pellet(x + cellSize / 2, y + cellSize / 2));
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
  for (let i = 0; i < pellets.length; i++) {
    pellets[i].draw();
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
