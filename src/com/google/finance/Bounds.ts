
export class Bounds {
	constructor(public minx: number, public miny: number, public maxx: number, public maxy: number) { }

	toString(): string {
		return "[" + this.minx + "," + this.miny + "][" + this.maxx + "," + this.maxy + "]";
	}

	containsPoint(x: number, y: number): boolean {
		return x > this.minx && x < this.maxx && y > this.miny && y < this.maxy;
	}

	append(bounds: Bounds) {
		this.minx = Math.min(this.minx, bounds.minx);
		this.miny = Math.min(this.miny, bounds.miny);
		this.maxx = Math.max(this.maxx, bounds.maxx);
		this.maxy = Math.max(this.maxy, bounds.maxy);
	}

	equals(otherBounds: any): boolean {
		const bounds = otherBounds as Bounds;
		if (bounds) {
			return bounds.minx === this.minx && bounds.miny === this.miny && bounds.maxx === this.maxx && bounds.maxy === this.maxy;
		}

		return false;
	}
}
