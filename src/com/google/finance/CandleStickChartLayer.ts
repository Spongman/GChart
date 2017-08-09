/// <reference path="IntervalBasedBarChartLayer.ts" />

namespace com.google.finance
{
	export class CandleStickChartLayer extends IntervalBasedBarChartLayer
	{
		constructor(param1: ViewPoint, param2: DataSource)
		{
			super(param1, param2);
		}

		protected drawBarAtDataUnit(context: Context, param2: DataUnit[], param3: number) 
		{
			let _loc9_ = false;
			const _loc4_ = param2[param3];
			const _loc5_ = !isNaN(_loc4_.weeklyXPos) ? _loc4_.weeklyXPos : this.viewPoint.getXPos(_loc4_);
			const _loc6_ = this.getOhlcYPos(context, _loc4_);
			//const _loc7_ = Math.abs(_loc6_.closeY - _loc6_.openY);
			const _loc8_ = this.getCandleStickColor(_loc4_);
			const gr = this.graphics;
			gr.lineStyle(1, _loc8_);
			if (!_loc4_.fake)
			{
				_loc9_ = _loc4_.close >= _loc4_.open;
				if (Math.abs(_loc6_.closeY - _loc6_.openY) <= 1)
				{
					const _loc10_ = (_loc6_.closeY + _loc6_.openY) / 2;
					if (this.barWidth === 0)
					{
						gr.moveTo(_loc5_, _loc10_ - 0.5);
						gr.lineTo(_loc5_, _loc10_ + 0.5);
					}
					else
					{
						gr.moveTo(_loc5_ - this.barWidth / 2, _loc10_);
						gr.lineTo(_loc5_ + this.barWidth / 2, _loc10_);
					}
				}
				else
				{
					gr.moveTo(_loc5_ - this.barWidth / 2, !!_loc9_ ? _loc6_.closeY : _loc6_.openY);
					if (!_loc9_)
						gr.beginFill(_loc8_);

					gr.lineTo(_loc5_ + this.barWidth / 2, !!_loc9_ ? _loc6_.closeY : _loc6_.openY);
					gr.lineTo(_loc5_ + this.barWidth / 2, !!_loc9_ ? _loc6_.openY : _loc6_.closeY);
					gr.lineTo(_loc5_ - this.barWidth / 2, !!_loc9_ ? _loc6_.openY : _loc6_.closeY);
					gr.lineTo(_loc5_ - this.barWidth / 2, !!_loc9_ ? _loc6_.closeY : _loc6_.openY);
					if (!_loc9_)
						gr.endFill();
				}
				gr.moveTo(_loc5_, _loc6_.lowY);
				gr.lineTo(_loc5_, !!_loc9_ ? _loc6_.openY : _loc6_.closeY);
				gr.moveTo(_loc5_, !!_loc9_ ? _loc6_.closeY : _loc6_.openY);
				gr.lineTo(_loc5_, _loc6_.highY);
			}
		}
	}
}
