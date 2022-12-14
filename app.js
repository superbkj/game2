const express = require("express");
const app = express();
const server = require("http").Server(app);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/client/index.html");
});

app.use("/client", express.static(__dirname + "/client"));

server.listen(2000);
console.log("Server started")

const SOCKET_LIST = {};
//const PLAYER_LIST = {};

const Entity = () => {
  const self = {
    x: 250,
    y: 250,
    spdX: 0,
    spdY: 0,
    id: ""
  }

  self.update = () => {
    self.updatePosition();
  }

  self.updatePosition = () => {
    self.x += self.spdX;
    self.y += self.spdY;
  }

  return self;
}

const Player = id => {
  const self = Entity();
  self.id = id;
  self.number = "" + Math.floor(10 * Math.random());
  self.pressingRight = false;
  self.pressingLeft = false;
  self.pressingUp = false;
  self.pressingDown = false;
  self.maxSpd = 10;

  const super_update = self.update;
  self.update = () => {
    self.updateSpd();
    super_update();
  }

  self.updateSpd = () => {
    if (self.pressingRight) {
      self.spdX = self.maxSpd;
    }
    else if (self.pressingLeft) {
      self.spdX = -self.maxSpd;
    }
    else {
      self.spdX = 0;
    }

    if (self.pressingUp) {
      self.spdY = -self.maxSpd;
    }
    else if (self.pressingDown) {
      self.spdY = self.maxSpd;
    }
    else {
      self.spdY = 0;
    }
  }

  Player.list[id] = self;

  return self;
}

Player.list = {};

Player.onConnect = socket => {
  const player = Player(socket.id);

  //console.log(player.id);

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

Player.onDisconnect = socket => {
  delete Player.list[socket.id];
}

Player.updateAll = () => {
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

const Bullet = angle => {
  const self = Entity();
  self.id = Math.random();
  self.spdX = Math.cos(angle/180*Math.PI) * 10;
  self.spdY = Math.sin(angle/180*Math.PI) * 10;

  self.timer = 0;
  self.toRemove = false;

  const super_update = self.update;
  self.update = () => {
    if (self.timer++ > 100) {
      self.toRemove = true;
    }
    super_update();
  }

  Bullet.list[self.id] = self;
  return self;
}

Bullet.list = {};

Bullet.updateAll = () => {
  if (Math.random() < 0.1) {
    Bullet(Math.random() * 360);
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

const io = require("socket.io")(server, {});
io.sockets.on("connection", socket => {
  socket.id = Math.random();
  SOCKET_LIST[socket.id] = socket;
  
  console.log("Socket connection. ID: " + socket.id);
  Player.onConnect(socket);
  
  socket.on("disconnect", () => {
    delete SOCKET_LIST[socket.id];
    Player.onDisconnect(socket);
  })

  
});

setInterval(() => {
  const pack = {
    player: Player.updateAll(),
    bullet: Bullet.updateAll()
  }

  for (let id in SOCKET_LIST) {
    const socket = SOCKET_LIST[id];
    socket.emit("newPositions", pack);
  }
}, 1000/25)