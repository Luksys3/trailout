function setup() {
	createCanvas(1200, 800);
}

function draw() {
	background(200);

	createSprite(width / 2, height - 50, 100, 10);

	translate(width / 2, height / 2);
}
