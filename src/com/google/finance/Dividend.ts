import { SeriesPosition } from "./DataSource";
import { StockAssociatedObject } from "./StockAssociatedObject";

export class Dividend extends StockAssociatedObject {
		yield: number;

		constructor(pos: number, dayPos: number, posInInterval: SeriesPosition[] | null, time: number, exchangeDateInUTC: Date, id: number, qname: string, public amount: number, public currency: string, param10: number) {
			super(pos, dayPos, posInInterval, time, exchangeDateInUTC, id, qname);
			this.yield = amount / param10;
		}
	}
