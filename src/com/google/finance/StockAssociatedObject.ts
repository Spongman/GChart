namespace com.google.finance
{
	export class StockAssociatedObject
		extends SeriesPosition
	{
		//public refDataSeries: com.google.finance.DataSeries;
		//public pos: number;
		//public dayPos: number;

		active = false;
		originalObject: any;

		constructor(pos: number, dayPos: number, public posInInterval: SeriesPosition[] | null, public time: number, public exchangeDateInUTC: Date, public id: number, public qname: string)
		{
			super(null, pos, dayPos);
		}

		static compare(param1: StockAssociatedObject, param2: StockAssociatedObject): number
		{
			const time1 = param1.time;
			const time2 = param2.time;
			if (time1 < time2)
				return -1;

			if (time1 > time2)
				return 1;

			if (param1 instanceof PinPoint && param2 instanceof PinPoint)
			{
				// TODO: PinPoint only?
				if (param1.letter < param2.letter)
					return -1;

				if (param1.letter > param2.letter)
					return 1;
			}
			return 0;
		}

		toString(): string
		{
			return this.id + " " + this.pos;
		}

		getRelativeMinutes(param1: number = -1): number
		{
			if (!this.posInInterval)
				return notnull(this.refDataSeries).units[this.pos].relativeMinutes;

			if (!this.posInInterval[param1])
				return NaN;

			const refDataSeries = this.posInInterval[param1].refDataSeries;
			const position = this.posInInterval[param1].position;
			return notnull(refDataSeries).getPointsInIntervalArray(param1)[position].relativeMinutes;
		}
	}
}
