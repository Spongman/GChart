namespace com.google.finance
{
	export class Indicator
	{
		private hash: Map<DataSeries[]> = {};

		intervals: number[] = [];
		clearAllOnAddData = false;

		getDataSeriesArray(param1: number): DataSeries[]
		{
			return this.hash["series" + param1];
		}

		setDataSeries(interval: number, dataSeries: DataSeries, param3 = 0)
		{
			if (!this.hasInterval(interval))
			{
				this.intervals.push(interval);
				this.intervals.sort();
			}
			if (this.hash["series" + interval] === undefined)
				this.hash["series" + interval] = [];

			this.hash["series" + interval][param3] = dataSeries;
			dataSeries.interval = interval;
		}

		getAllDataSeriesArray()
		{
			const dataSeriesArray: DataSeries[] = [];
			for (const interval of this.intervals)
			{
				const ds = this.getDataSeries(interval);
				if (ds)
					dataSeriesArray.push(ds);
			}
			return dataSeriesArray;
		}

		clear(param1: number = 0)
		{
			if (param1 === 0)
			{
				for (const interval of this.intervals)
					delete this.hash["series" + interval];

				this.intervals = [];
			}
			else
			{
				delete this.hash["series" + param1];
				const _loc3_ = this.intervals.indexOf(param1);
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
			let index = this.intervals.length;
			while (index >= 0 && this.intervals[index] !== param1)
				index--;

			return index !== -1;
		}
	}
}
