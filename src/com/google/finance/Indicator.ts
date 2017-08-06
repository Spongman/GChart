namespace com.google.finance
{
	export class Indicator
	{
		intervals: number[];

		private hash: { [key: string]: DataSeries[] };

		clearAllOnAddData = false;

		constructor()
		{
			this.intervals = [];
			this.hash = {};
		}

		getDataSeriesArray(param1: number): DataSeries[]
		{
			return this.hash["series" + param1];
		}

		setDataSeries(param1: number, param2: DataSeries, param3 = 0) 
		{
			if (!this.hasInterval(param1))
			{
				this.intervals.push(param1);
				this.intervals.sort();
			}
			if (this.hash["series" + param1] === undefined)
				this.hash["series" + param1] = [];

			this.hash["series" + param1][param3] = param2;
			param2.interval = param1;
		}

		getAllDataSeriesArray()
		{
			let _loc1_: DataSeries[] = [];
			for (let _loc2_ = 0; _loc2_ < this.intervals.length; _loc2_++)
			{
				let ds = this.getDataSeries(this.intervals[_loc2_]);
				if (ds)
					_loc1_.push(ds);
			}
			return _loc1_;
		}

		clear(param1:number = 0) 
		{
			let _loc2_ = 0;
			let _loc3_ = 0;
			if (param1 === 0)
			{
				_loc2_ = 0;
				while (_loc2_ < this.intervals.length)
				{
					delete this.hash["series" + this.intervals[_loc2_]];
					_loc2_++;
				}
				this.intervals = [];
			}
			else
			{
				delete this.hash["series" + param1];
				_loc3_ = this.intervals.indexOf(param1);
				if (_loc3_ !== -1)
					this.intervals.splice(_loc3_, 1);
			}
		}

		getDataSeries(param1: number, param2 = 0): DataSeries | null
		{
			if (!this.hash["series" + param1])
				return null;

			return this.hash["series" + param1][param2];
		}

		hasInterval(param1: number): boolean
		{
			let _loc2_ = this.intervals.length;
			while (_loc2_ >= 0 && this.intervals[_loc2_] !== param1)
				_loc2_--;

			return _loc2_ !== -1;
		}
	}
}
