namespace com.google.finance
{
	// import com.google.finance.indicator.AbstractStochasticIndicatorLayer;
	// import com.google.finance.indicator.BIASIndicatorLayer;
	// import com.google.finance.indicator.BollingerBandsIndicatorLayer;
	// import com.google.finance.indicator.CCIIndicatorLayer;
	// import com.google.finance.indicator.EMAIndicatorLayer;
	// import com.google.finance.indicator.FastStochasticIndicatorLayer;
	// import com.google.finance.indicator.KDJIndicatorLayer;
	// import com.google.finance.indicator.MACDIndicatorLayer;
	// import com.google.finance.indicator.RSIIndicatorLayer;
	// import com.google.finance.indicator.SMAIndicatorLayer;
	// import com.google.finance.indicator.SlowStochasticIndicatorLayer;
	// import com.google.finance.indicator.VMAIndicatorLayer;
	// import com.google.finance.indicator.VolumeDependentIndicatorLayer;
	// import com.google.finance.indicator.WilliamsPercentRIndicatorLayer;

	export class LayerInfo
	{
		name: string;
		arity: string;
		type: string;
		vp: string;
		ds: DataSource;
		layer: AbstractLayer<IViewPoint>;
		id: string;
	}

	export class LayerConfig
	{
		layers: any[];
		viewpoints: ViewPoint[];
		hiddenViewpoints: ViewPoint[];
		lastMinute: number;
	}

	export class LayersManager
	{
		static readonly NO_DATA_AVAILABLE_LAYER = "NoDataAvailableLayer";

		static readonly PERCENT = "percent";

		static readonly SINGLE = "single";

		static readonly COMPARISON = "compare";


		private lineColors: number[];

		private comparedTickers: string[];

		private displayManager: com.google.finance.DisplayManager;

		//TODO: layerClasses: (typeof flash.display.Sprite)[];

		private takenColors: { quote: string, color: number }[];

		chartHeightInStyle: { [key: string]: number };

		private dataSources: DataSource[];

		private mainManager: com.google.finance.MainManager;

		config: { [key: string]: LayerConfig };

		layers: LayerInfo[];

		private style_: string;

		private fullRedrawWithNextData_ = false;

		private refuseDataSources: { [key: string]: boolean };

		constructor(param1: com.google.finance.DisplayManager, param2: com.google.finance.MainManager)
		{
			this.style_ = LayersManager.SINGLE;
			this.lineColors = [14432530, 0xff9900, 0x8000, 4801228, 0x990099];
			this.displayManager = param1;
			this.mainManager = param2;
			//TODO: this.registerLayerClasses();
			this.displayManager.layersManager = this;
			this.dataSources = [];
			this.refuseDataSources = {};
			this.config = {};
			this.layers = [];
			this.takenColors = [];
			this.comparedTickers = [];
			let _loc3_ = com.google.finance.MainManager.paramsObj;
			let _loc4_ = Utils.decodeObjects(_loc3_.single_layers);
			let _loc5_ = Utils.decodeObjects(_loc3_.single_viewpoints);
			this.config[LayersManager.SINGLE] = new LayerConfig();
			this.config[LayersManager.SINGLE].layers = _loc4_;
			this.config[LayersManager.SINGLE].viewpoints = _loc5_;
			this.config[LayersManager.SINGLE].hiddenViewpoints = [];
			this.config[LayersManager.SINGLE].lastMinute = 0;
			this.separateHiddenViewPoints(this.config[LayersManager.SINGLE]);
			let _loc6_ = Utils.decodeObjects(_loc3_.compare_layers);
			let _loc7_ = Utils.decodeObjects(_loc3_.compare_viewpoints);
			this.config[LayersManager.COMPARISON] = new LayerConfig();
			this.config[LayersManager.COMPARISON].layers = _loc6_;
			this.config[LayersManager.COMPARISON].viewpoints = _loc7_;
			this.config[LayersManager.COMPARISON].hiddenViewpoints = [];
			this.config[LayersManager.COMPARISON].lastMinute = 0;
			this.separateHiddenViewPoints(this.config[LayersManager.COMPARISON]);
			this.config[LayersManager.PERCENT] = new LayerConfig();
			this.config[LayersManager.PERCENT].layers = Utils.decodeObjects(_loc3_.percent_layers);
			this.config[LayersManager.PERCENT].viewpoints = Utils.decodeObjects(_loc3_.percent_viewpoints);
			this.config[LayersManager.PERCENT].hiddenViewpoints = [];
			this.config[LayersManager.PERCENT].lastMinute = 0;
			this.separateHiddenViewPoints(this.config[LayersManager.PERCENT]);
			this.chartHeightInStyle = {};
			this.chartHeightInStyle[LayersManager.SINGLE] = Const.MOVIE_HEIGHT;
			this.chartHeightInStyle[LayersManager.COMPARISON] = Const.MOVIE_HEIGHT;
			this.chartHeightInStyle[LayersManager.PERCENT] = Const.MOVIE_HEIGHT;
		}

		static moveVolumeBelowPrice(param1: IViewPoint[])
		{
			let _loc2_ = LayersManager.getViewPointIndex(Const.MAIN_VIEW_POINT_NAME, param1, "name");
			let _loc3_ = LayersManager.getViewPointIndex(Const.BOTTOM_VIEW_POINT_NAME, param1, "name");
			if (_loc2_ >= 0 && _loc3_ >= 0 && _loc3_ > _loc2_ + 1)
			{
				let _loc4_ = param1[_loc3_];
				param1.splice(_loc3_, 1);
				param1.splice(_loc2_ + 1, 0, _loc4_);
			}
		}

		static getViewPointIndex(param1: string, param2: IViewPoint[], param3: string): number
		{
			let _loc4_ = param2.length - 1;
			while (_loc4_ >= 0 && (<any>param2[_loc4_])[param3] !== param1)	// TODO:
			{
				_loc4_--;
			}
			return _loc4_;
		}

		removeLayerFromStyle(param1: LayerInfo, param2: string)
		{
			if (this.config[param2] === undefined)
				return;

			let _loc3_ = -1;
			for (let _loc4_ = 0; _loc4_ < this.config[param2].layers.length; _loc4_++)
			{
				if (Utils.isSubset(param1, this.config[param2].layers[_loc4_]))
					_loc3_ = _loc4_;
			}
			if (_loc3_ !== -1)
			{
				this.config[param2].layers.splice(_loc3_, 1);
				_loc3_ = this.getLayerModelIndex(param1);
				if (_loc3_ !== -1)
					this.layers.splice(_loc3_, 1);

				let _loc5_ = this.getLayerId(param1);
				this.displayManager.removeLayer(_loc5_, param1.vp);
			}
		}

		deleteDataSources()
		{
			this.dataSources.splice(1);
		}

		private getNextColor(param1: string): number
		{
			if (this.mainManager.quote === param1)
				return Const.LINE_CHART_LINE_COLOR;

			for (let _loc2_ = 0; _loc2_ < this.takenColors.length; _loc2_++)
			{
				if (this.takenColors[_loc2_].quote === param1)
					return this.takenColors[_loc2_].color;
			}

			for (let _loc2_ = 0; _loc2_ < this.lineColors.length; _loc2_++)
			{
				let _loc3_ = false;
				for (let _loc4_ = 0; _loc4_ < this.takenColors.length; _loc4_++)
				{
					if (this.takenColors[_loc4_].color === this.lineColors[_loc2_])
						_loc3_ = true;

					_loc4_++;
				}
				if (!_loc3_)
				{
					this.takenColors.push({
						"quote": param1,
						"color": this.lineColors[_loc2_]
					});
					return this.lineColors[_loc2_];
				}
			}
			return 0;
		}

		private removeViewPoints(param1: IViewPoint[], param2: IViewPoint[])
		{
			let _loc5_ = 0;
			for (let _loc3_ = 0; _loc3_ < param1.length; _loc3_++)
			{
				let _loc4_ = param1[_loc3_];
				_loc5_ = LayersManager.getViewPointIndex(_loc4_.name, param2, "name");
				if (_loc5_ === -1)
					this.displayManager.removeViewPoint(_loc4_.name);
			}
		}

		private applyStartEndToViewPoints(param1: StartEndPair)
		{
			let _loc2_ = this.displayManager.getViewPoints();
			for (let _loc3_ = 0; _loc3_ < _loc2_.length; _loc3_++)
			{
				let _loc4_ = _loc2_[_loc3_];
				_loc4_.lastMinute = param1.end;
				_loc4_.setNewCount(param1.end - param1.start);
			}
		}

		addIndicatorLayer(param1: string, param2: string, param3: string, source: DataSource, param5: LayerInfo): AbstractLayer<ViewPoint> | null
		{
			switch (param1)
			{
				case "Volume":
					{
						let _loc6_ = this.displayManager.addLayer(Const.VOLUME_CHART, param3, source, param2) as VolumeLinesChartLayer;
						if (_loc6_)
						{
							_loc6_.setIndicator("Volume", VolumeCalculator.computeInterval, source.data);
							_loc6_.lineColor = Const.LINE_CHART_LINE_COLOR;
							return _loc6_;
						}
					}
					break;
				case "ECNVolume":
					{
						let indicatorLayer = this.displayManager.addLayer(Const.AH_VOLUME_LAYER, param3, source, param2) as VolumeLinesChartLayer;
						if (indicatorLayer)
						{
							indicatorLayer.setIndicator("AfterHoursVolume", VolumeCalculator.computeInterval, source.afterHoursData);
							indicatorLayer.lineColor = 0x999999;
							return indicatorLayer;
						}
					}
					break;
				default:
					if (Const.INDICATOR_ENABLED)
					{
						let _loc7_ = "indicator." + param1 + "IndicatorLayer";
						let indicatorLayer = this.displayManager.addLayer(_loc7_, param3, source, param2) as indicator.IndicatorLayer | null;
						if (indicatorLayer)
						{
							indicatorLayer.setIndicator(param1, source.data);
							return indicatorLayer;
						}
					}
					break;
			}
			return null;
		}

		private getAnyLayerModelIndexForDatasource(dataSource: DataSource): number
		{
			for (let _loc2_ = 0; _loc2_ < this.layers.length; _loc2_++)
			{
				let _loc3_ = this.layers[_loc2_];
				if (dataSource === _loc3_.ds)
					return _loc2_;
			}
			return -1;
		}

		syncDataSources(param1: string[], param2: boolean, param3 = false)
		{
			let _loc16_ = 0;
			let _loc4_ = this.mainManager.layersManager;
			let _loc5_ = this.mainManager.dataManager;
			let _loc6_ = this.displayManager.mainController;
			let _loc7_ = <ViewPoint><any>this.displayManager.getMainViewPoint();
			this.updateColors(param1);
			this.deleteDataSources();
			let _loc8_ = this.displayManager.isDifferentMarketSessionComparison();
			let _loc9_ = _loc7_.lastMinute;
			let _loc10_ = _loc7_.count;
			let _loc11_ = _loc8_;
			if (_loc8_ && !param2)
				_loc11_ = this.isDifferentMarketSessionComparison(param1);
			else if (param2 && param3)
				_loc11_ = true;

			this.displayManager.setDifferentMarketSessionComparison(_loc11_);
			if (param1.length === 0 || param1.length === 1 && this.dataSources.length > 0 && param1[0] === this.dataSources[0].quoteName)
			{
				let _loc12_ = this.style_ === LayersManager.PERCENT ? LayersManager.PERCENT : LayersManager.SINGLE;
				this.setStyle(_loc12_);
				let _loc15_ = !!Const.INDICATOR_ENABLED ? this.displayManager.getEnabledChartLayer() : "";
				if (_loc15_ === Const.CANDLE_STICK || _loc15_ === Const.OHLC_CHART)
				{
					_loc6_.toggleZoomIntervalButtons(Const.LINE_CHART, _loc15_);
					if (com.google.finance.MainManager.paramsObj.displayExtendedHours === "true")
						this.displayManager.toggleAllAfterHoursSessions(_loc6_.currentIntervalLevel === Const.INTRADAY);
				}
			}
			else
			{
				let _loc15_ = !!Const.INDICATOR_ENABLED ? this.displayManager.getEnabledChartLayer() : "";
				if (_loc15_ === Const.CANDLE_STICK || _loc15_ === Const.OHLC_CHART)
					_loc6_.toggleZoomIntervalButtons(_loc15_, Const.LINE_CHART);

				let _loc12_ = this.style_ === LayersManager.PERCENT ? LayersManager.PERCENT : LayersManager.COMPARISON;
				this.setStyle(_loc12_);
				_loc16_ = 0;
				while (_loc16_ < param1.length)
				{
					if (_loc5_.hasNonEmptyDataSource(param1[_loc16_]) || _loc5_.dataUnavailableOnServer(param1[_loc16_]))
					{
						let _loc17_ = _loc5_.dataSources[param1[_loc16_]];
						if (_loc17_.getRelativeMinutesState() !== DataSource.RELATIVE_MINUTES_READY)
							this.displayManager.computeRelativeTimes(_loc17_);

						this.newData(_loc17_);
					}
					else
					{
						this.mainManager.getQuote(param1[_loc16_]);
					}
					_loc16_++;
				}
			}
			let _loc13_ = this.getFirstDataSource();
			let _loc14_ = !!_loc13_ ? Number(_loc13_.data.marketDayLength + 1) : Const.MARKET_DAY_LENGTH;
			if (_loc8_ && !_loc11_)
			{
				_loc16_ = 0;
				while (_loc16_ < param1.length)
				{
					let _loc17_ = this.mainManager.dataManager.dataSources[param1[_loc16_]];
					this.displayManager.computeRelativeTimes(_loc17_);
					_loc16_++;
				}
				_loc6_.resetZoomButtons(Const.MIN_DISPLAY_DAYS);
				_loc6_.jumpTo(_loc9_ * _loc14_, _loc10_ * _loc14_, true);
				this.displayManager.HTMLnotify(Const.MAIN_VIEW_POINT_NAME);
			}
			else if (_loc11_)
			{
				this.displayManager.computeRelativeTimesForDiffSessionComparison();
				if (!_loc8_)
				{
					_loc6_.resetZoomButtons(Const.DIF_MKT_COMPARISON_MIN_DISPLAY_DAYS);
					_loc6_.jumpTo(_loc9_ / _loc14_, _loc10_ / _loc14_, true);
					this.displayManager.HTMLnotify(Const.MAIN_VIEW_POINT_NAME);
				}
			}
			this.displayManager.showContextualStaticInfo();
		}

		private getLayerId(param1: AbstractLayer<ViewPoint> | LayerInfo): string
		{
			switch (param1.name)
			{
				case "SimpleMovingAverage":
					return param1.name + "-" + param1.length;
				case "IndependentObjectsLayer":
					return "Objects" + (<IndependentObjectsLayer>param1).renderObj;
				case "IntervalBasedIndependentObjectsLayer":
					return "Objects" + (<IntervalBasedIndependentObjectsLayer>param1).renderObj;
				default:
					return param1.name;
			}
		}

		private removeAllLayers(param1: IViewPoint[]) 
		{
			for (let _loc2_ = 0; _loc2_ < param1.length; _loc2_++)
			{
				let _loc3_ = param1[_loc2_];
				_loc3_.removeAllLayers();
			}
			this.layers = [];
		}

		private updateColors(param1: string[]) 
		{
			let _loc2_ = 0;
			if (this.takenColors.length === 0)
				return;

			do
			{
				let _loc3_ = false;
				for (let _loc4_ = 0; _loc4_ < param1.length; _loc4_++)
				{
					if (param1[_loc4_] === this.takenColors[_loc2_].quote)
						_loc3_ = true;
				}
				if (!_loc3_)
					this.takenColors.splice(_loc2_, 1);
				else
					_loc2_++;
			}
			while (_loc2_ < this.takenColors.length);
		}

		removeCompareTo(param1: string)
		{
			let _loc2_: string[] = [];
			let _loc3_ = Utils.findValueInArray(param1, this.comparedTickers);
			if (_loc3_ !== -1)
			{
				this.comparedTickers.splice(_loc3_, 1);
				this.refuseDataSources[param1] = true;
			}
			if (this.dataSources.length > 0)
				_loc2_.push(this.dataSources[0].quoteName);

			_loc2_ = _loc2_.concat(this.comparedTickers);
			this.syncDataSources(_loc2_, false);
		}

		private getLayerModelIndex(param1: LayerInfo, param2?: DataSource): number
		{
			let _loc3_ = this.layers.length - 1;
			let _loc4_ = this.getLayerId(param1);
			while (_loc3_ >= 0)
			{
				let _loc5_ = this.layers[_loc3_];
				if (this.getLayerId(_loc5_) === _loc4_ && _loc5_.vp === param1.vp && (!param2 || param2 === _loc5_.ds)) // TODO:_loc5_.dataSource?
				{
					return _loc3_;
				}
				_loc3_--;
			}
			return -1;
		}

		numComparedTickers(): number
		{
			return this.comparedTickers.length;
		}

		addLayerToStyle(param1: LayerInfo, param2: string)
		{
			let _loc3_ = 0;
			if (this.config[param2] === undefined)
				this.config[param2] = new LayerConfig();

			if (this.config[param2].layers === undefined)
				this.config[param2].layers = [];

			this.config[param2].layers.push(param1);
			if (this.style_ === param2)
			{
				_loc3_ = 0;
				while (_loc3_ < this.dataSources.length)
				{
					this.addLayer(param1, this.dataSources[_loc3_]);
					_loc3_++;
				}
			}
			this.displayManager.update();
		}

		dataSourcePos(dataSource: DataSource): number
		{
			for (let _loc2_ = 0; _loc2_ < this.dataSources.length; _loc2_++)
			{
				if (this.dataSources[_loc2_] === dataSource)
					return _loc2_;
			}
			return 0;
		}

		private addLayer(param1: LayerInfo, param2: DataSource)
		{
			let _loc3_ = -1;
			if (param1.arity === "Unique")
				_loc3_ = Number(this.getLayerModelIndex(param1));
			else if (param1.arity === "MultipleNonPrimary")
				_loc3_ = Number(this.getAnyLayerModelIndexForDatasource(param2));
			else
				_loc3_ = Number(this.getLayerModelIndex(param1, param2));

			if (_loc3_ === -1)
			{
				let _loc5_: AbstractLayer<IViewPoint> | null = null;
				let _loc6_ = this.getLayerId(param1);
				switch (param1.type)
				{
					case "simple":
						_loc5_ = this.displayManager.addLayer(param1.name, param1.vp, param2, _loc6_);
						break;
					case "indicator":
						let _loc8_ = new LayerInfo();
						for (let _loc4_ in param1)
						{
							if (_loc4_ !== "name" && _loc4_ !== "vp" && _loc4_ !== "arity" && _loc4_ !== "type")
							{
								(<any>_loc8_)[_loc4_] = (<any>param1)[_loc4_];	// TODO
							}
						}
						_loc5_ = this.addIndicatorLayer(param1.name, _loc6_, param1.vp, param2, _loc8_);
						break;
				}
				if (!_loc5_)
					return;
				if (param1.arity === "Multiple" || param1.arity === "MultipleNonPrimary" || param1.name === "PrecalculatedPercentLineChartLayer")
				{
					_loc5_.lineColor = this.getNextColor(param2.quoteName);
					_loc5_.lineThickness = Const.LINE_CHART_LINE_THICKNESS;
					_loc5_.lineVisibility = Const.LINE_CHART_LINE_VISIBILITY;
				}
				let _loc7_ = new LayerInfo();
				_loc7_.name = param1.name;
				_loc7_.type = param1.type;
				_loc7_.vp = param1.vp;
				_loc7_.layer = _loc5_;
				_loc7_.ds = param2;
				_loc7_.id = _loc6_;
				for (let _loc4_ in param1)
				{
					if (_loc4_ !== "name" && _loc4_ !== "vp" && _loc4_ !== "arity")
					{
						(<any>_loc5_)[_loc4_] = (<any>param1)[_loc4_];
						(<any>_loc7_)[_loc4_] = (<any>param1)[_loc4_];
					}
				}
				this.layers.push(_loc7_);
			}
		}

		private isDifferentMarketSessionComparison(param1: string[]): boolean
		{
			if (param1.length <= 1)
				return false;

			let _loc2_ = this.mainManager.dataManager.dataSources[param1[0]];
			if (!_loc2_ || _loc2_.isEmpty())
				return false;

			let _loc3_ = 1;
			while (_loc3_ < param1.length)
			{
				let _loc4_ = this.mainManager.dataManager.dataSources[param1[_loc3_]];
				if (!(!_loc4_ || _loc4_.isEmpty()))
				{
					if (!_loc2_.data.dataSessions.equals(_loc4_.data.dataSessions))
						return true;
				}
				_loc3_++;
			}
			return false;
		}

		addCompareTo(param1: string, param2 = false)
		{
			let _loc3_: string[] = [];
			let _loc4_ = Utils.findValueInArray(param1, this.comparedTickers);
			if (_loc4_ === -1)
			{
				this.comparedTickers.push(param1);
				if (this.dataSources.length > 0)
					_loc3_.push(this.dataSources[0].quoteName);

				_loc3_ = _loc3_.concat(this.comparedTickers);
				delete this.refuseDataSources[param1];
				this.syncDataSources(_loc3_, true, param2);
				(<ViewPoint>this.displayManager.getMainViewPoint()).checkEvents();
			}
		}

		figureOutDefaultLastMinute(dataSource: DataSource)
		{
			let _loc2_ = <ViewPoint><any>this.displayManager.getMainViewPoint();
			this.displayManager.setLastMinute(_loc2_.getNewestMinute());
		}

		addLayers(dataSource: DataSource)
		{
			let _loc2_ = Const.SPARKLINE_VIEW_POINT_NAME;
			if (dataSource.quoteName === this.mainManager.quote)
			{
				let _loc5_ = new LayerInfo();
				_loc5_.name = Const.WINDOW_LAYER;
				_loc5_.arity = "Unique";
				_loc5_.type = "simple";
				_loc5_.vp = _loc2_;
				let _loc6_ = this.getLayerId(_loc5_);
				this.displayManager.addLayer(Const.WINDOW_LAYER, _loc2_, dataSource, _loc6_);
			}
			let _loc3_ = this.config[this.style_].layers;
			for (let _loc4_ = 0; _loc4_ < _loc3_.length; _loc4_++)
			{
				this.addLayer(_loc3_[_loc4_], dataSource);
			}
		}

		hideViewPoint(param1: string, param2: string)
		{
			let _loc3_ = this.config[param2].viewpoints;
			let _loc4_ = this.config[param2].hiddenViewpoints;
			this.moveViewPointBtArrays(param1, _loc3_, _loc4_);
			this.setStyle(this.style_);
		}

		getComparedTickers()
		{
			return this.comparedTickers;
		}

		unhideViewPoint(param1: string, param2: string)
		{
			let _loc3_ = this.config[param2].viewpoints;
			let _loc4_ = this.config[param2].hiddenViewpoints;
			this.moveViewPointBtArrays(param1, _loc4_, _loc3_);
			this.setStyle(this.style_);
		}

		/* TODO
		private registerLayerClasses()
		{
			this.layerClasses = [];
			this.layerClasses.push(LineChartLayer);
			this.layerClasses.push(DateLinesLayer);
			this.layerClasses.push(WindowLayer);
			this.layerClasses.push(PriceLinesLayer);
			this.layerClasses.push(AHLineChartLayer);
			this.layerClasses.push(PinPointsLayer);
			this.layerClasses.push(IndependentObjectsLayer);
			this.layerClasses.push(LastDayLineLayer);
			this.layerClasses.push(VolumeScaleLayer);
			this.layerClasses.push(AHVolumeLayer);
			this.layerClasses.push(VolumeLinesChartLayer);
			this.layerClasses.push(NoDataAvailableLayer);
			this.layerClasses.push(PassiveLineLayer);
			this.layerClasses.push(PercentLineChartLayer);
			this.layerClasses.push(PercentLinesLayer);
			this.layerClasses.push(PrecalculatedPercentLineChartLayer);
			this.layerClasses.push(com.google.finance.indicator.AbstractStochasticIndicatorLayer);
			this.layerClasses.push(com.google.finance.indicator.BIASIndicatorLayer);
			this.layerClasses.push(com.google.finance.indicator.BollingerBandsIndicatorLayer);
			this.layerClasses.push(com.google.finance.indicator.CCIIndicatorLayer);
			this.layerClasses.push(com.google.finance.indicator.EMAIndicatorLayer);
			this.layerClasses.push(com.google.finance.indicator.FastStochasticIndicatorLayer);
			this.layerClasses.push(com.google.finance.indicator.KDJIndicatorLayer);
			this.layerClasses.push(com.google.finance.indicator.MACDIndicatorLayer);
			this.layerClasses.push(com.google.finance.indicator.RSIIndicatorLayer);
			this.layerClasses.push(com.google.finance.indicator.SMAIndicatorLayer);
			this.layerClasses.push(com.google.finance.indicator.SlowStochasticIndicatorLayer);
			this.layerClasses.push(com.google.finance.indicator.VMAIndicatorLayer);
			this.layerClasses.push(com.google.finance.indicator.VolumeDependentIndicatorLayer);
			this.layerClasses.push(com.google.finance.indicator.WilliamsPercentRIndicatorLayer);
			this.layerClasses.push(CandleStickChartLayer);
			this.layerClasses.push(IntervalBasedAHChartLayer);
			this.layerClasses.push(IntervalBasedBarChartLayer);
			this.layerClasses.push(IntervalBasedChartManagerLayer);
			this.layerClasses.push(IntervalBasedChartLayer);
			this.layerClasses.push(IntervalBasedLineChartLayer);
			this.layerClasses.push(OhlcChartLayer);
			this.layerClasses.push(IntervalBasedVolumeLayer);
			this.layerClasses.push(IntervalBasedAHVolumeLayer);
			this.layerClasses.push(IntervalBasedIndependentObjectsLayer);
			this.layerClasses.push(IntervalBasedPinPointsLayer);
		}
		*/

		replaceFirstDataSource(dataSource: DataSource)
		{
			this.dataSources[0] = dataSource;
		}

		getContextualStaticInfo()
		{
			let _loc1_: { [key: string]: any } = {};
			let _loc2_ = this.displayManager.getViewPoints();
			let _loc3_ = 1;
			while (_loc3_ < _loc2_.length)
			{
				let _loc4_ = _loc2_[_loc3_];
				_loc4_.highlightPoint(Const.MOVIE_WIDTH, _loc1_);
				_loc4_.clearPointInformation();
				_loc3_++;
			}
			return _loc1_;
		}

		private moveViewPointBtArrays(param1: string, param2: IViewPoint[], param3: IViewPoint[])
		{
			let _loc4_ = LayersManager.getViewPointIndex(param1, param2, "name");
			if (_loc4_ === -1)
				return;

			param3.push(param2[_loc4_]);
			param2.splice(_loc4_, 1);
		}

		private addViewPoints(param1: ViewPoint[], param2: IViewPoint[], param3: number)
		{
			let _loc4_ = <ViewPoint><any>this.displayManager.getMainViewPoint();
			for (let _loc5_ = 0; _loc5_ < param1.length; _loc5_++)
			{
				let _loc6_ = param1[_loc5_];
				let _loc7_ = LayersManager.getViewPointIndex(_loc6_.name, param2, "name");
				if (_loc7_ === -1)
				{
					this.displayManager.addViewPoint("ViewPoint", _loc6_.name, 0, _loc6_.height, Number(_loc6_.topMargin), this.mainManager.stage.stageWidth, this.mainManager.stage.stageHeight, _loc4_);
					let _loc8_ = this.displayManager.getViewPoint(_loc6_.name);
				}
				else
				{
					let _loc9_ = <ViewPoint>this.displayManager.getViewPoint(_loc6_.name);
					_loc9_.topMargin = Number(_loc6_.topMargin);
				}
			}
		}

		newData(dataSource: DataSource)
		{
			if (!this.haveDataSource(dataSource))
			{
				if (this.refuseDataSources[dataSource.quoteName])
				{
					delete this.refuseDataSources[dataSource.quoteName];
					return;
				}
				if (!dataSource.isEmpty())
					this.addLayers(dataSource);

				if (dataSource.isEmpty() && this.dataSources.length === 0)
				{
					this.displayManager.addLayer(LayersManager.NO_DATA_AVAILABLE_LAYER, Const.MAIN_VIEW_POINT_NAME, dataSource, LayersManager.NO_DATA_AVAILABLE_LAYER);
					this.displayManager.addLayer(Const.WINDOW_LAYER, Const.SPARKLINE_VIEW_POINT_NAME, dataSource, Const.WINDOW_LAYER);
					this.displayManager.makeBorderLayerTop();
					this.displayManager.update();
					this.displayManager.topBorderLayer.update();
					return;
				}
				if (dataSource.quoteName === this.mainManager.quote && this.dataSources.length !== 0)
				{
					let _loc2_ = this.dataSources[0];
					this.dataSources[0] = dataSource;
					this.dataSources.push(_loc2_);
				}
				else
				{
					this.dataSources.push(dataSource);
				}
				if (this.dataSources.length === 0 || dataSource.quoteName === this.mainManager.quote)
				{
					this.figureOutDefaultLastMinute(dataSource);
					let _loc3_ = this.getDefaultZoomPair(dataSource);
					this.applyStartEndToViewPoints(_loc3_);
				}
				if (Const.INDICATOR_ENABLED && dataSource.quoteName === this.mainManager.quote && Const.DEFAULT_CHART_STYLE_NAME !== Const.LINE_CHART && this.displayManager.mainController.currentIntervalLevel === -1)
				{
					this.displayManager.mainController.enableIntervalButtons(Const.DEFAULT_D);
					this.displayManager.mainController.currentIntervalLevel = Const.DEFAULT_D;
					let _loc4_ = 0;
					if (!isNaN(com.google.finance.MainManager.paramsObj.defaultEndTime))
					{
						let _loc7_ = com.google.finance.MainManager.paramsObj.defaultEndTime;
						if (_loc7_ > 0)
						{
							let _loc8_ = Const.getDetailLevelInterval(Const.DEFAULT_D);
							let _loc9_ = dataSource.data.getPointsInIntervalArray(_loc8_);
							let _loc10_ = DataSource.getTimeIndex(_loc7_, _loc9_);
							if (_loc10_ !== -1)
								_loc4_ = Number(_loc9_[_loc10_].relativeMinutes);
						}
					}
					let _loc5_ = Const.INTERVAL_PERIODS[Const.DEFAULT_D].days;
					let _loc6_ = _loc5_ * (dataSource.data.marketDayLength + 1);
					if (Const.DEFAULT_DISPLAY_MINUTES !== -1)
						_loc6_ = Const.DEFAULT_DISPLAY_MINUTES;

					this.displayManager.mainController.animateTo(_loc4_, _loc6_, 1);
					com.google.finance.MainManager.jsProxy.setJsCurrentViewParam("defaultDisplayInterval", Const.getDetailLevelInterval(Const.DEFAULT_D));
				}
			}
			else
			{
				let _loc11_ = this.displayManager.getViewPoints();
				for (let _loc12_ = 0; _loc12_ < _loc11_.length; _loc12_++)
				{
					let _loc13_ = _loc11_[_loc12_];
					_loc13_.precomputeContexts();
				}
			}
			if (dataSource === this.getFirstDataSource())
				this.displayManager.mainController.syncZoomLevel();

			if (this.fullRedrawWithNextData_)
			{
				this.fullRedrawWithNextData_ = false;
				this.setStyle(this.style_);
			}
			else
			{
				this.displayManager.update();
				this.displayManager.topBorderLayer.update();
			}
		}

		private haveDataSource(param1: DataSource): boolean
		{
			for (let _loc2_ = 0; _loc2_ < this.dataSources.length; _loc2_++)
			{
				if (this.dataSources[_loc2_] === param1)
					return true;
			}
			return false;
		}

		setStyle(param1: string)
		{
			let _loc7_ = 0;
			if (Const.INDICATOR_ENABLED)
				com.google.finance.MainManager.jsProxy.resetChartHeight(this.chartHeightInStyle[param1]);

			let _loc2_ = this.config[param1].viewpoints;
			let _loc3_ = this.displayManager.getViewPoints();
			let _loc4_ = <ViewPoint><any>this.displayManager.getMainViewPoint();
			_loc4_.clearAllChildrenFromTopCanvas();
			this.config[this.style_].lastMinute = _loc4_.lastMinute;
			this.style_ = param1;
			this.removeAllLayers(_loc3_.slice(1));
			this.removeViewPoints(_loc3_.slice(1), _loc2_);
			this.displayManager.mainController.removeAllBounds();
			this.addViewPoints(_loc2_, _loc3_, this.config[this.style_].lastMinute);
			LayersManager.moveVolumeBelowPrice(_loc3_);
			this.displayManager.makeBorderLayerTop();
			for (let _loc5_ = 0; _loc5_ < this.dataSources.length; _loc5_++)
			{
				let _loc6_ = this.dataSources[_loc5_];
				this.addLayers(_loc6_);
			}
			if (param1 === LayersManager.COMPARISON)
			{
				this.displayManager.toggleAllAfterHoursSessions(false);
			}
			else if (param1 === LayersManager.SINGLE)
			{
				let _loc8_ = !!Const.INDICATOR_ENABLED ? this.displayManager.getEnabledChartLayer() : "";
				if (this.displayManager.mainController.currentIntervalLevel === -1 && (_loc8_ === Const.CANDLE_STICK || _loc8_ === Const.OHLC_CHART))
					_loc7_ = Const.DEFAULT_D;
				else
					_loc7_ = !!Const.INDICATOR_ENABLED ? _loc4_.getDetailLevelForTechnicalStyle() : _loc4_.getDetailLevel();

				if (_loc7_ === Const.INTRADAY && com.google.finance.MainManager.paramsObj.displayExtendedHours === "true")
					this.displayManager.toggleAllAfterHoursSessions(true);
			}
			this.displayManager.windowResized(this.displayManager.stage.stageWidth, this.displayManager.stage.stageHeight);
		}

		resetLayersForNewQuote(dataSource: DataSource, param2: string)
		{
			this.style_ = param2;
			this.fullRedrawWithNextData_ = true;
			let _loc3_ = this.displayManager.getViewPoints();
			let _loc4_: IViewPoint[] = [];
			for (let _loc5_ = 0; _loc5_ < _loc3_.length; _loc5_++)
			{
				if (_loc3_[_loc5_].name === Const.MAIN_VIEW_POINT_NAME)
					_loc4_.push(_loc3_[_loc5_]);
				else if (_loc3_[_loc5_].name === Const.SPARKLINE_VIEW_POINT_NAME)
					(<SparklineViewPoint>_loc3_[_loc5_]).replaceSparklineDataSource(dataSource);
			}
			this.removeAllLayers(_loc4_);
		}

		private separateHiddenViewPoints(param1: LayerConfig)
		{
			let _loc2_ = param1.viewpoints;
			let _loc3_ = param1.hiddenViewpoints;
			for (let _loc4_ = 0; _loc4_ < _loc2_.length; _loc4_++)
			{
				if (_loc2_[_loc4_].display === "hidden")
				{
					this.moveViewPointBtArrays(_loc2_[_loc4_].name, _loc2_, _loc3_);
					_loc4_--;
				}
			}
		}

		getDefaultZoomPair(dataSource: DataSource): StartEndPair
		{
			let _loc5_ = NaN;
			let _loc7_ = 0;
			let _loc10_ = NaN;
			let _loc11_ = NaN;
			let _loc2_ = 0;
			let _loc3_ = -1;
			let _loc4_ = com.google.finance.MainManager.paramsObj;
			if (_loc4_.defaultEndTime !== undefined && !isNaN(_loc4_.defaultEndTime))
			{
				_loc5_ = Number(_loc4_.defaultEndTime);
				let _loc6_ = new Date(_loc5_);
				if (_loc5_ > 0)
				{
					_loc7_ = DataSource.getTimeIndex(_loc5_, dataSource.data.units);
					let _loc8_ = dataSource.data.units[_loc7_];
					_loc2_ = Number(_loc8_.relativeMinutes);
					if (dataSource.data.minuteIsEndOfDataSession(_loc8_.dayMinute) && dataSource.afterHoursData && dataSource.afterHoursData.units.length > 0)
					{
						let _loc9_ = DataSource.getTimeIndex(_loc5_, dataSource.afterHoursData.units);
						_loc10_ = dataSource.afterHoursData.units[_loc9_].relativeMinutes;
						if (_loc2_ < _loc10_)
						{
							if (_loc7_ === dataSource.data.units.length - 1 || _loc10_ < dataSource.data.units[_loc7_ + 1].relativeMinutes)
								_loc2_ = Number(_loc10_);
						}
					}
				}
			}
			if (_loc3_ === -1)
			{
				if (Const.DEFAULT_DISPLAY_MINUTES !== -1)
				{
					_loc3_ = Number(Const.DEFAULT_DISPLAY_MINUTES);
				}
				else
				{
					_loc11_ = Const.DEFAULT_DISPLAY_DAYS;
					_loc3_ = Number(this.displayManager.mainController.getCountForDays(dataSource, _loc11_, 0));
				}
			}
			return new StartEndPair(_loc2_ - _loc3_, _loc2_);
		}

		getStyle(): string
		{
			return this.style_;
		}

		getFirstDataSource(): DataSource | null
		{
			if (!this.dataSources.length)
				return null;

			return this.dataSources[0];
		}
	}
}
