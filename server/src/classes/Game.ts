import { Server } from 'socket.io';
import { Player, PlayerDataInterface } from './Player';

type GameStateType = 'WAITING_FOR_PLAYERS' | 'COUNTDOWN' | 'RUNNING';

export class Game {
	private io: Server;

	private state: GameStateType = 'WAITING_FOR_PLAYERS';
	private players: Player[] = [];

	constructor(io: Server) {
		this.io = io;

		this.io.on('connection', socket => {
			console.log('CONNECTED: ' + socket.id);

			if (this.state === 'WAITING_FOR_PLAYERS') {
				this.players = [
					...this.players,
					new Player({ id: socket.id, carStyle: this.getUniqueCarStyle() })
				];
				console.log('Players count: ' + this.players.length);
			}

			socket.on('player-update', (message: PlayerDataInterface) => {
				this.players.forEach(player => {
					if (player.id === socket.id) {
						player.updateFromClient(message);
					}
				});
			});

			socket.on('disconnect', () => {
				console.log('DISCONNECTED: ' + socket.id);

				this.players = this.players.filter(player => player.id !== socket.id);
				console.log('Players count: ' + this.players.length);

				this.io.emit('remove-player', { playerId: socket.id });
			});
		});

		setInterval(() => {
			this.io.emit('players', {
				players: this.players.map(player => player.toJson())
			});
		}, 1000 / 60);
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
