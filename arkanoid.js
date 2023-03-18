let paddle, ball;
let bricks = [];
let brickRows = 4;
let brickCols = 10;
let brickWidth, brickHeight;
let winMessageTimeout;
let showWinMessage = false;
let originalWidth = 800;
let originalHeight = 600;
let scaleFactor;

function setup() {
  scaleFactor = min(windowWidth / originalWidth, windowHeight / originalHeight);
  createCanvas(originalWidth * scaleFactor, originalHeight * scaleFactor);
  paddle = new Paddle();
  ball = new Ball();
  setupBricks();

  // Touch controls
  let touchHandler = (e) => {
    e.preventDefault();
    paddle.move(touches[0].clientX);
  };
  canvas.addEventListener("touchstart", touchHandler, false);
  canvas.addEventListener("touchmove", touchHandler, false);
}

function setupBricks() {
  brickWidth = width / brickCols;
  brickHeight = height * 0.03;

  for (let i = 0; i < brickRows; i++) {
    for (let j = 0; j < brickCols; j++) {
      bricks.push(
        new Brick(
          j * brickWidth,
          i * brickHeight + height * 0.08,
          brickWidth,
          brickHeight
        )
      );
    }
  }
}

function draw() {
  background(0);

  paddle.move(mouseX);
  paddle.show();

  ball.update();
  ball.checkEdges();
  ball.show();

  for (let i = 0; i < bricks.length; i++) {
    bricks[i].show();

    if (ball.hits(bricks[i])) {
      ball.reflect(bricks[i]);
      bricks.splice(i, 1);
      i--; // Decrement the index when a brick is removed
    }
  }

  if (ball.hits(paddle)) {
    ball.handlePaddleCollision(paddle);
  }

  // Reset bricks and ball when the last brick is gone
  if (bricks.length === 0) {
    if (!showWinMessage) {
      clearTimeout(winMessageTimeout);
      showWinMessage = true;
      winMessageTimeout = setTimeout(() => {
        showWinMessage = false;
      }, 3000);
    }
    setupBricks();
    ball.pos.set(width / 2, height / 2);
    ball.vel = p5.Vector.random2D().mult(ball.speed);
  }

  // Display "You Win!" message
  if (showWinMessage) {
    textSize(32);
    textAlign(CENTER);
    fill(255);
    text("You Win!", width / 2, height / 2);
  }
}

class Paddle {
  constructor() {
    this.width = originalWidth * 0.125 * scaleFactor;
    this.height = originalHeight * 0.015 * scaleFactor;
    this.x = (width - this.width) / 2;
    this.y = height - height * 0.05;
  }

  move(x) {
    this.x = constrain(x - this.width / 2, 0, width - this.width);
  }

  getBounceAngle(ball) {
    let relativeIntersectX = ball.pos.x - (this.x + this.width / 2);
    let normalizedRelativeIntersectionX = relativeIntersectX / (this.width / 2);
    let maxAngle = 60; // Cap the max angle to 60 degrees
    let bounceAngle = normalizedRelativeIntersectionX * maxAngle;
    return bounceAngle;
  }

  show() {
    fill(255);
    rect(this.x, this.y, this.width, this.height);
  }
}

class Ball {
  constructor() {
    this.radius = originalWidth * 0.0125 * scaleFactor;
    this.pos = createVector(width / 2, paddle.y - this.radius * 2);
    this.speed = originalWidth * 0.0125 * scaleFactor;
    this.vel = createVector(0, -1).mult(this.speed);
  }

  update() {
    this.pos.add(this.vel);
  }

  checkEdges() {
    if (this.pos.x < this.radius || this.pos.x > width - this.radius) {
      this.vel.x *= -1;
    }
    if (this.pos.y < this.radius) {
      this.vel.y *= -1;
    }
    if (this.pos.y > height + this.radius) {
      this.pos.set(width / 2, paddle.y - this.radius * 2);
      this.vel = createVector(0, -1).mult(this.speed);
    }
  }

  hits(obj) {
    let left = this.pos.x - this.radius < obj.x + obj.width;
    let right = this.pos.x + this.radius > obj.x;
    let top = this.pos.y - this.radius < obj.y + obj.height;
    let bottom = this.pos.y + this.radius > obj.y;

    return left && right && top && bottom;
  }

  reflect(obj) {
    let ballCenter = createVector(this.pos.x, this.pos.y);
    let objCenter = createVector(obj.x + obj.width / 2, obj.y + obj.height / 2);
    let collisionNormal = ballCenter.sub(objCenter).normalize();

    // Reflect the velocity along the collision normal
    let newVel = this.vel
      .copy()
      .reflect(collisionNormal)
      .normalize()
      .mult(this.speed);
    this.vel.set(newVel.x, newVel.y);
  }

  handlePaddleCollision(paddle) {
    let bounceAngle = paddle.getBounceAngle(this);
    let newVelocity = p5.Vector.fromAngle(radians(bounceAngle), this.speed);
    this.vel.set(newVelocity.x, -abs(newVelocity.y));
  }

  show() {
    fill(255);
    ellipse(this.pos.x, this.pos.y, this.radius * 2);
  }
}

class Brick {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.score = floor(random(1, 4)); // Random score between 1 and 3
    this.color = this.getColor();
  }

  getColor() {
    switch (this.score) {
      case 1:
        return color(0, 255, 0); // Green
      case 2:
        return color(255, 255, 0); // Yellow
      case 3:
        return color(255, 0, 0); // Red
      default:
        return color(255); // White
    }
  }

  show() {
    fill(this.color);
    rect(this.x, this.y, this.width, this.height);
  }
}
