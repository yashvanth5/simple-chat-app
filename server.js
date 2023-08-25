const express = require("express");
const http = require("http");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static(__dirname + "/public"));

const onlineUsers = new Set();
let activeConnections = 0; // To keep track of active connections

io.on("connection", (socket) => {
  console.log("A user connected");

  // Increment the active connections count
  activeConnections++;

  socket.on("join", (name) => {
    socket.name = name; // Store the user's name in the socket object
    onlineUsers.add(name);
    io.emit("onlineUsers", Array.from(onlineUsers));
  });

  socket.on("message", (message) => {
    io.emit("message", message);
  });

  if (socket.name) {
    socket.emit("join", socket.name);
  }

  socket.on("disconnect", () => {
    console.log("A user disconnected");
    // Decrement the active connections count
    activeConnections--;

    if (activeConnections === 0) {
      // Clear the online users list when all tabs are closed
      onlineUsers.clear();
    } else if (socket.name) {
      onlineUsers.delete(socket.name);
      io.emit("onlineUsers", Array.from(onlineUsers));
    }
  });
});

const port = process.env.PORT || 3500;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
