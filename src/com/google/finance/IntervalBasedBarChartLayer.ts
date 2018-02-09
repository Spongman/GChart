import { Intervals } from "./Const";
import { DataUnit } from "./DataUnit";
import { IntervalBasedChartLayer } from "./IntervalBasedChartLayer";
import { Context } from "./ViewPoint";

export abstract class IntervalBasedBarChartLayer extends IntervalBasedChartLayer {
		protected barWidth: number;

		protected abstract drawBarAtDataUnit(context: Context, dataUnits: DataUnit[], param3: number): void;

		renderLayer(context: Context) {
			if (!this.isEnabled()) {
				return;
			}

			this.graphics.clear();
			const vp = this.viewPoint;
			const dataSeries = notnull(this.getDataSeries());
			const points = this.getPointsForCurrentDetailLevel();
			if (!points || points.length === 0) {
				return;
			}

			if (context.maxPriceRange === undefined || context.medPrice === undefined) {
				return;
			}

			this.localYOffset = vp.miny + vp.medPriceY + vp.V_OFFSET;
			this.localYScale = vp.maxPriceRangeViewSize / context.maxPriceRange;
			const firstMinuteIndex = Math.max(dataSeries.getRelativeMinuteIndex(vp.getFirstMinute(), points) - 1, 0);
			const lastMinuteIndex = Math.min(dataSeries.getRelativeMinuteIndex(vp.getLastMinute(), points) + 1, this.getLastRealPointIndex(points));
			const detailLevel = vp.getDetailLevelForTechnicalStyle();
			this.barWidth = this.getBarWidth(detailLevel, dataSeries);
			let _loc7_ = Number.MAX_VALUE;
			for (let minuteIndex = lastMinuteIndex; minuteIndex >= firstMinuteIndex; minuteIndex--) {
				if (!dataSeries.minuteIsStartOfDataSession(points[minuteIndex].dayMinute)) {
					if (!(isNaN(points[minuteIndex].high) || isNaN(points[minuteIndex].low) || isNaN(points[minuteIndex].open))) {
						if (detailLevel === Intervals.WEEKLY) {
							_loc7_ = this.getWeeklyBarXPos(points[minuteIndex], _loc7_);
						}

						this.drawBarAtDataUnit(context, points, minuteIndex);
					}
				}
			}
		}
	}
