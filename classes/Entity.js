class Entity {
  constructor() {
    this.x = 250,
    this.y = 250,
    this.spdX = 0,
    this.spdY = 0,
    this.id = ""
  }

  updatePosition() {
    this.x += this.spdX;
    this.y += this.spdY;
  }

  update() {
    this.updatePosition();
  }

  getDistance(pt) {
    return Math.sqrt(
      Math.pow(this.x - pt.x, 2)
      + Math.pow(this.y - pt.y, 2)
    );
  }
}

module.exports = Entity;