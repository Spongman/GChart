import { StockAssociatedObject } from "StockAssociatedObject";
import { SeriesPosition } from './DataSource';

export class Split extends StockAssociatedObject {
		constructor(pos: number, dayPos: number, posInInterval: SeriesPosition[] | null, time: number, exchangeDateInUTC: Date, id: number, qname: string, public oldShares: number, public newShares: number) {
			super(pos, dayPos, posInInterval, time, exchangeDateInUTC, id, qname);
		}
	}
