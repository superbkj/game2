const Entity = require("./Entity.js");

class Bullet extends Entity {
  static list = {};
  static initPack = [];
  static updatePack = [];
  static removePack = [];

  constructor(parent, angle) {
    super();
    this.id = Math.random();
    this.spdX = Math.cos(angle/180*Math.PI) * 10;
    this.spdY = Math.sin(angle/180*Math.PI) * 10;
    this.parent = parent;
    this.timer = 0;
    this.toRemove = false;

    Bullet.list[this.id] = this;

    Bullet.initPack.push(this.getDataForInit());
  }

  getDataForInit() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
    };
  }

  getDataForUpdate() {
    return {
      id: this.id,
      x: this.x,
      y: this.y
    };
  }

  update() {
    if (this.timer++ > 100) {
      this.toRemove = true;
    }
    super.update();
  }

  static getBulletsForSignInPlayer = () => {
    const bullets = [];
    for (let id in Bullet.list) {
      bullets.push(Bullet.list[id].getDataForInit());
    }
    return bullets;
  }


  static updateAll = () => {
    for (let id in Bullet.list) {
      const bullet = Bullet.list[id];
      bullet.update();

      if (bullet.toRemove) {
        delete Bullet.list[id];

        this.removePack.push(bullet.id);
      }
      else {
        this.updatePack.push(bullet.getDataForUpdate());
      }
    }
  
    const result = {
      initBullet: [...this.initPack],
      updateBullet: [...this.updatePack],
      removeBullet: [...this.removePack],
    }

    this.initPack = [];
    this.updatePack = [];
    this.removePack = [];
    
    return result;
  } 
}

module.exports = Bullet;