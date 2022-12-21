const Player = require("./classes/Player.js");
const Bullet = require("./classes/Bullet.js");

const express = require("express");
const app = express();
const server = require("http").Server(app);

const {
  isValidPassword,
  isUsernameTaken,
  addUser
} = require("./server/DBRelated.js");

let DEBUG = true;

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/client/index.html");
});

app.use("/client", express.static(__dirname + "/client"));

server.listen(2000);
console.log("Server started")

const SOCKET_LIST = {};

const io = require("socket.io")(server, {});

io.sockets.on("connection", socket => {
  socket.id = Math.random();
  SOCKET_LIST[socket.id] = socket;

  console.log("Socket connection. ID: " + socket.id);

  socket.on("signIn", data => {
    isValidPassword(data)
    .then(isValid => {
      if (isValid) {
        Player.onConnect(socket);
        console.log("Success: Sign in");
        socket.emit("signInResponse", {success: true});
      }
      else {
        console.log("Fail: Sign in");
        socket.emit("signInResponse", {success: false});
      }
    })
    .catch(err => console.error(err))
  })

  
  socket.on("signUp", data => {
    isUsernameTaken(data)
    .then(isTaken => {
      if (isTaken) {
        socket.emit("signUpResponse", {success: false});
      }
      else {
        addUser(data)
        .then(result => {
          console.log("Success: User registration")
        })
        socket.emit("signUpResponse", {success: true});
      }
    })
    .catch(err => console.error(err))
  })

  socket.on("disconnect", () => {
    delete SOCKET_LIST[socket.id];
    console.log("disconnect")
    Player.onDisconnect(socket);
  })

  socket.on("sendMsgToServer", data => {
    const playerName = ("" + socket.id).slice(2, 7);
    const msg = playerName + ": " + data;
    console.log("msg");

    for (let id in SOCKET_LIST) {
      const socket = SOCKET_LIST[id];
      socket.emit("addToChat", msg);
    }
  })

  socket.on("evalServer", data => {
    if (!DEBUG) {
      return;
    }

    const res = eval(data);
    socket.emit("evalAnswer", res);
  })
  
});

//const initPack = {player: [], bullet: []};
//const removePack = {player: [], bullet: []};

setInterval(() => {
  //const updatedPlayers = Player.updateAll();
  //const updatedBullets = Bullet.updateAll();

  const {initPlayer, updatePlayer, removePlayer} = Player.updateAll();
  const {initBullet, updateBullet, removeBullet} = Bullet.updateAll();

  const initPack = {
    player: initPlayer,
    bullet: initBullet
  }

  const updatePack = {
    player: updatePlayer,
    bullet: updateBullet
  }

  const removePack = {
    player: removePlayer,
    bullet: removeBullet
  }

  //console.log("aaaaaa", removePack.player);

  for (let id in SOCKET_LIST) {
    const socket = SOCKET_LIST[id];
    socket.emit("init", initPack);
    socket.emit("update", updatePack);
    socket.emit("remove", removePack);
  }

}, 1000/25)