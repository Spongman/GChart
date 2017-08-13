/// <reference path="StockAssociatedObject.ts" />

namespace com.google.finance
{
	export class PinPoint extends StockAssociatedObject
	{
		forceExpandInGroup = false;

		constructor(pos: number, dayPos: number, posInInterval: SeriesPosition[] | null, time: number, exchangeDateInUTC: Date, id: number, qname: string, public letter: string)
		{
			super(pos,  dayPos , posInInterval, time, exchangeDateInUTC, id, qname);
		}
	}
}
