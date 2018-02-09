import { DataUnit } from "./DataUnit";
import { IntervalBasedBarChartLayer } from "./IntervalBasedBarChartLayer";
import { Context } from "./ViewPoint";

export class CandleStickChartLayer extends IntervalBasedBarChartLayer {
		protected drawBarAtDataUnit(context: Context, dataUnits: DataUnit[], unitIndex: number) {
			const unit = dataUnits[unitIndex];
			if (unit.fake) {
				return;
			}

			const x = !isNaN(unit.weeklyXPos) ? unit.weeklyXPos : this.viewPoint.getXPos(unit);
			const ohlcYPos = this.getOhlcYPos(context, unit);
			// const _loc7_ = Math.abs(_loc6_.closeY - _loc6_.openY);
			const gr = this.graphics;
			const candleStickColor = this.getCandleStickColor(unit);
			gr.lineStyle(1, candleStickColor);

			const _loc9_ = unit.close >= unit.open;
			if (Math.abs(ohlcYPos.closeY - ohlcYPos.openY) <= 1) {
				const top = (ohlcYPos.closeY + ohlcYPos.openY) / 2;
				if (this.barWidth === 0) {
					gr.moveTo(x, top - 0.5);
					gr.lineTo(x, top + 0.5);
				} else {
					gr.moveTo(x - this.barWidth / 2, top);
					gr.lineTo(x + this.barWidth / 2, top);
				}
			} else {
				gr.moveTo(x - this.barWidth / 2, _loc9_ ? ohlcYPos.closeY : ohlcYPos.openY);
				if (!_loc9_) {
					gr.beginFill(candleStickColor);
				}

				gr.lineTo(x + this.barWidth / 2, _loc9_ ? ohlcYPos.closeY : ohlcYPos.openY);
				gr.lineTo(x + this.barWidth / 2, _loc9_ ? ohlcYPos.openY : ohlcYPos.closeY);
				gr.lineTo(x - this.barWidth / 2, _loc9_ ? ohlcYPos.openY : ohlcYPos.closeY);
				gr.lineTo(x - this.barWidth / 2, _loc9_ ? ohlcYPos.closeY : ohlcYPos.openY);
				if (!_loc9_) {
					gr.endFill();
				}
			}
			gr.moveTo(x, ohlcYPos.lowY);
			gr.lineTo(x, _loc9_ ? ohlcYPos.openY : ohlcYPos.closeY);
			gr.moveTo(x, _loc9_ ? ohlcYPos.closeY : ohlcYPos.openY);
			gr.lineTo(x, ohlcYPos.highY);
		}
	}
