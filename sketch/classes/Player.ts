class Player {
	private carsImage: p5.Image;

	private width = 22;
	private height = 38;

	private velocity: p5.Vector;
	private position: p5.Vector;

	private slippery = 24;

	private rotation = 0;
	private rotationAcceleration = 1;
	private rotationDeceleration = 0.8;
	private maxRotation = 10;

	private turnRight = false;
	private turnLeft = false;

	constructor() {
		this.position = createVector(64 * 8, 64 * 5);

		this.velocity = createVector(0, 14);
	}

	preload() {
		this.carsImage = loadImage('assets/Cars.png');
	}

	setup() {}

	update() {
		this.position.add(this.velocity.copy().mult(deltaTime / 50));

		if (this.turnLeft) {
			this.rotation -= this.rotationAcceleration;
		} else if (this.rotation < 0) {
			this.rotation += this.rotationDeceleration;
			if (this.rotation > 0) {
				this.rotation = 0;
			}
		}
		if (this.turnRight) {
			this.rotation += this.rotationAcceleration;
		} else if (this.rotation > 0) {
			this.rotation -= this.rotationDeceleration;
			if (this.rotation < 0) {
				this.rotation = 0;
			}
		}
		this.rotation = min(max(this.rotation, -this.maxRotation), this.maxRotation);

		this.velocity.rotate((PI / 180) * this.rotation * (deltaTime / 50));
	}

	draw() {
		push();

		translate(
			this.position.x + this.width / 2,
			this.position.y + this.height / 1.5
		);
		const deltaAngle = -this.velocity.angleBetween(createVector(0, -1));
		rotate(
			deltaAngle +
				(PI / 180) *
					(this.rotation > 0
						? this.slippery
						: this.rotation < 0
						? -this.slippery
						: 0) *
					map(abs(this.rotation), 0, this.maxRotation, 0, 1)
		);
		image(this.carsImage, 0, 0, 22, 38, 0, 46, 11, 19);

		pop();
	}

	onKeyPressed(keyCode: number) {
		if (keyCode === LEFT_ARROW) {
			this.turnLeft = true;
		} else if (keyCode === RIGHT_ARROW) {
			this.turnRight = true;
		}
	}

	onKeyReleased(keyCode: number) {
		if (keyCode === LEFT_ARROW) {
			this.turnLeft = false;
		} else if (keyCode === RIGHT_ARROW) {
			this.turnRight = false;
		}
	}
}
