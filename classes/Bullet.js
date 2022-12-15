//import Entity from "./Entity.js";
const Entity = require("./Entity.js");
//const Player = require("./Player.js");

class Bullet extends Entity {
  static list = {};

  constructor(parent, angle) {
    super();
    this.id = Math.random();
    this.spdX = Math.cos(angle/180*Math.PI) * 10;
    this.spdY = Math.sin(angle/180*Math.PI) * 10;
    this.parent = parent;
    this.timer = 0;
    this.toRemove = false;

    Bullet.list[this.id] = this;
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
    const pack = [];
  
    for (let id in Bullet.list) {
      const bullet = Bullet.list[id];
      bullet.update();

      if (bullet.toRemove) {
        delete Bullet.list[id];
      }
      else {
        pack.push({
          x: bullet.x,
          y: bullet.y,
        });
      }
    }
  
    return pack;
  } 
}

module.exports = Bullet;