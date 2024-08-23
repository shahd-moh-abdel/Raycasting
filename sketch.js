// BOUNDARY
class Boundary {
  constructor(x1, y1, x2, y2) {
    this.a = createVector(x1, y1);
    this.b = createVector(x2, y2);
  }

  show() {
    stroke(255);
    line(this.a.x, this.a.y, this.b.x, this.b.y);
  }
}

// RAY
class Ray {
  constructor(pos, angle) {
    this.pos = pos;
    this.dir = p5.Vector.fromAngle(angle);
  }

  show() {
    stroke(255);
    push();
    translate(this.pos.x, this.pos.y);
    line(0, 0, this.dir.x * 10, this.dir.y * 10);
    pop();
  }

  lookAt(x, y) {
    this.dir.x = x - this.pos.x;
    this.dir.y = y - this.pos.y;
    this.dir.normalize();
  }

  cast(wall) {
    const x1 = wall.a.x;
    const y1 = wall.a.y;
    const x2 = wall.b.x;
    const y2 = wall.b.y;

    const x3 = this.pos.x;
    const y3 = this.pos.y;
    const x4 = this.pos.x + this.dir.x;
    const y4 = this.pos.y + this.dir.y;

    const dem = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (dem === 0) {
      return;
    }
    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / dem;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / dem;

    if (t > 0 && t < 1 && u > 0) {
      const pt = createVector();
      pt.x = x1 + t * (x2 - x1);
      pt.y = y1 + t * (y2 - y1);
      return pt;
    } else {
      return;
    }
  }
}

// PARTICLE
class Particle {
  constructor() {
    this.pos = createVector(width / 2, height / 2);
    this.rays = [];
    for (let i = 0; i < 360; i += 1) {
      this.rays.push(new Ray(this.pos, radians(i)));
    }
  }

  update(x, y) {
    this.pos.set(x, y);
  }

  look(walls) {
    for (let ray of this.rays) {
      let record = Infinity;
      let closest = null;
      for (let wall of walls) {
        const pt = ray.cast(wall);
        if (pt) {
          const d = p5.Vector.dist(this.pos, pt);
          if (d < record) {
            record = d;
            closest = pt;
          }
        }
      }
      if (closest) {
        stroke(200);
        line(this.pos.x, this.pos.y, closest.x, closest.y);
      }
    }
  }

  show() {
    fill(255);
    ellipse(this.pos.x, this.pos.y, 2, 2);
    for (let ray of this.rays) {
      ray.show();
    }
  }
}

// SKETCH
let walls = [];
let particle;
let isDrawing = false;
let startPoint;

function setup() {
  createCanvas(400, 400);

  // Add boundary walls
  walls.push(new Boundary(0, 0, width, 0));
  walls.push(new Boundary(width, 0, width, height));
  walls.push(new Boundary(width, height, 0, height));
  walls.push(new Boundary(0, height, 0, 0));

  particle = new Particle();
}

function draw() {
  background(0);
  for (let wall of walls) {
    wall.show();
  }
  particle.update(mouseX, mouseY);
  particle.show();
  particle.look(walls);

  if (isDrawing) {
    stroke(255, 0, 0);
    line(startPoint.x, startPoint.y, mouseX, mouseY);
  }
}

function mousePressed() {
  startPoint = createVector(mouseX, mouseY);
  isDrawing = true;
}

function mouseReleased() {
  if (isDrawing) {
    let endPoint = createVector(mouseX, mouseY);
    walls.push(
      new Boundary(startPoint.x, startPoint.y, endPoint.x, endPoint.y)
    );
    isDrawing = false;
  }
}

function keyPressed() {
  if (key === "c" || key === "C") {
    walls = walls.slice(0, 4);
  }
}
