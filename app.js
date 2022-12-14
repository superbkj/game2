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

const io = require("socket.io")(server, {});
io.sockets.on("connection", socket => {
  socket.id = Math.random();
  socket.x = 0;
  socket.y = 0;
  socket.number = "" + Math.floor(10 * Math.random());
  SOCKET_LIST[socket.id] = socket;  
  console.log("Socket connection. ID: " + socket.id);

  socket.on("disconnect", () => {
    delete SOCKET_LIST[socket.id];
  })

});

setInterval(() => {
  //Contains every player in the game
  const pack = [];

  for (let id in SOCKET_LIST) {
    const socket = SOCKET_LIST[id];
    socket.x++;
    socket.y++;
    pack.push({
      x: socket.x,
      y: socket.y,
      number: socket.number
    });
  }

  for (let id in SOCKET_LIST) {
    const socket = SOCKET_LIST[id];
    socket.emit("newPositions", pack);
  }
}, 1000/25)