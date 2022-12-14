//import Entity from "./Entity.js";
const Entity = require("./Entity.js");

class Bullet extends Entity {
  static list = {};

  constructor(angle) {
    super();
    this.id = Math.random();
    this.spdX = Math.cos(angle/180*Math.PI) * 10;
    this.spdY = Math.sin(angle/180*Math.PI) * 10;
    this.timer = 0;
    this.toRemove = false;

    Bullet.list[this.id] = this;
  }

  update() {
    if (this.timer++ > 100) {
      this.toRemove = true;
    }
    super.update();
  }

  static updateAll = () => {
    if (Math.random() < 0.1) {
      new Bullet(Math.random() * 360);
    }
  
    //Contains every player in the game
    const pack = [];
  
    for (let id in Bullet.list) {
      const bullet = Bullet.list[id];
      bullet.update();
      
      pack.push({
        x: bullet.x,
        y: bullet.y,
      });
    }
  
    return pack;
  } 
}

module.exports = Bullet;