/// <reference path="StartEndPair.ts" />

namespace com.google.finance
{
	export class MarketSessionPair extends StartEndPair
	{
		constructor(start: number, end: number, public name: string)
		{
			super(start, end);
		}

		toString(): string
		{
			return '[' + this.start + ", " + this.end + ", " + this.name + ']';
		}

		equals(pair: StartEndPair): boolean
		{
			if (!(pair instanceof MarketSessionPair))
				return false;

			if (this.name !== pair.name)
				return false;

			return super.equals(pair);
		}
	}
}
