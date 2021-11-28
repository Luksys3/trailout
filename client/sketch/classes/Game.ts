interface ServerPlayer {
	id: string;
	carStyle: 0 | 1 | 2 | 3;
	position: { x: number; y: number };
	angle: number;
	dead: boolean;
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
	private walls: Record<string, Wall> = {};
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
					this.walls = {};
					break;

				case 'COUNTDOWN':
				case 'ENDED':
					this.countdown = message.countdown;
					if (this.countdown <= 2) {
						this.players = {};
						this.walls = {};
					}
					break;
			}

			this.state = message.state;
		});

		this.socket.on(
			'new-blob',
			(message: { blob: { id: string; position: { x: number; y: number } } }) => {
				this.walls[message.blob.id] = new Wall({
					position: createVector(
						message.blob.position.x,
						message.blob.position.y
					)
				});
			}
		);

		this.socket.on('players', (message: { players: ServerPlayer[] }) => {
			message.players.map(player => {
				if (this.players[player.id] === undefined) {
					const newPlayer = new Player(
						player.id,
						player.carStyle,
						createVector(player.position.x, player.position.y),
						{
							me: this.socket.id === player.id,
							angle: player.angle,
							game: this,
							dead: player.dead
						}
					);

					newPlayer.preload();
					this.players[newPlayer.id] = newPlayer;
					return;
				}

				if (this.socket.id !== player.id) {
					this.players[player.id].updateFromServer(player);
				} else {
					this.players[player.id].dead = player.dead;
				}
			});
		});

		this.socket.on('remove-player', (message: { playerId: ServerPlayer['id'] }) => {
			delete this.players[message.playerId];
		});

		this.socket.on('remove-wall', (message: { wallId: string }) => {
			delete this.walls[message.wallId];
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

	drawWalls() {
		Object.values(this.walls).forEach(wall => wall.draw());
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
		if (this.state !== 'STARTED') {
			push();
			strokeWeight(0);
			fill(255, 255, 255, 100);
			rect(0, 0, 1216, 832);
			pop();
		}

		push();
		textSize(20);
		textAlign(CENTER);
		if (this.state === 'WAITING_FOR_PLAYERS') {
			text('Waiting for more players', width / 2, height / 2);
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

	createWall(position: p5.Vector) {
		this.socket.emit('new-blob', {
			position: {
				x: position.x,
				y: position.y
			}
		});
	}

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
