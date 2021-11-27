class Wall {
	private position: p5.Vector;

	constructor({ position }: { position: p5.Vector }) {
		this.position = position;
	}

	draw() {
		push();
		color(240, 240, 240);
		circle(this.position.x, this.position.y, 20);
		pop();
	}
}
