import { canvasHeight, canvasWidth } from './Game';

export interface PlayerDataInterface {
	position: { x: number; y: number };
	angle: number;
}

export class Player {
	id: string;
	carStyle: 0 | 1 | 2 | 3;
	position!: { x: number; y: number };
	private angle = 0;
	dead = false;

	constructor({ id, carStyle }: { id: string; carStyle: 0 | 1 | 2 | 3 }) {
		this.id = id;
		this.carStyle = carStyle;
		this.resetPosition();
	}

	setDead() {
		this.dead = true;
	}

	reset() {
		this.dead = false;
		this.resetPosition();
	}

	private resetPosition() {
		this.position = {
			...{
				0: {
					x: 64 * 1,
					y: 64 * 1
				},
				1: {
					x: canvasWidth - 64 * 1,
					y: 64 * 1
				},
				2: {
					x: canvasWidth - 64 * 1,
					y: canvasHeight - 64 * 1
				},
				3: {
					x: 64 * 1,
					y: canvasHeight - 64 * 1
				}
			}[this.carStyle]
		};
		this.angle = {
			0: -(Math.PI / 180) * 45,
			1: (Math.PI / 180) * 45,
			2: -(Math.PI / 180) * 45 + Math.PI,
			3: (Math.PI / 180) * 45 + Math.PI
		}[this.carStyle];
	}

	updateFromClient({ position, angle }: PlayerDataInterface) {
		this.position = position;
		this.angle = angle;
	}

	toJson() {
		return {
			id: this.id,
			position: this.position,
			angle: this.angle,
			carStyle: this.carStyle,
			dead: this.dead
		};
	}
}
