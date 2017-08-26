namespace com.google.finance
{
	export class StockDividend extends StockAssociatedObject
	{
		constructor(pos: number, dayPos: number, posInInterval: SeriesPosition[] | null, time: number, exchangeDateInUTC: Date, id: number, qname: string, public ticker: string, public  adjustmentFactor: number)
		{
			super(pos, dayPos, posInInterval, time, exchangeDateInUTC, id, qname);
		}
	}
}
