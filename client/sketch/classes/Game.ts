interface ServerPlayer {
	id: string;
	carStyle: 0 | 1 | 2 | 3;
	position: { x: number; y: number };
	angle: number;
}

class Game {
	private socket: any;
	private players: Record<string, Player> = {};

	preload() {
		this.socket = io('http://localhost:8443');
	}

	setup() {
		this.socket.on('players', (message: { players: ServerPlayer[] }) => {
			message.players.map((player, index) => {
				if (this.players[player.id] === undefined) {
					const newPlayer = new Player(
						player.id,
						player.carStyle,
						createVector(player.position.x, player.position.y),
						{ me: this.socket.id === player.id }
					);

					newPlayer.preload();
					this.players[newPlayer.id] = newPlayer;
					return;
				}

				if (this.socket.id !== player.id) {
					this.players[player.id].updateFromServer(player);
				}
			});
			// console.log('this.players', this.players);
		});

		this.socket.on('remove-player', (message: { playerId: ServerPlayer['id'] }) => {
			delete this.players[message.playerId];
		});
	}

	updatePlayers() {
		this.useMePlayer(mePlayer => {
			mePlayer.update();

			this.socket.emit('player-update', {
				position: { x: mePlayer.position.x, y: mePlayer.position.y },
				angle: mePlayer.angle
			});
		});
	}

	onKeyPressed(keyCode: number) {
		this.useMePlayer(mePlayer => {
			mePlayer.onKeyPressed(keyCode);
		});
	}

	onKeyReleased(keyCode: number) {
		this.useMePlayer(mePlayer => {
			mePlayer.onKeyReleased(keyCode);
		});
	}

	drawPlayers() {
		Object.values(this.players).forEach(player => {
			player.draw();
		});
	}

	onNewPlayers() {}

	private useMePlayer(callback: (mePlayer: Player) => void) {
		if (!this.socket.connected) {
			return;
		}

		const mePlayer = this.players[this.socket.id] ?? null;
		if (mePlayer === null) {
			return;
		}

		callback(mePlayer);
	}
}
