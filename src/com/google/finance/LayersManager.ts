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

		private readonly lineColors = [14432530, 0xff9900, 0x8000, 4801228, 0x990099];
		private readonly comparedTickers: string[] = [];
		//TODO: layerClasses: (typeof flash.display.Sprite)[];
		private readonly takenColors: { quote: string, color: number }[] = [];
		private readonly dataSources: DataSource[] = [];
		private style_ = LayersManager.SINGLE;
		private fullRedrawWithNextData_ = false;
		private readonly refuseDataSources: Map<boolean> = {};

		readonly chartHeightInStyle: Map<number> = {};
		readonly config: Map<LayerConfig> = {};
		layers: LayerInfo[] = [];

		constructor(private readonly displayManager: DisplayManager, private readonly mainManager: MainManager)
		{
			//TODO: this.registerLayerClasses();
			this.displayManager.layersManager = this;
			const paramsObj = MainManager.paramsObj;
			const _loc4_ = Utils.decodeObjects(paramsObj.single_layers);
			const _loc5_ = Utils.decodeObjects(paramsObj.single_viewpoints);
			this.config[LayersManager.SINGLE] = new LayerConfig();
			this.config[LayersManager.SINGLE].layers = _loc4_;
			this.config[LayersManager.SINGLE].viewpoints = _loc5_;
			this.config[LayersManager.SINGLE].hiddenViewpoints = [];
			this.config[LayersManager.SINGLE].lastMinute = 0;
			this.separateHiddenViewPoints(this.config[LayersManager.SINGLE]);
			const _loc6_ = Utils.decodeObjects(paramsObj.compare_layers);
			const _loc7_ = Utils.decodeObjects(paramsObj.compare_viewpoints);
			this.config[LayersManager.COMPARISON] = new LayerConfig();
			this.config[LayersManager.COMPARISON].layers = _loc6_;
			this.config[LayersManager.COMPARISON].viewpoints = _loc7_;
			this.config[LayersManager.COMPARISON].hiddenViewpoints = [];
			this.config[LayersManager.COMPARISON].lastMinute = 0;
			this.separateHiddenViewPoints(this.config[LayersManager.COMPARISON]);
			this.config[LayersManager.PERCENT] = new LayerConfig();
			this.config[LayersManager.PERCENT].layers = Utils.decodeObjects(paramsObj.percent_layers);
			this.config[LayersManager.PERCENT].viewpoints = Utils.decodeObjects(paramsObj.percent_viewpoints);
			this.config[LayersManager.PERCENT].hiddenViewpoints = [];
			this.config[LayersManager.PERCENT].lastMinute = 0;
			this.separateHiddenViewPoints(this.config[LayersManager.PERCENT]);
			this.chartHeightInStyle[LayersManager.SINGLE] = Const.MOVIE_HEIGHT;
			this.chartHeightInStyle[LayersManager.COMPARISON] = Const.MOVIE_HEIGHT;
			this.chartHeightInStyle[LayersManager.PERCENT] = Const.MOVIE_HEIGHT;
		}

		static moveVolumeBelowPrice(viewPoints: IViewPoint[])
		{
			const viewPointIndex1 = LayersManager.getViewPointIndex(Const.MAIN_VIEW_POINT_NAME, viewPoints, "name");
			const viewPointIndex2 = LayersManager.getViewPointIndex(Const.BOTTOM_VIEW_POINT_NAME, viewPoints, "name");
			if (viewPointIndex1 >= 0 && viewPointIndex2 >= 0 && viewPointIndex2 > viewPointIndex1 + 1)
			{
				const _loc4_ = viewPoints[viewPointIndex2];
				viewPoints.splice(viewPointIndex2, 1);
				viewPoints.splice(viewPointIndex1 + 1, 0, _loc4_);
			}
		}

		static getViewPointIndex(value: string, viewPoints: IViewPoint[], key: string): number
		{
			let index = viewPoints.length - 1;
			while (index >= 0 && (<any>viewPoints[index])[key] !== value)	// TODO:
				index--;
			return index;
		}

		removeLayerFromStyle(layerInfo: LayerInfo, style: string)
		{
			if (this.config[style] === undefined)
				return;

			let _loc3_ = -1;
			for (let layerIndex = 0; layerIndex < this.config[style].layers.length; layerIndex++)
			{
				if (Utils.isSubset(layerInfo, this.config[style].layers[layerIndex]))
					_loc3_ = layerIndex;
			}
			if (_loc3_ !== -1)
			{
				this.config[style].layers.splice(_loc3_, 1);
				_loc3_ = this.getLayerModelIndex(layerInfo);
				if (_loc3_ !== -1)
					this.layers.splice(_loc3_, 1);

				const layerId = this.getLayerId(layerInfo);
				this.displayManager.removeLayer(layerId, layerInfo.vp);
			}
		}

		deleteDataSources()
		{
			this.dataSources.splice(1);
		}

		private getNextColor(quote: string): number
		{
			if (this.mainManager.quote === quote)
				return Const.LINE_CHART_LINE_COLOR;

			for (const takenColor of this.takenColors)
			{
				if (takenColor.quote === quote)
					return takenColor.color;
			}

			for (const lineColor of this.lineColors)
			{
				let _loc3_ = false;
				for (let takenColorIndex = 0; takenColorIndex < this.takenColors.length; takenColorIndex++)
				{
					if (this.takenColors[takenColorIndex].color === lineColor)
						_loc3_ = true;

					takenColorIndex++;
				}
				if (!_loc3_)
				{
					this.takenColors.push({
						quote: quote,
						color: lineColor
					});
					return lineColor;
				}
			}
			return 0;
		}

		private removeViewPoints(viewPointsToRemove: IViewPoint[], except: IViewPoint[])
		{
			for (const viewPointToRemove of viewPointsToRemove)
			{
				const _loc5_ = LayersManager.getViewPointIndex(viewPointToRemove.name, except, "name");
				if (_loc5_ === -1)
					this.displayManager.removeViewPoint(viewPointToRemove.name);
			}
		}

		private applyStartEndToViewPoints(startEndPair: StartEndPair)
		{
			const viewPoints = this.displayManager.getViewPoints();
			for (const viewPoint of viewPoints)
			{
				viewPoint.lastMinute = startEndPair.end;
				viewPoint.setNewCount(startEndPair.end - startEndPair.start);
			}
		}

		addIndicatorLayer(indicatorType: string, param2: string, param3: string, source: DataSource, layerInfo: LayerInfo): AbstractLayer<ViewPoint> | null
		{
			switch (indicatorType)
			{
				case "Volume":
					{
						const _loc6_ = this.displayManager.addLayer(Const.VOLUME_CHART, param3, source, param2) as VolumeLinesChartLayer;
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
						const indicatorLayer = this.displayManager.addLayer(Const.AH_VOLUME_LAYER, param3, source, param2) as VolumeLinesChartLayer;
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
						const _loc7_ = "indicator." + indicatorType + "IndicatorLayer";
						const indicatorLayer = this.displayManager.addLayer(_loc7_, param3, source, param2) as indicator.IndicatorLayer | null;
						if (indicatorLayer)
						{
							indicatorLayer.setIndicator(indicatorType, source.data);
							return indicatorLayer;
						}
					}
					break;
			}
			return null;
		}

		private getAnyLayerModelIndexForDatasource(dataSource: DataSource): number
		{
			for (let layerIndex = 0; layerIndex < this.layers.length; layerIndex++)
			{
				const layer = this.layers[layerIndex];
				if (dataSource === layer.ds)
					return layerIndex;
			}
			return -1;
		}

		syncDataSources(dataSourceNames: string[], param2: boolean, param3 = false)
		{
			//const _loc4_ = this.mainManager.layersManager;
			const dataManager = this.mainManager.dataManager;
			const mainController = this.displayManager.mainController;
			const mainViewPoint = this.displayManager.getMainViewPoint();
			this.updateColors(dataSourceNames);
			this.deleteDataSources();
			const _loc8_ = this.displayManager.isDifferentMarketSessionComparison();
			const lastMinute = mainViewPoint.lastMinute;
			const count = mainViewPoint.count;
			let isDifferentMarketSessionComparison = _loc8_;
			if (_loc8_ && !param2)
				isDifferentMarketSessionComparison = this.isDifferentMarketSessionComparison(dataSourceNames);
			else if (param2 && param3)
				isDifferentMarketSessionComparison = true;

			this.displayManager.setDifferentMarketSessionComparison(isDifferentMarketSessionComparison);
			if (dataSourceNames.length === 0 || dataSourceNames.length === 1 && this.dataSources.length > 0 && dataSourceNames[0] === this.dataSources[0].quoteName)
			{
				this.setStyle(this.style_ === LayersManager.PERCENT ? LayersManager.PERCENT : LayersManager.SINGLE);
				const _loc15_ = !!Const.INDICATOR_ENABLED ? this.displayManager.getEnabledChartLayer() : "";
				if (_loc15_ === Const.CANDLE_STICK || _loc15_ === Const.OHLC_CHART)
				{
					mainController.toggleZoomIntervalButtons(Const.LINE_CHART, _loc15_);
					if (Boolean(MainManager.paramsObj.displayExtendedHours))
						this.displayManager.toggleAllAfterHoursSessions(mainController.currentIntervalLevel === Intervals.INTRADAY);
				}
			}
			else
			{
				const _loc15_ = !!Const.INDICATOR_ENABLED ? this.displayManager.getEnabledChartLayer() : "";
				if (_loc15_ === Const.CANDLE_STICK || _loc15_ === Const.OHLC_CHART)
					mainController.toggleZoomIntervalButtons(_loc15_, Const.LINE_CHART);

				this.setStyle(this.style_ === LayersManager.PERCENT ? LayersManager.PERCENT : LayersManager.COMPARISON);
				for (const dataSourceName of dataSourceNames)
				{
					if (dataManager.hasNonEmptyDataSource(dataSourceName) || dataManager.dataUnavailableOnServer(dataSourceName))
					{
						const dataSource = dataManager.dataSources[dataSourceName];
						if (dataSource.getRelativeMinutesState() !== DataSource.RELATIVE_MINUTES_READY)
							this.displayManager.computeRelativeTimes(dataSource);

						this.newData(dataSource);
					}
					else
					{
						this.mainManager.getQuote(dataSourceName);
					}
				}
			}
			const firstDataSource = this.getFirstDataSource();
			const _loc14_ = !!firstDataSource ? Number(firstDataSource.data.marketDayLength + 1) : Const.MARKET_DAY_LENGTH;
			if (_loc8_ && !isDifferentMarketSessionComparison)
			{
				for (const dataSourceName of dataSourceNames)
				{
					const dataSource = this.mainManager.dataManager.dataSources[dataSourceName];
					this.displayManager.computeRelativeTimes(dataSource);
				}
				mainController.resetZoomButtons(Const.MIN_DISPLAY_DAYS);
				mainController.jumpTo(lastMinute * _loc14_, count * _loc14_, true);
				this.displayManager.HTMLnotify(Const.MAIN_VIEW_POINT_NAME);
			}
			else if (isDifferentMarketSessionComparison)
			{
				this.displayManager.computeRelativeTimesForDiffSessionComparison();
				if (!_loc8_)
				{
					mainController.resetZoomButtons(Const.DIF_MKT_COMPARISON_MIN_DISPLAY_DAYS);
					mainController.jumpTo(lastMinute / _loc14_, count / _loc14_, true);
					this.displayManager.HTMLnotify(Const.MAIN_VIEW_POINT_NAME);
				}
			}
			this.displayManager.showContextualStaticInfo();
		}

		private getLayerId(layer: AbstractLayer<ViewPoint> | LayerInfo): string
		{
			switch (layer.name)
			{
				case "SimpleMovingAverage":
					return layer.name + '-' + (<any>layer).length;	// TODO
				case "IndependentObjectsLayer":
					return "Objects" + (<IndependentObjectsLayer>layer).renderObj;
				case "IntervalBasedIndependentObjectsLayer":
					return "Objects" + (<IntervalBasedIndependentObjectsLayer>layer).renderObj;
				default:
					return layer.name;
			}
		}

		private removeAllLayers(viewPoints: IViewPoint[])
		{
			for (const viewPoint of viewPoints)
				viewPoint.removeAllLayers();

			this.layers = [];
		}

		private updateColors(dataSourceNames: string[])
		{
			let _loc2_ = 0;
			if (this.takenColors.length === 0)
				return;

			do
			{
				let _loc3_ = false;
				for (const dataSourceName of dataSourceNames)
				{
					if (dataSourceName === this.takenColors[_loc2_].quote)
						_loc3_ = true;
				}
				if (!_loc3_)
					this.takenColors.splice(_loc2_, 1);
				else
					_loc2_++;
			}
			while (_loc2_ < this.takenColors.length);
		}

		removeCompareTo(ticker: string)
		{
			let _loc2_: string[] = [];
			const value = Utils.findValueInArray(ticker, this.comparedTickers);
			if (value !== -1)
			{
				this.comparedTickers.splice(value, 1);
				this.refuseDataSources[ticker] = true;
			}
			if (this.dataSources.length > 0)
				_loc2_.push(this.dataSources[0].quoteName);

			_loc2_ = _loc2_.concat(this.comparedTickers);
			this.syncDataSources(_loc2_, false);
		}

		private getLayerModelIndex(layerInfo: LayerInfo, dataSource?: DataSource): number
		{
			const layerId = this.getLayerId(layerInfo);
			for (let layerIndex = this.layers.length - 1; layerIndex >= 0; layerIndex--)
			{
				const layer = this.layers[layerIndex];
				if (this.getLayerId(layer) === layerId && layer.vp === layerInfo.vp && (!dataSource || dataSource === layer.ds)) // TODO:_loc5_.dataSource?
					return layerIndex;
			}
			return -1;
		}

		numComparedTickers(): number
		{
			return this.comparedTickers.length;
		}

		addLayerToStyle(layerInfo: LayerInfo, style: string)
		{
			if (this.config[style] === undefined)
				this.config[style] = new LayerConfig();

			if (this.config[style].layers === undefined)
				this.config[style].layers = [];

			this.config[style].layers.push(layerInfo);
			if (this.style_ === style)
			{
				for (const dataSource of this.dataSources)
					this.addLayer(layerInfo, dataSource);
			}
			this.displayManager.update();
		}

		dataSourcePos(dataSource: DataSource): number
		{
			for (let dataSourceIndex = 0; dataSourceIndex < this.dataSources.length; dataSourceIndex++)
			{
				if (this.dataSources[dataSourceIndex] === dataSource)
					return dataSourceIndex;
			}
			return 0;
		}

		private addLayer(layerInfo: LayerInfo, dataSource: DataSource)
		{
			let _loc3_ = -1;
			if (layerInfo.arity === "Unique")
				_loc3_ = Number(this.getLayerModelIndex(layerInfo));
			else if (layerInfo.arity === "MultipleNonPrimary")
				_loc3_ = Number(this.getAnyLayerModelIndexForDatasource(dataSource));
			else
				_loc3_ = Number(this.getLayerModelIndex(layerInfo, dataSource));

			if (_loc3_ === -1)
			{
				let _loc5_: AbstractLayer<IViewPoint> | null = null;
				const layerId = this.getLayerId(layerInfo);
				switch (layerInfo.type)
				{
					case "simple":
						_loc5_ = this.displayManager.addLayer(layerInfo.name, layerInfo.vp, dataSource, layerId);
						break;
					case "indicator":
						const newIndicatorLayerInfo = new LayerInfo();
						for (const key of Object.keys(layerInfo))
						{
							if (key !== "name" && key !== "vp" && key !== "arity" && key !== "type")
							{
								(<any>newIndicatorLayerInfo)[key] = (<any>layerInfo)[key];	// TODO
							}
						}
						_loc5_ = this.addIndicatorLayer(layerInfo.name, layerId, layerInfo.vp, dataSource, newIndicatorLayerInfo);
						break;
				}
				if (!_loc5_)
					return;
				if (layerInfo.arity === "Multiple" || layerInfo.arity === "MultipleNonPrimary" || layerInfo.name === "PrecalculatedPercentLineChartLayer")
				{
					_loc5_.lineColor = this.getNextColor(dataSource.quoteName);
					_loc5_.lineThickness = Const.LINE_CHART_LINE_THICKNESS;
					_loc5_.lineVisibility = Const.LINE_CHART_LINE_VISIBILITY;
				}
				const newLayerInfo = new LayerInfo();
				newLayerInfo.name = layerInfo.name;
				newLayerInfo.type = layerInfo.type;
				newLayerInfo.vp = layerInfo.vp;
				newLayerInfo.layer = _loc5_;
				newLayerInfo.ds = dataSource;
				newLayerInfo.id = layerId;
				for (const key of Object.keys(layerInfo))
				{
					if (key !== "name" && key !== "vp" && key !== "arity")
					{
						(<any>_loc5_)[key] = (<any>layerInfo)[key];
						(<any>newLayerInfo)[key] = (<any>layerInfo)[key];
					}
				}
				this.layers.push(newLayerInfo);
			}
		}

		private isDifferentMarketSessionComparison(dataSourceNames: string[]): boolean
		{
			if (dataSourceNames.length <= 1)
				return false;

			const dataSource1 = this.mainManager.dataManager.dataSources[dataSourceNames[0]];
			if (!dataSource1 || dataSource1.isEmpty())
				return false;

			for (let index = 1; index < dataSourceNames.length; index++)
			{
				const dataSource2 = this.mainManager.dataManager.dataSources[dataSourceNames[index]];
				if (!(!dataSource2 || dataSource2.isEmpty()))
				{
					if (!dataSource1.data.dataSessions.equals(dataSource2.data.dataSessions))
						return true;
				}
			}
			return false;
		}

		addCompareTo(ticker: string, param2 = false)
		{
			let tickers: string[] = [];
			const value = Utils.findValueInArray(ticker, this.comparedTickers);
			if (value === -1)
			{
				this.comparedTickers.push(ticker);
				if (this.dataSources.length > 0)
					tickers.push(this.dataSources[0].quoteName);

				tickers = tickers.concat(this.comparedTickers);
				delete this.refuseDataSources[ticker];
				this.syncDataSources(tickers, true, param2);
				(this.displayManager.getMainViewPoint()).checkEvents();
			}
		}

		figureOutDefaultLastMinute(dataSource: DataSource)
		{
			const mainViewPoint = this.displayManager.getMainViewPoint();
			this.displayManager.setLastMinute(mainViewPoint.getNewestMinute());
		}

		addLayers(dataSource: DataSource)
		{
			const viewPointName = Const.SPARKLINE_VIEW_POINT_NAME;
			if (dataSource.quoteName === this.mainManager.quote)
			{
				const layerInfo = new LayerInfo();
				layerInfo.name = Const.WINDOW_LAYER;
				layerInfo.arity = "Unique";
				layerInfo.type = "simple";
				layerInfo.vp = viewPointName;
				const layerId = this.getLayerId(layerInfo);
				this.displayManager.addLayer(Const.WINDOW_LAYER, viewPointName, dataSource, layerId);
			}
			const layers = this.config[this.style_].layers;
			for (const layer of layers)
				this.addLayer(layer, dataSource);
		}

		hideViewPoint(param1: string, style: string)
		{
			const viewpoints = this.config[style].viewpoints;
			const hiddenViewpoints = this.config[style].hiddenViewpoints;
			this.moveViewPointBtArrays(param1, viewpoints, hiddenViewpoints);
			this.setStyle(this.style_);
		}

		getComparedTickers()
		{
			return this.comparedTickers;
		}

		unhideViewPoint(param1: string, style: string)
		{
			const viewpoints = this.config[style].viewpoints;
			const hiddenViewpoints = this.config[style].hiddenViewpoints;
			this.moveViewPointBtArrays(param1, hiddenViewpoints, viewpoints);
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
			const state: Dictionary = {};
			const viewPoints = this.displayManager.getViewPoints();
			for (let viewPointIndex = 1; viewPointIndex < viewPoints.length; viewPointIndex++)
			{
				const viewPoint = viewPoints[viewPointIndex];
				viewPoint.highlightPoint(Const.MOVIE_WIDTH, state);
				viewPoint.clearPointInformation();
			}
			return state;
		}

		private moveViewPointBtArrays(param1: string, from: IViewPoint[], to: IViewPoint[])
		{
			const viewPointIndex = LayersManager.getViewPointIndex(param1, from, "name");
			if (viewPointIndex === -1)
				return;

			to.push(from[viewPointIndex]);
			from.splice(viewPointIndex, 1);
		}

		private addViewPoints(viewPoints: ViewPoint[], except: IViewPoint[], param3: number)
		{
			const mainViewPoint = this.displayManager.getMainViewPoint();
			for (const viewPoint of viewPoints)
			{
				const exceptIndex = LayersManager.getViewPointIndex(viewPoint.name, except, "name");
				if (exceptIndex === -1)
				{
					this.displayManager.addViewPoint("ViewPoint", viewPoint.name, 0, viewPoint.height, Number(viewPoint.topMargin), this.mainManager.stage.stageWidth, this.mainManager.stage.stageHeight, mainViewPoint);
					//const _loc8_ = this.displayManager.getViewPoint(_loc6_.name);
				}
				else
				{
					const existingViewPoint = <ViewPoint>this.displayManager.getViewPoint(viewPoint.name);
					existingViewPoint.topMargin = Number(viewPoint.topMargin);
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
					//this.displayManager.topBorderLayer.update();
					return;
				}
				if (dataSource.quoteName === this.mainManager.quote && this.dataSources.length !== 0)
				{
					const tmp = this.dataSources[0];
					this.dataSources[0] = dataSource;
					this.dataSources.push(tmp);
				}
				else
				{
					this.dataSources.push(dataSource);
				}
				if (this.dataSources.length === 0 || dataSource.quoteName === this.mainManager.quote)
				{
					this.figureOutDefaultLastMinute(dataSource);
					const defaultZoomPair = this.getDefaultZoomPair(dataSource);
					this.applyStartEndToViewPoints(defaultZoomPair);
				}
				if (Const.INDICATOR_ENABLED && dataSource.quoteName === this.mainManager.quote && Const.DEFAULT_CHART_STYLE_NAME !== Const.LINE_CHART && this.displayManager.mainController.currentIntervalLevel === Intervals.INVALID)
				{
					this.displayManager.mainController.enableIntervalButtons(Const.DEFAULT_D);
					this.displayManager.mainController.currentIntervalLevel = Const.DEFAULT_D;
					let _loc4_ = 0;
					if (!isNaN(MainManager.paramsObj.defaultEndTime))
					{
						const defaultEndTime = MainManager.paramsObj.defaultEndTime;
						if (defaultEndTime > 0)
						{
							const detailLevelInterval = Const.getDetailLevelInterval(Const.DEFAULT_D);
							const points = dataSource.data.getPointsInIntervalArray(detailLevelInterval);
							const timeIndex = DataSource.getTimeIndex(defaultEndTime, points);
							if (timeIndex !== -1)
								_loc4_ = Number(points[timeIndex].relativeMinutes);
						}
					}
					const days = Const.INTERVAL_PERIODS[Const.DEFAULT_D].days;
					let _loc6_ = days * (dataSource.data.marketDayLength + 1);
					if (Const.DEFAULT_DISPLAY_MINUTES !== -1)
						_loc6_ = Const.DEFAULT_DISPLAY_MINUTES;

					this.displayManager.mainController.animateTo(_loc4_, _loc6_, 1);
					MainManager.jsProxy.setJsCurrentViewParam("defaultDisplayInterval", Const.getDetailLevelInterval(Const.DEFAULT_D));
				}
			}
			else
			{
				const viewPoints = this.displayManager.getViewPoints();
				for (const viewPoint of viewPoints)
					viewPoint.precomputeContexts();
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

		private haveDataSource(dataSource: DataSource): boolean
		{
			for (const dataSource2 of this.dataSources)
			{
				if (dataSource2 === dataSource)
					return true;
			}
			return false;
		}

		setStyle(style: string)
		{
			if (Const.INDICATOR_ENABLED)
				MainManager.jsProxy.resetChartHeight(this.chartHeightInStyle[style]);

			const viewpoints = this.config[style].viewpoints;
			const viewPoints = this.displayManager.getViewPoints();
			const mainViewPoint = this.displayManager.getMainViewPoint();
			mainViewPoint.clearAllChildrenFromTopCanvas();
			this.config[this.style_].lastMinute = mainViewPoint.lastMinute;
			this.style_ = style;
			this.removeAllLayers(viewPoints.slice(1));
			this.removeViewPoints(viewPoints.slice(1), viewpoints);
			this.displayManager.mainController.removeAllBounds();
			this.addViewPoints(viewpoints, viewPoints, this.config[this.style_].lastMinute);
			LayersManager.moveVolumeBelowPrice(viewPoints);
			this.displayManager.makeBorderLayerTop();
			for (const dataSource of this.dataSources)
				this.addLayers(dataSource);

			if (style === LayersManager.COMPARISON)
			{
				this.displayManager.toggleAllAfterHoursSessions(false);
			}
			else if (style === LayersManager.SINGLE)
			{
				const _loc8_ = !!Const.INDICATOR_ENABLED ? this.displayManager.getEnabledChartLayer() : "";
				let _loc7_;
				if (this.displayManager.mainController.currentIntervalLevel === Intervals.INVALID && (_loc8_ === Const.CANDLE_STICK || _loc8_ === Const.OHLC_CHART))
					_loc7_ = Const.DEFAULT_D;
				else
					_loc7_ = !!Const.INDICATOR_ENABLED ? mainViewPoint.getDetailLevelForTechnicalStyle() : mainViewPoint.getDetailLevel();

				if (_loc7_ === Intervals.INTRADAY && Boolean(MainManager.paramsObj.displayExtendedHours))
					this.displayManager.toggleAllAfterHoursSessions(true);
			}
			this.displayManager.windowResized(this.displayManager.stage.stageWidth, this.displayManager.stage.stageHeight);
		}

		resetLayersForNewQuote(dataSource: DataSource, style: string)
		{
			this.style_ = style;
			this.fullRedrawWithNextData_ = true;
			const viewPoints = this.displayManager.getViewPoints();
			const remove: IViewPoint[] = [];
			for (const viewPoint of viewPoints)
			{
				if (viewPoint.name === Const.MAIN_VIEW_POINT_NAME)
					remove.push(viewPoint);
				else if (viewPoint.name === Const.SPARKLINE_VIEW_POINT_NAME)
					(<SparklineViewPoint>viewPoint).replaceSparklineDataSource(dataSource);
			}
			this.removeAllLayers(remove);
		}

		private separateHiddenViewPoints(layerConfig: LayerConfig)
		{
			const viewpoints = layerConfig.viewpoints;
			const hiddenViewpoints = layerConfig.hiddenViewpoints;
			for (let viewPointIndex = 0; viewPointIndex < viewpoints.length; viewPointIndex++)
			{
				if (viewpoints[viewPointIndex].display === "hidden")
				{
					this.moveViewPointBtArrays(viewpoints[viewPointIndex].name, viewpoints, hiddenViewpoints);
					viewPointIndex--;
				}
			}
		}

		getDefaultZoomPair(dataSource: DataSource): StartEndPair
		{
			let _loc2_ = 0;
			const paramsObj = MainManager.paramsObj;
			if (paramsObj.defaultEndTime !== undefined && !isNaN(paramsObj.defaultEndTime))
			{
				const defaultEndTime = Number(paramsObj.defaultEndTime);
				//const _loc6_ = new Date(_loc5_);
				if (defaultEndTime > 0)
				{
					const timeIndex = DataSource.getTimeIndex(defaultEndTime, dataSource.data.units);
					const unit = dataSource.data.units[timeIndex];
					_loc2_ = Number(unit.relativeMinutes);
					if (dataSource.data.minuteIsEndOfDataSession(unit.dayMinute) && dataSource.afterHoursData && dataSource.afterHoursData.units.length > 0)
					{
						const afterHoursTimeIndex = DataSource.getTimeIndex(defaultEndTime, dataSource.afterHoursData.units);
						const relativeMinutes = dataSource.afterHoursData.units[afterHoursTimeIndex].relativeMinutes;
						if (_loc2_ < relativeMinutes)
						{
							if (timeIndex === dataSource.data.units.length - 1 || relativeMinutes < dataSource.data.units[timeIndex + 1].relativeMinutes)
								_loc2_ = Number(relativeMinutes);
						}
					}
				}
			}
			let _loc3_ = -1;
			if (_loc3_ === -1)
			{
				if (Const.DEFAULT_DISPLAY_MINUTES !== -1)
					_loc3_ = Number(Const.DEFAULT_DISPLAY_MINUTES);
				else
					_loc3_ = Number(this.displayManager.mainController.getCountForDays(dataSource, Const.DEFAULT_DISPLAY_DAYS, 0));
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
