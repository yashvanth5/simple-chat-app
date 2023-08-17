document.addEventListener("DOMContentLoaded", () => {
  const socket = io("https://social-chat-app-g6ri.onrender.com/"); // Connect to the server

  const sendButton = document.getElementById("button");
  const inputField = document.getElementById("messageInput");
  const chatMessages = document.querySelector(".chat-messages");

  sendButton.addEventListener("click", () => {
    const message = inputField.value;
    if (message) {
      socket.emit("message", message); // Send the message to the server
      inputField.value = "";
    }
  });

  socket.on("message", (message) => {
    const newMessage = document.createElement("div");
    newMessage.className = "message incoming";
    newMessage.textContent = message;
    chatMessages.appendChild(newMessage);
  });
});
