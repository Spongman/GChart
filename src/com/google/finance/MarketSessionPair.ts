/// <reference path="StartEndPair.ts" />

namespace com.google.finance
{
	export class MarketSessionPair extends StartEndPair
	{
		name: string;

		constructor(param1: number, param2: number, param3: string)
		{
			super(param1, param2);
			this.name = param3;
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
