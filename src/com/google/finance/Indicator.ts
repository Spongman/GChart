namespace com.google.finance
{
	export class Indicator
	{
		private hash: { [key: string]: DataSeries[] } = {};

		intervals: number[] = [];
		clearAllOnAddData = false;

		getDataSeriesArray(param1: number): DataSeries[]
		{
			return this.hash["series" + param1];
		}

		setDataSeries(param1: number, dataSeries: DataSeries, param3 = 0) 
		{
			if (!this.hasInterval(param1))
			{
				this.intervals.push(param1);
				this.intervals.sort();
			}
			if (this.hash["series" + param1] === undefined)
				this.hash["series" + param1] = [];

			this.hash["series" + param1][param3] = dataSeries;
			dataSeries.interval = param1;
		}

		getAllDataSeriesArray()
		{
			const dataSeriesArray: DataSeries[] = [];
			for (let intervalIndex = 0; intervalIndex < this.intervals.length; intervalIndex++)
			{
				let ds = this.getDataSeries(this.intervals[intervalIndex]);
				if (ds)
					dataSeriesArray.push(ds);
			}
			return dataSeriesArray;
		}

		clear(param1:number = 0) 
		{
			if (param1 === 0)
			{
				for (let intervalIndex = 0; intervalIndex < this.intervals.length; intervalIndex++)
					delete this.hash["series" + this.intervals[intervalIndex]];

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
