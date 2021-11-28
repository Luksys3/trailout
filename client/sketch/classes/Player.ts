class Player {
	id: string;

	private me: boolean;
	private game: Game;

	position: p5.Vector;
	private velocity: p5.Vector;

	angle = 0;
	private rotation = 0;
	private rotationAcceleration = 1;
	private rotationDeceleration = 0.8;
	private maxRotation = 10;

	private turnRight = false;
	private turnLeft = false;

	private carsImage: p5.Image;
	private fireImage: p5.Image;
	private carStyle: 0 | 1 | 2 | 3;

	private width = 22;
	private height = 38;

	private slippery = 24;
	dead = false;

	constructor(
		id: string,
		carStyle: 0 | 1 | 2 | 3,
		position: p5.Vector,
		{
			me,
			angle,
			game,
			dead
		}: { me: boolean; angle: number; game: Game; dead: boolean }
	) {
		this.id = id;
		this.carStyle = carStyle;
		this.me = me;
		this.angle = angle;
		this.game = game;
		this.dead = dead;

		this.position = position;
		// this.velocity = createVector(0, 0.1);
		this.velocity = createVector(0, 14);
		this.velocity.rotate(this.angle);
	}

	preload() {
		this.carsImage = loadImage('assets/Cars.png');
		this.fireImage = loadImage('assets/Fire_Spreadsheet.png');
	}

	updateFromServer(data: ServerPlayer) {
		this.position = createVector(data.position.x, data.position.y);
		this.angle = data.angle;
		this.dead = data.dead;
	}

	update() {
		if (this.dead) {
			return;
		}

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

		translate(this.position.x, this.position.y);

		if (this.me) {
			const deltaAngle = -this.velocity.angleBetween(createVector(0, -1));
			this.angle =
				deltaAngle +
				(PI / 180) *
					(this.rotation > 0
						? this.slippery
						: this.rotation < 0
						? -this.slippery
						: 0) *
					map(abs(this.rotation), 0, this.maxRotation, 0, 1);
		}
		rotate(this.angle);

		const coords = this.getCarStyleCoords();
		image(
			this.carsImage,
			-this.width / 2,
			-this.height / 2,
			this.width,
			this.height,
			coords[0],
			coords[1],
			11,
			19
		);
		pop();

		if (this.dead) {
			push();
			translate(this.position.x, this.position.y);
			const fireWidth = (256 / 32) * 2;
			const fireHeight = (352 / 32) * 2;

			const coords2 = [
				[0, 0],
				[512, 0],
				[0, 512],
				[512, 512]
			][Math.floor((millis() % 1000) / 250)];

			image(
				this.fireImage,
				-fireWidth / 2 - 8,
				-fireHeight / 2,
				fireWidth,
				fireHeight,
				128 + coords2[0],
				64 + coords2[0],
				256,
				352
			);
			image(
				this.fireImage,
				-fireWidth / 2 + 6,
				-fireHeight / 2 + 8,
				fireWidth,
				fireHeight,
				128 + coords2[0],
				64 + coords2[0],
				256,
				352
			);
			image(
				this.fireImage,
				-fireWidth / 2 + 4,
				-fireHeight / 2 - 6,
				fireWidth,
				fireHeight,
				128 + coords2[0],
				64 + coords2[0],
				256,
				352
			);
			pop();
		}
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
		} else if (keyCode === 32) {
			this.putBlob();
		}
	}

	private putBlob() {
		this.game.createWall(
			createVector(this.position.x, this.position.y).add(
				createVector(0, 30).rotate(this.angle)
			)
		);
	}

	private getCarStyleCoords(): [number, number] {
		return {
			0: [0, 46],
			1: [26, 25],
			2: [10, -1],
			3: [53, 45]
		}[this.carStyle] as [number, number];
	}
}
