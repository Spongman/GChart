/// <reference path="StockAssociatedObject.ts" />

namespace com.google.finance
{
	export class Split extends StockAssociatedObject
	{
		oldShares: number;

		newShares: number;

		constructor(param1: number, param2: number, param3: SeriesPosition[] | null, param4: number, param5: Date, param6: number, param7: string, param8: number, param9: number)
		{
			super(param1, param2, param3, param4, param5, param6, param7);
			this.oldShares = param8;
			this.newShares = param9;
		}
	}
}
