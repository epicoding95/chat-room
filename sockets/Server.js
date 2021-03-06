const express = require('express')
const app = express()
const server = require('http').Server(app)

app.use(express.static(__dirname + '../build'))

const io = require("socket.io")(server, {
    transports: ["websocket", "polling"]
});
const users = {};
io.on("connection", client => {
    client.on("username", username => {
        const user = {
            name: username,
            id: client.id
        };
        console.log(user, 'user on server')
        users[client.id] = user;
        io.emit("connected", user);
        io.emit("users", Object.values(users));
    });

    client.on("send", (message, user) => {
        io.emit("message", {
            text: message,
            user: user
        });
        console.log(message, user)
    });

    client.on("disconnect", () => {
        const username = users[client.id];
        delete users[client.id];
        io.emit("disconnected", client.id);
    });
});

const PORT = process.env.PORT || 3001
server.listen(PORT => console.log(`listening on port ${PORT}`));