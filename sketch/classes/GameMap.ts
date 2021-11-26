type GameMapTileType =
	| 'GRASS'
	| 'COBBLE'
	| 'COBBLE_GRASS_TOP_LEFT'
	| 'COBBLE_GRASS_LEFT'
	| 'COBBLE_GRASS_BOTTOM_LEFT'
	| 'COBBLE_GRASS_BOTTOM'
	| 'COBBLE_GRASS_BOTTOM_RIGHT'
	| 'COBBLE_GRASS_RIGHT'
	| 'COBBLE_GRASS_TOP_RIGHT'
	| 'COBBLE_GRASS_TOP'
	| 'GRASS_COBBLE_TOP_RIGHT'
	| 'GRASS_COBBLE_BOTTOM_LEFT'
	| 'STONE'
	| 'BUSH'
	| 'TREE_TOP'
	| 'TREE_COLLIDED'
	| 'TREE_BOTTOM'
	| 'ICE_GRASS_TOP_LEFT'
	| 'ICE_GRASS_LEFT'
	| 'ICE_GRASS_BOTTOM_LEFT'
	| 'ICE_GRASS_BOTTOM'
	| 'ICE_GRASS_BOTTOM_RIGHT'
	| 'ICE_GRASS_RIGHT'
	| 'ICE_GRASS_TOP_RIGHT'
	| 'ICE_GRASS_TOP'
	| 'GRASS_ICE_TOP_LEFT'
	| 'GRASS_ICE_TOP_RIGHT'
	| 'GRASS_ICE_BOTTOM_LEFT'
	| 'GRASS_ICE_BOTTOM_RIGHT'
	| 'ICE'
	| 'WOOD';

class GameMap {
	private tileImage: any;
	private tileSize = 64;

	private map: Record<number, Record<number, GameMapTileType>> = {
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

	private objects: Record<number, Record<number, GameMapTileType>> = {
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

	preload() {
		this.tileImage = loadImage('assets/IceTileset.png');
	}

	setup() {
		background(30);

		// const imageSprite = createSprite(32, 32);
		// imageSprite.addImage(this.tileImage);
	}

	drawBackground() {
		for (let ix = 0; ix < width / this.tileSize; ix++) {
			const x = ix * this.tileSize;

			for (let iy = 0; iy < width / this.tileSize; iy++) {
				const objectType = this.map[ix]?.[iy] ?? 'GRASS';

				const y = iy * this.tileSize;
				const coords = this.getTileCoords(objectType);
				image(this.tileImage, x, y, 64, 64, coords[0], coords[1], 32, 32);
			}
		}
	}

	drawObjects() {
		for (let ix = 0; ix < width / this.tileSize; ix++) {
			const x = ix * this.tileSize;

			for (let iy = 0; iy < width / this.tileSize; iy++) {
				const objectType = this.objects[ix]?.[iy] ?? null;
				const y = iy * this.tileSize;

				// text(`${ix}:${iy}`, x + this.tileSize / 2, y - this.tileSize / 2);
				if (objectType == null) {
					continue;
				}

				const coords = this.getTileCoords(objectType);
				image(this.tileImage, x, y, 64, 64, coords[0], coords[1], 32, 32);
			}
		}
	}

	private getTileCoords(type: GameMapTileType): [number, number] {
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
