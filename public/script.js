(function () {
  const socket = io();

  let isLoggedIn = false;
  let username;
  let pushNotification = false;

  window.onbeforeunload = () => {
    if (isLoggedIn && username) {
      return "Do you really want to leave chat room?";
    }
  };

  // Notification.requestPermission();

  let typingInterval;

  const showChats = () => {
    document.querySelector("body").classList.add("background");
    document.getElementById("login-container").style.display = "none";
    document.getElementById("chat-container").style.display = "block";

    document.getElementById("username-text").innerText = username;
    document.getElementById("sidebar-username-text").innerText = username;
  };

  document.getElementById("input-box").addEventListener("keyup", (e) => {
    if (isLoggedIn) {
      if (e.target.value) {
        socket.emit("user typing start", username);

        if (typingInterval) clearInterval(typingInterval);

        typingInterval = setTimeout(() => {
          console.log("stopping typing");
          socket.emit("user typing stop", username);
        }, 5000);
      } else {
        socket.emit("user typing stop", username);
      }
    }
  });

  document.getElementById("login-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const psh = document.getElementById("request-notification").checked;
    if (psh) {
      notifyMe("Welcome", "Welcome to Chat");
      pushNotification = true;
    }
    const input = document.getElementById("username-input").value;
    socket.emit("set username", input.toLowerCase());
    document.getElementById("username-input").value = "";
  });

  document.getElementById("message-box").addEventListener("submit", (e) => {
    e.preventDefault();
    const inp = document.getElementById("input-box");
    if (inp.value) {
      sendMessage(inp.value);
      inp.value = "";
    }
  });

  const sendMessage = (msg) => {
    const time = new Date().toLocaleTimeString();
    socket.emit("send message", {
      sender: username,
      message: msg,
      time,
    });
    appendMessage("You", msg, time + " 🍛");
  };

  const appendMessage = (
    sender,
    msg,
    time = new Date().toLocaleTimeString()
  ) => {
    if (isLoggedIn && username) {
      const senderString = `<strong>${sender}: </strong>`;
      const dateString = `<br /><small style="font-size: xx-small">${time}</small><br />`;

      if (sender === "You") {
        document.getElementById(
          "messages"
        ).innerHTML += `<p class="message-wrapper-right"><span class="message" style="background-color:#DCF8C6">${senderString}${msg}${dateString}</span></p>`;
      } else {
        document.getElementById(
          "messages"
        ).innerHTML += `<p class="message-wrapper-left"><span class="message" >${senderString}${msg}${dateString}</span></p>`;
      }
      window.scrollTo(0, document.body.scrollHeight);
    }
    // <span class="message"><strong>${sender}: </strong>${msg}<br /><small style="font-size: xx-small">${time}</small></span><br />
  };

  socket.on("user set", (data) => {
    username = data;
    isLoggedIn = true;
    showChats();
    appendNotification("You joined");
    appendMessage("Bot", `Hi ${username}, welcome to the chatroom.`);
  });

  socket.on("user exists", (data) => {
    document.getElementById("login-status").innerText = data;
    document.getElementById("login-status").style.color = "red";
  });

  socket.on("new message", (data) => {
    appendMessage(data.sender, data.message, data.time);
    if (pushNotification) {
      notifyMe("New Message", `${data.sender}: ${data.message}`);
    }
  });

  socket.on("user count", (data) => {
    document.getElementById("user-count").innerText = `${data} user${
      data === 1 ? "" : "s"
    } active`;
    if (Number(data) === 1) {
      appendMessage("Bot", "It looks like you are the only one online");
      appendMessage("Bot", "Share the link to allow your friends to join");
    } else if (Number(data) === 2) {
      appendMessage("Bot", `1 other user is present`);
    } else {
      appendMessage("Bot", `${Number(data) - 1} other users are present`);
    }
    // document.getElementById(
    //   "user-count-navbar"
    // ).innerText = `${data} users active`;
  });

  socket.on("typing start", (data) => {
    document.getElementById("one-line-notification-navbar").innerText = data;
    document.getElementById("one-line-notification-sidebar").innerText = data;
  });

  socket.on("typing stop", (data) => {
    document.getElementById("one-line-notification-navbar").innerText = "";
    document.getElementById("one-line-notification-sidebar").innerText = data;
  });

  const appendNotification = (data) => {
    if (username && isLoggedIn) {
      document.getElementById(
        "messages"
      ).innerHTML += `<p class="message-wrapper-center"><span class="notification">${data}</span></p>`;
      window.scrollTo(0, document.body.scrollHeight);
    }
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

  const showLogin = () => {
    document.querySelector("body").classList.remove("background");
    document.getElementById("login-container").style.display = "block";
    document.getElementById("chat-container").style.display = "none";
    document.getElementById("messages").innerHTML = "";
  };

  socket.on("user valid", (data) => {
    if (data) {
      appendMessage("Bot", "you are back online!");
    } else {
      isLoggedIn = false;
      username = "";
      pushNotification = false;
      showLogin();
    }
  });

  socket.on("disconnect", () => {
    const status = document.getElementById("connection");
    status.innerText = "Offline";
    status.style.color = "red";

    appendMessage("Bot", "Your internet connection is down.");
    appendMessage(
      "Bot",
      "Chat will automatically reconnect when you are back online"
    );
  });

  socket.on("reconnect", () => {
    const status = document.getElementById("connection");
    status.innerText = "Online";
    status.style.color = "green";

    socket.emit("validate user", username);
  });

  socket.on("reconnect_error", () => {});

  (function () {
    const appendMedia = (sender, media, time) => {
      if (isLoggedIn && username) {
        const senderString = `<strong>${sender}: </strong>`;
        const dateString = `<br /><small style="font-size: xx-small">${time}</small><br />`;

        const m = document.querySelector("#messages");
        const p = document.createElement("p");
        const sp = document.createElement("span");

        p.className = "message-wrapper-right";
        sp.className = "message";

        if (sender === "You") {
          m.append(p);
          p.append(sp);
          sp.innerHTML += senderString;
          sp.append(media);
          sp.innerHTML += dateString;
          sp.style.background = "background-color: #DCF8C6";
        } else {
          m.append(p);
          p.append(sp);
          p.className = "message-wrapper-left";
          sp.innerHTML += senderString;
          sp.append(media);
          sp.innerHTML += dateString;
          sp.style.background = "background-color: #DCF8C6";
        }
        window.scrollTo(0, document.body.scrollHeight);
      }
    };

    const readFile = function readFile(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
      });
    };

    const fileInput = document.querySelector("input[type='file']#image_input");
    fileInput.addEventListener("change", function () {
      const files = this.files;
      const fileLength = files.length;

      for (let i = 0; i < fileLength; i++) {
        readFile(files[i])
          .then((result) => {
            const time = new Date().toLocaleTimeString();
            const image = new Image();
            image.src = result;
            image.onload = () => {
              appendMedia("You", image, time);
            };
            socket.emit("media share", {
              username,
              media: result,
              time,
            });
          })
          .catch(console.log);
      }
    });

    socket.on("new media", (data) => {
      const time = new Date().toLocaleTimeString();
      const image = new Image();
      image.src = data.media;
      image.onload = () => {
        appendMedia(data.username, image, time);
      };
    });
  })();
})();
