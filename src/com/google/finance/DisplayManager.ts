import { Sprite } from "../../../flash/display/Sprite";
import { IViewPoint, ViewPoint, EventCallback } from './ViewPoint';
import { LayersManager } from './LayersManager';
import { Controller } from './Controller';
import { SpaceText } from './SpaceText';
import { BorderLayer } from './BorderLayer';
import { MainManager } from './MainManager';
import { DataSource } from './DataSource';
import { Const, Intervals, ScaleTypes, ChartDetailTypes } from './Const';
import { SparklineViewPoint } from './SparklineViewPoint';
import { Utils } from './Utils';
import { DataSeries } from './DataSeries';
import { DataUnit } from './DataUnit';
import { AbstractLayer } from './AbstractLayer';
import { Bounds } from './Bounds';
import { PinPoint } from './PinPoint';
import { StartEndPair } from 'StartEndPair';
import { EventFactory } from './EventFactory';
import { ChartEventPriorities } from './ChartEvent';
import { IntervalBasedChartManagerLayer } from './IntervalBasedChartManagerLayer';
import { Map } from '../../../Global';
import { DependentIndicatorLayer } from './indicator/DependentIndicatorLayer';
import { IndependentIndicatorLayer } from "./indicator/IndependentIndicatorLayer";
import { IndicatorLayer } from './indicator/IndicatorLayer';
import { VolumeDependentIndicatorLayer } from './indicator/VolumeDependentIndicatorLayer';

	// import flash.display.Sprite;
	// import flash.utils.Dictionary;
	// import flash.utils.getDefinitionByName;
	// import com.google.finance.indicator.IndicatorLayer;
	// import com.google.finance.indicator.DependentIndicatorLayer;
	// import com.google.finance.indicator.VolumeDependentIndicatorLayer;
	// import com.google.finance.indicator.IndependentIndicatorLayer;

export class DisplayManager extends Sprite {
		private firstResize: boolean = true;
		private viewpoints: IViewPoint[] = [];
		private differentMarketSessionComparison: boolean;

		layersManager: LayersManager;
		mainController: Controller;
		spaceText: SpaceText;
		topBorderLayer: BorderLayer;

		constructor(readonly mainManager: MainManager) {
			super();
			if (mainManager) {
				this.layersManager = mainManager.layersManager;
			}
		}

		private computeRelativeTimesForPointsInIntervals(dataSource: DataSource) {
			const points = dataSource.data.getPointsInIntervals();
			const units = dataSource.data.units;
			const map: Map<number> = {};
			for (const key of Object.keys(points)) {
				const pointIndex = Number(key);
				const pointUnits = points[pointIndex];
				// TODO: was Intervals.FIVE_MINUTES
				if (pointIndex === Const.FIVE_MINUTE_INTERVAL && pointUnits[pointUnits.length - 1].dayMinute % 2 === 1) {
					pointUnits.splice(pointUnits.length - 1, 1);
				}

				map[pointIndex] = pointUnits.length - 1;
			}
			for (let unitIndex = units.length - 1; unitIndex >= 0; unitIndex--) {
				for (const key2 of Object.keys(points)) {
					const pointIndex2 = Number(key2) as Intervals;
					const point = points[pointIndex2];
					if (map[pointIndex2] >= 0 && point[map[pointIndex2]].time === units[unitIndex].time) {
						point[map[pointIndex2]].relativeMinutes = units[unitIndex].relativeMinutes;
						map[pointIndex2]--;
					}
					while (map[pointIndex2] >= 0 && (point[map[pointIndex2]].time > units[unitIndex].time || unitIndex === 0)) {
						let session = notnull(dataSource.data.getSessionForMinute(point[map[pointIndex2]].dayMinute));
						const _loc10_ = session.end - point[map[pointIndex2]].dayMinute;
						if (_loc10_ < Number(pointIndex2) / Const.SEC_PER_MINUTE) {
							if (point.length <= map[pointIndex2] + 1) {
								point[map[pointIndex2]].relativeMinutes = -_loc10_;
							} else {
								session = notnull(dataSource.data.getSessionForMinute(point[map[pointIndex2] + 1].dayMinute));
								point[map[pointIndex2]].relativeMinutes = point[map[pointIndex2] + 1].relativeMinutes - (point[map[pointIndex2] + 1].dayMinute - session.start) - 1 - _loc10_;
								if (session.start !== dataSource.data.marketOpenMinute) {
									point[map[pointIndex2]].relativeMinutes++;
								}
							}
						} else {
							point[map[pointIndex2]].relativeMinutes = point[map[pointIndex2] + 1].relativeMinutes - (point[map[pointIndex2] + 1].dayMinute - point[map[pointIndex2]].dayMinute);
						}
						map[pointIndex2]--;
					}
				}
			}
		}

		hasOhlcRequiredIndicator(): boolean {
			const layers = this.layersManager.config[LayersManager.SINGLE].layers;
			for (const layer of layers) {
				if (Const.OHLC_DEPENDENT_INDICATOR_NAMES.indexOf(layer.name) !== -1 && Boolean(layer.enabled)) {
					return true;
				}
			}
			return false;
		}

		clearWeeklyXPos() {
			if (Const.INDICATOR_ENABLED) {
				const _loc1_ = !this.layersManager ? null : this.layersManager.getFirstDataSource();
				const _loc2_ = !_loc1_ ? null : _loc1_.data.getPointsInIntervalArray(Const.WEEKLY_INTERVAL);
				if (_loc2_) {
					for (const unit of _loc2_) {
						unit.weeklyXPos = NaN;
					}
				}
			}
		}

		showContextualStaticInfo() {
			for (const viewPoint of this.viewpoints) {
				viewPoint.clearPointInformation();
			}

			const state = this.layersManager.getContextualStaticInfo();
			this.spaceText.setContextualStaticInfo(state);
			this.resizeViewPoints(this.stage.stageWidth, this.stage.stageHeight);
		}

		init(width: number, height: number) {
			this.mainController = new Controller(this.mainManager, this);
			let sparklineViewPoint: SparklineViewPoint | null = null;
			if (Boolean(Const.SHOW_SPARKLINE)) {
				sparklineViewPoint = new SparklineViewPoint(this.mainManager.dataManager, this);
				sparklineViewPoint.my_minx = 0;
				sparklineViewPoint.my_miny = 0;
				sparklineViewPoint.my_maxx = width;
				sparklineViewPoint.my_maxy = Const.SPARKLINE_HEIGHT + 1;
				sparklineViewPoint.name = Const.SPARKLINE_VIEW_POINT_NAME;
				this.addChild(sparklineViewPoint);
				this.viewpoints.push(sparklineViewPoint);
				sparklineViewPoint.setController(this.mainController);
				sparklineViewPoint.topBorder = Const.SPARK_PADDING - 1;
				sparklineViewPoint.drawBorders();
			} else {
				this.viewpoints.push(null!);	// TODO: really?
			}
			const viewPoints = Utils.decodeObjects(MainManager.paramsObj.single_viewpoints) as ViewPoint[];
			for (const viewPoint of viewPoints) {
				if (viewPoint.display !== "hidden") {
					this.addViewPoint("ViewPoint", viewPoint.name, this.stage.stageWidth, Number(viewPoint.height), Number(viewPoint.topMargin), width, height);
				}
			}
			this.spaceText = new SpaceText(this);
			this.spaceText.y = 0;
			this.spaceText.x = 0;
			this.addChild(this.spaceText);
			if (Boolean(Const.SHOW_SPARKLINE)) {
				this.topBorderLayer = new BorderLayer(this, notnull(sparklineViewPoint));
				this.addChild(this.topBorderLayer);
			}
			this.resizeViewPoints(width, height);
			this.addChild(this.mainController);
			this.mainController.initEventListeners();
		}

		private positionAfterHoursTimes(param1: number, param2: number, param3: number, param4: number, dataSeries: DataSeries, dataUnits?: DataUnit[] | null) {
			let _loc7_ = param3;
			for (let _loc8_ = param2; _loc8_ >= param1; _loc8_--) {
				dataSeries.units[_loc8_].relativeMinutes = _loc7_;
				if (dataUnits) {
					dataUnits[_loc8_].relativeMinutes = _loc7_;
				}

				_loc7_ -= param4;
			}
		}

		isIndicatorConfigEnabled(name: string): boolean {
			const layers = this.layersManager.config[LayersManager.SINGLE].layers;
			for (const layer of layers) {
				if (layer.name === name) {
					return Boolean(layer.enabled);
				}
			}
			return false;
		}

		getLayer(layerId: string, viewPointName: string, dataSource: DataSource): AbstractLayer<ViewPoint> | null {
			const viewPoint = this.getViewPoint(viewPointName) as ViewPoint;
			if (!viewPoint) {
				return null;
			}
			return viewPoint.getLayer(layerId, dataSource);
		}

		makeBorderLayerTop() {
			const viewPoint = this.getViewPoint(Const.SPARKLINE_VIEW_POINT_NAME);
			if (viewPoint) {
				this.addChildAt(viewPoint, this.numChildren - 1);
				this.addChildAt(this.topBorderLayer, this.numChildren - 1);
			}
		}

		removeAllLayers(viewPointIndex: number) {
			this.viewpoints[viewPointIndex].removeAllLayers();
		}

		windowResized(param1: number, param2: number) {
			const bounds = new Bounds(0, 0, param1, Const.SPARKLINE_HEIGHT + 1);
			const viewPoint = this.getSparklineViewPoint();
			if (viewPoint) {
				viewPoint.setNewSize(bounds);
			}
			const mainViewPoint = this.getMainViewPoint().count;
			this.resizeViewPoints(param1, param2);
			this.mainController.updateChartSizeChangeButtonPosition();
			if (this.firstResize) {
				this.firstResize = false;
				if (!this.layersManager.getFirstDataSource()) {
					return;
				}

				if (this.mainController.currentZoomLevel !== ScaleTypes.INVALID) {
					this.mainController.syncZoomLevel();
				} else {
					for (const otherViewPoint of this.viewpoints) {
						otherViewPoint.setNewCount(mainViewPoint);
					}

					this.update();
				}
			}
		}

		private updateViewPoint(viewPointIndex: number) {
			this.viewpoints[viewPointIndex].update();
		}

		protected extractInterdayPoints(dataSeries: DataSeries): DataUnit[] {
			const dataUnits: DataUnit[] = [];
			const marketCloseMinute = dataSeries.marketCloseMinute;
			const units = dataSeries.units;
			for (const unit of units) {
				unit.relativeMinutes = NaN;
				if (unit.dayMinute === marketCloseMinute) {
					dataUnits.push(unit);
				}
			}
			return dataUnits;
		}

		animateToSelectedPin(pinPoint: PinPoint) {
			if (!pinPoint) {
				return;
			}

			const firstDataSource = this.layersManager.getFirstDataSource();
			if (!firstDataSource) {
				return;
			}

			let relativeMinutes: number;

			const mainViewPoint = this.getMainViewPoint();
			if (Const.INDICATOR_ENABLED) {
				const enabledChartLayer = this.getEnabledChartLayer();
				let detailLevelForTechnicalStyle = mainViewPoint.getDetailLevelForTechnicalStyle();
				let detailLevelInterval = Const.getDetailLevelInterval(detailLevelForTechnicalStyle);
				relativeMinutes = pinPoint.getRelativeMinutes(detailLevelInterval);
				if (enabledChartLayer === Const.LINE_CHART) {
					while (isNaN(relativeMinutes) && detailLevelForTechnicalStyle < Intervals.WEEKLY) {
						detailLevelForTechnicalStyle++;
						detailLevelInterval = Const.getDetailLevelInterval(detailLevelForTechnicalStyle);
						if (firstDataSource.data.hasPointsInIntervalArray(detailLevelInterval)) {
							relativeMinutes = pinPoint.getRelativeMinutes(detailLevelInterval);
							continue;
						}
						const eventCallback = new EventCallback(this.animateToSelectedPin, [pinPoint]);
						mainViewPoint.checkEvents(detailLevelForTechnicalStyle, [eventCallback]);
						return;
					}
				}
			} else {
				relativeMinutes = pinPoint.getRelativeMinutes();
			}

			let _loc5_: number;
			if (relativeMinutes > mainViewPoint.getLastMinute()) {
				_loc5_ = Number(relativeMinutes + mainViewPoint.count / 3);
				if (_loc5_ > 0) {
					_loc5_ = 0;
				}
			} else if (relativeMinutes <= mainViewPoint.getFirstMinute()) {
				_loc5_ = Number(relativeMinutes + mainViewPoint.count * 2 / 3);
				const oldestMinute = mainViewPoint.getOldestMinute();
				if (_loc5_ < oldestMinute) {
					_loc5_ = Number(oldestMinute + mainViewPoint.count);
				}
			} else {
				return;
			}
			this.mainController.animateTo(_loc5_, mainViewPoint.count, NaN, true);
		}

		removeLayer(layerId: string, viewPointName: string, dataSource?: DataSource) {
			const viewPoint = this.getViewPoint(viewPointName) as ViewPoint;
			viewPoint.removeLayer(layerId, dataSource);
		}

		enableIndicatorConfig(layerName: string, param2 = true) {
			const layers = this.layersManager.config[LayersManager.SINGLE].layers;
			for (const layer of layers) {
				if (layer.name === layerName) {
					layer.enabled = param2 ? "true" : "false";
				}
			}
		}

		addLayer(param1: string, param2: string, dataSource: DataSource, param4: string): AbstractLayer<IViewPoint> | null {
			const viewPoint = this.getViewPoint(param2);
			if (viewPoint) {
				return viewPoint.addLayer(param1, dataSource, param4);
			}

			return null;
		}

		getViewPoint(name: string): IViewPoint | null {
			const viewPointPos = this.getViewPointPos(name);
			if (viewPointPos !== -1) {
				return this.viewpoints[viewPointPos];
			}

			return null;
		}

		getMainViewPoint(): ViewPoint {
			const viewPointPos = this.getViewPointPos(Const.MAIN_VIEW_POINT_NAME);
			if (viewPointPos === -1) {
				throw new Error();
			}

			return this.viewpoints[viewPointPos] as ViewPoint;
		}

		getSparklineViewPoint(): SparklineViewPoint {
			const viewPointPos = this.getViewPointPos(Const.SPARKLINE_VIEW_POINT_NAME);
			if (viewPointPos === -1) {
				throw new Error();
			}

			return this.viewpoints[viewPointPos] as SparklineViewPoint;
		}

		protected getComparedDataSeries(): DataSeries[] {
			const dataSeriesArray: DataSeries[] = [];
			dataSeriesArray.push(this.mainManager.dataManager.dataSources[this.mainManager.quote].data);
			const comparedTickers = this.layersManager.getComparedTickers();
			for (const ticker of comparedTickers) {
				dataSeriesArray.push(this.mainManager.dataManager.dataSources[ticker].data);
			}
			return dataSeriesArray;
		}

		getLayers(param1: string) {
			const viewPoint = notnull(this.getViewPoint(param1));
			return viewPoint.getLayers();
		}

		HTMLnotify(viewpointName: string, param2 = false) {
			if (viewpointName !== Const.MAIN_VIEW_POINT_NAME) {
				return;
			}

			const mainViewPoint = this.getMainViewPoint();
			const firstDataUnit = mainViewPoint.getFirstDataUnit();
			const lastDataUnit = mainViewPoint.getLastDataUnit();
			if (!firstDataUnit || !lastDataUnit) {
				return;
			}

			let firstDate = new Date(firstDataUnit.time);
			const lastDate = new Date(lastDataUnit.time);
			if (firstDate.getTime() >= lastDate.getTime()) {
				firstDate = new Date(lastDate.getTime() - Const.MS_PER_DAY);
			}

			const firstDataSource = this.layersManager.getFirstDataSource();
			if (firstDataSource) {
				const numberOfDays = this.getNumberOfDaysForCount(mainViewPoint.count, mainViewPoint.lastMinute, firstDataSource);
				MainManager.jsProxy.HTMLnotify(firstDate, lastDate, numberOfDays, mainViewPoint.count, param2);
				MainManager.jsProxy.setForceDisplayExtendedHours(firstDataSource);
			}
		}

		private resizeViewPoints(width: number, height: number) {
			let bounds = new Bounds(0, height - Const.SPARKLINE_HEIGHT, width, height);
			const viewPoint = this.getSparklineViewPoint();
			if (viewPoint) {
				viewPoint.setNewSize(bounds);
			}
			height = bounds.miny - Const.SPARK_PADDING;
			let viewpointIndex: number;
			for (viewpointIndex = this.viewpoints.length - 1; viewpointIndex >= 2; viewpointIndex--) {
				bounds = new Bounds(
					Const.BORDER_WIDTH,
					height - (this.viewpoints[viewpointIndex].maxy - this.viewpoints[viewpointIndex].miny),
					width - Const.BORDER_WIDTH,
					height,
				);
				this.viewpoints[viewpointIndex].setNewSize(bounds);
				height = bounds.miny - (this.viewpoints[viewpointIndex] as ViewPoint).topMargin;
			}
			this.spaceText.setSize(width, Const.SPACE_HEIGHT + (this.viewpoints[viewpointIndex] as ViewPoint).topMargin);
			bounds = new Bounds(
				Const.BORDER_WIDTH,
				Const.SPACE_HEIGHT + Const.INFO_TEXT_TOP_PADDING + (this.viewpoints[viewpointIndex] as ViewPoint).topMargin,
				width - Const.BORDER_WIDTH,
				height,
			);
			this.viewpoints[Const.MAIN_VIEW_POINT].setNewSize(bounds);
			this.viewpoints[Const.MAIN_VIEW_POINT].clearPointInformation();
			if (Boolean(Const.SHOW_SPARKLINE)) {
				this.topBorderLayer.update();
			}
		}

		removeViewPoint(param1: string) {
			const viewPointPos = this.getViewPointPos(param1);
			if (viewPointPos === -1) {
				return;
			}

			const vp = this.viewpoints[viewPointPos];
			if (!vp) {
				return;
			}

			this.mainController.removeControlListener(vp);
			this.removeChild(vp);
			this.viewpoints.splice(viewPointPos, 1);
		}

		update(param1 = false) {
			this.clearWeeklyXPos();

			for (let viewPointIndex = 0; viewPointIndex < this.viewpoints.length; viewPointIndex++) {
				this.updateViewPoint(viewPointIndex);
			}

			if (param1) {
				this.mainController.triggerMouseMoveAction();
			} else {
				this.showContextualStaticInfo();
			}

			this.topBorderLayer.update();
		}

		addViewPoint(viewPointTypeName: string, viewPointName: string, width: number, height: number, top: number, param6: number, param7: number, mainViewPoint?: IViewPoint): number {
			const viewPointType = getDefinitionByName("com.google.finance." + viewPointTypeName) as typeof ViewPoint;
			const bounds = new Bounds(
				Const.BORDER_WIDTH,
				param7 - height + top,
				param6 - Const.BORDER_WIDTH,
				param7,
			);
			const viewPoint = new viewPointType(this);
			this.addChild(viewPoint);
			viewPoint.name = viewPointName;
			viewPoint.topMargin = top;
			viewPoint.setNewSize(bounds);
			if (mainViewPoint) {
				viewPoint.count = mainViewPoint.count;
				viewPoint.lastMinute = mainViewPoint.lastMinute;
			}
			this.viewpoints.push(viewPoint);
			viewPoint.setController(this.mainController);
			if (mainViewPoint) {
				viewPoint.setNewCount(mainViewPoint.count);
			}

			return this.viewpoints.length - 1;
		}

		setLastMinute(lastMinute: number) {
			for (const viewPoint of this.viewpoints) {
				viewPoint.lastMinute = lastMinute;
			}
		}

		isDifferentMarketSessionComparison(): boolean {
			return this.differentMarketSessionComparison;
		}

		getNumberOfDaysForCount(param1: number, param2: number, dataSource: DataSource): number {
			if (this.differentMarketSessionComparison) {
				return param1;
			}

			const data = dataSource.data;
			const _loc5_ = param2 - param1;
			let _loc6_ = 0;
			let endOfDayDataUnit = dataSource.getEndOfDayDataUnitFor(param2);
			let minuteMetaIndex = DataSource.getMinuteMetaIndex(endOfDayDataUnit.relativeMinutes, data.days, data.units);
			if (endOfDayDataUnit.coveredDays > 0) {
				const _loc9_ = endOfDayDataUnit.relativeMinutes - param2;
				_loc6_ = Number(_loc6_ - Math.floor(_loc9_ / data.marketDayLength));
			}
			while (endOfDayDataUnit.relativeMinutes > _loc5_ && minuteMetaIndex > 0) {
				minuteMetaIndex--;
				if (minuteMetaIndex < 0) {
					break;
				}

				const relativeMinutes = data.units[data.days[minuteMetaIndex]].relativeMinutes;
				const endOfDayDataUnitFor = dataSource.getEndOfDayDataUnitFor(relativeMinutes);
				if (endOfDayDataUnitFor.relativeMinutes >= _loc5_) {
					if (endOfDayDataUnit.coveredDays === 0) {
						_loc6_++;
					} else {
						_loc6_ = Number(_loc6_ + endOfDayDataUnit.coveredDays);
					}
				} else if (endOfDayDataUnit.coveredDays > 0) {
					const _loc12_ = endOfDayDataUnit.relativeMinutes - _loc5_;
					_loc6_ = Number(_loc6_ + Math.floor(_loc12_ / data.marketDayLength));
				}
				endOfDayDataUnit = endOfDayDataUnitFor;
			}
			return _loc6_;
		}

		toggleAllAfterHoursSessions(param1: boolean, dataSource?: DataSource) {
			let _loc3_: DataSource;
			if (dataSource) {
				_loc3_ = dataSource;
			} else {
				const dataSeries = this.layersManager.getFirstDataSource();
				if (!dataSeries) {
					return;
				}
				_loc3_ = dataSeries;
			}
			const _loc4_ = _loc3_.visibleExtendedHours.length();
			const _loc5_ = _loc3_.hiddenExtendedHours.length();
			if (param1 === true && _loc5_ > 0 || param1 === false && _loc4_ > 0) {
				const visibleExtendedHours = _loc3_.visibleExtendedHours;
				_loc3_.visibleExtendedHours = _loc3_.hiddenExtendedHours;
				_loc3_.hiddenExtendedHours = visibleExtendedHours;
			}
			this.computeRelativeTimes(_loc3_);
			_loc3_.computeObjectPositions();
			this.mainController.syncZoomLevel(true);
		}

		getViewPoints(): IViewPoint[] {
			return this.viewpoints;
		}

		private getViewPointPos(name: string): number {
			for (let viewPointIndex = 0; viewPointIndex < this.viewpoints.length; viewPointIndex++) {
				if (this.viewpoints[viewPointIndex].name === name) {
					return viewPointIndex;
				}
			}
			return -1;
		}

		computeRelativeTimes(dataSource: DataSource) {
			if (this.differentMarketSessionComparison) {
				return;
			}

			dataSource.setRelativeMinutesState(DataSource.RELATIVE_MINUTES_READY);
			const data = dataSource.data;
			if (data.units.length === 0) {
				return;
			}

			const afterHoursData = dataSource.afterHoursData;
			const _loc4_ = Const.INDICATOR_ENABLED ? afterHoursData.getPointsInIntervalArray(Const.INTRADAY_INTERVAL) : null;
			dataSource.firstOpenRelativeMinutes = 0;
			let interval: StartEndPair | null = null;
			let _loc6_ = dataSource.visibleExtendedHours.length() - 1;
			if (_loc6_ !== -1) {
				interval = dataSource.visibleExtendedHours.getIntervalAt(_loc6_);
			}

			const lastUnit = data.units[data.units.length - 1];
			let session = notnull(data.getSessionForMinute(lastUnit.dayMinute));
			const intradayMinutesInterval = dataSource.intradayMinutesInterval;
			let _loc10_ = 0;
			for (let unitIndex = data.units.length - 1; unitIndex > 0; unitIndex--) {
				const unit = data.units[unitIndex];
				unit.relativeMinutes = _loc10_;
				if (unit.time >= Const.YEAR_2000 && _loc10_ < dataSource.firstOpenRelativeMinutes) {
					dataSource.firstOpenRelativeMinutes = _loc10_;
				}

				if (unit.coveredDays > 0) {
					if (unitIndex > 0) {
						const _loc13_ = unit.time - data.units[unitIndex - 1].time;
						const _loc14_ = Math.floor(_loc13_ / (Const.DAILY_INTERVAL * 1000));
						if (unit.coveredDays > _loc14_) {
							unit.coveredDays = _loc14_;
						}
					}
					if (unit.coveredDays === 0) {
						_loc10_ -= intradayMinutesInterval;
					} else {
						_loc10_ -= (data.marketDayLength + 1) * unit.coveredDays;
					}
				} else if (unit.dayMinute === session.end && data.minuteIsEndOfDataSession(data.units[unitIndex - 1].dayMinute)) {
					_loc10_ -= data.marketDayLength + 1;
				} else {
					const _loc15_ = unit.dayMinute - session.start;
					if (_loc15_ >= 0 && _loc15_ < intradayMinutesInterval) {
						_loc10_ -= _loc15_ + (session.start === data.marketOpenMinute ? 1 : 0);
						const _loc16_ = data.units[unitIndex - 1].dayMinute;
						if (!isNaN(_loc16_)) {
							session = notnull(data.getSessionForMinute(_loc16_));
						}
					} else if (unit.dayMinute === session.end && interval) {
						let start = interval.start;
						let end = interval.end;
						let _loc19_ = Number(afterHoursData.units[start].time);
						while (unit.time <= _loc19_) {
							const _loc20_ = afterHoursData.units[end].dayMinute - afterHoursData.units[start].dayMinute;
							unit.relativeMinutes -= _loc20_ + 1;
							this.positionAfterHoursTimes(start, end, _loc10_, intradayMinutesInterval, afterHoursData, _loc4_);
							_loc10_ -= _loc20_ + 1;
							_loc6_--;
							interval = dataSource.visibleExtendedHours.getIntervalAt(_loc6_);
							if (interval) {
								start = interval.start;
								end = interval.end;
								_loc19_ = Number(afterHoursData.units[start].time);
							} else {
								_loc19_ = -1;
							}
						}
						_loc10_ -= intradayMinutesInterval;
					} else {
						_loc10_ -= intradayMinutesInterval;
					}
				}
			}
			data.units[0].relativeMinutes = _loc10_;
			if (data.units[0].time >= Const.YEAR_2000 && _loc10_ < dataSource.firstOpenRelativeMinutes) {
				dataSource.firstOpenRelativeMinutes = _loc10_;
			}

			if (Const.INDICATOR_ENABLED) {
				this.computeRelativeTimesForPointsInIntervals(dataSource);
			}
		}

		enableIndicatorLayer(indicatorName: string, viewpointName: string, enabled = true) {
			const viewPoint = this.getViewPoint(viewpointName);
			if (viewPoint) {
				for (const layer of viewPoint.getLayers()) {
					if (layer instanceof IndicatorLayer) {
						if (indicatorName === layer.getIndicatorName()) {
							layer.setEnabled(enabled);
						}
					}
				}
				this.update();
			}
		}

		setDifferentMarketSessionComparison(isDifferentMarketSessionComparison: boolean) {
			this.differentMarketSessionComparison = isDifferentMarketSessionComparison;
		}

		setAfterHoursDisplay(param1: boolean, dataSource?: DataSource) {
			let _loc3_: DataSource | null;
			if (dataSource) {
				_loc3_ = dataSource;
			} else {
				_loc3_ = this.layersManager.getFirstDataSource();
				if (!_loc3_) {
					return;
				}
			}
			const _loc4_ = _loc3_.visibleExtendedHours.length();
			const _loc5_ = _loc3_.hiddenExtendedHours.length();
			if (param1 === true && _loc4_ + _loc5_ === 0) {
				const event = EventFactory.getEvent(ChartDetailTypes.GET_AH_DATA, _loc3_.quoteName, ChartEventPriorities.OPTIONAL);
				this.mainManager.dataManager.expectEvent(event);
				this.mainManager.dataManager.eventHandler(event);
			} else {
				const detailLevel = this.getDetailLevel();
				const _loc8_ = Const.INDICATOR_ENABLED ? this.getEnabledChartLayer() : "";
				const _loc9_ = detailLevel === Intervals.INTRADAY || _loc8_ === Const.LINE_CHART && detailLevel < Intervals.DAILY;
				if (_loc9_ && this.layersManager.getStyle() === LayersManager.SINGLE) {
					this.toggleAllAfterHoursSessions(param1, _loc3_);
					if (_loc8_ === Const.CANDLE_STICK || _loc8_ === Const.OHLC_CHART) {
						const _loc10_ = _loc3_.data.marketDayLength + 1;
						this.mainController.jumpTo(0, _loc10_ * Const.INTERVAL_PERIODS[detailLevel].days);
					} else {
						this.mainController.syncZoomLevel();
					}
				}
			}
		}

		protected setDiffMarketSessionRelativeMinutesState() {
			this.mainManager.dataManager.dataSources[this.mainManager.quote].setRelativeMinutesState(DataSource.DMS_RELATIVE_MINUTES_READY);
			const comparedTickers = this.layersManager.getComparedTickers();
			for (const layer of comparedTickers) {
				this.mainManager.dataManager.dataSources[layer].setRelativeMinutesState(DataSource.DMS_RELATIVE_MINUTES_READY);
			}
		}

		setEnabledChartLayer(layerType: string) {
			const mainViewPoint = this.getMainViewPoint();
			const layers = mainViewPoint.getLayers();
			const dataSource = this.layersManager ? this.layersManager.getFirstDataSource() : null;
			for (const layer of layers) {
				if (layer instanceof IntervalBasedChartManagerLayer) {
					if (Boolean(MainManager.paramsObj.displayExtendedHours)) {
						if ((!dataSource || dataSource.visibleExtendedHours.length() > 0) && layerType !== Const.LINE_CHART && layer.getEnabledLayerName() === Const.LINE_CHART) {
							this.setAfterHoursDisplay(false);
						}
					}
					layer.setEnabledLayer(layerType);
					if (Boolean(MainManager.paramsObj.displayExtendedHours)) {
						if ((!dataSource || dataSource.visibleExtendedHours.length() === 0) && Const.CHART_STYLE_NAMES.indexOf(layerType) !== -1) {
							this.setAfterHoursDisplay(true);
						}
					}
				}
			}
			this.update();
		}

		computeRelativeTimesForDiffSessionComparison() {
			this.setDiffMarketSessionRelativeMinutesState();
			const dataUnits: DataUnit[] = [];
			const comparedDataSeries = this.getComparedDataSeries();
			for (const dataSeries of comparedDataSeries) {
				for (const unit of this.extractInterdayPoints(dataSeries)) {
					dataUnits.push(unit);
				}
			}
			if (dataUnits.length === 0) {
				return;
			}

			dataUnits.sort(Utils.compareDataUnits);
			let minutes = 0;
			const _loc5_ = dataUnits[dataUnits.length - 1];
			let date = new Date(_loc5_.exchangeDateInUTC.getUTCFullYear(), _loc5_.exchangeDateInUTC.getUTCMonth(), _loc5_.exchangeDateInUTC.getUTCDate());
			for (let unitIndex = dataUnits.length - 1; unitIndex >= 0; unitIndex--) {
				const _loc10_ = dataUnits[unitIndex];
				const exchangeDateInUTC = _loc10_.exchangeDateInUTC;
				if (exchangeDateInUTC.getUTCDate() !== date.getDate() || exchangeDateInUTC.getUTCMonth() !== date.getMonth() || exchangeDateInUTC.getUTCFullYear() !== date.getFullYear()) {
					const exchangeDate = new Date(exchangeDateInUTC.getUTCFullYear(), exchangeDateInUTC.getUTCMonth(), exchangeDateInUTC.getUTCDate());
					const _loc13_ = this.mainManager ? this.mainManager.weekdayBitmap : Const.DEFAULT_WEEKDAY_BITMAP;
					minutes -= Utils.getWeekdaysDifference(exchangeDate, date, _loc13_);
					date = exchangeDate;
				}
				_loc10_.relativeMinutes = minutes;
			}

			for (const dataSeries of comparedDataSeries) {
				const units = dataSeries.units;
				if (units.length !== 0) {
					let _loc14_ = 0;
					while (_loc14_ < units.length && isNaN(units[_loc14_].relativeMinutes)) {
						_loc14_++;
					}

					if (_loc14_ !== units.length) {
						minutes = units[_loc14_].relativeMinutes;
						for (let unitIndex = _loc14_ + 1; unitIndex < units.length; unitIndex++) {
							if (isNaN(units[unitIndex].relativeMinutes)) {
								units[unitIndex].relativeMinutes = minutes;
							} else {
								minutes = units[unitIndex].relativeMinutes;
							}

						}
					}
				}
			}
		}

		setIndicatorInstanceArray(viewPointName: string, indicators: any[]) {
			const mainViewPoint = this.getMainViewPoint();
			const mainLayers = mainViewPoint.getLayers();
			for (const layer of mainLayers) {
				if (layer instanceof DependentIndicatorLayer) {
					if (viewPointName === layer.getIndicatorName()) {
						layer.setIndicatorInstanceArray(indicators);
					}
				}
			}
			const bottomViewPoint = this.getViewPoint(Const.BOTTOM_VIEW_POINT_NAME);
			if (bottomViewPoint) {
				for (const bottomLayer of bottomViewPoint.getLayers()) {
					if (bottomLayer instanceof VolumeDependentIndicatorLayer) {
						if (viewPointName === bottomLayer.getIndicatorName()) {
							bottomLayer.setIndicatorInstanceArray(indicators);
						}
					}
				}
			}
			const viewPoint = this.getViewPoint(viewPointName);
			const layers = !viewPoint ? [] : viewPoint.getLayers();
			for (const layer of layers) {
				if (layer instanceof IndependentIndicatorLayer) {
					if (viewPointName === layer.getIndicatorName()) {
						layer.setIndicatorInstanceArray(indicators);
					}
				}
			}
			this.update();
		}

		getDetailLevel(): Intervals {
			const mainViewPoint = this.getMainViewPoint();
			const interval = Const.INDICATOR_ENABLED ? mainViewPoint.getDetailLevelForTechnicalStyle() : mainViewPoint.getDetailLevel();
			if (interval === Intervals.INVALID) {
				const zoomLevel = Const.getZoomLevel(Const.MARKET_DAY_LENGTH * Const.getDefaultDisplayDays(), Const.MARKET_DAY_LENGTH);
				if (zoomLevel <= ScaleTypes.SCALE_1Y) {
					return Intervals.WEEKLY;
				}

				if (zoomLevel <= ScaleTypes.SCALE_1M) {
					return Intervals.DAILY;
				}

				return Intervals.INTRADAY;
			}
			return interval;
		}

		getEnabledChartLayer(): string {
			const mainViewPoint = this.getMainViewPoint();
			const layers = mainViewPoint.getLayers();
			for (const layer of layers) {
				if (layer instanceof IntervalBasedChartManagerLayer) {
					return (layer as IntervalBasedChartManagerLayer).getEnabledLayerName();
				}
			}
			const enabledChartLayerName = IntervalBasedChartManagerLayer.getEnabledChartLayerName();
			return enabledChartLayerName ? enabledChartLayerName : Const.DEFAULT_CHART_STYLE_NAME;
		}
	}
