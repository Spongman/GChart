/// <reference path="IntervalBasedVolumeLayer.ts" />

namespace com.google.finance
{
	export class IntervalBasedAHVolumeLayer extends IntervalBasedVolumeLayer
	{
		private regionsXLimits: com.google.finance.IntervalSet;

		highlightPoint(context: Context, param2: number, state: Dictionary)
		{
			this.clearHighlight();
			if (!this.regionsXLimits || !this.regionsXLimits.containsValue(param2))
				return;

			if (state["volumesetter"])
				state["volumesetter"].clearHighlight();

			const dataSeries = this.getDataSeries();
			const viewPoint = this.viewPoint;
			const pointIndex = this.findPointIndex(param2);
			const detailLevel = viewPoint.getDetailLevelForTechnicalStyle();
			const detailLevelInterval = Const.getDetailLevelInterval(detailLevel);
			const points = dataSeries.getPointsInIntervalArray(detailLevelInterval);
			if (!points || pointIndex === -1)
				return;

			const _loc10_ = points[pointIndex];
			const xPos = viewPoint.getXPos(_loc10_);
			const yPos = this.getYPos(_loc10_.volumes[detailLevelInterval], viewPoint);
			this.highlightCanvas.graphics.lineStyle(2, Const.VOLUME_HIGHLIGHT_COLOR, 1);
			this.drawOneLine(xPos, yPos, viewPoint, this.highlightCanvas);
			state[SpaceText.VOLUME_STR] = _loc10_.volumes[detailLevelInterval];
			state["ahsetter"] = this;
		}

		renderLayer(context: Context)
		{
			this.graphics.clear();
			const vp = this.viewPoint;
			if (vp.getDetailLevelForTechnicalStyle() !== Intervals.INTRADAY)
				return;

			const points = this.getDataSeries().getPointsInIntervalArray(Const.INTRADAY_INTERVAL);
			if (!points)
				return;

			const visibleExtendedHours = this.dataSource.visibleExtendedHours;
			if (visibleExtendedHours.length() === 0)
				return;

			this.regionsXLimits = new com.google.finance.IntervalSet();

			for (let intervalIndex = 0; intervalIndex < visibleExtendedHours.length(); intervalIndex++)
			{
				const interval = visibleExtendedHours.getIntervalAt(intervalIndex);
				const _loc6_ = points[interval.start];
				const _loc7_ = points[interval.end];
				if (ViewPoint.sessionVisible(_loc6_, _loc7_, context))
				{
					const xPos1 = vp.getXPos(_loc6_);
					const xPos2 = vp.getXPos(_loc7_);
					this.regionsXLimits.addInterval(xPos1, xPos2);
				}
			}
			super.renderLayer(context);
		}

		getDataSeries(context?: Context): DataSeries
		{
			return this.dataSource.afterHoursData;
		}
	}
}
