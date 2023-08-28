document.addEventListener("DOMContentLoaded", () => {
  const socket = io();

  const sendButton = document.getElementById("button");
  const nameInput = document.getElementById("nameInput");
  const messageInput = document.getElementById("messageInput");
  const chatMessages = document.querySelector(".chat-messages");

  const onlineUsersList = document.querySelector(".user-list"); // Add this line
  const onlineUsers = new Set();

  const onlineUsersCount = document.getElementById("onlineUsersCount");

  const emojiToggle = document.getElementById("emojiToggle");

  let sendWithEmojis = emojiToggle.checked; // Initial value

  emojiToggle.addEventListener("change", () => {
    sendWithEmojis = emojiToggle.checked;
  });

  let currentSenderColor = getRandomColor();
  let isNameEditable = true;

  nameInput.value = "";
  if (nameInput.value.trim() && !isNameEditable) {
    socket.emit("join", nameInput.value.trim());
  }

  sendButton.addEventListener("click", () => {
    const name = nameInput.value.trim();
    const message = messageInput.value.trim();

    if (name && message) {
      // Add the new user to the online users list

      if (!onlineUsers.has(name)) {
        onlineUsers.add(name);
        onlineUsersList.innerHTML = "";
        onlineUsers.forEach((user) => {
          const userItem = document.createElement("li");
          userItem.textContent = user;
          userItem.setAttribute("data-user", user);
          onlineUsersList.appendChild(userItem);
        });

        // Emit the "join" event to inform the server that a new user has joined
        socket.emit("join", name);
      }

      if (message.toLowerCase().startsWith("/calc ")) {
        const command = message.split(" ");
        if (command.length === 2) {
          const action = command[0].toLowerCase();
          const expression = command[1];

          // Handle the /calc command
          if (action === "/calc") {
            try {
              const result = eval(expression);
              // Provide feedback to the user
              chatMessages.innerHTML += `<div class="message incoming">
                <div class="message-content">
                  <h3 class="message-sender">You</h3>
                  <p class="message-text">Result of "${expression}" is ${result}</p>
                </div>
              </div>`;
            } catch (error) {
              // Provide feedback for invalid expressions
              chatMessages.innerHTML += `<div class="message incoming">
                <div class="message-content">
                  <h3 class="message-sender">You</h3>
                  <p class="message-text">Invalid expression: "${expression}"</p>
                </div>
              </div>`;
            }
            messageInput.value = "";
            return; // Exit the event listener
          }
        }
      } else if (message.toLowerCase().startsWith("/rem ")) {
        const parts = message.split(" ");
        const action = parts[0].toLowerCase();
        const name = parts[1];
        const value = parts.slice(2).join(" ");

        if (action === "/rem") {
          if (value) {
            // Store the value associated with the name in localStorage
            localStorage.setItem(name, value);

            // Provide feedback to the user
            chatMessages.innerHTML += `<div class="message incoming">
              <div class="message-content">
                <h3 class="message-sender">You</h3>
                <p class="message-text">Saved value "${value}" with key "${name}"</p>
              </div>
            </div>`;
          } else {
            // Retrieve the stored value associated with the name from localStorage
            const storedValue = localStorage.getItem(name);
            if (storedValue !== null) {
              // Display the stored value in the chat
              chatMessages.innerHTML += `<div class="message incoming">
                <div class="message-content">
                  <h3 class="message-sender">You</h3>
                  <p class="message-text">Recalled value "${storedValue}" for key "${name}"</p>
                </div>
              </div>`;
            } else {
              // Display a message if the name is not found
              chatMessages.innerHTML += `<div class="message incoming">
                <div class="message-content">
                  <h3 class="message-sender">You</h3>
                  <p class="message-text">No value found for key "${name}"</p>
                </div>
              </div>`;
            }
          }
          messageInput.value = "";
          return; // Exit the event listener
        }
      } else if (message.toLowerCase() === "/clear") {
        chatMessages.innerHTML = "";
        messageInput.value = "";
      } else if (message.toLowerCase() === "/help") {
        alert(
          "Available slash commands :\n" +
            "/help : Show this help message\n" +
            "/clear : Clear the chat\n" +
            "/random : Generate a random number\n" +
            "/about: Info about creator of this app"
        );
        messageInput.value = "";
      } else if (message.toLowerCase() === "/random") {
        const previousMessages = chatMessages.innerHTML;
        const randomNumber = Math.floor(Math.random() * (100 - 1 + 1)) + 1;
        chatMessages.innerHTML =
          previousMessages +
          `<div class="message incoming">
            <div class="message-content">
              <h3 class="message-sender">You</h3>
              <p class="message-text">Random number: ${randomNumber}</p>
            </div>
          </div>`;
        messageInput.value = "";
      } else if (message.toLowerCase() === "/about") {
        const previousMessages = chatMessages.innerHTML;
        chatMessages.innerHTML =
          previousMessages +
          `<div class="message incoming">
            <div class="message-content">
              <h3 class="message-sender">You</h3>
              <p class="message-text">This is a chat app created by [Yashvanth].</p>
            </div>
          </div>`;
        messageInput.value = "";
      } else {
        socket.emit("message", { name, message, color: currentSenderColor });

        // added below code

        if (!onlineUsers.has(name)) {
          onlineUsers.add(name);
          onlineUsersList.innerHTML = "";
          onlineUsers.forEach((user) => {
            const userItem = document.createElement("li");
            userItem.textContent = user;
            onlineUsersList.appendChild(userItem);
          });

          // Emit the "join" event to inform the server that a new user has joined
          socket.emit("join", name);
        }

        // till above

        if (isNameEditable) {
          nameInput.disabled = true;
          isNameEditable = false;
        }
        messageInput.value = "";
      }
    }
  });

  socket.on("message", (data) => {
    const newMessage = document.createElement("div");
    newMessage.className =
      data.name === nameInput.value.trim()
        ? "message outgoing"
        : "message incoming";
    newMessage.style.backgroundColor = data.color;

    const messageContent = document.createElement("div");
    messageContent.className = "message-content";
    const messageSender = document.createElement("h3");
    messageSender.className = "message-sender";
    messageSender.textContent = data.name;
    const messageText = document.createElement("p");
    messageText.className = "message-text";
    if (sendWithEmojis) {
      const messageWithEmojis = replaceWordsWithEmojis(
        data.message,
        emojiToggle.checked
      );
      messageText.textContent = messageWithEmojis;
    } else {
      messageText.textContent = data.message;
    }

    // const messageWithEmojis = replaceWordsWithEmojis(data.message);
    // messageText.textContent = messageWithEmojis;

    messageContent.appendChild(messageSender);
    messageContent.appendChild(messageText);
    newMessage.appendChild(messageContent);

    chatMessages.appendChild(newMessage);
  });

  // added this below so make sure to check wht its not working

  socket.on("onlineUsers", (users) => {
    // Update the online users list
    onlineUsersList.innerHTML = "";
    onlineUsersCount.textContent = users.length;
    users.forEach((user) => {
      const userItem = document.createElement("li");
      userItem.textContent = user;
      userItem.setAttribute("data-user", user);
      onlineUsersList.appendChild(userItem);
    });
  });

  const replaceWordsWithEmojis = (msg, sendWithEmojis) => {
    const wordToEmojiMap = {
      hey: "🖐️",
      hello: "👋",
      smile: "😄",
      sad: "😞",
      cool: "😎",
      love: "❤️",
      lol: "😂",
      good: "👍",
      react: " ⚛️",
      congratulation: "🎉",
    };

    const words = msg.split(" ");

    const emojisReplacedMessage = words
      // .map((word) => wordToEmojiMap[word.toLowerCase()] || word)
      .map((word) =>
        sendWithEmojis ? wordToEmojiMap[word.toLowerCase()] || word : word
      )
      .join(" ");
    return emojisReplacedMessage;
  };

  function getRandomColor() {
    const colors = ["#dcf8c6", "#e0e0e0", "#ffd700", "#87ceeb", "#ffb6c1"];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  function handleKeyPress(event) {
    if (event.keyCode === 13) {
      event.preventDefault(); // Prevent the form from submitting
      sendButton.click(); // Trigger the "Send" button's click event
    }
  }

  messageInput.addEventListener("keypress", handleKeyPress);
});
