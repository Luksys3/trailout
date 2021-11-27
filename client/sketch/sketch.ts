let game: Game;
let gameMap: GameMap;

function preload() {
	game = new Game();
	game.preload();

	gameMap = new GameMap();
	gameMap.preload();
}

function setup() {
	frameRate(60);
	createCanvas(1216, 832);

	game.setup();
	gameMap.setup();
}

function draw() {
	noSmooth();

	game.updatePlayers();

	gameMap.drawBackground();
	game.drawWalls();
	game.drawPlayers();
	gameMap.drawObjects();

	game.drawUi();

	text(Math.round(frameRate()), 10, 10);
}

function keyPressed() {
	game.onKeyPressed(keyCode);
}

function keyReleased() {
	game.onKeyReleased(keyCode);
}
