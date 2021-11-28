let game: Game;
let gameMap: GameMap;
let font: any;

function preload() {
	font = loadFont('assets/PressStart2P-Regular.ttf');

	game = new Game();
	game.preload();

	gameMap = new GameMap();
	gameMap.preload();
}

function setup() {
	textFont(font);
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
}

function keyPressed() {
	game.onKeyPressed(keyCode);
}

function keyReleased() {
	game.onKeyReleased(keyCode);
}
