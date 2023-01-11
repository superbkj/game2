const Entity = require("./Entity.js");
const Bullet = require("./Bullet.js");

class Player extends Entity {
  static list = {};
  static initPack = [];
  static updatePack = [];
  static removePack = [];

  constructor(params) {
    super(params);
    //this.id = id;
    this.number = "" + Math.floor(10 * Math.random());
    this.pressingRight = false;
    this.pressingLeft = false;
    this.pressingUp = false;
    this.pressingDown = false;
    this.pressingAttack = false;
    this.mouseAngle = 0;
    this.maxSpd = 10;
    this.hp = 10;
    this.hpMax = 10;
    this.score = 0;

    Player.list[this.id] = this;

    Player.initPack.push(this.getDataForInit());
  }

  getDataForInit() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      number: this.number,
      hp: this.hp,
      hpMax: this.hpMax,
      score: this.score,
      map: this.map
    };
  }

  getDataForUpdate() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      hp: this.hp,
      score: this.score,
      map: this.map
    };
  }

  updateSpd() {
    if (this.pressingRight) {
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
      if (this.map === bullet.map && this.getDistance(bullet) < 32 && bullet.parent !== this.id) {
        this.hp -= 1;
        if (this.hp <= 0) {
          console.log(`Player ${this.id} dead. respawning...`)
          this.hp = this.hpMax;
          this.x = Math.random() * 500;
          this.y = Math.random() * 500;

          //bullet.parentのIDを持つPlayerがまだ存在すればスコアアップ
          const shooter = Player.list[bullet.parent]
          if (shooter) { 
            shooter.score += 1;
          }
        }

        bullet.toRemove = true;
      }
    }
  }

  shootBullet(angle) {
    const b = new Bullet({
      parent: this.id,
      angle: angle,
      x: this.x,
      y: this.y,
      map: this.map
    });
  }

  static getPlayersForSignInPlayer = () => {
    const players = [];
    for (let id in Player.list) {
      players.push(Player.list[id].getDataForInit());
    }
    return players;
  }

  static onConnect = socket => {
    let map = "forest";
    if (Math.random() < 0.5) {
      map = "field";
    }

    const player = new Player({
      id: socket.id,
      map: map
    });

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
    });

    socket.on("changeMap", data => {
      if (player.map === "field") {
        player.map = "forest";
      }
      else {
        player.map = "field";
      }
    })

    socket.emit("init", { 
      selfId: socket.id,
      player: this.getPlayersForSignInPlayer(),
      bullet: Bullet.getBulletsForSignInPlayer()
    })
  }
  
  static onDisconnect = socket => {
    delete Player.list[socket.id];

    this.removePack.push(socket.id);
  }
  
  static updateAll = () => {
  
    for (let id in Player.list) {
      const player = Player.list[id];
      player.update();
      this.updatePack.push(player.getDataForUpdate());
    }

    const result = {
      initPlayer: [...this.initPack],
      updatePlayer: [...this.updatePack],
      removePlayer: [...this.removePack],
    }
    
    this.initPack = [];
    this.updatePack = [];
    this.removePack = [];
    
    return result;
  }
}

module.exports = Player;