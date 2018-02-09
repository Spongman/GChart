import { Sprite } from "../../../flash/display/Sprite";
import { Dictionary, Map } from "../../../Global";
import { Const } from "./Const";
import { DataSeries } from "./DataSeries";
import { DataSource } from "./DataSource";
import { VolumeIndicatorPoint } from "./indicator/IndicatorPoint";
import { IntervalSet } from "./IntervalSet";
import { Utils } from "./Utils";
import { ViewPoint } from "./ViewPoint";
import { VolumeLinesChartLayer } from "./VolumeLinesChartLayer";
import { Context, IViewPoint } from './IViewPoint';

// import flash.display.Sprite;

export class AHVolumeLayer extends VolumeLinesChartLayer {
	protected regionsXLimits: IntervalSet | undefined;
	protected readonly maxVolumeCache: Map<number> = {};

	private drawAfterHoursSession(layer: AHVolumeLayer, dataSeries: DataSeries, startTime: number, endTime: number, context: Context, interval: number) {
		const timeIndex2 = DataSource.getTimeIndex(endTime, dataSeries.units);
		const timeIndex1 = DataSource.getTimeIndex(startTime, dataSeries.units);
		const viewPoint = this.viewPoint;
		const points = dataSeries.points as VolumeIndicatorPoint[];
		const right = viewPoint.getXPos(points[timeIndex2].point);
		let left = right;
		const intervalLength = viewPoint.getIntervalLength(interval / 60);
		const gr = layer.graphics;
		for (let timeIndex = timeIndex2; timeIndex > timeIndex1; timeIndex--) {
			let _loc15_ = viewPoint.maxy - points[timeIndex].volume * this.verticalScale;
			if (viewPoint.maxy - _loc15_ < 1 && viewPoint.maxy - _loc15_ > 0) {
				_loc15_ = viewPoint.maxy - 1;
			} else if (_loc15_ < viewPoint.miny) {
				_loc15_ = viewPoint.miny;
			}

			gr.moveTo(left, _loc15_);
			gr.lineTo(left, viewPoint.maxy);
			left -= intervalLength;
		}
		this.regionsXLimits.addInterval(left, right);
	}

	private getMaxVolumeHashKey(param1: number, interval: number): string {
		return param1 + "-" + interval;
	}

	protected drawLines(sprite: Sprite, dataSeries: DataSeries, param3: number, param4: number, viewPoint: IViewPoint, context: Context) {
		const skipInterval = (viewPoint as ViewPoint).getSkipInterval();
		// const _loc8_ = _loc7_.skip;
		const skip = skipInterval.interval;
		this.verticalScale = (viewPoint.maxy - viewPoint.miny - 6) / context.maxVolume;
		this.graphics.clear();
		this.graphics.lineStyle(0, this.lineColor, 1);
		const visibleExtendedHours = this.dataSource.visibleExtendedHours;
		this.regionsXLimits = new IntervalSet();

		for (let intervalIndex = 0; intervalIndex < visibleExtendedHours.length(); intervalIndex++) {
			const interval = visibleExtendedHours.getIntervalAt(intervalIndex);
			const startUnit = this.dataSource.afterHoursData.units[interval.start];
			const endUnit = this.dataSource.afterHoursData.units[interval.end];
			if (ViewPoint.sessionVisible(startUnit, endUnit, context)) {
				this.drawAfterHoursSession(this, dataSeries, startUnit.time, endUnit.time, context, skip);
			}
		}
	}

	highlightPoint(context: Context, param2: number, state: Dictionary) {
		this.clearHighlight();
		const vp = this.viewPoint;
		const skipInterval = vp.getSkipInterval(context.count, context.lastMinute);
		const dataSeries = this.indicator.getDataSeries(skipInterval.interval);

		if (!dataSeries || !this.regionsXLimits || !this.regionsXLimits.containsValue(param2)) {
			return;
		}

		if (state["volumesetter"]) {
			state["volumesetter"].clearHighlight();
		}

		const indicatorPoint = this.getPoint(dataSeries, param2) as VolumeIndicatorPoint;
		const x = vp.getXPos(indicatorPoint.point);
		const y = this.getYPos(this.viewPoint, indicatorPoint);
		this.highlightCanvas.graphics.lineStyle(2, Const.VOLUME_HIGHLIGHT_COLOR, 1);
		this.drawOneLine(x, y, this.highlightCanvas, this.viewPoint);
		state["volume"] = indicatorPoint.volume;
		state["ahsetter"] = this;
	}

	protected getMaxVolume(param1: number, param2: number, param3: boolean): number {
		const interval = this.viewPoint.getSkipInterval(param2, param1).interval;
		if (interval >= Const.DAILY_INTERVAL) {
			return 0;
		}

		const visibleExtendedHours = this.dataSource.visibleExtendedHours;
		let maxVolume = 0;
		const dataSeries = notnull(this.indicator.getDataSeries(interval));

		for (let intervalIndex = 0; intervalIndex < visibleExtendedHours.length(); intervalIndex++) {
			const startEndPair = visibleExtendedHours.getIntervalAt(intervalIndex);
			const startUnits = this.dataSource.afterHoursData.units[startEndPair.start];
			const endUnits = this.dataSource.afterHoursData.units[startEndPair.end];
			const maxVolumeHashKey = this.getMaxVolumeHashKey(startUnits.time, interval);
			if (this.maxVolumeCache[maxVolumeHashKey] === undefined) {
				const timeIndex1 = DataSource.getTimeIndex(endUnits.time, dataSeries.units);
				const timeIndex2 = DataSource.getTimeIndex(startUnits.time, dataSeries.units);
				let _loc15_ = 0;

				for (let timeIndex = timeIndex2; timeIndex < timeIndex1; timeIndex++) {
					_loc15_ = Math.max((dataSeries.points[timeIndex] as VolumeIndicatorPoint).volume, _loc15_);
				}

				if (timeIndex1 > timeIndex2) {
					this.maxVolumeCache[maxVolumeHashKey] = _loc15_;
				}
			}
			maxVolume = Utils.extendedMax(maxVolume, this.maxVolumeCache[maxVolumeHashKey]);
		}
		return maxVolume;
	}
}
