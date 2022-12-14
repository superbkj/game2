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
}

module.exports = Entity;