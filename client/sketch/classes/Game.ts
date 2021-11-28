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
	private music: p5.SoundFile;
	private crashSound: p5.SoundFile;
	private musicStarted = false;

	preload() {
		this.crashSound = loadSound('assets/Crash.wav');
	}

	setup(music: p5.SoundFile) {
		this.music = music;
		this.socket = io('http://192.168.1.222:8443');

		this.socket.on('game-state', (message: GameStateData) => {
			switch (message.state) {
				case 'WAITING_FOR_PLAYERS':
					this.musicStarted = false;
					this.music.stop();
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

			if (message.state === 'COUNTDOWN' && !this.musicStarted) {
				this.musicStarted = true;
				this.music.play();
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

		this.socket.on('player-dead', () => {
			this.crashSound.setVolume(0.6);
			this.crashSound.play();
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

			push();
			translate(width / 2, 0);
			color(0, 0, 0, 160);
			textAlign(CENTER);
			textSize(14);
			text('Trailout', 0, 22);
			pop();
		}

		push();
		textSize(20);
		textAlign(CENTER);
		if (this.state === 'WAITING_FOR_PLAYERS') {
			if (this.playersCount <= 1) {
				text('Waiting for 1 more player', width / 2, height / 2);
			} else {
				text(`${this.playersCount} players connected`, width / 2, height / 2);
				textSize(16);
				text('[Start]', width / 2, height / 2 + 50);
				textSize(20);
			}
		}

		if (this.state === 'COUNTDOWN') {
			text(`Game starts in ${this.countdown}!`, width / 2, height / 2);
		}

		if (this.state === 'ENDED') {
			text(`Restarting in ${this.countdown} sec.`, width / 2, height / 2);
		}
		pop();
	}

	mouseReleased() {
		if (this.state === 'WAITING_FOR_PLAYERS' && this.playersCount > 1) {
			if (
				mouseX >= width / 2 - 80 &&
				mouseX <= width / 2 + 80 &&
				mouseY >= height / 2 + 25 &&
				mouseY <= height / 2 + 75
			) {
				this.socket.emit('try-start');
			}
		}
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
		if (!this.socket?.connected ?? true) {
			return;
		}

		const mePlayer = this.players[this.socket.id] ?? null;
		if (mePlayer === null) {
			return;
		}

		callback(mePlayer);
	}
}
