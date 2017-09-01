/// <reference path="IntervalBasedVolumeLayer.ts" />

namespace com.google.finance
{
	export class IntervalBasedAHVolumeLayer extends IntervalBasedVolumeLayer
	{
		private regionsXLimits: IntervalSet;

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

			const unit = points[pointIndex];
			const x = viewPoint.getXPos(unit);
			const y = this.getYPos(unit.volumes[detailLevelInterval], viewPoint);
			this.highlightCanvas.graphics.lineStyle(2, Const.VOLUME_HIGHLIGHT_COLOR, 1);
			this.drawOneLine(x, y, viewPoint, this.highlightCanvas);
			state[SpaceText.VOLUME_STR] = unit.volumes[detailLevelInterval];
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

			this.regionsXLimits = new IntervalSet();

			for (let intervalIndex = 0; intervalIndex < visibleExtendedHours.length(); intervalIndex++)
			{
				const interval = visibleExtendedHours.getIntervalAt(intervalIndex);
				const startUnit = points[interval.start];
				const endUnit = points[interval.end];
				if (ViewPoint.sessionVisible(startUnit, endUnit, context))
				{
					const xPos1 = vp.getXPos(startUnit);
					const xPos2 = vp.getXPos(endUnit);
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
