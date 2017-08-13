namespace com.google.finance
{
	export class Bounds
	{
		constructor(public minx: number, public miny: number, public maxx: number, public maxy: number) { }

		toString(): string
		{
			return "[" + this.minx + "," + this.miny + "][" + this.maxx + "," + this.maxy + "]";
		}

		containsPoint(param1: number, param2: number): boolean
		{
			return param1 > this.minx && param1 < this.maxx && param2 > this.miny && param2 < this.maxy;
		}

		append(bounds: Bounds) 
		{
			this.minx = Math.min(this.minx, bounds.minx);
			this.miny = Math.min(this.miny, bounds.miny);
			this.maxx = Math.max(this.maxx, bounds.maxx);
			this.maxy = Math.max(this.maxy, bounds.maxy);
		}

		equals(param1: any): boolean
		{
			const _loc2_ = param1 as Bounds;
			if (_loc2_)
				return _loc2_.minx === this.minx && _loc2_.miny === this.miny && _loc2_.maxx === this.maxx && _loc2_.maxy === this.maxy;

			return false;
		}
	}
}
