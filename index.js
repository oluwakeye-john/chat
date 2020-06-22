const express = require("express");
const app = express();
const http = require("http").createServer(app);
const path = require("path");

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
  count += 1;
  socket.on("set username", (data) => {
    const findUser = users.map((user) => user.username === data);
    console.log(findUser);
    if (!findUser.includes(true)) {
      users.push({
        username: data,
        socket,
      });
      socket.emit("user set", data);
      io.emit("user count", count);
    } else {
      socket.emit("user exists", "Select another name!");
      console.log("user exist");
    }
  });
  socket.on("send message", (data) => {
    console.log(data);
    socket.broadcast.emit("new message", data);
  });

  socket.on("disconnect", () => {
    console.log("og: ", count);
    const filterSocket = users.filter((user) => user.socket !== socket);
    users = filterSocket;
    count -= 1;
    io.emit("user count", count);
  });
});

const port = 3000;

http.listen(port, () => {
  console.log(`listening on port ${port}`);
});
