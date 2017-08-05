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
		private firstResize: boolean;

		layersManager: com.google.finance.LayersManager;

		mainManager: MainManager;

		mainController: com.google.finance.Controller;

		private viewpoints: IViewPoint[];

		spaceText: com.google.finance.SpaceText;

		topBorderLayer: com.google.finance.BorderLayer;

		private differentMarketSessionComparison: boolean;

		constructor(param1: com.google.finance.MainManager)
		{
			super();
			this.viewpoints = [];
			this.mainManager = param1;
			this.firstResize = true;
			if (param1)
				this.layersManager = param1.layersManager;
		}

		private computeRelativeTimesForPointsInIntervals(dataSource: DataSource) 
		{
			let _loc2_ = dataSource.data.getPointsInIntervals();
			let _loc3_ = dataSource.data.units;
			let _loc4_: { [key: string]: number } = {};
			for (let _loc5_ in _loc2_)
			{
				let _loc7_ = _loc2_[_loc5_];
				if (Number(_loc5_) === Const.FIVE_MINUTES && _loc7_[_loc7_.length - 1].dayMinute % 2 === 1)
					_loc7_.splice(_loc7_.length - 1, 1);

				_loc4_[_loc5_] = _loc7_.length - 1;
			}
			let _loc6_ = _loc3_.length - 1;
			while (_loc6_ >= 0)
			{
				for (let _loc5_ in _loc2_)
				{
					let _loc8_ = _loc2_[_loc5_];
					if (_loc4_[_loc5_] >= 0 && _loc8_[_loc4_[_loc5_]].time === _loc3_[_loc6_].time)
					{
						_loc8_[_loc4_[_loc5_]].relativeMinutes = _loc3_[_loc6_].relativeMinutes;
						_loc4_[_loc5_]--;
					}
					while (_loc4_[_loc5_] >= 0 && (_loc8_[_loc4_[_loc5_]].time > _loc3_[_loc6_].time || _loc6_ === 0))
					{
						let _loc9_ = notnull(dataSource.data.getSessionForMinute(_loc8_[_loc4_[_loc5_]].dayMinute));
						let _loc10_ = _loc9_.end - _loc8_[_loc4_[_loc5_]].dayMinute;
						if (_loc10_ < Number(_loc5_) / Const.SEC_PER_MINUTE)
						{
							if (_loc8_.length <= _loc4_[_loc5_] + 1)
							{
								_loc8_[_loc4_[_loc5_]].relativeMinutes = -_loc10_;
							}
							else
							{
								_loc9_ = notnull(dataSource.data.getSessionForMinute(_loc8_[_loc4_[_loc5_] + 1].dayMinute));
								_loc8_[_loc4_[_loc5_]].relativeMinutes = _loc8_[_loc4_[_loc5_] + 1].relativeMinutes - (_loc8_[_loc4_[_loc5_] + 1].dayMinute - _loc9_.start) - 1 - _loc10_;
								if (_loc9_.start !== dataSource.data.marketOpenMinute)
									_loc8_[_loc4_[_loc5_]].relativeMinutes++;
							}
						}
						else
						{
							_loc8_[_loc4_[_loc5_]].relativeMinutes = _loc8_[_loc4_[_loc5_] + 1].relativeMinutes - (_loc8_[_loc4_[_loc5_] + 1].dayMinute - _loc8_[_loc4_[_loc5_]].dayMinute);
						}
						_loc4_[_loc5_]--;
					}
				}
				_loc6_--;
			}
		}

		hasOhlcRequiredIndicator(): boolean
		{
			let _loc1_ = this.layersManager.config[com.google.finance.LayersManager.SINGLE].layers;
			for (let _loc2_ = 0; _loc2_ < _loc1_.length; _loc2_++)
			{
				if (Const.OHLC_DEPENDENT_INDICATOR_NAMES.indexOf(_loc1_[_loc2_].name) !== -1 && _loc1_[_loc2_].enabled === "true")
					return true;
			}
			return false;
		}

		clearWeeklyXPos() 
		{
			if (Const.INDICATOR_ENABLED)
			{
				let _loc1_ = !this.layersManager ? null : this.layersManager.getFirstDataSource();
				let _loc2_ = !_loc1_ ? null : _loc1_.data.getPointsInIntervalArray(Const.WEEKLY_INTERVAL);
				if (_loc2_)
				{
					for (let _loc3_ = 0; _loc3_ < _loc2_.length; _loc3_++)
						_loc2_[_loc3_].weeklyXPos = NaN;
				}
			}
		}

		showContextualStaticInfo() 
		{
			for (let _loc1_ = 0; _loc1_ < this.viewpoints.length; _loc1_++)
			{
				let _loc3_ = this.viewpoints[_loc1_];
				_loc3_.clearPointInformation();
			}
			let _loc2_ = this.layersManager.getContextualStaticInfo();
			this.spaceText.setContextualStaticInfo(_loc2_);
			this.resizeViewPoints(this.stage.stageWidth, this.stage.stageHeight);
		}

		init(param1: number, param2: number) 
		{
			this.mainController = new com.google.finance.Controller(this.mainManager, this);
			let _loc4_: SparklineViewPoint | null = null;
			if (Const.SHOW_SPARKLINE === "true")
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
				this.viewpoints.push(null);
			}
			let _loc5_ = Utils.decodeObjects(com.google.finance.MainManager.paramsObj.single_viewpoints) as ViewPoint[];
			for (let _loc6_ = 0; _loc6_ < _loc5_.length; _loc6_++)
			{
				let _loc7_ = _loc5_[_loc6_];
				if (_loc7_.display !== "hidden")
					this.addViewPoint("ViewPoint", _loc7_.name, this.stage.stageWidth, Number(_loc7_.height), Number(_loc7_.topMargin), param1, param2);
			}
			this.spaceText = new com.google.finance.SpaceText(this);
			this.spaceText.y = 0;
			this.spaceText.x = 0;
			this.addChild(this.spaceText);
			if (Const.SHOW_SPARKLINE === "true")
			{
				this.topBorderLayer = new com.google.finance.BorderLayer(this, notnull(_loc4_));
				this.addChild(this.topBorderLayer);
			}
			this.resizeViewPoints(param1, param2);
			this.addChild(this.mainController);
			this.mainController.initEventListeners();
		}

		private positionAfterHoursTimes(param1: number, param2: number, param3: number, param4: number, param5: DataSeries, param6?: DataUnit[] | null)
		{
			let _loc7_ = param3;
			let _loc8_ = param2;
			while (_loc8_ >= param1)
			{
				let _loc9_ = param5.units[_loc8_];
				_loc9_.relativeMinutes = _loc7_;
				if (param6)
					param6[_loc8_].relativeMinutes = _loc7_;

				_loc7_ = _loc7_ - param4;
				_loc8_--;
			}
		}

		isIndicatorConfigEnabled(param1: string): boolean
		{
			let _loc2_ = this.layersManager.config[com.google.finance.LayersManager.SINGLE].layers;
			for (let _loc3_ = 0; _loc3_ < _loc2_.length; _loc3_++)
			{
				if (_loc2_[_loc3_].name === param1)
					return _loc2_[_loc3_].enabled === "true";
			}
			return false;
		}

		getLayer(param1: string, param2: string, param3: DataSource): AbstractLayer<ViewPoint> | null
		{
			let _loc4_ = <ViewPoint>this.getViewPoint(param2);
			if (!_loc4_)
				return null;
			return _loc4_.getLayer(param1, param3);
		}

		makeBorderLayerTop() 
		{
			let _loc1_ = this.getViewPoint(Const.SPARKLINE_VIEW_POINT_NAME);
			if (_loc1_)
			{
				this.addChildAt(_loc1_, this.numChildren - 1);
				this.addChildAt(this.topBorderLayer, this.numChildren - 1);
			}
		}

		removeAllLayers(param1: number) 
		{
			let _loc2_ = this.viewpoints[param1];
			_loc2_.removeAllLayers();
		}

		windowResized(param1: number, param2: number) 
		{
			let _loc7_ = 0;
			let _loc3_ = new Bounds(0, 0, param1, Const.SPARKLINE_HEIGHT + 1);
			let _loc4_ = this.getViewPoint(Const.SPARKLINE_VIEW_POINT_NAME);
			if (_loc4_)
				_loc4_.setNewSize(_loc3_);
			let _loc5_ = this.getMainViewPoint().count;
			this.resizeViewPoints(param1, param2);
			this.mainController.updateChartSizeChangeButtonPosition();
			if (this.firstResize)
			{
				this.firstResize = false;
				let _loc6_ = this.layersManager.getFirstDataSource();
				if (!_loc6_)
					return;

				if (this.mainController.currentZoomLevel !== -1)
				{
					this.mainController.syncZoomLevel();
				}
				else
				{
					_loc7_ = 0;
					while (_loc7_ < this.viewpoints.length)
					{
						let _loc8_ = this.viewpoints[_loc7_];
						_loc8_.setNewCount(_loc5_);
						_loc7_++;
					}
					this.update();
				}
			}
		}

		private updateViewPoint(param1: number) 
		{
			this.viewpoints[param1].update();
		}

		protected extractInterdayPoints(param1: DataSeries): DataUnit[]
		{
			let _loc2_: DataUnit[] = [];
			let _loc3_ = param1.marketCloseMinute;
			let _loc4_ = param1.units;
			for (let _loc5_ = 0; _loc5_ < _loc4_.length; _loc5_++)
			{
				let _loc6_ = _loc4_[_loc5_];
				_loc6_.relativeMinutes = NaN;
				if (_loc6_.dayMinute === _loc3_)
					_loc2_.push(_loc6_);
			}
			return _loc2_;
		}

		animateToSelectedPin(param1: PinPoint) 
		{
			let _loc4_ = NaN;
			let _loc5_ = NaN;
			let _loc7_ = 0;
			let _loc8_ = 0;
			let _loc10_ = NaN;
			if (!param1)
				return;

			let _loc2_ = this.layersManager.getFirstDataSource();
			if (!_loc2_)
				return;

			let _loc3_ = this.getMainViewPoint();
			if (Const.INDICATOR_ENABLED)
			{
				let _loc6_ = this.getEnabledChartLayer();
				_loc7_ = _loc3_.getDetailLevelForTechnicalStyle();
				_loc8_ = Const.getDetailLevelInterval(_loc7_);
				_loc4_ = param1.getRelativeMinutes(_loc8_);
				if (_loc6_ === Const.LINE_CHART)
				{
					while (isNaN(_loc4_) && _loc7_ < Const.WEEKLY)
					{
						_loc7_++;
						_loc8_ = Const.getDetailLevelInterval(_loc7_);
						if (_loc2_.data.hasPointsInIntervalArray(_loc8_))
						{
							_loc4_ = param1.getRelativeMinutes(_loc8_);
							continue;
						}
						let _loc9_ = {
							"func": this.animateToSelectedPin,
							"param": [param1]
						};
						_loc3_.checkEvents(_loc7_, [_loc9_]);
						return;
					}
				}
			}
			else
			{
				_loc4_ = param1.getRelativeMinutes();
			}
			if (_loc4_ > _loc3_.getLastMinute())
			{
				_loc5_ = Number(_loc4_ + _loc3_.count / 3);
				if (_loc5_ > 0)
					_loc5_ = 0;
			}
			else if (_loc4_ <= _loc3_.getFirstMinute())
			{
				_loc5_ = Number(_loc4_ + _loc3_.count * 2 / 3);
				_loc10_ = _loc3_.getOldestMinute();
				if (_loc5_ < _loc10_)
					_loc5_ = Number(_loc10_ + _loc3_.count);
			}
			else
			{
				return;
			}
			this.mainController.animateTo(_loc5_, _loc3_.count, NaN, true);
		}

		removeLayer(param1: string, param2: string, param3?: DataSource) 
		{
			let _loc4_ = <ViewPoint>this.getViewPoint(param2);
			_loc4_.removeLayer(param1, param3);
		}

		enableIndicatorConfig(param1: string, param2 = true) 
		{
			let _loc3_ = this.layersManager.config[com.google.finance.LayersManager.SINGLE].layers;
			for (let _loc4_ = 0; _loc4_ < _loc3_.length; _loc4_++)
			{
				if (_loc3_[_loc4_].name === param1)
					_loc3_[_loc4_].enabled = !!param2 ? "true" : "false";
			}
		}

		addLayer(param1: string, param2: string, param3: DataSource, param4: string): AbstractLayer<IViewPoint> | null
		{
			let _loc5_ = this.getViewPoint(param2);
			if (_loc5_)
				return _loc5_.addLayer(param1, param3, param4);

			return null;
		}

		getViewPoint(param1: string): IViewPoint | null
		{
			let _loc2_ = this.getViewPointPos(param1);
			if (_loc2_ !== -1)
				return this.viewpoints[_loc2_];

			return null;
		}

		getMainViewPoint(): ViewPoint
		{
			let _loc2_ = this.getViewPointPos(Const.MAIN_VIEW_POINT_NAME);
			if (_loc2_ === -1)
				throw new Error();

			return this.viewpoints[_loc2_] as ViewPoint;
		}

		protected getComparedDataSeries(): DataSeries[]
		{
			let _loc1_: DataSeries[] = [];
			_loc1_.push(this.mainManager.dataManager.dataSources[this.mainManager.quote].data);
			let _loc2_ = this.layersManager.getComparedTickers();
			for (let _loc3_ = 0; _loc3_ < _loc2_.length; _loc3_++)
			{
				_loc1_.push(this.mainManager.dataManager.dataSources[_loc2_[_loc3_]].data);
			}
			return _loc1_;
		}

		getLayers(param1: string)
		{
			let _loc2_ = notnull(this.getViewPoint(param1));
			return _loc2_.getLayers();
		}

		HTMLnotify(param1: string, param2 = false) 
		{
			if (param1 !== Const.MAIN_VIEW_POINT_NAME)
				return;

			let _loc3_ = this.getMainViewPoint();
			let _loc4_ = _loc3_.getFirstDataUnit();
			let _loc5_ = _loc3_.getLastDataUnit();
			if (!_loc4_ || !_loc5_)
				return;

			let _loc6_ = new Date(_loc4_.time);
			let _loc7_ = new Date(_loc5_.time);
			if (_loc6_.getTime() >= _loc7_.getTime())
				_loc6_ = new Date(_loc7_.getTime() - Const.MS_PER_DAY);

			let _loc8_ = this.layersManager.getFirstDataSource();
			if (_loc8_)
			{
				let _loc9_ = this.getNumberOfDaysForCount(_loc3_.count, _loc3_.lastMinute, _loc8_);
				com.google.finance.MainManager.jsProxy.HTMLnotify(_loc6_, _loc7_, _loc9_, _loc3_.count, param2);
				com.google.finance.MainManager.jsProxy.setForceDisplayExtendedHours(_loc8_);
			}
		}

		private resizeViewPoints(param1: number, param2: number) 
		{
			let _loc5_ = 0;
			let _loc3_ = new Bounds(0, param2 - Const.SPARKLINE_HEIGHT, param1, param2);
			let _loc4_ = this.getViewPoint(Const.SPARKLINE_VIEW_POINT_NAME);
			if (_loc4_)
				_loc4_.setNewSize(_loc3_);
			param2 = _loc3_.miny - Const.SPARK_PADDING;
			_loc5_ = this.viewpoints.length - 1;
			while (_loc5_ >= 2)
			{
				_loc3_ = new Bounds(
					Const.BORDER_WIDTH,
					param2 - (this.viewpoints[_loc5_].maxy - this.viewpoints[_loc5_].miny),
					param1 - Const.BORDER_WIDTH,
					param2
				);
				this.viewpoints[_loc5_].setNewSize(_loc3_);
				param2 = _loc3_.miny - (<ViewPoint>this.viewpoints[_loc5_]).topMargin;
				_loc5_--;
			}
			this.spaceText.setSize(param1, Const.SPACE_HEIGHT + (<ViewPoint>this.viewpoints[_loc5_]).topMargin);
			_loc3_ = new Bounds(
				Const.BORDER_WIDTH,
				Const.SPACE_HEIGHT + Const.INFO_TEXT_TOP_PADDING + (<ViewPoint>this.viewpoints[_loc5_]).topMargin,
				param1 - Const.BORDER_WIDTH,
				param2
			);
			this.viewpoints[Const.MAIN_VIEW_POINT].setNewSize(_loc3_);
			this.viewpoints[Const.MAIN_VIEW_POINT].clearPointInformation();
			if (Const.SHOW_SPARKLINE === "true")
				this.topBorderLayer.update();
		}

		removeViewPoint(param1: string) 
		{
			let _loc2_ = this.getViewPointPos(param1);
			if (_loc2_ === -1)
				return;

			var vp = this.viewpoints[_loc2_];
			if (!vp)
				return;

			this.mainController.removeControlListener(vp);
			this.removeChild(vp);
			this.viewpoints.splice(_loc2_, 1);
		}

		update(param1 = false) 
		{
			this.clearWeeklyXPos();
			for (let _loc2_ = 0; _loc2_ < this.viewpoints.length; _loc2_++)
			{
				this.updateViewPoint(_loc2_);
			}
			if (param1)
				this.mainController.triggerMouseMoveAction();
			else
				this.showContextualStaticInfo();

			this.topBorderLayer.update();
		}

		addViewPoint(param1: string, param2: string, param3: number, param4: number, param5: number, param6: number, param7: number, param8?: IViewPoint): number
		{
			let _loc9_ = getDefinitionByName("com.google.finance." + param1) as typeof ViewPoint;
			let _loc10_ = new Bounds(
				Const.BORDER_WIDTH,
				param7 - param4 + param5,
				param6 - Const.BORDER_WIDTH,
				param7
			);
			let _loc11_ = new _loc9_(this);
			this.addChild(_loc11_);
			_loc11_.name = param2;
			_loc11_.topMargin = param5;
			_loc11_.setNewSize(_loc10_);
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
			for (let _loc2_ = 0; _loc2_ < this.viewpoints.length; _loc2_++)
			{
				let _loc3_ = this.viewpoints[_loc2_];
				_loc3_.lastMinute = param1;
			}
		}

		isDifferentMarketSessionComparison(): boolean
		{
			return this.differentMarketSessionComparison;
		}

		getNumberOfDaysForCount(param1: number, param2: number, param3: DataSource): number
		{
			let _loc9_ = NaN;
			let _loc10_ = NaN;
			let _loc12_ = NaN;
			if (this.differentMarketSessionComparison)
				return param1;

			let _loc4_ = param3.data;
			let _loc5_ = param2 - param1;
			let _loc6_ = 0;
			let _loc7_ = param3.getEndOfDayDataUnitFor(param2);
			let _loc8_ = DataSource.getMinuteMetaIndex(_loc7_.relativeMinutes, _loc4_.days, _loc4_.units);
			if (_loc7_.coveredDays > 0)
			{
				_loc9_ = _loc7_.relativeMinutes - param2;
				_loc6_ = Number(_loc6_ - Math.floor(_loc9_ / _loc4_.marketDayLength));
			}
			while (_loc7_.relativeMinutes > _loc5_ && _loc8_ > 0)
			{
				_loc8_--;
				if (_loc8_ < 0)
					break;

				_loc10_ = _loc4_.units[_loc4_.days[_loc8_]].relativeMinutes;
				let _loc11_ = param3.getEndOfDayDataUnitFor(_loc10_);
				if (_loc11_.relativeMinutes >= _loc5_)
				{
					if (_loc7_.coveredDays === 0)
						_loc6_++;
					else
						_loc6_ = Number(_loc6_ + _loc7_.coveredDays);
				}
				else if (_loc7_.coveredDays > 0)
				{
					_loc12_ = _loc7_.relativeMinutes - _loc5_;
					_loc6_ = Number(_loc6_ + Math.floor(_loc12_ / _loc4_.marketDayLength));
				}
				_loc7_ = _loc11_;
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
				var dataSeries = this.layersManager.getFirstDataSource();
				if (!dataSeries)
					return;
				_loc3_ = dataSeries;
			}
			let _loc4_ = _loc3_.visibleExtendedHours.length();
			let _loc5_ = _loc3_.hiddenExtendedHours.length();
			if (param1 === true && _loc5_ > 0 || param1 === false && _loc4_ > 0)
			{
				let _loc6_ = _loc3_.visibleExtendedHours;
				_loc3_.visibleExtendedHours = _loc3_.hiddenExtendedHours;
				_loc3_.hiddenExtendedHours = _loc6_;
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
			for (let _loc2_ = 0; _loc2_ < this.viewpoints.length; _loc2_++)
			{
				if (this.viewpoints[_loc2_].name === param1)
					return _loc2_;
			}
			return -1;
		}

		computeRelativeTimes(dataSource: DataSource) 
		{
			let _loc13_ = NaN;
			let _loc14_ = 0;
			let _loc15_ = NaN;
			let _loc16_ = NaN;
			let _loc17_ = NaN;
			let _loc18_ = NaN;
			let _loc19_ = NaN;
			let _loc20_ = NaN;
			if (this.differentMarketSessionComparison)
				return;

			dataSource.setRelativeMinutesState(DataSource.RELATIVE_MINUTES_READY);
			let _loc2_ = dataSource.data;
			if (_loc2_.units.length === 0)
				return;

			let _loc3_ = dataSource.afterHoursData;
			let _loc4_ = !!Const.INDICATOR_ENABLED ? _loc3_.getPointsInIntervalArray(Const.INTRADAY_INTERVAL) : null;
			dataSource.firstOpenRelativeMinutes = 0;
			let _loc5_: StartEndPair | null = null;
			let _loc6_ = dataSource.visibleExtendedHours.length() - 1;
			if (_loc6_ !== -1)
				_loc5_ = dataSource.visibleExtendedHours.method_1(_loc6_);

			let _loc7_ = _loc2_.units[_loc2_.units.length - 1];
			let _loc8_ = notnull(_loc2_.getSessionForMinute(_loc7_.dayMinute));
			let _loc9_ = dataSource.intradayMinutesInterval;
			let _loc10_ = 0;
			let _loc12_ = _loc2_.units.length - 1;
			while (_loc12_ > 0)
			{
				let _loc11_ = _loc2_.units[_loc12_];
				_loc11_.relativeMinutes = _loc10_;
				if (_loc11_.time >= Const.YEAR_2000 && _loc10_ < dataSource.firstOpenRelativeMinutes)
					dataSource.firstOpenRelativeMinutes = _loc10_;

				if (_loc11_.coveredDays > 0)
				{
					if (_loc12_ > 0)
					{
						_loc13_ = _loc11_.time - _loc2_.units[_loc12_ - 1].time;
						_loc14_ = Math.floor(_loc13_ / (Const.DAILY_INTERVAL * 1000));
						if (_loc11_.coveredDays > _loc14_)
							_loc11_.coveredDays = _loc14_;
					}
					if (_loc11_.coveredDays === 0)
						_loc10_ = _loc10_ - _loc9_;
					else
						_loc10_ = _loc10_ - (_loc2_.marketDayLength + 1) * _loc11_.coveredDays;
				}
				else if (_loc11_.dayMinute === _loc8_.end && _loc2_.minuteIsEndOfDataSession(_loc2_.units[_loc12_ - 1].dayMinute))
				{
					_loc10_ = _loc10_ - (_loc2_.marketDayLength + 1);
				}
				else
				{
					_loc15_ = _loc11_.dayMinute - _loc8_.start;
					if (_loc15_ >= 0 && _loc15_ < _loc9_)
					{
						_loc10_ = _loc10_ - (_loc15_ + (_loc8_.start === _loc2_.marketOpenMinute ? 1 : 0));
						_loc16_ = _loc2_.units[_loc12_ - 1].dayMinute;
						if (!isNaN(_loc16_))
							_loc8_ = notnull(_loc2_.getSessionForMinute(_loc16_));
					}
					else if (_loc11_.dayMinute === _loc8_.end && _loc5_)
					{
						_loc17_ = _loc5_.start;
						_loc18_ = _loc5_.end;
						_loc19_ = Number(_loc3_.units[_loc17_].time);
						while (_loc11_.time <= _loc19_)
						{
							_loc20_ = _loc3_.units[_loc18_].dayMinute - _loc3_.units[_loc17_].dayMinute;
							_loc11_.relativeMinutes = _loc11_.relativeMinutes - (_loc20_ + 1);
							this.positionAfterHoursTimes(_loc17_, _loc18_, _loc10_, _loc9_, _loc3_, _loc4_);
							_loc10_ = _loc10_ - (_loc20_ + 1);
							_loc6_--;
							_loc5_ = dataSource.visibleExtendedHours.method_1(_loc6_);
							if (_loc5_)
							{
								_loc17_ = _loc5_.start;
								_loc18_ = _loc5_.end;
								_loc19_ = Number(_loc3_.units[_loc17_].time);
							}
							else
							{
								_loc19_ = -1;
							}
						}
						_loc10_ = _loc10_ - _loc9_;
					}
					else
					{
						_loc10_ = _loc10_ - _loc9_;
					}
				}
				_loc12_--;
			}
			_loc2_.units[0].relativeMinutes = _loc10_;
			if (_loc2_.units[0].time >= Const.YEAR_2000 && _loc10_ < dataSource.firstOpenRelativeMinutes)
				dataSource.firstOpenRelativeMinutes = _loc10_;

			if (Const.INDICATOR_ENABLED)
				this.computeRelativeTimesForPointsInIntervals(dataSource);
		}

		enableIndicatorLayer(param1: string, param2: string, param3 = true) 
		{
			let _loc6_ = 0;
			let _loc4_ = this.getViewPoint(param2);
			if (_loc4_)
			{
				let _loc5_ = _loc4_.getLayers();
				_loc6_ = 0;
				while (_loc6_ < _loc5_.length)
				{
					let layer = _loc5_[_loc6_];
					if (layer instanceof google.finance.indicator.IndicatorLayer)
					{
						if (param1 === layer.getIndicatorName())
							layer.setEnabled(param3);
					}
					_loc6_++;
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
			let _loc6_: ChartEvent;
			let _loc7_ = NaN;
			let _loc8_: string;
			let _loc9_ = false;
			let _loc10_ = NaN;
			let _loc11_ = 0;
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
			let _loc4_ = _loc3_.visibleExtendedHours.length();
			let _loc5_ = _loc3_.hiddenExtendedHours.length();
			if (param1 === true && _loc4_ + _loc5_ === 0)
			{
				let _loc6_ = EventFactory.getEvent(Const.GET_AH_DATA, _loc3_.quoteName, ChartEventTypes.OPTIONAL);
				this.mainManager.dataManager.expectEvent(_loc6_);
				this.mainManager.dataManager.eventHandler(_loc6_);
			}
			else
			{
				_loc7_ = this.getDetailLevel();
				_loc8_ = !!Const.INDICATOR_ENABLED ? this.getEnabledChartLayer() : "";
				_loc9_ = _loc7_ === Const.INTRADAY || _loc8_ === Const.LINE_CHART && _loc7_ < Const.DAILY;
				if (_loc9_ && this.layersManager.getStyle() === com.google.finance.LayersManager.SINGLE)
				{
					this.toggleAllAfterHoursSessions(param1, _loc3_);
					if (_loc8_ === Const.CANDLE_STICK || _loc8_ === Const.OHLC_CHART)
					{
						_loc10_ = _loc3_.data.marketDayLength + 1;
						_loc11_ = Const.INTERVAL_PERIODS[_loc7_].days;
						this.mainController.jumpTo(0, _loc10_ * _loc11_);
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
			let _loc1_ = this.layersManager.getComparedTickers();
			for (let _loc2_ = 0; _loc2_ < _loc1_.length; _loc2_++)
			{
				this.mainManager.dataManager.dataSources[_loc1_[_loc2_]].setRelativeMinutesState(DataSource.DMS_RELATIVE_MINUTES_READY);
			}
		}

		setEnabledChartLayer(param1: string) 
		{
			let _loc2_ = this.getMainViewPoint();
			let _loc3_ = _loc2_.getLayers();
			let _loc4_ = !!this.layersManager ? this.layersManager.getFirstDataSource() : null;
			for (let _loc5_ = 0; _loc5_ < _loc3_.length; _loc5_++)
			{
				let layer = _loc3_[_loc5_];
				if (layer instanceof IntervalBasedChartManagerLayer)
				{
					if (com.google.finance.MainManager.paramsObj.displayExtendedHours === "true")
					{
						if ((!_loc4_ || _loc4_.visibleExtendedHours.length() > 0) && param1 !== Const.LINE_CHART && layer.getEnabledLayerName() === Const.LINE_CHART)
							this.setAfterHoursDisplay(false);
					}
					layer.setEnabledLayer(param1);
					if (com.google.finance.MainManager.paramsObj.displayExtendedHours === "true")
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
			let _loc9_ = 0;
			this.setDiffMarketSessionRelativeMinutesState();
			let _loc1_: DataUnit[] = [];
			let _loc2_ = this.getComparedDataSeries();
			for (let _loc3_ = 0; _loc3_ < _loc2_.length; _loc3_++)
			{
				let _loc8_ = this.extractInterdayPoints(_loc2_[_loc3_]);
				_loc9_ = 0;
				while (_loc9_ < _loc8_.length)
				{
					_loc1_.push(_loc8_[_loc9_]);
					_loc9_++;
				}
			}
			if (_loc1_.length === 0)
				return;

			_loc1_.sort(Utils.compareDataUnits);
			let _loc4_ = 0;
			let _loc5_ = _loc1_[_loc1_.length - 1];
			let _loc6_ = new Date(_loc5_.exchangeDateInUTC.fullYearUTC, _loc5_.exchangeDateInUTC.monthUTC, _loc5_.exchangeDateInUTC.dateUTC);
			let _loc7_ = _loc1_.length - 1;
			while (_loc7_ >= 0)
			{
				let _loc10_ = _loc1_[_loc7_];
				let _loc11_ = _loc10_.exchangeDateInUTC;
				if (_loc11_.dateUTC !== _loc6_.date || _loc11_.monthUTC !== _loc6_.month || _loc11_.fullYearUTC !== _loc6_.fullYear)
				{
					let _loc12_ = new Date(_loc11_.fullYearUTC, _loc11_.monthUTC, _loc11_.dateUTC);
					let _loc13_ = this.mainManager ? this.mainManager.weekdayBitmap : Const.DEFAULT_WEEKDAY_BITMAP;
					_loc4_ = _loc4_ - Utils.getWeekdaysDifference(_loc12_, _loc6_, _loc13_);
					_loc6_ = _loc12_;
				}
				_loc10_.relativeMinutes = _loc4_;
				_loc7_--;
			}

			for (let _loc3_ = 0; _loc3_ < _loc2_.length; _loc3_++)
			{
				let _loc8_ = _loc2_[_loc3_].units;
				if (_loc8_.length !== 0)
				{
					let _loc14_ = 0;
					while (_loc14_ < _loc8_.length && isNaN(_loc8_[_loc14_].relativeMinutes))
					{
						_loc14_++;
					}
					if (_loc14_ !== _loc8_.length)
					{
						_loc4_ = _loc8_[_loc14_].relativeMinutes;
						_loc9_ = _loc14_ + 1;
						while (_loc9_ < _loc8_.length)
						{
							if (isNaN(_loc8_[_loc9_].relativeMinutes))
								_loc8_[_loc9_].relativeMinutes = _loc4_;
							else
								_loc4_ = _loc8_[_loc9_].relativeMinutes;

							_loc9_++;
						}
					}
				}
			}
		}

		setIndicatorInstanceArray(param1: string, param2: any[]) 
		{
			let _loc3_ = this.getMainViewPoint();
			let _loc4_ = _loc3_.getLayers();
			for (let _loc5_ = 0; _loc5_ < _loc4_.length; _loc5_++)
			{
				let layer = _loc4_[_loc5_];
				if (layer instanceof indicator.DependentIndicatorLayer)
				{
					if (param1 === layer.getIndicatorName())
						layer.setIndicatorInstanceArray(param2);
				}
			}
			let _loc6_ = this.getViewPoint(Const.BOTTOM_VIEW_POINT_NAME);
			if (_loc6_)
			{
				let _loc9_ = _loc6_.getLayers();

				for (let _loc5_ = 0; _loc5_ < _loc9_.length; _loc5_++)
				{
					let layer = _loc9_[_loc5_];
					if (layer instanceof indicator.VolumeDependentIndicatorLayer)
					{
						if (param1 === layer.getIndicatorName())
							layer.setIndicatorInstanceArray(param2);
					}
				}
			}
			let _loc7_ = this.getViewPoint(param1);
			let _loc8_ = !_loc7_ ? [] : _loc7_.getLayers();

			for (let _loc5_ = 0; _loc5_ < _loc8_.length; _loc5_++)
			{
				let layer = _loc8_[_loc5_];
				if (layer instanceof indicator.IndependentIndicatorLayer)
				{
					if (param1 === layer.getIndicatorName())
						layer.setIndicatorInstanceArray(param2);
				}
			}
			this.update();
		}

		getDetailLevel(): number
		{
			let _loc3_ = NaN;
			let _loc4_ = NaN;
			let _loc1_ = this.getMainViewPoint();
			let _loc2_ = !!Const.INDICATOR_ENABLED ? Number(_loc1_.getDetailLevelForTechnicalStyle()) : _loc1_.getDetailLevel();
			if (_loc2_ === -1)
			{
				_loc3_ = Const.getDefaultDisplayDays();
				_loc4_ = Const.getZoomLevel(Const.MARKET_DAY_LENGTH * _loc3_, Const.MARKET_DAY_LENGTH);
				if (_loc4_ <= Const.SCALE_1Y)
					return Const.WEEKLY;

				if (_loc4_ <= Const.SCALE_1M)
					return Const.DAILY;

				return Const.INTRADAY;
			}
			return _loc2_;
		}

		getEnabledChartLayer(): string
		{
			let _loc1_ = this.getMainViewPoint();
			let _loc2_ = _loc1_.getLayers();
			for (let _loc3_ = 0; _loc3_ < _loc2_.length; _loc3_++)
			{
				if (_loc2_[_loc3_] instanceof IntervalBasedChartManagerLayer)
					return (<IntervalBasedChartManagerLayer>_loc2_[_loc3_]).getEnabledLayerName();
			}
			let _loc4_ = IntervalBasedChartManagerLayer.getEnabledChartLayerName();
			return _loc4_ ? _loc4_ : Const.DEFAULT_CHART_STYLE_NAME;
		}
	}
}
