import { Server } from 'socket.io';
import { Player, PlayerDataInterface } from './Player';
import { Wall } from './Wall';
import * as uuid from 'uuid';

type GameStateType = 'WAITING_FOR_PLAYERS' | 'COUNTDOWN' | 'STARTED' | 'ENDED';

export const canvasWidth = 1216;
export const canvasHeight = 832;

export class Game {
	private io: Server;

	private state: GameStateType = 'WAITING_FOR_PLAYERS';
	private players: Player[] = [];
	private walls: Record<string, Wall> = {};
	private countdown: number = 5;
	private countdownTimeout: any = null;
	private countdownInterval: any = null;
	private endedInterval: any = null;

	private objects: Record<number, Record<number, string>> = {
		2: {
			7: 'TREE_TOP',
			8: 'TREE_BOTTOM'
		},
		4: {
			10: 'TREE_TOP',
			11: 'TREE_BOTTOM'
		},
		6: {
			1: 'WOOD'
		},
		7: {
			6: 'BUSH'
		},
		8: {
			1: 'TREE_TOP',
			2: 'TREE_BOTTOM'
		},
		9: {
			5: 'STONE'
		},
		10: {
			10: 'TREE_TOP',
			11: 'TREE_BOTTOM'
		},
		11: {
			2: 'TREE_TOP',
			3: 'TREE_BOTTOM',
			11: 'TREE_TOP',
			12: 'TREE_BOTTOM'
		},
		12: {
			3: 'TREE_TOP',
			4: 'TREE_COLLIDED',
			5: 'TREE_BOTTOM',
			11: 'TREE_TOP',
			12: 'TREE_BOTTOM'
		},
		14: {
			2: 'STONE'
		},
		15: {
			7: 'WOOD'
		},
		18: {
			5: 'TREE_TOP',
			6: 'TREE_BOTTOM'
		}
	};

	constructor(io: Server) {
		this.io = io;

		this.io.on('connection', socket => {
			console.log('CONNECTED: ' + socket.id);

			this.players = [
				...this.players,
				new Player({ id: socket.id, carStyle: this.getUniqueCarStyle() })
			];

			this.sendGameState(this.io);

			socket.on('try-start', () => {
				if (this.state === 'WAITING_FOR_PLAYERS') {
					if (this.players.length >= 2) {
						this.startCountdown();
					}
				}
			});

			socket.on('player-update', (message: PlayerDataInterface) => {
				if (
					this.state === 'STARTED' ||
					(this.state === 'ENDED' && this.countdown > 2)
				) {
					this.players.forEach(player => {
						if (player.id === socket.id && !player.dead) {
							player.updateFromClient(message);
						}
					});
				}
			});

			socket.on('new-blob', (message: { position: { x: number; y: number } }) => {
				const id = uuid.v4();

				this.walls[id] = new Wall({
					id,
					position: message.position,
					ownerId: socket.id
				});

				this.io.emit('new-blob', {
					blob: {
						id: this.walls[id].id,
						position: this.walls[id].position
					}
				});

				setTimeout(() => {
					delete this.walls[id];
					this.io.emit('remove-wall', {
						wallId: id
					});
				}, 3000);
			});

			socket.on('disconnect', () => {
				console.log('DISCONNECTED: ' + socket.id);

				this.players = this.players.filter(player => player.id !== socket.id);
				console.log('Players count: ' + this.players.length);

				this.io.emit('remove-player', { playerId: socket.id });
			});
		});

		setInterval(() => {
			if (this.state !== 'WAITING_FOR_PLAYERS' && this.players.length <= 1) {
				this.state = 'WAITING_FOR_PLAYERS';

				this.players = this.players.map(player => {
					player.reset();
					return player;
				});
				this.walls = {};

				this.sendGameState(this.io);

				clearTimeout(this.countdownTimeout);
				clearInterval(this.countdownInterval);
				clearInterval(this.endedInterval);
			}

			if (
				this.state === 'STARTED' ||
				(this.state === 'ENDED' && this.countdown > 2)
			) {
				this.io.emit('players', {
					players: this.players.map(player => player.toJson())
				});

				this.players.forEach(player => {
					if (player.dead) {
						return;
					}

					if (
						player.position.x <= 16 ||
						player.position.y <= 16 ||
						player.position.x >= canvasWidth - 16 ||
						player.position.y >= canvasHeight - 16
					) {
						player.setDead();
						this.io.emit('player-dead', { playerId: player.id });
						return;
					}

					const playerTileX = Math.floor(player.position.x / 64);
					const playerTileY = Math.floor(player.position.y / 64);
					const potentialObject =
						this.objects[playerTileX]?.[playerTileY] ?? null;
					if (potentialObject !== null) {
						if (potentialObject !== 'TREE_TOP') {
							const a = playerTileX * 64 + 32 - player.position.x;
							const b = playerTileY * 64 + 32 - player.position.y;
							if (Math.sqrt(a * a + b * b) < 32) {
								player.setDead();
								this.io.emit('player-dead', { playerId: player.id });
								return;
							}
						}
					}

					Object.values(this.players).forEach(({ id, position: p }) => {
						if (id === player.id) {
							return;
						}

						const a = p.x - player.position.x;
						const b = p.y - player.position.y;
						if (Math.sqrt(a * a + b * b) < 20) {
							player.setDead();
							this.io.emit('player-dead', { playerId: player.id });
						}
					});

					Object.values(this.walls).forEach(({ position: p }) => {
						const a = p.x - player.position.x;
						const b = p.y - player.position.y;
						if (Math.sqrt(a * a + b * b) < 20) {
							player.setDead();
							this.io.emit('player-dead', { playerId: player.id });
						}
					});
				});

				if (this.state === 'STARTED') {
					const aliveCount = this.players.reduce(
						(previous, player) => (player.dead ? previous : previous + 1),
						0
					);
					if (aliveCount <= 1) {
						this.io.emit('players', {
							players: this.players.map(player => player.toJson())
						});

						this.state = 'ENDED';
						this.countdown = 4;
						this.sendGameState(this.io);

						clearInterval(this.endedInterval);
						this.endedInterval = setInterval(() => {
							this.countdown -= 1;

							if (this.players.length <= 1) {
								clearInterval(this.endedInterval);
								this.state = 'WAITING_FOR_PLAYERS';
							} else if (this.countdown <= 0) {
								this.players = this.players.map(player => {
									player.reset();
									return player;
								});
								this.walls = {};

								this.io.emit('players', {
									players: this.players.map(player => player.toJson())
								});

								clearInterval(this.endedInterval);
								this.state = 'STARTED';
							}

							this.sendGameState(this.io);
						}, 1000);
					}
				}
			}
		}, 1000 / 40);
	}

	private startCountdown() {
		this.state = 'COUNTDOWN';
		this.countdown = 6;
		this.sendGameState(this.io);

		clearTimeout(this.countdownTimeout);
		this.countdownTimeout = setTimeout(() => {
			clearInterval(this.countdownInterval);
			this.countdownInterval = setInterval(() => {
				this.countdown -= 1;

				if (this.countdown <= 0) {
					clearInterval(this.countdownInterval);
					this.state = 'STARTED';
				}

				this.sendGameState(this.io);
			}, 1000);
		}, 500);
	}

	private sendGameState(socket: any) {
		switch (this.state) {
			case 'WAITING_FOR_PLAYERS':
				socket.emit('game-state', {
					state: this.state,
					playersCount: this.players.length
				});
				break;

			case 'COUNTDOWN':
			case 'ENDED':
				socket.emit('game-state', {
					state: this.state,
					countdown: this.countdown
				});
				break;

			default:
				socket.emit('game-state', {
					state: this.state
				});
		}
	}

	private getUniqueCarStyle(): 0 | 1 | 2 | 3 {
		let unusedCarStyles: (0 | 1 | 2 | 3)[] = [0, 1, 2, 3];

		this.players.forEach(player => {
			unusedCarStyles = unusedCarStyles.filter(
				carStyle => player.carStyle !== carStyle
			);
		});

		return (
			unusedCarStyles[
				Math.floor((Math.random() * 99999) % unusedCarStyles.length)
			] ?? 1
		);
	}
}
