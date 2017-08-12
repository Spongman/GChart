/// <reference path="IntervalBasedChartLayer.ts" />

namespace com.google.finance
{
	export abstract class IntervalBasedBarChartLayer extends IntervalBasedChartLayer
	{
		protected barWidth: number;

		protected abstract drawBarAtDataUnit(context: Context, param2: DataUnit[], param3: number):void;

		renderLayer(context: Context) 
		{
			if (!this.isEnabled())
				return;

			this.graphics.clear();
			let vp = this.viewPoint;
			const dataSeries = notnull(this.getDataSeries());
			const points = this.getPointsForCurrentDetailLevel();
			if (!points || points.length === 0)
				return;

			if (context.maxPriceRange === undefined || context.medPrice === undefined)
				return;

			this.localYOffset = vp.miny + vp.medPriceY + vp.V_OFFSET;
			this.localYScale = vp.maxPriceRangeViewSize / context.maxPriceRange;
			const firstMinuteIndex = Math.max(dataSeries.getRelativeMinuteIndex(vp.getFirstMinute(), points) - 1, 0);
			const lastMinuteIndex = Math.min(dataSeries.getRelativeMinuteIndex(vp.getLastMinute(), points) + 1, this.getLastRealPointIndex(points));
			const detailLevel = vp.getDetailLevelForTechnicalStyle();
			this.barWidth = this.getBarWidth(detailLevel, dataSeries);
			let _loc7_ = Number.MAX_VALUE;
			for (let _loc8_ = lastMinuteIndex; _loc8_ >= firstMinuteIndex; _loc8_--)
			{
				if (!dataSeries.minuteIsStartOfDataSession(points[_loc8_].dayMinute))
				{
					if (!(isNaN(points[_loc8_].high) || isNaN(points[_loc8_].low) || isNaN(points[_loc8_].open)))
					{
						if (detailLevel === Intervals.WEEKLY)
							_loc7_ = this.getWeeklyBarXPos(points[_loc8_], _loc7_);

						this.drawBarAtDataUnit(context, points, _loc8_);
					}
				}
			}
		}
	}
}
