const Entity = require("./Entity.js");
const Bullet = require("./Bullet.js");

class Player extends Entity {
  static list = {};
  static initPack = [];
  static updatePack = [];
  static removePack = [];

  constructor(id) {
    super();
    this.id = id;
    this.number = "" + Math.floor(10 * Math.random());
    this.pressingRight = false;
    this.pressingLeft = false;
    this.pressingUp = false;
    this.pressingDown = false;
    this.pressingAttack = false;
    this.mouseAngle = 0;
    this.maxSpd = 10;

    Player.list[id] = this;

    Player.initPack.push({
      id: this.id,
      x: this.x,
      y: this.y,
      number: this.number
    });

    //console.log([...Player.initPack]);
  }

  updateSpd() {
    //console.log("Updating speed...");
    if (this.pressingRight) {
      //console.log("Right spped");
      this.spdX = this.maxSpd;
    }
    else if (this.pressingLeft) {
      this.spdX = -this.maxSpd;
    }
    else {
      this.spdX = 0;
    }

    if (this.pressingUp) {
      this.spdY = -this.maxSpd;
    }
    else if (this.pressingDown) {
      this.spdY = this.maxSpd;
    }
    else {
      this.spdY = 0;
    }
  }

  update() {
    this.updateSpd();
    super.update();

    if (this.pressingAttack) {
      this.shootBullet(this.mouseAngle);
    }

    for (let id in Bullet.list) {
      const bullet = Bullet.list[id];
      if (this.getDistance(bullet) < 32 && bullet.parent !== this.id) {
        //TODO: handle collision like hp--
        bullet.toRemove = true;
        //console.log("Collide")
      }
    }
  }

  shootBullet(angle) {
    const b = new Bullet(this.id, angle);
    b.x = this.x;
    b.y = this.y;
  }

  static onConnect = socket => {
    const player = new Player(socket.id);

    socket.on("keyPress", data => {
      if (data.inputId === "right") {
        player.pressingRight = data.state;
      }
      else if (data.inputId === "left") {
        player.pressingLeft = data.state;
      }
      else if (data.inputId === "up") {
        player.pressingUp = data.state;
      }
      else if (data.inputId === "down") {
        player.pressingDown = data.state;
      }
      else if (data.inputId === "attack") {
        player.pressingAttack = data.state;
      }
      else if (data.inputId === "mouseAngle") {
        player.mouseAngle = data.state;
      }
    })
  }
  
  static onDisconnect = socket => {
    //console.log(Player.list[socket.id] ? "Aru" : "Nai");
    delete Player.list[socket.id];
    //console.log(Player.list[socket.id] ? "Aru" : "Nai")

    this.removePack.push(socket.id);
    //表示される: console.log("onDisconnect: ", [...this.removePack])
  }
  
  static updateAll = () => {
    //this.updatePack = [];
  
    for (let id in Player.list) {
      const player = Player.list[id];
      player.update();
      this.updatePack.push({
        id: player.id,
        x: player.x,
        y: player.y
      });
    }

    const result = {
      initPlayer: [...this.initPack],
      updatePlayer: [...this.updatePack],
      removePlayer: [...this.removePack],
      /*
      initPack: this.initPack,
      updatePack: this.updatePack,
      removePack: this.removePack,
      */
    }

    //表示される: console.log(result.removePack)
    
    this.initPack = [];
    this.updatePack = [];
    this.removePack = [];
    
    //console.log(result)
    return result;
  }
}

module.exports = Player;