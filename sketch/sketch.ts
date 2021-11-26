let gameMap: GameMap;

function preload() {}

function setup() {
	createCanvas(1216, 836);
	gameMap = new GameMap();
	gameMap.preload();

	gameMap.setup();
}

function draw() {
	noSmooth();

	gameMap.drawBackground();
	gameMap.drawObjects();

	// drawSprites();
}
