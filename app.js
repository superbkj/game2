//import Player from "./classes/Player.js";
//import Bullet from "./classes/Bullet.js";

const Player = require("./classes/Player.js");
const Bullet = require("./classes/Bullet.js");

const express = require("express");
const app = express();
const server = require("http").Server(app);

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
  Player.onConnect(socket);
  
  socket.on("disconnect", () => {
    delete SOCKET_LIST[socket.id];
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