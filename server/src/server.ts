import * as express from 'express';
import { Game } from './classes/Game';

const SOCKETS_PORT = 8443;

const app = express();
app.set('port', SOCKETS_PORT);

let http = require('http').Server(app);
let io = require('socket.io')(http, {
	cors: {
		origin: 'http://192.168.1.222:3000'
	}
});

http.listen(SOCKETS_PORT, function () {
	console.log('listening on *:' + SOCKETS_PORT);
});

new Game(io);
