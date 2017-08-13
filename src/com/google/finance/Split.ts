/// <reference path="StockAssociatedObject.ts" />

namespace com.google.finance
{
	export class Split extends StockAssociatedObject
	{
		constructor(pos: number, dayPos: number, posInInterval: SeriesPosition[] | null, time: number, exchangeDateInUTC: Date, id: number, qname: string, public oldShares: number, public newShares: number)
		{
			super(pos, dayPos, posInInterval, time, exchangeDateInUTC, id, qname);
		}
	}
}
