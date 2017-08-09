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
			return "[" + this.start + ", " + this.end + ", " + this.name + "]";
		}

		equals(param1: StartEndPair): boolean
		{
			if (!(param1 instanceof MarketSessionPair))
				return false;

			if (this.name !== param1.name)
				return false;

			return super.equals(param1);
		}
	}
}
