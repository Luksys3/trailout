let gameMap;
let player;
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
            4: {
                8: 'TREE_TOP',
                9: 'TREE_BOTTOM'
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
            12: {
                3: 'TREE_TOP',
                4: 'TREE_COLLIDED',
                5: 'TREE_BOTTOM'
            },
            13: {
                3: 'TREE_TOP',
                4: 'TREE_BOTTOM'
            },
            15: {
                7: 'WOOD'
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
    constructor() {
        this.width = 22;
        this.height = 38;
        this.slippery = 24;
        this.rotation = 0;
        this.rotationAcceleration = 1;
        this.rotationDeceleration = 0.8;
        this.maxRotation = 10;
        this.turnRight = false;
        this.turnLeft = false;
        this.position = createVector(64 * 8, 64 * 5);
        this.velocity = createVector(0, 14);
    }
    preload() {
        this.carsImage = loadImage('assets/Cars.png');
    }
    setup() { }
    update() {
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
        translate(this.position.x + this.width / 2, this.position.y + this.height / 1.5);
        const deltaAngle = -this.velocity.angleBetween(createVector(0, -1));
        rotate(deltaAngle +
            (PI / 180) *
                (this.rotation > 0
                    ? this.slippery
                    : this.rotation < 0
                        ? -this.slippery
                        : 0) *
                map(abs(this.rotation), 0, this.maxRotation, 0, 1));
        image(this.carsImage, 0, 0, 22, 38, 0, 46, 11, 19);
        pop();
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
    }
}
//# sourceMappingURL=build.js.map