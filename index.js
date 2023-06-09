const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/index.html');
});

const userMap = {};

io.on('connection', (socket) => {
	socket.on('set nickname', (nickname) => {
		userMap[socket.id] = {
			nickname,
		};
	});

	socket.on('set color', (color) => {
		userMap[socket.id].color = color;

		socket.broadcast.emit('connected', {
			...userMap[socket.id],
			msg: 'has connected',
		});
	});

	socket.on('chat message', (msg) => {
		io.emit('chat message', {
			...userMap[socket.id],
			msg,
		});
	});

	socket.on('disconnect', () => {
		socket.broadcast.emit('disconnected', {
			...userMap[socket.id],
			msg: 'has dicsonnected',
		});
	});
});

server.listen(3000, () => {
	console.log('listening on *:3000');
});
