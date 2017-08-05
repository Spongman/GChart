/// <reference path="IntervalBasedChartLayer.ts" />

namespace com.google.finance
{
	export abstract class IntervalBasedBarChartLayer extends IntervalBasedChartLayer
	{
		protected barWidth: number;

		constructor(param1: ViewPoint, param2: DataSource)
		{
			super(param1, param2);
		}

		protected abstract drawBarAtDataUnit(context: Context, param2: DataUnit[], param3: number):void;

		renderLayer(context: Context) 
		{
			if (!this.isEnabled())
				return;

			this.graphics.clear();
			let vp = this.viewPoint;
			let _loc2_ = notnull(this.getDataSeries());
			let _loc3_ = this.getPointsForCurrentDetailLevel();
			if (!_loc3_ || _loc3_.length === 0)
				return;

			if (context.maxPriceRange === undefined || context.medPrice === undefined)
				return;

			this.localYOffset = vp.miny + vp.medPriceY + vp.V_OFFSET;
			this.localYScale = vp.maxPriceRangeViewSize / context.maxPriceRange;
			let _loc4_ = Math.max(_loc2_.getRelativeMinuteIndex(vp.getFirstMinute(), _loc3_) - 1, 0);
			let _loc5_ = Math.min(_loc2_.getRelativeMinuteIndex(vp.getLastMinute(), _loc3_) + 1, this.getLastRealPointIndex(_loc3_));
			let _loc6_ = vp.getDetailLevelForTechnicalStyle();
			this.barWidth = this.getBarWidth(_loc6_, _loc2_);
			let _loc7_ = Number.MAX_VALUE;
			for (let _loc8_ = _loc5_; _loc8_ >= _loc4_; _loc8_--)
			{
				if (!_loc2_.minuteIsStartOfDataSession(_loc3_[_loc8_].dayMinute))
				{
					if (!(isNaN(_loc3_[_loc8_].high) || isNaN(_loc3_[_loc8_].low) || isNaN(_loc3_[_loc8_].open)))
					{
						if (_loc6_ === Const.WEEKLY)
							_loc7_ = this.getWeeklyBarXPos(_loc3_[_loc8_], _loc7_);

						this.drawBarAtDataUnit(context, _loc3_, _loc8_);
					}
				}
			}
		}
	}
}
