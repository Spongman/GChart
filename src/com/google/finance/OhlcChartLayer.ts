namespace com.google.finance
{
	export class OhlcChartLayer extends IntervalBasedBarChartLayer
	{
		protected drawBarAtDataUnit(param1: Context, param2: DataUnit[], param3: number) 
		{
			const _loc4_ = param2[param3];
			if (_loc4_.fake)
				return;

			const _loc5_ = !isNaN(_loc4_.weeklyXPos) ? _loc4_.weeklyXPos : this.viewPoint.getXPos(_loc4_);
			const _loc6_ = this.getOhlcYPos(param1, _loc4_);
			const _loc7_ = this.getOhlcColor(_loc4_, param2[Math.max(param3 - 1, 0)]);

			let gr = this.graphics;
			gr.lineStyle(1, _loc7_);

			if (Math.abs(_loc6_.highY - _loc6_.lowY) <= 1)
			{
				const _loc8_ = (_loc6_.highY + _loc6_.lowY) / 2;
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
				gr.moveTo(_loc5_ - this.barWidth / 2, _loc6_.openY);
				gr.lineTo(_loc5_, _loc6_.openY);
				gr.moveTo(_loc5_, _loc6_.closeY);
				gr.lineTo(_loc5_ + this.barWidth / 2, _loc6_.closeY);
				gr.moveTo(_loc5_, _loc6_.highY);
				gr.lineTo(_loc5_, _loc6_.lowY);
			}
		}
	}
}
