class Wall {
	private position: p5.Vector;
	private wallImage: p5.Image;
	private angle: number;

	constructor({ position }: { position: p5.Vector }) {
		this.position = position;

		this.wallImage = loadImage('assets/Boulder.png');

		this.angle = random(-PI, PI);
	}

	draw() {
		const width = 17 * 2;
		const height = 17 * 2;

		push();
		translate(this.position.x, this.position.y);
		rotate(this.angle);
		image(this.wallImage, -width / 2, -height / 2, width, height);
		pop();
	}
}
