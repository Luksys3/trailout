let gameMap: GameMap;
let player: Player;

function preload() {
	gameMap = new GameMap();
	gameMap.preload();

	player = new Player();
	player.preload();
}

function setup() {
	frameRate(60);
	createCanvas(1216, 836);

	gameMap.setup();
	player.setup();
}

function draw() {
	player.update();

	background(255);

	noSmooth();
	gameMap.drawBackground();

	player.draw();

	gameMap.drawObjects();

	text(Math.round(frameRate()), 10, 10);
}

function keyPressed() {
	player.onKeyPressed(keyCode);
	return false;
}

function keyReleased() {
	player.onKeyReleased(keyCode);
	return false;
}
