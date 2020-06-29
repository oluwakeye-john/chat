const express = require("express");
const app = express();
const http = require("http").createServer(app);
const path = require("path");
const dotEnv = require("dotenv").config();

const io = require("socket.io")(http);

const publicPath = path.join(__dirname, "public");
const indexHtml = path.join(publicPath, "index,html");

app.use(express.static(publicPath));

app.get("/", (req, res) => {
  res.sendFile(indexHtml);
});

let users = [];
let count = 0;

io.on("connection", (socket) => {
  console.log("A user connected");
  socket.on("set username", (data) => {
    console.log(data);
    const findUser = users.filter((user) => user.username === data);
    console.log(findUser);
    if (!findUser.length) {
      count += 1;
      users.push({
        username: data,
        socket,
      });
      socket.emit("user set", data);
      io.emit("user count", count);
      socket.broadcast.emit("notification", `${data} joined`);
    } else {
      socket.emit("user exists", "Select another name!");
      console.log("user exist");
    }
  });
  socket.on("send message", (data) => {
    console.log(data);
    socket.broadcast.emit("new message", data);
  });

  socket.on("user typing start", (data) => {
    socket.broadcast.emit("typing start", `${data} is typing`);
  });

  socket.on("user typing stop", (data) => {
    socket.broadcast.emit("typing stop", "");
  });

  socket.on("validate user", (data) => {
    const findUser = users.map((user) => user.username === data);
    console.log(findUser.includes(true));
    if (findUser.includes(true)) {
      socket.emit("user valid", true);
    } else {
      socket.emit("user valid", false);
    }
  });

  // media sharing

  socket.on("media share", (data) => {
    console.log("incoming media")
    socket.broadcast.emit("new media", data)
  })

  socket.on("disconnect", () => {
    console.log("og: ", count);
    const filterSocket = users.filter((user) => {
      if (user.socket !== socket) {
        return true;
      } else {
        socket.broadcast.emit("notification", `${user.username} left`);
        count -= 1;
        return false;
      }
    });
    users = filterSocket;
    io.emit("user count", count);
  });
});

const port = process.env.PORT || 3000;

http.listen(port, () => {
  console.log(`listening on port ${port}`);
});
