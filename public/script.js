const socket = io();

let isLoggedIn = false;
let username;
let pushNotification = false;

// Notification.requestPermission();

const showChats = () => {
  document.getElementById("login-container").style.display = "none";
  document.getElementById("chat-container").style.display = "block";

  document.getElementById(
    "username-text"
  ).innerHTML = `Logged in as ${username}`;
};

document.getElementById("message-box").addEventListener("keyup", (e) => {
  if (isLoggedIn) {
    if (e.target.value) {
      socket.emit("user typing start", username);
    } else {
      socket.emit("user typing stop", username);
    }
  }
});

document.getElementById("form-username").addEventListener("submit", (e) => {
  e.preventDefault();
  if (document.getElementById("request-notification").checked) {
    notifyMe("Welcome", "Welcome to Chat");
    pushNotification = true;
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
  socket.emit("send message", {
    sender: username,
    message: msg,
  });
  appendMessage("You", msg);
};

const appendMessage = (sender, msg) => {
  const time = new Date().toLocaleTimeString();

  const senderString = `<strong>${sender}: </strong>`;
  const dateString = `<br /><small style="font-size: xx-small">${time}</small><br />`;

  if (sender === "You") {
    document.getElementById(
      "messages"
    ).innerHTML += `<p class="message-wrapper-right"><span class="message">${senderString}${msg}${dateString}</span></p>`;
  } else {
    document.getElementById(
      "messages"
    ).innerHTML += `<p class="message-wrapper-left"><span class="message">${senderString}${msg}${dateString}</span></p>`;
  }
  window.scrollTo(0, document.body.scrollHeight);
  // <span class="message"><strong>${sender}: </strong>${msg}<br /><small style="font-size: xx-small">${time}</small></span><br />
};

socket.on("user set", (data) => {
  username = data;
  isLoggedIn = true;
  showChats();
});

socket.on("user exists", (data) => {
  document.getElementById("login-status").innerText = data;
  document.getElementById("login-status").style.color = "red";
});

socket.on("new message", (data) => {
  if (isLoggedIn) {
    appendMessage(data.sender, data.message);
    if (pushNotification) {
      notifyMe("New Message", `${data.sender}: ${data.message}`);
    }
  }
});

socket.on("user count", (data) => {
  document.getElementById("user-count").innerText = `${data} users active`;
  document.getElementById(
    "user-count-navbar"
  ).innerText = `${data} users active`;
});

socket.on("typing start", (data) => {
  document.getElementById("one-line-notification").innerText = data;
});

socket.on("typing stop", (data) => {
  document.getElementById("one-line-notification").innerText = "";
});

const appendNotification = (data) => {
  document.getElementById(
    "messages"
  ).innerHTML += `<p class="message-wrapper-center"><span class="notification">${data}</span></p>`;
  window.scrollTo(0, document.body.scrollHeight);
  // <span class="message"><strong>${sender}: </strong>${msg}<br /><small style="font-size: xx-small">${time}</small></span><br />
};

socket.on("notification", (data) => {
  if (isLoggedIn) {
    appendNotification(data);
    if (pushNotification) {
      notifyMe("Notification", data);
    }
  }
});

socket.on("disconnect", () => {
  const status = document.getElementById("connection");
  status.innerText = "Offline";
  status.style.color = "red";
});

socket.on("reconnect", () => {
  const status = document.getElementById("connection");
  status.innerText = "Online";
  status.style.color = "green";
});

socket.on("reconnect_error", () => {});
