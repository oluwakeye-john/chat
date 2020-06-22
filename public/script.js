const socket = io();

let isLoggedIn = false;
let username;

// Notification.requestPermission();

const showChats = () => {
  document.getElementById("login-container").style.display = "none";
  document.getElementById("chat-container").style.display = "block";

  document.getElementById(
    "username-text"
  ).innerHTML = `Logged in as ${username}`;
};

document.getElementById("form-username").addEventListener("submit", (e) => {
  e.preventDefault();
  if (document.getElementById("request-notification").checked) {
    notifyMe("Welcome to Chat");
  }
  const input = document.getElementById("username-input").value;
  socket.emit("set username", input.toLowerCase());
  document.getElementById("username-input").value = "";
});

document.getElementById("message-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const inp = document.getElementById("message-box");
  if (inp.value) {
    sendMessage(inp.value);
    inp.value = "";
  }
});

const sendMessage = (msg) => {
  console.log("sending ", msg);
  socket.emit("send message", {
    sender: username,
    message: msg,
  });
  appendMessage("You", msg);
};

const appendMessage = (sender, msg) => {
  console.log("appending");
  const time = new Date().toLocaleTimeString();
  document.getElementById(
    "messages"
  ).innerHTML += `<span class="message"><strong>${sender}: </strong>${msg}<br /><small style="font-size: xx-small">${time}</small></span><br />`;
  scrollTo(window.innerWidth, window.innerHeight);
};

socket.on("user set", (data) => {
  console.log("logged in");
  username = data;
  isLoggedIn = true;
  showChats();
});

socket.on("user exists", (data) => {
  document.getElementById("login-status").innerText = data;
  document.getElementById("login-status").style.color = "red";
});

socket.on("new message", (data) => {
  if (isLoggedIn);
  {
    appendMessage(data.sender, data.message);
    notifyMe(data.message);
  }
});

socket.on("user count", (data) => {
  document.getElementById("user-count").innerText = `${data} users active`;
});

socket.on("disconnect", () => {
  const status = document.getElementById("connection");
  status.innerText = "Disconnected";
  status.style.color = "red";
});

socket.on("reconnect", () => {
  const status = document.getElementById("connection");
  status.innerText = "Online";
  status.style.color = "green";
});

socket.on("reconnect_error", () => {});
