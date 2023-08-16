const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("chat message", (msg) => {
    io.emit("chat message", msg); // Send the message to all connected clients
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

const port = process.env.PORT || 5000; // Change the port number if needed
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
