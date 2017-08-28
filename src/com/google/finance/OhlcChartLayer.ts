namespace com.google.finance
{
	export class OhlcChartLayer extends IntervalBasedBarChartLayer
	{
		protected drawBarAtDataUnit(context: Context, dataUnits: DataUnit[], param3: number)
		{
			const unit = dataUnits[param3];
			if (unit.fake)
				return;

			const _loc5_ = !isNaN(unit.weeklyXPos) ? unit.weeklyXPos : this.viewPoint.getXPos(unit);
			const ohlcYPos = this.getOhlcYPos(context, unit);
			const ohlcColor = this.getOhlcColor(unit, dataUnits[Math.max(param3 - 1, 0)]);

			const gr = this.graphics;
			gr.lineStyle(1, ohlcColor);

			if (Math.abs(ohlcYPos.highY - ohlcYPos.lowY) <= 1)
			{
				const _loc8_ = (ohlcYPos.highY + ohlcYPos.lowY) / 2;
				if (this.barWidth === 0)
				{
					gr.moveTo(_loc5_, _loc8_ - 0.5);
					gr.lineTo(_loc5_, _loc8_ + 0.5);
				}
				else
				{
					gr.moveTo(_loc5_ - this.barWidth / 2, _loc8_);
					gr.lineTo(_loc5_ + this.barWidth / 2, _loc8_);
				}
			}
			else
			{
				gr.moveTo(_loc5_ - this.barWidth / 2, ohlcYPos.openY);
				gr.lineTo(_loc5_, ohlcYPos.openY);
				gr.moveTo(_loc5_, ohlcYPos.closeY);
				gr.lineTo(_loc5_ + this.barWidth / 2, ohlcYPos.closeY);
				gr.moveTo(_loc5_, ohlcYPos.highY);
				gr.lineTo(_loc5_, ohlcYPos.lowY);
			}
		}
	}
}
