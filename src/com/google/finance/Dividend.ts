/// <reference path="StockAssociatedObject.ts" />

namespace com.google.finance
{
	export class Dividend extends StockAssociatedObject
	{
		currency: string;

		amount: number;

		yield: number;

		constructor(param1: number, param2: number, param3: SeriesPosition[] | null, param4: number, param5: Date, param6: number, param7: string, param8: number, param9: string, param10: number)
		{
			super(param1, param2, param3, param4, param5, param6, param7);
			this.amount = param8;
			this.currency = param9;
			this.yield = param8 / param10;
		}
	}
}
