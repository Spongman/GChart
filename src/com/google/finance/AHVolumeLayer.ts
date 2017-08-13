/// <reference path="VolumeLinesChartLayer.ts" />

namespace com.google.finance
{
	// import flash.display.Sprite;

	export class AHVolumeLayer extends VolumeLinesChartLayer
	{
		protected regionsXLimits: com.google.finance.IntervalSet;
		protected readonly maxVolumeCache: { [key: string]: number } = {};

		private drawAfterHoursSession(param1: flash.display.Sprite, dataSeries: DataSeries, param3: number, param4: number, context: Context, param6: number) 
		{
			const timeIndex1 = DataSource.getTimeIndex(param4, dataSeries.units);
			const timeIndex2 = DataSource.getTimeIndex(param3, dataSeries.units);
			const viewPoint = this.viewPoint;
			const _loc10_ = <indicator.VolumeIndicatorPoint[]>dataSeries.points;
			let left = viewPoint.getXPos(_loc10_[timeIndex1].point);
			const right = left;
			const intervalLength = viewPoint.getIntervalLength(param6 / 60);
			const gr = param1.graphics;
			for (let timeIndex = timeIndex1; timeIndex > timeIndex2; timeIndex--)
			{
				let _loc15_ = viewPoint.maxy - _loc10_[timeIndex].volume * this.verticalScale;
				if (viewPoint.maxy - _loc15_ < 1 && viewPoint.maxy - _loc15_ > 0)
					_loc15_ = viewPoint.maxy - 1;
				else if (_loc15_ < viewPoint.miny)
					_loc15_ = viewPoint.miny;

				gr.moveTo(left, _loc15_);
				gr.lineTo(left, viewPoint.maxy);
				left = left - intervalLength;
			}
			this.regionsXLimits.addInterval(left, right);
		}

		private getMaxVolumeHashKey(param1: number, param2: number): string
		{
			return param1 + "-" + param2;
		}

		protected drawLines(param1: flash.display.Sprite, dataSeries: DataSeries, param3: number, param4: number, param5: IViewPoint, context: Context) 
		{
			const skipInterval = (<ViewPoint>param5).getSkipInterval();
			//const _loc8_ = _loc7_.skip;
			const skip = skipInterval.interval;
			this.verticalScale = (param5.maxy - param5.miny - 6) / context.maxVolume;
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

		highlightPoint(context: Context, param2: number, param3: { [key: string]: any }) 
		{
			this.clearHighlight();
			let vp = this.viewPoint;
			const skipInterval = vp.getSkipInterval(context.count, context.lastMinute);
			const dataSeries = this.indicator.getDataSeries(skipInterval.interval);

			if (!dataSeries || !this.regionsXLimits || !this.regionsXLimits.containsValue(param2))
				return;

			if (param3["volumesetter"])
				param3["volumesetter"].clearHighlight();

			const indicatorPoint = <indicator.VolumeIndicatorPoint>this.getPoint(dataSeries, param2);
			const xPos = vp.getXPos(indicatorPoint.point);
			const yPos = this.getYPos(this.viewPoint, indicatorPoint);
			this.highlightCanvas.graphics.lineStyle(2, Const.VOLUME_HIGHLIGHT_COLOR, 1);
			this.drawOneLine(xPos, yPos, this.highlightCanvas, this.viewPoint);
			param3["volume"] = indicatorPoint.volume;
			param3["ahsetter"] = this;
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
				const _loc10_ = this.dataSource.afterHoursData.units[interval.start];
				const _loc11_ = this.dataSource.afterHoursData.units[interval.end];
				const maxVolumeHashKey = this.getMaxVolumeHashKey(_loc10_.time, skipInterval);
				if (this.maxVolumeCache[maxVolumeHashKey] === undefined)
				{
					const timeIndex1 = DataSource.getTimeIndex(_loc11_.time, dataSeries.units);
					const timeIndex2 = DataSource.getTimeIndex(_loc10_.time, dataSeries.units);
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
