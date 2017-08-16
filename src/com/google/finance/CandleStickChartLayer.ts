/// <reference path="IntervalBasedBarChartLayer.ts" />

namespace com.google.finance
{
	export class CandleStickChartLayer extends IntervalBasedBarChartLayer
	{
		protected drawBarAtDataUnit(context: Context, dataUnits: DataUnit[], param3: number)
		{
			const unit = dataUnits[param3];
			if (unit.fake)
				return;

			const xPos = !isNaN(unit.weeklyXPos) ? unit.weeklyXPos : this.viewPoint.getXPos(unit);
			const ohlcYPos = this.getOhlcYPos(context, unit);
			//const _loc7_ = Math.abs(_loc6_.closeY - _loc6_.openY);
			const gr = this.graphics;
			const candleStickColor = this.getCandleStickColor(unit);
			gr.lineStyle(1, candleStickColor);

			let _loc9_ = unit.close >= unit.open;
			if (Math.abs(ohlcYPos.closeY - ohlcYPos.openY) <= 1)
			{
				const top = (ohlcYPos.closeY + ohlcYPos.openY) / 2;
				if (this.barWidth === 0)
				{
					gr.moveTo(xPos, top - 0.5);
					gr.lineTo(xPos, top + 0.5);
				}
				else
				{
					gr.moveTo(xPos - this.barWidth / 2, top);
					gr.lineTo(xPos + this.barWidth / 2, top);
				}
			}
			else
			{
				gr.moveTo(xPos - this.barWidth / 2, !!_loc9_ ? ohlcYPos.closeY : ohlcYPos.openY);
				if (!_loc9_)
					gr.beginFill(candleStickColor);

				gr.lineTo(xPos + this.barWidth / 2, !!_loc9_ ? ohlcYPos.closeY : ohlcYPos.openY);
				gr.lineTo(xPos + this.barWidth / 2, !!_loc9_ ? ohlcYPos.openY : ohlcYPos.closeY);
				gr.lineTo(xPos - this.barWidth / 2, !!_loc9_ ? ohlcYPos.openY : ohlcYPos.closeY);
				gr.lineTo(xPos - this.barWidth / 2, !!_loc9_ ? ohlcYPos.closeY : ohlcYPos.openY);
				if (!_loc9_)
					gr.endFill();
			}
			gr.moveTo(xPos, ohlcYPos.lowY);
			gr.lineTo(xPos, !!_loc9_ ? ohlcYPos.openY : ohlcYPos.closeY);
			gr.moveTo(xPos, !!_loc9_ ? ohlcYPos.closeY : ohlcYPos.openY);
			gr.lineTo(xPos, ohlcYPos.highY);
		}
	}
}
