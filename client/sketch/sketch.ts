let game: Game;
let gameMap: GameMap;
// let player: Player;

function preload() {
	game = new Game();
	game.preload();

	gameMap = new GameMap();
	gameMap.preload();

	// player = new Player(3);
	// player.preload();
}

function setup() {
	frameRate(60);
	createCanvas(1216, 836);

	game.setup();
	gameMap.setup();
}

function draw() {
	// player.update();
	game.updatePlayers();

	background(255);

	noSmooth();
	gameMap.drawBackground();

	// player.draw();
	game.drawPlayers();

	gameMap.drawObjects();

	text(Math.round(frameRate()), 10, 10);
}

function keyPressed() {
	// player.onKeyPressed(keyCode);
	game.onKeyPressed(keyCode);
	// return false;
}

function keyReleased() {
	// player.onKeyReleased(keyCode);
	game.onKeyReleased(keyCode);
	// return false;
}
