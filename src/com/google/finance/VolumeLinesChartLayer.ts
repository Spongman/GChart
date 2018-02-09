import { Sprite } from "../../../flash/display/Sprite";
import { Dictionary, Map } from "../../../Global";
import { AbstractDrawingLayer } from "./AbstractDrawingLayer";
import { Const, Intervals } from "./Const";
import { DataSeries } from "./DataSeries";
import { DataSource } from "./DataSource";
import { Indicator } from "./Indicator";
import { VolumeIndicatorPoint } from "./indicator/IndicatorPoint";
import { SpaceText } from "./SpaceText";
import { Utils } from "./Utils";
import { Context, IViewPoint } from "./ViewPoint";
import { ViewPoint } from "./ViewPoint";

// import flash.display.Sprite;

export class VolumeLinesChartLayer extends AbstractDrawingLayer<ViewPoint> {
	protected scaledFactor: number;
	protected factor: number;
	protected indicator: Indicator;
	protected computer: (interval: number, indicator: Indicator, intput: DataSeries) => void;
	protected highlightCanvas: Sprite = new Sprite();
	protected maxVolume: Map<number> = {};
	protected originalDataSeries: DataSeries;
	protected verticalScale = 0;

	constructor(viewPoint: ViewPoint, dataSource: DataSource) {
		super(viewPoint, dataSource);
		this.addChild(this.highlightCanvas);
	}

	private drawDayLine(sprite: Sprite, dayIndex: number, viewPoint: ViewPoint, dataSeries: DataSeries, detailLevel: Intervals, param6: number, param7: number, param8: number, context: Context): number {
		const points = dataSeries.points;
		const days = dataSeries.days;
		if (days[dayIndex - 1] === days[dayIndex] - 1) {
			return dayIndex;
		}

		let _loc14_ = days[dayIndex];
		if (_loc14_ > param8) {
			_loc14_ = param8;
		}

		const point = dataSeries.points[_loc14_] as VolumeIndicatorPoint;
		let xPos = viewPoint.getXPos(points[_loc14_].point);
		const intervalLength = viewPoint.getIntervalLength(param6 / 60);
		const _loc15_ = Utils.extendedMax(param7, days[dayIndex - 1]);
		const gr = sprite.graphics;
		while (_loc14_ > _loc15_) {
			let _loc13_ = viewPoint.maxy - point.volume * this.verticalScale;
			if (viewPoint.maxy - _loc13_ < 1 && viewPoint.maxy - _loc13_ > 0) {
				_loc13_ = viewPoint.maxy - 1;
			} else if (_loc13_ < viewPoint.miny) {
				_loc13_ = viewPoint.miny;
			}

			gr.moveTo(xPos, _loc13_);
			gr.lineTo(xPos, viewPoint.maxy);
			_loc14_--;
			xPos -= intervalLength;
		}
		return dayIndex;
	}

	setIndicator(indicatorName: string, computer: (interval: number, indicator: Indicator, intput: DataSeries) => void, dataSeries: DataSeries) {
		this.dataSource.indicators[indicatorName] = new Indicator();
		this.indicator = this.dataSource.indicators[indicatorName];
		this.indicator.clearAllOnAddData = true;
		this.computer = computer;
		this.originalDataSeries = dataSeries;
	}

	getNewestMinute(): number {
		const originalDataSeries = this.originalDataSeries;
		return originalDataSeries.getLastRelativeMinute();
	}

	protected getYPos(viewPoint: IViewPoint, indicatorPoint: VolumeIndicatorPoint): number {
		if (isNaN(indicatorPoint.volume)) {
			return viewPoint.maxy;
		}

		return viewPoint.maxy - indicatorPoint.volume * this.verticalScale;
	}

	getPoint(dataSeries: DataSeries, x: number) {
		let pointIndex = this.getPointIndex(dataSeries, x);
		while (pointIndex > 0 && (dataSeries.points[pointIndex] as VolumeIndicatorPoint).volume === 0) {
			pointIndex--;
		}

		return dataSeries.points[pointIndex];
	}

	renderLayer(context: Context) {
		const skipInterval = this.viewPoint.getSkipInterval(context.count, context.lastMinute);
		const dataSeries = this.indicator.getDataSeries(skipInterval.interval);
		if (!dataSeries || dataSeries.points.length === 0) {
			return;
		}

		const lastMinute = this.viewPoint.getLastMinute();
		const firstMinute = this.viewPoint.getFirstMinute();
		const lastReferencePointIndex = dataSeries.getReferencePointIndex(lastMinute);
		let firstReferencePointIndex = Number(dataSeries.getReferencePointIndex(firstMinute) - 1);
		if (firstReferencePointIndex < 0) {
			firstReferencePointIndex = 0;
		}

		this.drawLines(this, dataSeries, firstReferencePointIndex, lastReferencePointIndex, this.viewPoint, context);
	}

	protected drawOneLine(param1: number, param2: number, sprite: Sprite, viewPoint: IViewPoint) {
		if (viewPoint.maxy - param2 < 1 && viewPoint.maxy - param2 > 0) {
			param2 = viewPoint.maxy - 1;
		} else if (param2 < viewPoint.miny) {
			param2 = viewPoint.miny;
		}

		sprite.graphics.moveTo(param1, param2);
		sprite.graphics.lineTo(param1, viewPoint.maxy);
	}

	private getPointIndex(dataSeries: DataSeries, x: number): number {
		const minute = this.viewPoint.getMinuteOfX(x);
		let referencePointIndex = dataSeries.getReferencePointIndex(minute);
		while (dataSeries.units[referencePointIndex].fake && referencePointIndex >= 0) {
			referencePointIndex--;
		}

		if (referencePointIndex < dataSeries.points.length - 1) {
			const point = dataSeries.points[referencePointIndex].point;
			const nextPoint = dataSeries.points[referencePointIndex + 1].point;
			const pointX = this.viewPoint.getMinuteXPos(nextPoint.relativeMinutes);
			const nextPointX = this.viewPoint.getMinuteXPos(point.relativeMinutes);
			if (Math.abs(pointX - x) < Math.abs(nextPointX - x)) {
				return referencePointIndex + 1;
			}
		}
		return referencePointIndex;
	}

	clearHighlight() {
		this.highlightCanvas.graphics.clear();
	}

	getOldestMinute(): number {
		const originalDataSeries = this.originalDataSeries;
		return originalDataSeries.getFirstRelativeMinute();
	}

	protected drawLines(sprite: Sprite, dataSeries: DataSeries, param3: number, param4: number, viewPoint: ViewPoint, context: Context) {
		const _loc7_ = dataSeries.points as VolumeIndicatorPoint[];
		// const _loc8_ = param2.days;
		let nextDayStart = dataSeries.getNextDayStart(param4);
		const detailLevel = viewPoint.getDetailLevel();
		const skipInterval = viewPoint.getSkipInterval();
		// const _loc12_ = _loc11_.skip;
		const interval = skipInterval.interval;
		this.verticalScale = (viewPoint.maxy - viewPoint.miny - 6) / context.maxVolume;
		const gr = sprite.graphics;
		gr.clear();
		gr.lineStyle(0, this.lineColor, 1);
		switch (detailLevel) {
			case Intervals.INTRADAY:
				while (dataSeries.days[nextDayStart] > param3 && nextDayStart >= 0) {
					this.drawDayLine(sprite, nextDayStart, viewPoint, dataSeries, detailLevel, interval, param3, param4, context);
					nextDayStart--;
				}
				break;
			case Intervals.DAILY:
				{
					// _loc14_ = param5.getXPos(_loc7_[_loc16_].point);
					// _loc17_ = param5.minutePix * (this.dataSource.data.marketDayLength + 1);
					for (let _loc16_ = param4; _loc16_ > param3 && _loc16_ >= 0; _loc16_--) {
						let _loc15_ = this.getYPos(viewPoint, _loc7_[_loc16_]);
						const _loc14_ = viewPoint.getXPos(_loc7_[_loc16_].point);
						if (viewPoint.maxy - _loc15_ < 1 && viewPoint.maxy - _loc15_ > 0) {
							_loc15_ = viewPoint.maxy - 1;
						} else if (_loc15_ < viewPoint.miny) {
							_loc15_ = viewPoint.miny;
						}

						gr.moveTo(_loc14_, _loc15_);
						gr.lineTo(_loc14_, viewPoint.maxy);
					}
				}
				break;
			case Intervals.WEEKLY:
				{
					for (let _loc16_ = param4; _loc16_ > param3 && _loc16_ >= 0; _loc16_--) {
						const _loc14_ = viewPoint.getXPos(_loc7_[_loc16_].point);
						let _loc15_ = this.getYPos(viewPoint, _loc7_[_loc16_]);
						if (viewPoint.maxy - _loc15_ < 1 && viewPoint.maxy - _loc15_ > 0) {
							_loc15_ = viewPoint.maxy - 1;
						} else if (_loc15_ < viewPoint.miny) {
							_loc15_ = viewPoint.miny;
						}

						gr.moveTo(_loc14_, _loc15_);
						gr.lineTo(_loc14_, viewPoint.maxy);
					}
				}
				break;
		}
	}

	protected getMaxVolume(param1: number, param2: number, param3: boolean): number {
		let _loc13_ = NaN;
		const viewPoint = this.viewPoint;
		const skipInterval = viewPoint.getSkipInterval(param2, param1);
		const interval = skipInterval.interval;
		// const _loc7_ = _loc5_.skip;
		const dataSeries = notnull(this.indicator.getDataSeries(interval));
		const detailLevel = viewPoint.getDetailLevel(param2, param1);
		const _loc10_ = "c" + param2 + "-" + detailLevel + "-" + dataSeries.units.length;
		if (this.maxVolume[_loc10_] !== undefined) {
			return this.maxVolume[_loc10_];
		}

		let _loc11_ = 0;
		for (const point of dataSeries.points) {
			if ((point as VolumeIndicatorPoint).volume > _loc11_) {
				_loc11_ = Number((point as VolumeIndicatorPoint).volume);
			}
		}
		this.maxVolume[_loc10_] = _loc11_;
		for (let scaleIndex = 1; scaleIndex < Const.VOLUME_SCALES.length; scaleIndex++) {
			_loc13_ = Const.VOLUME_SCALES[scaleIndex];
			if (Math.floor(this.maxVolume[_loc10_] / _loc13_) < 10) {
				break;
			}
		}
		const _loc14_ = (Math.floor(this.maxVolume[_loc10_] / _loc13_) + 1) * _loc13_;
		this.maxVolume[_loc10_] = _loc14_;
		return this.maxVolume[_loc10_];
	}

	getDataSeries(context: Context): DataSeries {
		const vp = this.viewPoint;
		if (!context) {
			context = vp.layersContext;
		}

		const skipInterval = vp.getSkipInterval(context.count, context.lastMinute);
		this.computer(skipInterval.interval, this.indicator, this.originalDataSeries);
		return notnull(this.indicator.getDataSeries(skipInterval.interval));
	}

	getContext(context: Context, param2 = false) {
		const dataSeries = this.getDataSeries(context);
		if (dataSeries.points.length === 0) {
			if (context.maxVolume === undefined) {
				context.maxVolume = 0;
			}

			return context;
		}
		const maxVolume = this.getMaxVolume(context.lastMinute, context.count, param2);
		context.maxVolume = Utils.extendedMax(context.maxVolume, maxVolume);
		return context;
	}

	highlightPoint(context: Context, x: number, state: Dictionary) {
		this.clearHighlight();
		const skipInterval = this.viewPoint.getSkipInterval(context.count, context.lastMinute);
		const dataSeries = this.indicator.getDataSeries(skipInterval.interval);
		if (!dataSeries) {
			return;
		}

		const firstReferencePoint = dataSeries.getFirstReferencePoint();
		const lastReferencePoint = dataSeries.getLastReferencePoint();
		if (!firstReferencePoint || !lastReferencePoint) {
			return;
		}

		const firstMinuteXPos = this.viewPoint.getMinuteXPos(firstReferencePoint.relativeMinutes);
		const lastMinuteXPos = this.viewPoint.getMinuteXPos(lastReferencePoint.relativeMinutes);
		if (x < firstMinuteXPos || x > lastMinuteXPos) {
			return;
		}

		if (state["ahsetter"] !== undefined) {
			return;
		}

		const point = this.getPoint(dataSeries, x) as VolumeIndicatorPoint;
		const xPos = this.viewPoint.getXPos(point.point);
		const yPos = this.getYPos(this.viewPoint, point);
		this.highlightCanvas.graphics.lineStyle(2, Const.VOLUME_HIGHLIGHT_COLOR, 1);
		this.drawOneLine(xPos, yPos, this.highlightCanvas, this.viewPoint);
		state[SpaceText.VOLUME_STR] = point.volume;
		state["volumesetter"] = this;
	}
}
