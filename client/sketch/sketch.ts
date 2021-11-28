let game: Game;
let gameMap: GameMap;
let font: any;
let music: p5.SoundFile;

let connectPressed = false;

function preload() {
	font = loadFont('assets/PressStart2P-Regular.ttf');
	music = loadSound('assets/8_Bit_Retro_Funk.mp3');

	game = new Game();
	game.preload();

	gameMap = new GameMap();
	gameMap.preload();
}

function setup() {
	textFont(font);
	frameRate(60);
	createCanvas(1216, 832);
}

function setupGame() {
	game.setup(music);
	gameMap.setup();

	music.setLoop(true);
	music.setVolume(0.6);
}

function draw() {
	if (connectPressed) {
		noSmooth();

		game.updatePlayers();

		gameMap.drawBackground();
		game.drawWalls();
		game.drawPlayers();
		gameMap.drawObjects();

		game.drawUi();
	} else {
		push();
		background(255);
		strokeWeight(0);
		translate(width / 2, height / 2);
		textAlign(CENTER);
		color(0, 0, 0);
		textSize(32);
		text('Trailout', 0, -100);
		textSize(16);
		text('by Luksys3', 0, -70);
		textSize(20);
		text('[Connect]', 0, 20);
		pop();
	}
}

function keyPressed() {
	game.onKeyPressed(keyCode);
}

function keyReleased() {
	game.onKeyReleased(keyCode);
}

function mouseReleased() {
	if (!connectPressed) {
		const relativeMouseX = mouseX - width / 2;
		const relativeMouseY = mouseY - height / 2;
		if (
			relativeMouseX >= -100 &&
			relativeMouseX <= 100 &&
			relativeMouseY >= 0 &&
			relativeMouseY <= 40
		) {
			connectPressed = true;
			setupGame();
		}
	}
}
