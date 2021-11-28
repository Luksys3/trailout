class Wall {
	private position: p5.Vector;
	private wallImage: p5.Image;

	constructor({ position }: { position: p5.Vector }) {
		this.position = position;

		this.wallImage = loadImage('assets/Boulder.png');
	}

	draw() {
		const width = 17 * 2;
		const height = 14 * 2;

		push();
		image(
			this.wallImage,
			this.position.x - width / 2,
			this.position.y - height / 2,
			width,
			height
		);
		pop();
	}
}
