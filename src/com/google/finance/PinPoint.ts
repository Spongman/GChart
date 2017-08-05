/// <reference path="StockAssociatedObject.ts" />

namespace com.google.finance
{
	export class PinPoint extends StockAssociatedObject
	{
		forceExpandInGroup = false;

		letter: string;

		constructor(param1: number, param2: number, param3: SeriesPosition[] | null, param4: number, param5: Date, param6: number, param7: string, param8: string)
		{
			super(param1, param2, param3, param4, param5, param6, param7);
			this.letter = param8;
		}
	}
}
