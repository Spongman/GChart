import { DataSeries } from './DataSeries';

export class SeriesPosition {
	position: number;
	constructor(public refDataSeries: DataSeries | null, public pos: number, public dayPos: number | null = null) {
	}
}