interface ServerPlayer {
	id: string;
	carStyle: 0 | 1 | 2 | 3;
	position: { x: number; y: number };
	angle: number;
}

type GameStateType = 'WAITING_FOR_PLAYERS' | 'COUNTDOWN' | 'STARTED' | 'ENDED';

type GameStateData =
	| {
			state: 'WAITING_FOR_PLAYERS';
			playersCount: number;
	  }
	| {
			state: 'COUNTDOWN' | 'ENDED';
			countdown: number;
	  }
	| {
			state: 'STARTED';
	  };

class Game {
	private socket: any;
	private players: Record<string, Player> = {};
	private state: GameStateType | null = null;

	private playersCount = 0;
	private countdown = 5;

	preload() {}

	setup() {
		this.socket = io('http://localhost:8443');

		this.socket.on('game-state', (message: GameStateData) => {
			switch (message.state) {
				case 'WAITING_FOR_PLAYERS':
					this.playersCount = message.playersCount;
					this.players = {};
					break;

				case 'COUNTDOWN':
				case 'ENDED':
					this.countdown = message.countdown;
					this.players = {};
					break;
			}

			this.state = message.state;
		});

		this.socket.on('players', (message: { players: ServerPlayer[] }) => {
			message.players.map((player, index) => {
				if (this.players[player.id] === undefined) {
					const newPlayer = new Player(
						player.id,
						player.carStyle,
						createVector(player.position.x, player.position.y),
						{ me: this.socket.id === player.id, angle: player.angle }
					);

					newPlayer.preload();
					this.players[newPlayer.id] = newPlayer;
					return;
				}

				if (this.socket.id !== player.id) {
					this.players[player.id].updateFromServer(player);
				}
			});
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

	drawUi() {
		push();
		textSize(26);
		if (this.state === 'WAITING_FOR_PLAYERS') {
			text(`Connected players: ${this.playersCount}`, width / 2, height / 2);
		}

		if (this.state === 'COUNTDOWN') {
			text(`Game starts in ${this.countdown}!`, width / 2, height / 2);
		}

		if (this.state === 'ENDED') {
			text(
				`Game ended! Restarting in ${this.countdown} seconds.`,
				width / 2,
				height / 2
			);
		}
		pop();
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
