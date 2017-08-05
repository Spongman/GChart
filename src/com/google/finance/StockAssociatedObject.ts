namespace com.google.finance
{
	export class StockAssociatedObject
		extends SeriesPosition
	{
		//public refDataSeries: com.google.finance.DataSeries;
		//public pos: number;
		//public dayPos: number;

		active: boolean;

		qname: string;

		time: number;

		exchangeDateInUTC: Date;

		originalObject: any;

		id: number;

		posInInterval: SeriesPosition[] | null;

		constructor(param1: number, param2: number, param3: SeriesPosition[] | null, param4: number, param5: Date, param6: number, param7: string)
		{
			super(null, param1, param2);
			//this.pos = param1;
			//this.dayPos = param2;
			this.posInInterval = param3;
			this.time = param4;
			this.exchangeDateInUTC = param5;
			this.id = param6;
			this.qname = param7;
			this.active = false;
		}

		static compare(param1: StockAssociatedObject, param2: StockAssociatedObject): number
		{
			let _loc3_ = param1.time;
			let _loc4_ = param2.time;
			if (_loc3_ < _loc4_)
				return -1;

			if (_loc3_ > _loc4_)
				return 1;

			if (param1.letter < param2.letter)
				return -1;

			if (param1.letter > param2.letter)
				return 1;

			return 0;
		}

		toString(): string
		{
			return this.id + " " + this.pos;
		}

		getRelativeMinutes(param1: number = -1): number
		{
			if (!this.posInInterval)
				return this.refDataSeries.units[this.pos].relativeMinutes;

			if (!this.posInInterval[param1])
				return NaN;

			let _loc2_ = this.posInInterval[param1].refDataSeries;
			let _loc3_ = this.posInInterval[param1].position;
			return _loc2_.getPointsInIntervalArray(param1)[_loc3_].relativeMinutes;
		}
	}
}
