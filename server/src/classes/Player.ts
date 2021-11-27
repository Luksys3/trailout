export interface PlayerDataInterface {
	position: { x: number; y: number };
	angle: number;
}

export class Player {
	id: string;
	carStyle: 0 | 1 | 2 | 3;
	private position: { x: number; y: number };
	private angle: number;

	constructor({ id, carStyle }: { id: string; carStyle: 0 | 1 | 2 | 3 }) {
		this.id = id;
		this.position = {
			x: 500,
			y: 600
		};
		this.angle = 0;
		this.carStyle = carStyle;
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
			carStyle: this.carStyle
		};
	}
}
