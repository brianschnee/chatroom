const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/index.html');
});

let nickname, color;

app.get('/chat', (req, res) => {
	if (!req.query.nickname || !req.query.nickname) {
		res.sendFile(__dirname + '/index.html');
	}

	nickname = req.query.nickname;
	color = req.query.color;
	res.sendFile(__dirname + '/chat.html');
});

const userMap = {};

io.on('connection', (socket) => {
	userMap[socket.id] = {
		nickname,
		color,
	};

	socket.broadcast.emit('connected', {
		...userMap[socket.id],
		msg: 'has connected',
	});

	socket.on('is typing', () => {
		socket.broadcast.emit('is typing', {
			nickname: userMap[socket.id].nickname,
		});
	});

	socket.on('remove active typer', () => {
		socket.broadcast.emit('remove active typer', {
			nickname: userMap[socket.id].nickname,
		});
	});

	socket.on('chat message', (msg) => {
		socket.broadcast.emit('chat message', {
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
