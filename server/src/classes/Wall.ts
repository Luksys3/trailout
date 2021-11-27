export class Wall {
	id: string;
	position: { x: number; y: number };
	ownerId: string;

	constructor({
		id,
		position,
		ownerId
	}: {
		id: string;
		ownerId: string;
		position: { x: number; y: number };
	}) {
		this.id = id;
		this.position = position;
		this.ownerId = ownerId;
	}
}
