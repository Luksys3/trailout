import * as express from 'express';

const SOCKETS_PORT = 8443;

const app = express();
app.set('port', SOCKETS_PORT);

let http = require('http').Server(app);
let io = require('socket.io')(http, {
	cors: {
		origin: 'http://localhost:3000'
	}
});

io.on('connection', function (socket: any) {
	console.log('a user connected');

	socket.on('message', function (message: any) {
		console.log(message);
	});
});

http.listen(SOCKETS_PORT, function () {
	console.log('listening on *:' + SOCKETS_PORT);
});
