import { IntervalBasedChartLayer } from "IntervalBasedChartLayer";
import { IntervalSet } from './IntervalSet';
import { ViewPoint, Context } from './ViewPoint';
import { DataSource } from './DataSource';
import { DataUnit } from './DataUnit';
import { Intervals, Const } from './Const';
import { DataSeries } from './DataSeries';
import { Dictionary } from '../../../Global';

export class IntervalBasedAHChartLayer extends IntervalBasedChartLayer {
		private regionsXLimits: IntervalSet;
		private visibleSessionsTimes: IntervalSet;

		constructor(viewPoint: ViewPoint, dataSoure: DataSource) {
			super(viewPoint, dataSoure);
			this.setEnabled(true);
		}

		private drawOhlcBars(dataUnits: DataUnit[], param2: number, param3: number, context: Context) {
			const afterHoursBarWidth = this.getAfterHoursBarWidth();
			const gr = this.graphics;
			for (let _loc6_ = param3; _loc6_ > param2; _loc6_--) {
				if (!(isNaN(dataUnits[_loc6_].high) || isNaN(dataUnits[_loc6_].low) || isNaN(dataUnits[_loc6_].open))) {
					const unit = dataUnits[_loc6_];
					const x = this.viewPoint.getXPos(unit);
					const ohlcYPos = this.getOhlcYPos(context, unit);
					gr.lineStyle(1, this.getOhlcColor(unit, dataUnits[Math.max(_loc6_ - 1, 0)]));
					if (!unit.fake) {
						if (Math.abs(ohlcYPos.highY - ohlcYPos.lowY) <= 1) {
							const _loc11_ = (ohlcYPos.highY + ohlcYPos.lowY) / 2;
							if (afterHoursBarWidth === 0) {
								gr.moveTo(x, _loc11_ - 0.5);
								gr.lineTo(x, _loc11_ + 0.5);
							} else {
								gr.moveTo(x - afterHoursBarWidth / 2, _loc11_);
								gr.lineTo(x + afterHoursBarWidth / 2, _loc11_);
							}
						} else {
							gr.moveTo(x - afterHoursBarWidth / 2, ohlcYPos.openY);
							gr.lineTo(x, ohlcYPos.openY);
							gr.moveTo(x, ohlcYPos.closeY);
							gr.lineTo(x + afterHoursBarWidth / 2, ohlcYPos.closeY);
							gr.moveTo(x, ohlcYPos.highY);
							gr.lineTo(x, ohlcYPos.lowY);
						}
					}
				}
			}
		}

		renderLayer(context: Context) {
			this.graphics.clear();
			const vp = this.viewPoint as ViewPoint;
			const detailLevel = vp.getDetailLevelForTechnicalStyle();
			const displayManager = vp.getDisplayManager().getEnabledChartLayer();
			if (detailLevel >= Intervals.DAILY || detailLevel !== Intervals.INTRADAY && displayManager !== Const.LINE_CHART) {
				return;
			}

			const points = this.getDataSeries().getPointsInIntervalArray(Const.INTRADAY_INTERVAL);
			if (!points) {
				return;
			}

			this.visibleSessionsTimes = this.getVisibleSessionsTimes(context, points);
			this.localYOffset = vp.miny + vp.medPriceY + vp.V_OFFSET;
			this.localYScale = vp.maxPriceRangeViewSize / context.maxPriceRange;
			this.regionsXLimits = new IntervalSet();

			for (let intervalIndex = 0; intervalIndex < this.visibleSessionsTimes.length(); intervalIndex++) {
				const interval = this.visibleSessionsTimes.getIntervalAt(intervalIndex);
				this.drawAfterHoursSession(interval.start, interval.end, context, points);
			}
		}

		highlightPoint(context: Context, x: number, state: Dictionary) {
			if (!this.regionsXLimits || !this.regionsXLimits.containsValue(x)) {
				this.clearHighlight();
				return;
			}
			super.highlightPoint(context, x, state);
		}

		private getVisibleSessionsTimes(context: Context, dataUnits: DataUnit[]): IntervalSet {
			const intervalSet = new IntervalSet();
			const visibleExtendedHours = this.dataSource.visibleExtendedHours;
			for (let _loc5_ = visibleExtendedHours.length() - 1; _loc5_ >= 0; _loc5_--) {
				const interval = visibleExtendedHours.getIntervalAt(_loc5_);
				const startUnit = dataUnits[interval.start];
				const endUnit = dataUnits[interval.end];
				if (ViewPoint.sessionVisible(startUnit, endUnit, context)) {
					intervalSet.addInterval(startUnit.time, endUnit.time);
				}
			}
			return intervalSet;
		}

		private drawCandleSticks(dataUnits: DataUnit[], param2: number, param3: number, context: Context) {
			const afterHoursBarWidth = this.getAfterHoursBarWidth();
			const gr = this.graphics;
			for (let _loc6_ = param3; _loc6_ > param2; _loc6_--) {
				if (!(isNaN(dataUnits[_loc6_].high) || isNaN(dataUnits[_loc6_].low) || isNaN(dataUnits[_loc6_].open))) {
					const unit = dataUnits[_loc6_];
					const x = this.viewPoint.getXPos(unit);
					const ohlcYPos = this.getOhlcYPos(context, unit);
					// const _loc10_ = Math.abs(_loc9_.closeY - _loc9_.openY);
					const _loc11_ = unit.close >= unit.open;
					const candleStickColor = this.getCandleStickColor(unit);
					gr.lineStyle(1, candleStickColor);
					if (!unit.fake) {
						if (Math.abs(ohlcYPos.closeY - ohlcYPos.openY) <= 1) {
							const _loc13_ = (ohlcYPos.closeY + ohlcYPos.openY) / 2;
							if (afterHoursBarWidth === 0) {
								gr.moveTo(x, _loc13_ - 0.5);
								gr.lineTo(x, _loc13_ + 0.5);
							} else {
								gr.moveTo(x - afterHoursBarWidth / 2, _loc13_);
								gr.lineTo(x + afterHoursBarWidth / 2, _loc13_);
							}
						} else {
							gr.moveTo(x - afterHoursBarWidth / 2, _loc11_ ? Number(ohlcYPos.closeY) : ohlcYPos.openY);
							if (!_loc11_) {
								gr.beginFill(candleStickColor);
							}

							gr.lineTo(x + afterHoursBarWidth / 2, _loc11_ ? Number(ohlcYPos.closeY) : ohlcYPos.openY);
							gr.lineTo(x + afterHoursBarWidth / 2, _loc11_ ? Number(ohlcYPos.openY) : ohlcYPos.closeY);
							gr.lineTo(x - afterHoursBarWidth / 2, _loc11_ ? Number(ohlcYPos.openY) : ohlcYPos.closeY);
							gr.lineTo(x - afterHoursBarWidth / 2, _loc11_ ? Number(ohlcYPos.closeY) : ohlcYPos.openY);
							if (!_loc11_) {
								gr.endFill();
							}
						}
						gr.moveTo(x, ohlcYPos.lowY);
						gr.lineTo(x, _loc11_ ? Number(ohlcYPos.openY) : ohlcYPos.closeY);
						gr.moveTo(x, _loc11_ ? Number(ohlcYPos.closeY) : ohlcYPos.openY);
						gr.lineTo(x, ohlcYPos.highY);
					}
				}
			}
		}

		getContext(context: Context, param2 = false) {
			if (this.dataSource.visibleExtendedHours.length() > 0) {
				return super.getContext(context, param2);
			}

			return context;
		}

		private drawLines(dataUnits: DataUnit[], param2: number, unitIndex: number, context: Context) {
			let xPos = this.viewPoint.getXPos(dataUnits[unitIndex]);
			let closeYPos = this.getCloseYPos(context, dataUnits[unitIndex]);
			const gr = this.graphics;
			gr.lineStyle(0, 0, 0);
			gr.beginFill(Const.ECN_LINE_CHART_FILL_COLOR, Const.ECN_LINE_CHART_FILL_VISIBILITY);
			gr.moveTo(xPos, this.viewPoint.maxy - 15);
			gr.lineTo(xPos, closeYPos);
			gr.lineStyle(Const.ECN_LINE_CHART_LINE_THICKNESS, Const.ECN_LINE_CHART_LINE_COLOR, Const.ECN_LINE_CHART_LINE_VISIBILITY);
			for (let _loc7_ = unitIndex; _loc7_ > param2; _loc7_--) {
				xPos = this.viewPoint.getXPos(dataUnits[_loc7_]);
				closeYPos = this.getCloseYPos(context, dataUnits[_loc7_]);
				gr.lineTo(xPos, closeYPos);
			}
			gr.lineStyle(0, 0, 0);
			gr.lineTo(xPos, this.viewPoint.maxy - 15);
			gr.endFill();
		}

		private getAfterHoursBarWidth(): number {
			const _loc1_ = Const.BAR_WIDTH_RATIO * this.viewPoint.minutePix * 2;
			return _loc1_ % 2 === 0 ? _loc1_ : (_loc1_ - 1);
		}

		getDataSeries(context?: Context): DataSeries {
			return this.dataSource.afterHoursData;
		}

		private drawAfterHoursSession(param1: number, param2: number, context: Context, dataUnits: DataUnit[]) {
			const timeIndex1 = DataSource.getTimeIndex(param2, dataUnits);
			const timeIndex2 = DataSource.getTimeIndex(param1, dataUnits);
			const _loc7_ = Math.min(timeIndex1, this.getLastRealPointIndex(dataUnits));
			switch (this.viewPoint.getDisplayManager().getEnabledChartLayer()) {
				case Const.CANDLE_STICK:
					this.drawCandleSticks(dataUnits, timeIndex2, _loc7_, context);
					break;
				case Const.OHLC_CHART:
					this.drawOhlcBars(dataUnits, timeIndex2, _loc7_, context);
					break;
				default:
					this.drawLines(dataUnits, timeIndex2, _loc7_, context);
					break;
			}
			this.regionsXLimits.addInterval(this.viewPoint.getXPos(dataUnits[timeIndex2]), this.viewPoint.getXPos(dataUnits[timeIndex1]));
		}
	}
