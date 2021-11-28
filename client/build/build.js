let game;
let gameMap;
let font;
let music;
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
    }
    else {
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
        if (relativeMouseX >= -100 &&
            relativeMouseX <= 100 &&
            relativeMouseY >= 0 &&
            relativeMouseY <= 40) {
            connectPressed = true;
            setupGame();
        }
    }
    else {
        game.mouseReleased();
    }
}
class Game {
    constructor() {
        this.players = {};
        this.walls = {};
        this.state = null;
        this.playersCount = 0;
        this.countdown = 5;
        this.musicStarted = false;
    }
    preload() {
        this.crashSound = loadSound('assets/Crash.wav');
    }
    setup(music) {
        this.music = music;
        this.socket = io('http://192.168.1.222:8443');
        this.socket.on('game-state', (message) => {
            switch (message.state) {
                case 'WAITING_FOR_PLAYERS':
                    this.musicStarted = false;
                    this.music.stop();
                    this.playersCount = message.playersCount;
                    this.players = {};
                    this.walls = {};
                    break;
                case 'COUNTDOWN':
                case 'ENDED':
                    this.countdown = message.countdown;
                    if (this.countdown <= 2) {
                        this.players = {};
                        this.walls = {};
                    }
                    break;
            }
            if (message.state === 'COUNTDOWN' && !this.musicStarted) {
                this.musicStarted = true;
                this.music.play();
            }
            this.state = message.state;
        });
        this.socket.on('new-blob', (message) => {
            this.walls[message.blob.id] = new Wall({
                position: createVector(message.blob.position.x, message.blob.position.y)
            });
        });
        this.socket.on('players', (message) => {
            message.players.map(player => {
                if (this.players[player.id] === undefined) {
                    const newPlayer = new Player(player.id, player.carStyle, createVector(player.position.x, player.position.y), {
                        me: this.socket.id === player.id,
                        angle: player.angle,
                        game: this,
                        dead: player.dead
                    });
                    newPlayer.preload();
                    this.players[newPlayer.id] = newPlayer;
                    return;
                }
                if (this.socket.id !== player.id) {
                    this.players[player.id].updateFromServer(player);
                }
                else {
                    this.players[player.id].dead = player.dead;
                }
            });
        });
        this.socket.on('remove-player', (message) => {
            delete this.players[message.playerId];
        });
        this.socket.on('remove-wall', (message) => {
            delete this.walls[message.wallId];
        });
        this.socket.on('player-dead', () => {
            this.crashSound.setVolume(0.6);
            this.crashSound.play();
        });
    }
    updatePlayers() {
        this.useMePlayer(mePlayer => {
            mePlayer.update();
            this.socket.emit('player-update', {
                position: { x: mePlayer.position.x, y: mePlayer.position.y },
                angle: mePlayer.angle
            });
        });
    }
    drawWalls() {
        Object.values(this.walls).forEach(wall => wall.draw());
    }
    onKeyPressed(keyCode) {
        this.useMePlayer(mePlayer => {
            mePlayer.onKeyPressed(keyCode);
        });
    }
    onKeyReleased(keyCode) {
        this.useMePlayer(mePlayer => {
            mePlayer.onKeyReleased(keyCode);
        });
    }
    drawPlayers() {
        Object.values(this.players).forEach(player => {
            player.draw();
        });
    }
    drawUi() {
        if (this.state !== 'STARTED') {
            push();
            strokeWeight(0);
            fill(255, 255, 255, 100);
            rect(0, 0, 1216, 832);
            pop();
            push();
            translate(width / 2, 0);
            color(0, 0, 0, 160);
            textAlign(CENTER);
            textSize(14);
            text('Trailout', 0, 22);
            pop();
        }
        push();
        textSize(20);
        textAlign(CENTER);
        if (this.state === 'WAITING_FOR_PLAYERS') {
            if (this.playersCount <= 1) {
                text('Waiting for 1 more player', width / 2, height / 2);
            }
            else {
                text(`${this.playersCount} players connected`, width / 2, height / 2);
                textSize(16);
                text('[Start]', width / 2, height / 2 + 50);
                textSize(20);
            }
        }
        if (this.state === 'COUNTDOWN') {
            text(`Game starts in ${this.countdown}!`, width / 2, height / 2);
        }
        if (this.state === 'ENDED') {
            text(`Restarting in ${this.countdown} sec.`, width / 2, height / 2);
        }
        pop();
    }
    mouseReleased() {
        if (this.state === 'WAITING_FOR_PLAYERS' && this.playersCount > 1) {
            if (mouseX >= width / 2 - 80 &&
                mouseX <= width / 2 + 80 &&
                mouseY >= height / 2 + 25 &&
                mouseY <= height / 2 + 75) {
                this.socket.emit('try-start');
            }
        }
    }
    onNewPlayers() { }
    createWall(position) {
        this.socket.emit('new-blob', {
            position: {
                x: position.x,
                y: position.y
            }
        });
    }
    useMePlayer(callback) {
        var _a, _b, _c;
        if ((_b = !((_a = this.socket) === null || _a === void 0 ? void 0 : _a.connected)) !== null && _b !== void 0 ? _b : true) {
            return;
        }
        const mePlayer = (_c = this.players[this.socket.id]) !== null && _c !== void 0 ? _c : null;
        if (mePlayer === null) {
            return;
        }
        callback(mePlayer);
    }
}
class GameMap {
    constructor() {
        this.tileSize = 64;
        this.map = {
            0: {
                0: 'ICE',
                1: 'ICE',
                2: 'ICE',
                3: 'ICE',
                4: 'ICE',
                5: 'ICE',
                6: 'ICE',
                7: 'ICE',
                8: 'ICE_GRASS_TOP_LEFT',
                9: 'GRASS_ICE_BOTTOM_RIGHT'
            },
            1: {
                0: 'ICE',
                1: 'ICE',
                2: 'ICE',
                3: 'ICE',
                4: 'ICE_GRASS_TOP_LEFT',
                5: 'ICE_GRASS_LEFT',
                6: 'ICE_GRASS_LEFT',
                7: 'ICE_GRASS_LEFT',
                8: 'GRASS_ICE_BOTTOM_RIGHT'
            },
            2: {
                0: 'ICE_GRASS_LEFT',
                1: 'ICE_GRASS_LEFT',
                2: 'ICE_GRASS_LEFT',
                3: 'ICE_GRASS_LEFT',
                4: 'GRASS_ICE_BOTTOM_RIGHT'
            },
            3: {
                0: 'COBBLE_GRASS_RIGHT',
                1: 'COBBLE_GRASS_RIGHT',
                2: 'COBBLE_GRASS_RIGHT',
                3: 'COBBLE_GRASS_RIGHT',
                4: 'COBBLE_GRASS_RIGHT',
                5: 'COBBLE_GRASS_RIGHT',
                6: 'COBBLE_GRASS_RIGHT',
                7: 'COBBLE_GRASS_RIGHT',
                8: 'COBBLE_GRASS_RIGHT',
                9: 'GRASS_COBBLE_BOTTOM_LEFT'
            },
            4: {
                0: 'COBBLE',
                1: 'COBBLE',
                2: 'COBBLE',
                3: 'COBBLE',
                4: 'COBBLE',
                5: 'COBBLE',
                6: 'COBBLE',
                7: 'COBBLE',
                8: 'COBBLE',
                9: 'COBBLE_GRASS_TOP'
            },
            5: {
                0: 'COBBLE_GRASS_LEFT',
                1: 'COBBLE_GRASS_LEFT',
                2: 'COBBLE_GRASS_LEFT',
                3: 'COBBLE_GRASS_LEFT',
                4: 'COBBLE_GRASS_LEFT',
                5: 'COBBLE_GRASS_LEFT',
                6: 'COBBLE_GRASS_LEFT',
                7: 'COBBLE_GRASS_BOTTOM_LEFT',
                8: 'COBBLE',
                9: 'COBBLE_GRASS_TOP_RIGHT',
                10: 'COBBLE_GRASS_RIGHT',
                11: 'COBBLE_GRASS_RIGHT',
                12: 'COBBLE_GRASS_RIGHT'
            },
            6: {
                7: 'COBBLE_GRASS_BOTTOM',
                8: 'COBBLE',
                9: 'COBBLE',
                10: 'COBBLE',
                11: 'COBBLE',
                12: 'COBBLE'
            },
            7: {
                7: 'COBBLE_GRASS_BOTTOM',
                8: 'COBBLE',
                9: 'COBBLE_GRASS_TOP_LEFT',
                10: 'COBBLE_GRASS_LEFT',
                11: 'COBBLE_GRASS_LEFT',
                12: 'COBBLE_GRASS_LEFT'
            },
            8: {
                7: 'COBBLE_GRASS_BOTTOM',
                8: 'COBBLE',
                9: 'COBBLE_GRASS_TOP'
            },
            9: {
                7: 'COBBLE_GRASS_BOTTOM',
                8: 'COBBLE',
                9: 'COBBLE_GRASS_TOP'
            },
            10: {
                7: 'COBBLE_GRASS_BOTTOM',
                8: 'COBBLE',
                9: 'COBBLE_GRASS_TOP'
            },
            11: {
                7: 'COBBLE_GRASS_BOTTOM',
                8: 'COBBLE',
                9: 'COBBLE_GRASS_TOP'
            },
            12: {
                7: 'COBBLE_GRASS_BOTTOM',
                8: 'COBBLE',
                9: 'COBBLE_GRASS_TOP'
            },
            13: {
                7: 'COBBLE_GRASS_BOTTOM',
                8: 'COBBLE',
                9: 'COBBLE_GRASS_TOP'
            },
            14: {
                7: 'COBBLE_GRASS_BOTTOM',
                8: 'COBBLE',
                9: 'COBBLE_GRASS_TOP'
            },
            15: {
                7: 'COBBLE_GRASS_BOTTOM',
                8: 'COBBLE',
                9: 'COBBLE_GRASS_TOP'
            },
            16: {
                7: 'COBBLE_GRASS_BOTTOM',
                8: 'COBBLE',
                9: 'COBBLE_GRASS_TOP'
            },
            17: {
                7: 'COBBLE_GRASS_BOTTOM',
                8: 'COBBLE',
                9: 'COBBLE_GRASS_TOP'
            },
            18: {
                7: 'COBBLE_GRASS_BOTTOM',
                8: 'COBBLE',
                9: 'COBBLE_GRASS_TOP'
            }
        };
        this.objects = {
            2: {
                7: 'TREE_TOP',
                8: 'TREE_BOTTOM'
            },
            4: {
                10: 'TREE_TOP',
                11: 'TREE_BOTTOM'
            },
            6: {
                1: 'WOOD'
            },
            7: {
                6: 'BUSH'
            },
            8: {
                1: 'TREE_TOP',
                2: 'TREE_BOTTOM'
            },
            9: {
                5: 'STONE'
            },
            10: {
                10: 'TREE_TOP',
                11: 'TREE_BOTTOM'
            },
            11: {
                2: 'TREE_TOP',
                3: 'TREE_BOTTOM',
                11: 'TREE_TOP',
                12: 'TREE_BOTTOM'
            },
            12: {
                3: 'TREE_TOP',
                4: 'TREE_COLLIDED',
                5: 'TREE_BOTTOM',
                11: 'TREE_TOP',
                12: 'TREE_BOTTOM'
            },
            14: {
                2: 'STONE'
            },
            15: {
                7: 'WOOD'
            },
            18: {
                5: 'TREE_TOP',
                6: 'TREE_BOTTOM'
            }
        };
    }
    preload() {
        this.tileImage = loadImage('assets/IceTileset.png');
    }
    setup() {
        background(30);
    }
    drawBackground() {
        var _a, _b;
        for (let ix = 0; ix < width / this.tileSize; ix++) {
            const x = ix * this.tileSize;
            for (let iy = 0; iy < width / this.tileSize; iy++) {
                const objectType = (_b = (_a = this.map[ix]) === null || _a === void 0 ? void 0 : _a[iy]) !== null && _b !== void 0 ? _b : 'GRASS';
                const y = iy * this.tileSize;
                const coords = this.getTileCoords(objectType);
                image(this.tileImage, x, y, 64, 64, coords[0], coords[1], 32, 32);
            }
        }
    }
    drawObjects() {
        var _a, _b;
        for (let ix = 0; ix < width / this.tileSize; ix++) {
            const x = ix * this.tileSize;
            for (let iy = 0; iy < width / this.tileSize; iy++) {
                const objectType = (_b = (_a = this.objects[ix]) === null || _a === void 0 ? void 0 : _a[iy]) !== null && _b !== void 0 ? _b : null;
                const y = iy * this.tileSize;
                if (objectType == null) {
                    continue;
                }
                const coords = this.getTileCoords(objectType);
                image(this.tileImage, x, y, 64, 64, coords[0], coords[1], 32, 32);
            }
        }
    }
    getTileCoords(type) {
        const rawCoords = {
            GRASS: [0, 2],
            COBBLE: [2, 2],
            COBBLE_GRASS_TOP_LEFT: [0, 3],
            COBBLE_GRASS_LEFT: [0, 4],
            COBBLE_GRASS_BOTTOM_LEFT: [0, 5],
            COBBLE_GRASS_BOTTOM: [1, 5],
            COBBLE_GRASS_BOTTOM_RIGHT: [0, 3],
            COBBLE_GRASS_RIGHT: [2, 4],
            COBBLE_GRASS_TOP_RIGHT: [2, 3],
            COBBLE_GRASS_TOP: [1, 3],
            GRASS_COBBLE_TOP_RIGHT: [4, 3],
            GRASS_COBBLE_BOTTOM_LEFT: [3, 4],
            STONE: [2, 1],
            BUSH: [1, 1],
            TREE_BOTTOM: [0, 1],
            TREE_COLLIDED: [1, 0],
            TREE_TOP: [0, 0],
            ICE_GRASS_TOP_LEFT: [5, 3],
            ICE_GRASS_LEFT: [5, 4],
            ICE_GRASS_BOTTOM_LEFT: [5, 5],
            ICE_GRASS_BOTTOM: [6, 5],
            ICE_GRASS_BOTTOM_RIGHT: [7, 5],
            ICE_GRASS_RIGHT: [7, 4],
            ICE_GRASS_TOP_RIGHT: [7, 3],
            ICE_GRASS_TOP: [6, 3],
            GRASS_ICE_TOP_LEFT: [8, 3],
            GRASS_ICE_TOP_RIGHT: [9, 3],
            GRASS_ICE_BOTTOM_LEFT: [8, 4],
            GRASS_ICE_BOTTOM_RIGHT: [9, 4],
            ICE: [1, 2],
            WOOD: [3, 0]
        }[type];
        return [rawCoords[0] * 32, rawCoords[1] * 32];
    }
}
class Player {
    constructor(id, carStyle, position, { me, angle, game, dead }) {
        this.angle = 0;
        this.rotation = 0;
        this.rotationAcceleration = 1;
        this.rotationDeceleration = 0.8;
        this.maxRotation = 10;
        this.turnRight = false;
        this.turnLeft = false;
        this.width = 22;
        this.height = 38;
        this.slippery = 24;
        this.dead = false;
        this.id = id;
        this.carStyle = carStyle;
        this.me = me;
        this.angle = angle;
        this.game = game;
        this.dead = dead;
        this.position = position;
        this.velocity = createVector(0, 14);
        this.velocity.rotate(this.angle);
    }
    preload() {
        this.carsImage = loadImage('assets/Cars.png');
        this.fireImage = loadImage('assets/Fire_Spreadsheet.png');
    }
    updateFromServer(data) {
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
        }
        else if (this.rotation < 0) {
            this.rotation += this.rotationDeceleration;
            if (this.rotation > 0) {
                this.rotation = 0;
            }
        }
        if (this.turnRight) {
            this.rotation += this.rotationAcceleration;
        }
        else if (this.rotation > 0) {
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
        image(this.carsImage, -this.width / 2, -this.height / 2, this.width, this.height, coords[0], coords[1], 11, 19);
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
            image(this.fireImage, -fireWidth / 2 - 8, -fireHeight / 2, fireWidth, fireHeight, 128 + coords2[0], 64 + coords2[0], 256, 352);
            image(this.fireImage, -fireWidth / 2 + 6, -fireHeight / 2 + 8, fireWidth, fireHeight, 128 + coords2[0], 64 + coords2[0], 256, 352);
            image(this.fireImage, -fireWidth / 2 + 4, -fireHeight / 2 - 6, fireWidth, fireHeight, 128 + coords2[0], 64 + coords2[0], 256, 352);
            pop();
        }
    }
    onKeyPressed(keyCode) {
        if (keyCode === LEFT_ARROW) {
            this.turnLeft = true;
        }
        else if (keyCode === RIGHT_ARROW) {
            this.turnRight = true;
        }
    }
    onKeyReleased(keyCode) {
        if (keyCode === LEFT_ARROW) {
            this.turnLeft = false;
        }
        else if (keyCode === RIGHT_ARROW) {
            this.turnRight = false;
        }
        else if (keyCode === 32) {
            this.putBlob();
        }
    }
    putBlob() {
        if (!this.dead) {
            this.game.createWall(createVector(this.position.x, this.position.y).add(createVector(0, 30).rotate(this.angle)));
        }
    }
    getCarStyleCoords() {
        return {
            0: [0, 46],
            1: [26, 25],
            2: [10, -1],
            3: [53, 45]
        }[this.carStyle];
    }
}
class Wall {
    constructor({ position }) {
        this.position = position;
        this.wallImage = loadImage('assets/Boulder.png');
        this.angle = random(-PI, PI);
    }
    draw() {
        const width = 17 * 2;
        const height = 17 * 2;
        push();
        translate(this.position.x, this.position.y);
        rotate(this.angle);
        image(this.wallImage, -width / 2, -height / 2, width, height);
        pop();
    }
}
//# sourceMappingURL=build.js.map