/// <reference path="VolumeLinesChartLayer.ts" />

namespace com.google.finance
{
	// import flash.display.Sprite;

	export class AHVolumeLayer extends VolumeLinesChartLayer
	{
		protected regionsXLimits: com.google.finance.IntervalSet;
		protected readonly maxVolumeCache: Map<number> = {};

		private drawAfterHoursSession(layer: AHVolumeLayer, dataSeries: DataSeries, startTime: number, endTime: number, context: Context, interval: number)
		{
			const timeIndex2 = DataSource.getTimeIndex(endTime, dataSeries.units);
			const timeIndex1 = DataSource.getTimeIndex(startTime, dataSeries.units);
			const viewPoint = this.viewPoint;
			const points = <indicator.VolumeIndicatorPoint[]>dataSeries.points;
			const right = viewPoint.getXPos(points[timeIndex2].point);
			let left = right;
			const intervalLength = viewPoint.getIntervalLength(interval / 60);
			const gr = layer.graphics;
			for (let timeIndex = timeIndex2; timeIndex > timeIndex1; timeIndex--)
			{
				let _loc15_ = viewPoint.maxy - points[timeIndex].volume * this.verticalScale;
				if (viewPoint.maxy - _loc15_ < 1 && viewPoint.maxy - _loc15_ > 0)
					_loc15_ = viewPoint.maxy - 1;
				else if (_loc15_ < viewPoint.miny)
					_loc15_ = viewPoint.miny;

				gr.moveTo(left, _loc15_);
				gr.lineTo(left, viewPoint.maxy);
				left -= intervalLength;
			}
			this.regionsXLimits.addInterval(left, right);
		}

		private getMaxVolumeHashKey(param1: number, detailLevel: number): string
		{
			return param1 + '-' + detailLevel;
		}

		protected drawLines(sprite: flash.display.Sprite, dataSeries: DataSeries, param3: number, param4: number, viewPoint: IViewPoint, context: Context)
		{
			const skipInterval = (<ViewPoint>viewPoint).getSkipInterval();
			//const _loc8_ = _loc7_.skip;
			const skip = skipInterval.interval;
			this.verticalScale = (viewPoint.maxy - viewPoint.miny - 6) / context.maxVolume;
			this.graphics.clear();
			this.graphics.lineStyle(0, this.lineColor, 1);
			const visibleExtendedHours = this.dataSource.visibleExtendedHours;
			this.regionsXLimits = new com.google.finance.IntervalSet();

			for (let intervalIndex = 0; intervalIndex < visibleExtendedHours.length(); intervalIndex++)
			{
				const interval = visibleExtendedHours.getIntervalAt(intervalIndex);
				const startUnit = this.dataSource.afterHoursData.units[interval.start];
				const endUnit = this.dataSource.afterHoursData.units[interval.end];
				if (ViewPoint.sessionVisible(startUnit, endUnit, context))
				{
					const startTime = startUnit.time;
					const endTime = endUnit.time;
					this.drawAfterHoursSession(this, dataSeries, startTime, endTime, context, skip);
				}
			}
		}

		highlightPoint(context: Context, param2: number, state: Dictionary)
		{
			this.clearHighlight();
			const vp = this.viewPoint;
			const skipInterval = vp.getSkipInterval(context.count, context.lastMinute);
			const dataSeries = this.indicator.getDataSeries(skipInterval.interval);

			if (!dataSeries || !this.regionsXLimits || !this.regionsXLimits.containsValue(param2))
				return;

			if (state["volumesetter"])
				state["volumesetter"].clearHighlight();

			const indicatorPoint = <indicator.VolumeIndicatorPoint>this.getPoint(dataSeries, param2);
			const x = vp.getXPos(indicatorPoint.point);
			const y = this.getYPos(this.viewPoint, indicatorPoint);
			this.highlightCanvas.graphics.lineStyle(2, Const.VOLUME_HIGHLIGHT_COLOR, 1);
			this.drawOneLine(x, y, this.highlightCanvas, this.viewPoint);
			state["volume"] = indicatorPoint.volume;
			state["ahsetter"] = this;
		}

		protected getMaxVolume(param1: number, param2: number, param3: boolean): number
		{
			const skipInterval = this.viewPoint.getSkipInterval(param2, param1).interval;
			if (skipInterval >= Intervals.DAILY)
				return 0;

			const visibleExtendedHours = this.dataSource.visibleExtendedHours;
			let maxVolume = 0;
			const dataSeries = notnull(this.indicator.getDataSeries(skipInterval));

			for (let intervalIndex = 0; intervalIndex < visibleExtendedHours.length(); intervalIndex++)
			{
				const interval = visibleExtendedHours.getIntervalAt(intervalIndex);
				const startUnits = this.dataSource.afterHoursData.units[interval.start];
				const endUnits = this.dataSource.afterHoursData.units[interval.end];
				const maxVolumeHashKey = this.getMaxVolumeHashKey(startUnits.time, skipInterval);
				if (this.maxVolumeCache[maxVolumeHashKey] === undefined)
				{
					const timeIndex1 = DataSource.getTimeIndex(endUnits.time, dataSeries.units);
					const timeIndex2 = DataSource.getTimeIndex(startUnits.time, dataSeries.units);
					let _loc15_ = 0;

					for (let timeIndex = timeIndex2; timeIndex < timeIndex1; timeIndex++)
						_loc15_ = Math.max((<indicator.VolumeIndicatorPoint>dataSeries.points[timeIndex]).volume, _loc15_);

					if (timeIndex1 > timeIndex2)
						this.maxVolumeCache[maxVolumeHashKey] = _loc15_;
				}
				maxVolume = Utils.extendedMax(maxVolume, this.maxVolumeCache[maxVolumeHashKey]);
			}
			return maxVolume;
		}
	}
}
