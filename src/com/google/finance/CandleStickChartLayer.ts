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
			let _loc4_ = param2[param3];
			let _loc5_ = !isNaN(_loc4_.weeklyXPos) ? _loc4_.weeklyXPos : this.viewPoint.getXPos(_loc4_);
			let _loc6_ = this.getOhlcYPos(context, _loc4_);
			let _loc7_ = Math.abs(_loc6_.closeY - _loc6_.openY);
			let _loc8_ = this.getCandleStickColor(_loc4_);
			this.graphics.lineStyle(1, _loc8_);
			if (!_loc4_.fake)
			{
				_loc9_ = _loc4_.close >= _loc4_.open;
				if (Math.abs(_loc6_.closeY - _loc6_.openY) <= 1)
				{
					let _loc10_ = (_loc6_.closeY + _loc6_.openY) / 2;
					if (this.barWidth === 0)
					{
						this.graphics.moveTo(_loc5_, _loc10_ - 0.5);
						this.graphics.lineTo(_loc5_, _loc10_ + 0.5);
					}
					else
					{
						this.graphics.moveTo(_loc5_ - this.barWidth / 2, _loc10_);
						this.graphics.lineTo(_loc5_ + this.barWidth / 2, _loc10_);
					}
				}
				else
				{
					this.graphics.moveTo(_loc5_ - this.barWidth / 2, !!_loc9_ ? _loc6_.closeY : _loc6_.openY);
					if (!_loc9_)
						this.graphics.beginFill(_loc8_);

					this.graphics.lineTo(_loc5_ + this.barWidth / 2, !!_loc9_ ? _loc6_.closeY : _loc6_.openY);
					this.graphics.lineTo(_loc5_ + this.barWidth / 2, !!_loc9_ ? _loc6_.openY : _loc6_.closeY);
					this.graphics.lineTo(_loc5_ - this.barWidth / 2, !!_loc9_ ? _loc6_.openY : _loc6_.closeY);
					this.graphics.lineTo(_loc5_ - this.barWidth / 2, !!_loc9_ ? _loc6_.closeY : _loc6_.openY);
					if (!_loc9_)
						this.graphics.endFill();
				}
				this.graphics.moveTo(_loc5_, _loc6_.lowY);
				this.graphics.lineTo(_loc5_, !!_loc9_ ? _loc6_.openY : _loc6_.closeY);
				this.graphics.moveTo(_loc5_, !!_loc9_ ? _loc6_.closeY : _loc6_.openY);
				this.graphics.lineTo(_loc5_, _loc6_.highY);
			}
		}
	}
}
