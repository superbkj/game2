//import Entity from "./Entity.js";
const Entity = require("./Entity.js");

class Player extends Entity {
  static list = {};

  constructor(id) {
    super();
    this.id = id;
    this.number = "" + Math.floor(10 * Math.random());
    this.pressingRight = false;
    this.pressingLeft = false;
    this.pressingUp = false;
    this.pressingDown = false;
    this.maxSpd = 10;

    Player.list[id] = this;
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
    })
  }
  
  static onDisconnect = socket => {
    delete Player.list[socket.id];
  }
  
  static updateAll = () => {
    //Contains every player in the game
    const pack = [];
  
    for (let id in Player.list) {
      const player = Player.list[id];
      player.update();
      pack.push({
        x: player.x,
        y: player.y,
        number: player.number
      });
    }
  
    return pack;
  }
}

module.exports = Player;