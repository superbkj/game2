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

    Bullet.initPack.push({
      id: this.id,
      x: this.x,
      y: this.y
    });
  }

  update() {
    if (this.timer++ > 100) {
      this.toRemove = true;
    }
    super.update();

    /*
    for (let id in Player.list) {
      const player = Player.list[id];
      if (this.getDistance(player) < 32 && this.parent !== player.id) {
        //TODO: handle collision like hp--
        this.toRemove = true;
      }
    }
    */
  }

  static updateAll = () => {
    /*
    if (Math.random() < 0.1) {
      new Bullet(Math.random() * 360);
    }
    */
  
    //Contains every player in the game
    this.updatePack = [];
  
    for (let id in Bullet.list) {
      const bullet = Bullet.list[id];
      bullet.update();

      if (bullet.toRemove) {
        delete Bullet.list[id];

        this.removePack.push(bullet.id);
      }
      else {
        this.updatePack.push({
          id: bullet.id,
          x: bullet.x,
          y: bullet.y,
        });
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