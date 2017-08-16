namespace com.google.finance
{
	export class OhlcChartLayer extends IntervalBasedBarChartLayer
	{
		protected drawBarAtDataUnit(context: Context, dataUnits: DataUnit[], param3: number) 
		{
			const _loc4_ = dataUnits[param3];
			if (_loc4_.fake)
				return;

			const _loc5_ = !isNaN(_loc4_.weeklyXPos) ? _loc4_.weeklyXPos : this.viewPoint.getXPos(_loc4_);
			const ohlcYPos = this.getOhlcYPos(context, _loc4_);
			const ohlcColor = this.getOhlcColor(_loc4_, dataUnits[Math.max(param3 - 1, 0)]);

			let gr = this.graphics;
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
