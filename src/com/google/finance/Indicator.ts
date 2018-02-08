import { Map } from '../../../Global';
import { DataSeries } from './DataSeries';
import { Intervals } from './Const';

	export class Indicator {
		private hash: Map<DataSeries[]> = {};

		intervals: number[] = [];
		clearAllOnAddData = false;

		getDataSeriesArray(interval: number): DataSeries[] {
			return this.hash["series" + interval];
		}

		setDataSeries(interval: number, dataSeries: DataSeries, param3 = 0) {
			if (!this.hasInterval(interval)) {
				this.intervals.push(interval);
				this.intervals.sort();
			}
			if (this.hash["series" + interval] === undefined) {
				this.hash["series" + interval] = [];
			}

			this.hash["series" + interval][param3] = dataSeries;
			dataSeries.interval = interval;
		}

		getAllDataSeriesArray() {
			const dataSeriesArray: DataSeries[] = [];
			for (const interval of this.intervals) {
				const ds = this.getDataSeries(interval);
				if (ds) {
					dataSeriesArray.push(ds);
				}
			}
			return dataSeriesArray;
		}

		clear(interval: number = 0) {
			if (interval === 0) {
				for (const interval2 of this.intervals) {
					delete this.hash["series" + interval2];
				}

				this.intervals = [];
			} else {
				delete this.hash["series" + interval];
				const index = this.intervals.indexOf(interval);
				if (index !== -1) {
					this.intervals.splice(index, 1);
				}
			}
		}

		getDataSeries(interval: number, detailLevel = Intervals.INTRADAY): DataSeries | null {
			if (!this.hash["series" + interval]) {
				return null;
			}

			return this.hash["series" + interval][detailLevel];
		}

		hasInterval(interval: number): boolean {
			let index = this.intervals.length;
			while (index >= 0 && this.intervals[index] !== interval) {
				index--;
			}

			return index !== -1;
		}
	}
