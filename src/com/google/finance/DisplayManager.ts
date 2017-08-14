/// <reference path="../../../flash/display/Sprite.ts" />

namespace com.google.finance
{
	// import flash.display.Sprite;
	// import flash.utils.Dictionary;
	// import flash.utils.getDefinitionByName;
	// import com.google.finance.indicator.IndicatorLayer;
	// import com.google.finance.indicator.DependentIndicatorLayer;
	// import com.google.finance.indicator.VolumeDependentIndicatorLayer;
	// import com.google.finance.indicator.IndependentIndicatorLayer;

	export class DisplayManager extends flash.display.Sprite
	{
		private firstResize: boolean = true;
		private viewpoints: IViewPoint[] = [];
		private differentMarketSessionComparison: boolean;

		layersManager: com.google.finance.LayersManager;
		mainController: com.google.finance.Controller;
		spaceText: com.google.finance.SpaceText;
		topBorderLayer: com.google.finance.BorderLayer;
		
		constructor(public readonly mainManager: com.google.finance.MainManager)
		{
			super();
			if (mainManager)
				this.layersManager = mainManager.layersManager;
		}

		private computeRelativeTimesForPointsInIntervals(dataSource: DataSource) 
		{
			const points = dataSource.data.getPointsInIntervals();
			const units = dataSource.data.units;
			const map: { [key: string]: number } = {};
			for (let pointIndex in points)
			{
				const pointUnits = points[pointIndex];
				if (Number(pointIndex) === Intervals.FIVE_MINUTES && pointUnits[pointUnits.length - 1].dayMinute % 2 === 1)
					pointUnits.splice(pointUnits.length - 1, 1);

				map[pointIndex] = pointUnits.length - 1;
			}
			for (let unitIndex = units.length - 1; unitIndex >= 0; unitIndex--)				
			{
				for (let pointIndex in points)
				{
					const point = points[pointIndex];
					if (map[pointIndex] >= 0 && point[map[pointIndex]].time === units[unitIndex].time)
					{
						point[map[pointIndex]].relativeMinutes = units[unitIndex].relativeMinutes;
						map[pointIndex]--;
					}
					while (map[pointIndex] >= 0 && (point[map[pointIndex]].time > units[unitIndex].time || unitIndex === 0))
					{
						let session = notnull(dataSource.data.getSessionForMinute(point[map[pointIndex]].dayMinute));
						const _loc10_ = session.end - point[map[pointIndex]].dayMinute;
						if (_loc10_ < Number(pointIndex) / Const.SEC_PER_MINUTE)
						{
							if (point.length <= map[pointIndex] + 1)
							{
								point[map[pointIndex]].relativeMinutes = -_loc10_;
							}
							else
							{
								session = notnull(dataSource.data.getSessionForMinute(point[map[pointIndex] + 1].dayMinute));
								point[map[pointIndex]].relativeMinutes = point[map[pointIndex] + 1].relativeMinutes - (point[map[pointIndex] + 1].dayMinute - session.start) - 1 - _loc10_;
								if (session.start !== dataSource.data.marketOpenMinute)
									point[map[pointIndex]].relativeMinutes++;
							}
						}
						else
						{
							point[map[pointIndex]].relativeMinutes = point[map[pointIndex] + 1].relativeMinutes - (point[map[pointIndex] + 1].dayMinute - point[map[pointIndex]].dayMinute);
						}
						map[pointIndex]--;
					}
				}
			}
		}

		hasOhlcRequiredIndicator(): boolean
		{
			const layers = this.layersManager.config[com.google.finance.LayersManager.SINGLE].layers;
			for (let layerIndex = 0; layerIndex < layers.length; layerIndex++)
			{
				if (Const.OHLC_DEPENDENT_INDICATOR_NAMES.indexOf(layers[layerIndex].name) !== -1 && Boolean(layers[layerIndex].enabled))
					return true;
			}
			return false;
		}

		clearWeeklyXPos() 
		{
			if (Const.INDICATOR_ENABLED)
			{
				const _loc1_ = !this.layersManager ? null : this.layersManager.getFirstDataSource();
				const _loc2_ = !_loc1_ ? null : _loc1_.data.getPointsInIntervalArray(Const.WEEKLY_INTERVAL);
				if (_loc2_)
				{
					for (let unitIndex = 0; unitIndex < _loc2_.length; unitIndex++)
						_loc2_[unitIndex].weeklyXPos = NaN;
				}
			}
		}

		showContextualStaticInfo() 
		{
			for (let viewPointIndex = 0; viewPointIndex < this.viewpoints.length; viewPointIndex++)
				this.viewpoints[viewPointIndex].clearPointInformation();

			const contextualStaticInfo = this.layersManager.getContextualStaticInfo();
			this.spaceText.setContextualStaticInfo(contextualStaticInfo);
			this.resizeViewPoints(this.stage.stageWidth, this.stage.stageHeight);
		}

		init(param1: number, param2: number) 
		{
			this.mainController = new com.google.finance.Controller(this.mainManager, this);
			let _loc4_: SparklineViewPoint | null = null;
			if (Boolean(Const.SHOW_SPARKLINE))
			{
				_loc4_ = new SparklineViewPoint(this.mainManager.dataManager, this);
				_loc4_.my_minx = 0;
				_loc4_.my_miny = 0;
				_loc4_.my_maxx = param1;
				_loc4_.my_maxy = Const.SPARKLINE_HEIGHT + 1;
				_loc4_.name = Const.SPARKLINE_VIEW_POINT_NAME;
				this.addChild(_loc4_);
				this.viewpoints.push(_loc4_);
				_loc4_.setController(this.mainController);
				_loc4_.topBorder = Const.SPARK_PADDING - 1;
				_loc4_.drawBorders();
			}
			else
			{
				this.viewpoints.push(null!);	// TODO: really?
			}
			const _loc5_ = Utils.decodeObjects(com.google.finance.MainManager.paramsObj.single_viewpoints) as ViewPoint[];
			for (let _loc6_ = 0; _loc6_ < _loc5_.length; _loc6_++)
			{
				const _loc7_ = _loc5_[_loc6_];
				if (_loc7_.display !== "hidden")
					this.addViewPoint("ViewPoint", _loc7_.name, this.stage.stageWidth, Number(_loc7_.height), Number(_loc7_.topMargin), param1, param2);
			}
			this.spaceText = new com.google.finance.SpaceText(this);
			this.spaceText.y = 0;
			this.spaceText.x = 0;
			this.addChild(this.spaceText);
			if (Boolean(Const.SHOW_SPARKLINE))
			{
				this.topBorderLayer = new com.google.finance.BorderLayer(this, notnull(_loc4_));
				this.addChild(this.topBorderLayer);
			}
			this.resizeViewPoints(param1, param2);
			this.addChild(this.mainController);
			this.mainController.initEventListeners();
		}

		private positionAfterHoursTimes(param1: number, param2: number, param3: number, param4: number, dataSeries: DataSeries, param6?: DataUnit[] | null)
		{
			let _loc7_ = param3;
			for (let _loc8_ = param2; _loc8_ >= param1; _loc8_--)
			{
				const _loc9_ = dataSeries.units[_loc8_];
				_loc9_.relativeMinutes = _loc7_;
				if (param6)
					param6[_loc8_].relativeMinutes = _loc7_;

				_loc7_ -= param4;
			}
		}

		isIndicatorConfigEnabled(param1: string): boolean
		{
			const layers = this.layersManager.config[com.google.finance.LayersManager.SINGLE].layers;
			for (let layerIndex = 0; layerIndex < layers.length; layerIndex++)
			{
				if (layers[layerIndex].name === param1)
					return Boolean(layers[layerIndex].enabled);
			}
			return false;
		}

		getLayer(param1: string, param2: string, param3: DataSource): AbstractLayer<ViewPoint> | null
		{
			const _loc4_ = <ViewPoint>this.getViewPoint(param2);
			if (!_loc4_)
				return null;
			return _loc4_.getLayer(param1, param3);
		}

		makeBorderLayerTop() 
		{
			const viewPoint = this.getViewPoint(Const.SPARKLINE_VIEW_POINT_NAME);
			if (viewPoint)
			{
				this.addChildAt(viewPoint, this.numChildren - 1);
				this.addChildAt(this.topBorderLayer, this.numChildren - 1);
			}
		}

		removeAllLayers(param1: number) 
		{
			const _loc2_ = this.viewpoints[param1];
			_loc2_.removeAllLayers();
		}

		windowResized(param1: number, param2: number) 
		{
			const bounds = new Bounds(0, 0, param1, Const.SPARKLINE_HEIGHT + 1);
			const viewPoint = this.getViewPoint(Const.SPARKLINE_VIEW_POINT_NAME);
			if (viewPoint)
				viewPoint.setNewSize(bounds);
			const mainViewPoint = this.getMainViewPoint().count;
			this.resizeViewPoints(param1, param2);
			this.mainController.updateChartSizeChangeButtonPosition();
			if (this.firstResize)
			{
				this.firstResize = false;
				const firstDataSource = this.layersManager.getFirstDataSource();
				if (!firstDataSource)
					return;

				if (this.mainController.currentZoomLevel !== -1)
				{
					this.mainController.syncZoomLevel();
				}
				else
				{
					for (let viewPointIndex = 0; viewPointIndex < this.viewpoints.length; viewPointIndex++)
					{
						const _loc8_ = this.viewpoints[viewPointIndex];
						_loc8_.setNewCount(mainViewPoint);
					}
					this.update();
				}
			}
		}

		private updateViewPoint(param1: number) 
		{
			this.viewpoints[param1].update();
		}

		protected extractInterdayPoints(dataSeries: DataSeries): DataUnit[]
		{
			const _loc2_: DataUnit[] = [];
			const marketCloseMinute = dataSeries.marketCloseMinute;
			const units = dataSeries.units;
			for (let unitIndex = 0; unitIndex < units.length; unitIndex++)
			{
				const _loc6_ = units[unitIndex];
				_loc6_.relativeMinutes = NaN;
				if (_loc6_.dayMinute === marketCloseMinute)
					_loc2_.push(_loc6_);
			}
			return _loc2_;
		}

		animateToSelectedPin(param1: PinPoint) 
		{
			if (!param1)
				return;

			const firstDataSource = this.layersManager.getFirstDataSource();
			if (!firstDataSource)
				return;

			let _loc4_: number;
			
			const mainViewPoint = this.getMainViewPoint();
			if (Const.INDICATOR_ENABLED)
			{
				const enabledChartLayer = this.getEnabledChartLayer();
				let detailLevelForTechnicalStyle = mainViewPoint.getDetailLevelForTechnicalStyle();
				let detailLevelInterval = Const.getDetailLevelInterval(detailLevelForTechnicalStyle);
				_loc4_ = param1.getRelativeMinutes(detailLevelInterval);
				if (enabledChartLayer === Const.LINE_CHART)
				{
					while (isNaN(_loc4_) && detailLevelForTechnicalStyle < Intervals.WEEKLY)
					{
						detailLevelForTechnicalStyle++;
						detailLevelInterval = Const.getDetailLevelInterval(detailLevelForTechnicalStyle);
						if (firstDataSource.data.hasPointsInIntervalArray(detailLevelInterval))
						{
							_loc4_ = param1.getRelativeMinutes(detailLevelInterval);
							continue;
						}
						const _loc9_ = {
							"func": this.animateToSelectedPin,
							"param": [param1]
						};
						mainViewPoint.checkEvents(detailLevelForTechnicalStyle, [_loc9_]);
						return;
					}
				}
			}
			else
			{
				_loc4_ = param1.getRelativeMinutes();
			}

			let _loc5_: number;
			if (_loc4_ > mainViewPoint.getLastMinute())
			{
				_loc5_ = Number(_loc4_ + mainViewPoint.count / 3);
				if (_loc5_ > 0)
					_loc5_ = 0;
			}
			else if (_loc4_ <= mainViewPoint.getFirstMinute())
			{
				_loc5_ = Number(_loc4_ + mainViewPoint.count * 2 / 3);
				const oldestMinute = mainViewPoint.getOldestMinute();
				if (_loc5_ < oldestMinute)
					_loc5_ = Number(oldestMinute + mainViewPoint.count);
			}
			else
			{
				return;
			}
			this.mainController.animateTo(_loc5_, mainViewPoint.count, NaN, true);
		}

		removeLayer(param1: string, param2: string, param3?: DataSource) 
		{
			const _loc4_ = <ViewPoint>this.getViewPoint(param2);
			_loc4_.removeLayer(param1, param3);
		}

		enableIndicatorConfig(param1: string, param2 = true) 
		{
			const layers = this.layersManager.config[com.google.finance.LayersManager.SINGLE].layers;
			for (let layerIndex = 0; layerIndex < layers.length; layerIndex++)
			{
				if (layers[layerIndex].name === param1)
					layers[layerIndex].enabled = !!param2 ? "true" : "false";
			}
		}

		addLayer(param1: string, param2: string, param3: DataSource, param4: string): AbstractLayer<IViewPoint> | null
		{
			const viewPoint = this.getViewPoint(param2);
			if (viewPoint)
				return viewPoint.addLayer(param1, param3, param4);

			return null;
		}

		getViewPoint(param1: string): IViewPoint | null
		{
			const viewPointPos = this.getViewPointPos(param1);
			if (viewPointPos !== -1)
				return this.viewpoints[viewPointPos];

			return null;
		}

		getMainViewPoint(): ViewPoint
		{
			const viewPointPos = this.getViewPointPos(Const.MAIN_VIEW_POINT_NAME);
			if (viewPointPos === -1)
				throw new Error();

			return this.viewpoints[viewPointPos] as ViewPoint;
		}

		protected getComparedDataSeries(): DataSeries[]
		{
			const _loc1_: DataSeries[] = [];
			_loc1_.push(this.mainManager.dataManager.dataSources[this.mainManager.quote].data);
			const comparedTickers = this.layersManager.getComparedTickers();
			for (let tickerIndex = 0; tickerIndex < comparedTickers.length; tickerIndex++)
			{
				_loc1_.push(this.mainManager.dataManager.dataSources[comparedTickers[tickerIndex]].data);
			}
			return _loc1_;
		}

		getLayers(param1: string)
		{
			const viewPoint = notnull(this.getViewPoint(param1));
			return viewPoint.getLayers();
		}

		HTMLnotify(param1: string, param2 = false) 
		{
			if (param1 !== Const.MAIN_VIEW_POINT_NAME)
				return;

			const mainViewPoint = this.getMainViewPoint();
			const firstDataUnit = mainViewPoint.getFirstDataUnit();
			const lastDataUnit = mainViewPoint.getLastDataUnit();
			if (!firstDataUnit || !lastDataUnit)
				return;

			let firstDate = new Date(firstDataUnit.time);
			const lastDate = new Date(lastDataUnit.time);
			if (firstDate.getTime() >= lastDate.getTime())
				firstDate = new Date(lastDate.getTime() - Const.MS_PER_DAY);

			const firstDataSource = this.layersManager.getFirstDataSource();
			if (firstDataSource)
			{
				const numberOfDays = this.getNumberOfDaysForCount(mainViewPoint.count, mainViewPoint.lastMinute, firstDataSource);
				com.google.finance.MainManager.jsProxy.HTMLnotify(firstDate, lastDate, numberOfDays, mainViewPoint.count, param2);
				com.google.finance.MainManager.jsProxy.setForceDisplayExtendedHours(firstDataSource);
			}
		}

		private resizeViewPoints(param1: number, param2: number) 
		{
			let bounds = new Bounds(0, param2 - Const.SPARKLINE_HEIGHT, param1, param2);
			const viewPoint = this.getViewPoint(Const.SPARKLINE_VIEW_POINT_NAME);
			if (viewPoint)
				viewPoint.setNewSize(bounds);
			param2 = bounds.miny - Const.SPARK_PADDING;
			let _loc5_: number;
			for (_loc5_ = this.viewpoints.length - 1; _loc5_ >= 2; _loc5_--)
			{
				bounds = new Bounds(
					Const.BORDER_WIDTH,
					param2 - (this.viewpoints[_loc5_].maxy - this.viewpoints[_loc5_].miny),
					param1 - Const.BORDER_WIDTH,
					param2
				);
				this.viewpoints[_loc5_].setNewSize(bounds);
				param2 = bounds.miny - (<ViewPoint>this.viewpoints[_loc5_]).topMargin;
			}
			this.spaceText.setSize(param1, Const.SPACE_HEIGHT + (<ViewPoint>this.viewpoints[_loc5_]).topMargin);
			bounds = new Bounds(
				Const.BORDER_WIDTH,
				Const.SPACE_HEIGHT + Const.INFO_TEXT_TOP_PADDING + (<ViewPoint>this.viewpoints[_loc5_]).topMargin,
				param1 - Const.BORDER_WIDTH,
				param2
			);
			this.viewpoints[Const.MAIN_VIEW_POINT].setNewSize(bounds);
			this.viewpoints[Const.MAIN_VIEW_POINT].clearPointInformation();
			if (Boolean(Const.SHOW_SPARKLINE))
				this.topBorderLayer.update();
		}

		removeViewPoint(param1: string) 
		{
			const viewPointPos = this.getViewPointPos(param1);
			if (viewPointPos === -1)
				return;

			let vp = this.viewpoints[viewPointPos];
			if (!vp)
				return;

			this.mainController.removeControlListener(vp);
			this.removeChild(vp);
			this.viewpoints.splice(viewPointPos, 1);
		}

		update(param1 = false) 
		{
			this.clearWeeklyXPos();
			for (let viewPointIndex = 0; viewPointIndex < this.viewpoints.length; viewPointIndex++)
			{
				this.updateViewPoint(viewPointIndex);
			}
			if (param1)
				this.mainController.triggerMouseMoveAction();
			else
				this.showContextualStaticInfo();

			this.topBorderLayer.update();
		}

		addViewPoint(param1: string, param2: string, param3: number, param4: number, param5: number, param6: number, param7: number, param8?: IViewPoint): number
		{
			const _loc9_ = getDefinitionByName("com.google.finance." + param1) as typeof ViewPoint;
			const bounds = new Bounds(
				Const.BORDER_WIDTH,
				param7 - param4 + param5,
				param6 - Const.BORDER_WIDTH,
				param7
			);
			const _loc11_ = new _loc9_(this);
			this.addChild(_loc11_);
			_loc11_.name = param2;
			_loc11_.topMargin = param5;
			_loc11_.setNewSize(bounds);
			if (param8)
			{
				_loc11_.count = param8.count;
				_loc11_.lastMinute = param8.lastMinute;
			}
			this.viewpoints.push(_loc11_);
			_loc11_.setController(this.mainController);
			if (param8)
				_loc11_.setNewCount(param8.count);

			return this.viewpoints.length - 1;
		}

		setLastMinute(param1: number) 
		{
			for (let viewPointIndex = 0; viewPointIndex < this.viewpoints.length; viewPointIndex++)
			{
				const _loc3_ = this.viewpoints[viewPointIndex];
				_loc3_.lastMinute = param1;
			}
		}

		isDifferentMarketSessionComparison(): boolean
		{
			return this.differentMarketSessionComparison;
		}

		getNumberOfDaysForCount(param1: number, param2: number, param3: DataSource): number
		{
			if (this.differentMarketSessionComparison)
				return param1;

			const data = param3.data;
			const _loc5_ = param2 - param1;
			let _loc6_ = 0;
			let endOfDayDataUnit = param3.getEndOfDayDataUnitFor(param2);
			let minuteMetaIndex = DataSource.getMinuteMetaIndex(endOfDayDataUnit.relativeMinutes, data.days, data.units);
			if (endOfDayDataUnit.coveredDays > 0)
			{
				const _loc9_ = endOfDayDataUnit.relativeMinutes - param2;
				_loc6_ = Number(_loc6_ - Math.floor(_loc9_ / data.marketDayLength));
			}
			while (endOfDayDataUnit.relativeMinutes > _loc5_ && minuteMetaIndex > 0)
			{
				minuteMetaIndex--;
				if (minuteMetaIndex < 0)
					break;

				const relativeMinutes = data.units[data.days[minuteMetaIndex]].relativeMinutes;
				const endOfDayDataUnitFor = param3.getEndOfDayDataUnitFor(relativeMinutes);
				if (endOfDayDataUnitFor.relativeMinutes >= _loc5_)
				{
					if (endOfDayDataUnit.coveredDays === 0)
						_loc6_++;
					else
						_loc6_ = Number(_loc6_ + endOfDayDataUnit.coveredDays);
				}
				else if (endOfDayDataUnit.coveredDays > 0)
				{
					const _loc12_ = endOfDayDataUnit.relativeMinutes - _loc5_;
					_loc6_ = Number(_loc6_ + Math.floor(_loc12_ / data.marketDayLength));
				}
				endOfDayDataUnit = endOfDayDataUnitFor;
			}
			return _loc6_;
		}

		toggleAllAfterHoursSessions(param1: boolean, param2?: DataSource) 
		{
			let _loc3_: DataSource;
			if (param2)
			{
				_loc3_ = param2;
			}
			else
			{
				let dataSeries = this.layersManager.getFirstDataSource();
				if (!dataSeries)
					return;
				_loc3_ = dataSeries;
			}
			const _loc4_ = _loc3_.visibleExtendedHours.length();
			const _loc5_ = _loc3_.hiddenExtendedHours.length();
			if (param1 === true && _loc5_ > 0 || param1 === false && _loc4_ > 0)
			{
				const visibleExtendedHours = _loc3_.visibleExtendedHours;
				_loc3_.visibleExtendedHours = _loc3_.hiddenExtendedHours;
				_loc3_.hiddenExtendedHours = visibleExtendedHours;
			}
			this.computeRelativeTimes(_loc3_);
			_loc3_.computeObjectPositions();
			this.mainController.syncZoomLevel(true);
		}

		getViewPoints(): IViewPoint[]
		{
			return this.viewpoints;
		}

		private getViewPointPos(param1: string): number
		{
			for (let viewPointIndex = 0; viewPointIndex < this.viewpoints.length; viewPointIndex++)
			{
				if (this.viewpoints[viewPointIndex].name === param1)
					return viewPointIndex;
			}
			return -1;
		}

		computeRelativeTimes(dataSource: DataSource) 
		{
			if (this.differentMarketSessionComparison)
				return;

			dataSource.setRelativeMinutesState(DataSource.RELATIVE_MINUTES_READY);
			const data = dataSource.data;
			if (data.units.length === 0)
				return;

			const afterHoursData = dataSource.afterHoursData;
			const _loc4_ = !!Const.INDICATOR_ENABLED ? afterHoursData.getPointsInIntervalArray(Const.INTRADAY_INTERVAL) : null;
			dataSource.firstOpenRelativeMinutes = 0;
			let _loc5_: StartEndPair | null = null;
			let _loc6_ = dataSource.visibleExtendedHours.length() - 1;
			if (_loc6_ !== -1)
				_loc5_ = dataSource.visibleExtendedHours.getIntervalAt(_loc6_);

			const _loc7_ = data.units[data.units.length - 1];
			let session = notnull(data.getSessionForMinute(_loc7_.dayMinute));
			const intradayMinutesInterval = dataSource.intradayMinutesInterval;
			let _loc10_ = 0;
			for (let _loc12_ = data.units.length - 1; _loc12_ > 0; _loc12_--)
			{
				const _loc11_ = data.units[_loc12_];
				_loc11_.relativeMinutes = _loc10_;
				if (_loc11_.time >= Const.YEAR_2000 && _loc10_ < dataSource.firstOpenRelativeMinutes)
					dataSource.firstOpenRelativeMinutes = _loc10_;

				if (_loc11_.coveredDays > 0)
				{
					if (_loc12_ > 0)
					{
						const _loc13_ = _loc11_.time - data.units[_loc12_ - 1].time;
						const _loc14_ = Math.floor(_loc13_ / (Const.DAILY_INTERVAL * 1000));
						if (_loc11_.coveredDays > _loc14_)
							_loc11_.coveredDays = _loc14_;
					}
					if (_loc11_.coveredDays === 0)
						_loc10_ -= intradayMinutesInterval;
					else
						_loc10_ = _loc10_ - (data.marketDayLength + 1) * _loc11_.coveredDays;
				}
				else if (_loc11_.dayMinute === session.end && data.minuteIsEndOfDataSession(data.units[_loc12_ - 1].dayMinute))
				{
					_loc10_ = _loc10_ - (data.marketDayLength + 1);
				}
				else
				{
					const _loc15_ = _loc11_.dayMinute - session.start;
					if (_loc15_ >= 0 && _loc15_ < intradayMinutesInterval)
					{
						_loc10_ = _loc10_ - (_loc15_ + (session.start === data.marketOpenMinute ? 1 : 0));
						const _loc16_ = data.units[_loc12_ - 1].dayMinute;
						if (!isNaN(_loc16_))
							session = notnull(data.getSessionForMinute(_loc16_));
					}
					else if (_loc11_.dayMinute === session.end && _loc5_)
					{
						let start = _loc5_.start;
						let end = _loc5_.end;
						let _loc19_ = Number(afterHoursData.units[start].time);
						while (_loc11_.time <= _loc19_)
						{
							const _loc20_ = afterHoursData.units[end].dayMinute - afterHoursData.units[start].dayMinute;
							_loc11_.relativeMinutes = _loc11_.relativeMinutes - (_loc20_ + 1);
							this.positionAfterHoursTimes(start, end, _loc10_, intradayMinutesInterval, afterHoursData, _loc4_);
							_loc10_ = _loc10_ - (_loc20_ + 1);
							_loc6_--;
							_loc5_ = dataSource.visibleExtendedHours.getIntervalAt(_loc6_);
							if (_loc5_)
							{
								start = _loc5_.start;
								end = _loc5_.end;
								_loc19_ = Number(afterHoursData.units[start].time);
							}
							else
							{
								_loc19_ = -1;
							}
						}
						_loc10_ -= intradayMinutesInterval;
					}
					else
					{
						_loc10_ -= intradayMinutesInterval;
					}
				}
			}
			data.units[0].relativeMinutes = _loc10_;
			if (data.units[0].time >= Const.YEAR_2000 && _loc10_ < dataSource.firstOpenRelativeMinutes)
				dataSource.firstOpenRelativeMinutes = _loc10_;

			if (Const.INDICATOR_ENABLED)
				this.computeRelativeTimesForPointsInIntervals(dataSource);
		}

		enableIndicatorLayer(param1: string, param2: string, param3 = true) 
		{
			const viewPoint = this.getViewPoint(param2);
			if (viewPoint)
			{
				const layers = viewPoint.getLayers();
				for (let layerIndex = 0; layerIndex < layers.length; layerIndex++)
				{
					let layer = layers[layerIndex];
					if (layer instanceof google.finance.indicator.IndicatorLayer)
					{
						if (param1 === layer.getIndicatorName())
							layer.setEnabled(param3);
					}
				}
				this.update();
			}
		}

		setDifferentMarketSessionComparison(param1: boolean) 
		{
			this.differentMarketSessionComparison = param1;
		}

		setAfterHoursDisplay(param1: boolean, param2?: DataSource) 
		{
			let _loc3_: DataSource | null;
			if (param2)
			{
				_loc3_ = param2;
			}
			else
			{
				_loc3_ = this.layersManager.getFirstDataSource();
				if (!_loc3_)
					return;
			}
			const _loc4_ = _loc3_.visibleExtendedHours.length();
			const _loc5_ = _loc3_.hiddenExtendedHours.length();
			if (param1 === true && _loc4_ + _loc5_ === 0)
			{
				const event = EventFactory.getEvent(ChartEventStyles.GET_AH_DATA, _loc3_.quoteName, ChartEventPriorities.OPTIONAL);
				this.mainManager.dataManager.expectEvent(event);
				this.mainManager.dataManager.eventHandler(event);
			}
			else
			{
				const detailLevel = this.getDetailLevel();
				const _loc8_ = !!Const.INDICATOR_ENABLED ? this.getEnabledChartLayer() : "";
				const _loc9_ = detailLevel === Intervals.INTRADAY || _loc8_ === Const.LINE_CHART && detailLevel < Intervals.DAILY;
				if (_loc9_ && this.layersManager.getStyle() === com.google.finance.LayersManager.SINGLE)
				{
					this.toggleAllAfterHoursSessions(param1, _loc3_);
					if (_loc8_ === Const.CANDLE_STICK || _loc8_ === Const.OHLC_CHART)
					{
						const _loc10_ = _loc3_.data.marketDayLength + 1;
						const days = Const.INTERVAL_PERIODS[detailLevel].days;
						this.mainController.jumpTo(0, _loc10_ * days);
					}
					else
					{
						this.mainController.syncZoomLevel();
					}
				}
			}
		}

		protected setDiffMarketSessionRelativeMinutesState() 
		{
			this.mainManager.dataManager.dataSources[this.mainManager.quote].setRelativeMinutesState(DataSource.DMS_RELATIVE_MINUTES_READY);
			const comparedTickers = this.layersManager.getComparedTickers();
			for (let tickerIndex = 0; tickerIndex < comparedTickers.length; tickerIndex++)
				this.mainManager.dataManager.dataSources[comparedTickers[tickerIndex]].setRelativeMinutesState(DataSource.DMS_RELATIVE_MINUTES_READY);
		}

		setEnabledChartLayer(param1: string) 
		{
			const mainViewPoint = this.getMainViewPoint();
			const layers = mainViewPoint.getLayers();
			const _loc4_ = !!this.layersManager ? this.layersManager.getFirstDataSource() : null;
			for (let layerIndex = 0; layerIndex < layers.length; layerIndex++)
			{
				let layer = layers[layerIndex];
				if (layer instanceof IntervalBasedChartManagerLayer)
				{
					if (Boolean(com.google.finance.MainManager.paramsObj.displayExtendedHours))
					{
						if ((!_loc4_ || _loc4_.visibleExtendedHours.length() > 0) && param1 !== Const.LINE_CHART && layer.getEnabledLayerName() === Const.LINE_CHART)
							this.setAfterHoursDisplay(false);
					}
					layer.setEnabledLayer(param1);
					if (Boolean(com.google.finance.MainManager.paramsObj.displayExtendedHours))
					{
						if ((!_loc4_ || _loc4_.visibleExtendedHours.length() === 0) && Const.CHART_STYLE_NAMES.indexOf(param1) !== -1)
							this.setAfterHoursDisplay(true);
					}
				}
			}
			this.update();
		}

		computeRelativeTimesForDiffSessionComparison() 
		{
			this.setDiffMarketSessionRelativeMinutesState();
			const _loc1_: DataUnit[] = [];
			const comparedDataSeries = this.getComparedDataSeries();
			for (let seriesIndex = 0; seriesIndex < comparedDataSeries.length; seriesIndex++)
			{
				const _loc8_ = this.extractInterdayPoints(comparedDataSeries[seriesIndex]);
				for (let unitIndex = 0; unitIndex < _loc8_.length; unitIndex++)
					_loc1_.push(_loc8_[unitIndex]);
			}
			if (_loc1_.length === 0)
				return;

			_loc1_.sort(Utils.compareDataUnits);
			let _loc4_ = 0;
			const _loc5_ = _loc1_[_loc1_.length - 1];
			let date = new Date(_loc5_.exchangeDateInUTC.fullYearUTC, _loc5_.exchangeDateInUTC.monthUTC, _loc5_.exchangeDateInUTC.dateUTC);
			for (let _loc7_ = _loc1_.length - 1; _loc7_ >= 0; _loc7_--)
			{
				const _loc10_ = _loc1_[_loc7_];
				const exchangeDateInUTC = _loc10_.exchangeDateInUTC;
				if (exchangeDateInUTC.dateUTC !== date.date || exchangeDateInUTC.monthUTC !== date.month || exchangeDateInUTC.fullYearUTC !== date.fullYear)
				{
					const exchangeDate = new Date(exchangeDateInUTC.fullYearUTC, exchangeDateInUTC.monthUTC, exchangeDateInUTC.dateUTC);
					const _loc13_ = this.mainManager ? this.mainManager.weekdayBitmap : Const.DEFAULT_WEEKDAY_BITMAP;
					_loc4_ = _loc4_ - Utils.getWeekdaysDifference(exchangeDate, date, _loc13_);
					date = exchangeDate;
				}
				_loc10_.relativeMinutes = _loc4_;
			}

			for (let seriesIndex = 0; seriesIndex < comparedDataSeries.length; seriesIndex++)
			{
				const units = comparedDataSeries[seriesIndex].units;
				if (units.length !== 0)
				{
					let _loc14_ = 0;
					while (_loc14_ < units.length && isNaN(units[_loc14_].relativeMinutes))
						_loc14_++;

					if (_loc14_ !== units.length)
					{
						_loc4_ = units[_loc14_].relativeMinutes;
						for (let _loc9_ = _loc14_ + 1; _loc9_ < units.length; _loc9_++)
						{
							if (isNaN(units[_loc9_].relativeMinutes))
								units[_loc9_].relativeMinutes = _loc4_;
							else
								_loc4_ = units[_loc9_].relativeMinutes;

						}
					}
				}
			}
		}

		setIndicatorInstanceArray(param1: string, param2: any[]) 
		{
			const mainViewPoint = this.getMainViewPoint();
			const layers = mainViewPoint.getLayers();
			for (let layerIndex = 0; layerIndex < layers.length; layerIndex++)
			{
				let layer = layers[layerIndex];
				if (layer instanceof indicator.DependentIndicatorLayer)
				{
					if (param1 === layer.getIndicatorName())
						layer.setIndicatorInstanceArray(param2);
				}
			}
			const bottomViewPoint = this.getViewPoint(Const.BOTTOM_VIEW_POINT_NAME);
			if (bottomViewPoint)
			{
				const layers2 = bottomViewPoint.getLayers();

				for (let layerIndex = 0; layerIndex < layers2.length; layerIndex++)
				{
					let layer = layers2[layerIndex];
					if (layer instanceof indicator.VolumeDependentIndicatorLayer)
					{
						if (param1 === layer.getIndicatorName())
							layer.setIndicatorInstanceArray(param2);
					}
				}
			}
			const viewPoint = this.getViewPoint(param1);
			const _loc8_ = !viewPoint ? [] : viewPoint.getLayers();

			for (let layerIndex = 0; layerIndex < _loc8_.length; layerIndex++)
			{
				let layer = _loc8_[layerIndex];
				if (layer instanceof indicator.IndependentIndicatorLayer)
				{
					if (param1 === layer.getIndicatorName())
						layer.setIndicatorInstanceArray(param2);
				}
			}
			this.update();
		}

		getDetailLevel(): Intervals
		{
			const mainViewPoint = this.getMainViewPoint();
			const interval = !!Const.INDICATOR_ENABLED ? mainViewPoint.getDetailLevelForTechnicalStyle() : mainViewPoint.getDetailLevel();
			if (interval === -1)
			{
				const defaultDisplayDays = Const.getDefaultDisplayDays();
				const zoomLevel = Const.getZoomLevel(Const.MARKET_DAY_LENGTH * defaultDisplayDays, Const.MARKET_DAY_LENGTH);
				if (zoomLevel <= ScaleTypes.SCALE_1Y)
					return Intervals.WEEKLY;

				if (zoomLevel <= ScaleTypes.SCALE_1M)
					return Intervals.DAILY;

				return Intervals.INTRADAY;
			}
			return interval;
		}

		getEnabledChartLayer(): string
		{
			const mainViewPoint = this.getMainViewPoint();
			const layers = mainViewPoint.getLayers();
			for (let layerIndex = 0; layerIndex < layers.length; layerIndex++)
			{
				if (layers[layerIndex] instanceof IntervalBasedChartManagerLayer)
					return (<IntervalBasedChartManagerLayer>layers[layerIndex]).getEnabledLayerName();
			}
			const enabledChartLayerName = IntervalBasedChartManagerLayer.getEnabledChartLayerName();
			return enabledChartLayerName ? enabledChartLayerName : Const.DEFAULT_CHART_STYLE_NAME;
		}
	}
}
