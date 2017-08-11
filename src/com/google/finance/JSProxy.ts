namespace com.google.finance
{
	// import flash.system.Capabilities;
	// import flash.external.ExternalInterface;
	// import flash.utils.getDefinitionByName;
	// import flash.events.MouseEvent;

	export class JSProxy
	{
		private javascriptRequestMade = false;
		private javascriptNotified = false;

		constructor(private readonly mainManager: com.google.finance.MainManager)
		{
			if (!com.google.finance.MainManager.paramsObj["disableExternalInterface"] && flash.external.ExternalInterface.available)
			{
				(<{ [key: string]: any }>mainManager.stage.element)["callAsFunction"] = flash.display.Stage.bind(this.callAsFunction, this);
				//flash.external.ExternalInterface.addCallback("callAsFunction", this.callAsFunction.bind(this));
			}
			//TODO if (Capabilities.os.search(/Linux*/) === 0)
			{
				mainManager.stage.addEventListener(MouseEvents.MOUSE_WHEEL, flash.display.Stage.bind(this.playerMouseWheelHandler, this));
			}
		}

		static isPlayingInBrowser(): boolean
		{
			return true;
			//return Capabilities.playerType !== "StandAlone" && Capabilities.playerType !== "External";
		}

		addObject(param1: string, param2: string, param3: Date, param4: string, param5: number) 
		{
			param1 = Utils.adjustNasdToNasdaq(param1);
			const _loc6_ = {
				"_qname": param1,
				"_type": param2,
				"_date": param3,
				"_id": param5,
				"_letter": param4
			};
			this.mainManager.addObject(_loc6_);
		}

		removeLayerFromStyle(param1: LayerInfo, param2: string) 
		{
			const _loc3_ = this.mainManager.layersManager;
			_loc3_.removeLayerFromStyle(param1, param2);
		}

		initIndicators() 
		{
			if (this.shouldSkipExternalInterfaceCall())
				return;

			if (!Const.INDICATOR_ENABLED)
				return;

			flash.external.ExternalInterface.call("google.finance.initTechnicals");
		}

		private handleMouseWheel(param1: number) 
		{
			this.mainManager.displayManager.mainController.handleMouseWheel(param1);
		}

		logIntervalButtonClick(param1: string) 
		{
			if (this.shouldSkipExternalInterfaceCall())
				return;

			flash.external.ExternalInterface.call("_GF_click", "", "chs_in", param1.replace(/\\/g, "\\\\"), "");
		}

		changePrimaryTicker(param1: string, param2: string, param3 = false) 
		{
			param1 = Utils.adjustNasdToNasdaq(param1);
			this.mainManager.changePrimaryTicker(param1, param2, param3);
		}

		private getIndicatorInstanceArray(indicatorName: string, params: any[]): any[]
		{
			try
			{
				let indicatorClass = getDefinitionByName("com.google.finance.indicator." + indicatorName + "IndicatorLayer") as typeof indicator.IndicatorLayer;
				//let parameterNames = (<any>indicatorClass.getParameterNames())["getParameterNames"]() as string[];
				let parameterNames = indicatorClass.getParameterNames();

				let instances: any[] = [];
				let index = 1;
				while (index < params.length)
				{
					let instance = <any>{};	// TODO
					let finished = true;
					for (let i = 0; i < parameterNames.length; i++)
					{
						if (index === params.length)
							finished = false;

						(<any>instance)[parameterNames[i]] = params[index++];
					}

					if (finished)
						instances.push(instance);
				}
				if (instances.length === 0)
					instances = Const.INDICATOR_PARAMETERS[indicatorName];
				else
					Const.INDICATOR_PARAMETERS[indicatorName] = instances;

				return instances;
			}
			catch (re /*: ReferenceError*/)
			{
				return Const.INDICATOR_PARAMETERS[indicatorName];
			}
		}

		importGVizData(param1: any, param2: string, param3: number) 
		{
			const _loc4_ = this.mainManager.layersManager.getFirstDataSource();
			if (!_loc4_)
				return;

			if (!_loc4_.indicators[param2])
				_loc4_.indicators[param2] = new Indicator();

			GVizFormatConverter.convertGVizData(param1, param3, _loc4_.data, _loc4_.indicators[param2]);
		}

		updateLastPrice(param1: boolean, param2: number) 
		{
			const _loc3_ = this.mainManager.layersManager.getFirstDataSource();
			const _loc4_ = this.mainManager.displayManager;
			if (!_loc3_)
				return;

			if (this.updateLastPriceInDataSeries(!!param1 ? _loc3_.afterHoursData : _loc3_.data, param2))
			{
				if (_loc4_.getDetailLevel() === Intervals.INTRADAY)
					_loc4_.update(true);
			}
		}

		private playerMouseWheelHandler(param1: MouseWheelEvent) 
		{
			let delta = param1.wheelDelta < 0 ? -3 : 3;
			this.handleMouseWheel(delta);

			param1.preventDefault();
			param1.stopPropagation();
		}

		firstDataIsHere() 
		{
			if (this.shouldSkipExternalInterfaceCall())
				return;

			if (this.javascriptNotified)
				return;

			this.javascriptNotified = true;
			flash.external.ExternalInterface.call("_firstDataIsHere");
		}

		setChartFocus(param1: boolean) 
		{
			if (this.shouldSkipExternalInterfaceCall())
				return;

			flash.external.ExternalInterface.call("_setChartFocus", param1);
		}

		resetChartHeight(param1: number) 
		{
			if (this.shouldSkipExternalInterfaceCall())
				return;

			flash.external.ExternalInterface.call("_setChartSize", param1 + "px");
		}

		setJsCurrentViewParam(param1: string, param2: any) 
		{
			if (this.shouldSkipExternalInterfaceCall())
				return;

			flash.external.ExternalInterface.call("_setCurrentViewParam", encodeURIComponent(param1), encodeURIComponent(param2.toString()));
		}

		toggleIndicator(param1: string, param2: string) 
		{
			const _loc3_ = this.mainManager.layersManager;
			const _loc4_ = this.mainManager.displayManager;
			const _loc5_ = param2.split("*");
			if (Const.DEPENDENT_INDICATOR_NAMES.indexOf(param1) !== -1 || Const.VOLUME_DEPENDENT_INDICATOR_NAMES.indexOf(param1) !== -1)
			{
				const _loc6_ = Const.DEPENDENT_INDICATOR_NAMES.indexOf(param1) !== -1 ? Const.MAIN_VIEW_POINT_NAME : Const.BOTTOM_VIEW_POINT_NAME;
				if (Boolean(_loc5_[0]))
				{
					_loc4_.enableIndicatorConfig(param1, true);
					_loc4_.enableIndicatorLayer(param1, _loc6_, true);
					_loc4_.setIndicatorInstanceArray(param1, this.getIndicatorInstanceArray(param1, _loc5_));
				}
				else
				{
					_loc4_.enableIndicatorConfig(param1, false);
					_loc4_.enableIndicatorLayer(param1, _loc6_, false);
				}
			}
			else if (Const.INDEPENDENT_INDICATOR_NAMES.indexOf(param1) !== -1)
			{
				if (Boolean(_loc5_[0]))
				{
					if (!_loc4_.isIndicatorConfigEnabled(param1))
					{
						this.mainManager.layersManager.chartHeightInStyle[LayersManager.SINGLE] = this.mainManager.layersManager.chartHeightInStyle[LayersManager.SINGLE] + Const.TECHNICAL_INDICATOR_HEIGHT;
						_loc4_.enableIndicatorConfig(param1, true);
						_loc3_.unhideViewPoint(param1, LayersManager.SINGLE);
						_loc4_.setIndicatorInstanceArray(param1, this.getIndicatorInstanceArray(param1, _loc5_));
						Const.MOVIE_HEIGHT = this.mainManager.stage.stageHeight;
					}
				}
				else if (_loc4_.isIndicatorConfigEnabled(param1))
				{
					this.mainManager.layersManager.chartHeightInStyle[LayersManager.SINGLE] = this.mainManager.layersManager.chartHeightInStyle[LayersManager.SINGLE] - Const.TECHNICAL_INDICATOR_HEIGHT;
					_loc4_.enableIndicatorConfig(param1, false);
					_loc3_.hideViewPoint(param1, LayersManager.SINGLE);
					Const.MOVIE_HEIGHT = this.mainManager.stage.stageHeight;
				}
				const _loc7_ = _loc4_.getMainViewPoint();
				if (_loc7_)
					_loc7_.checkEvents();

				_loc4_.update();
			}
		}

		removeCompareTo(param1: string) 
		{
			if (!this.mainManager.layersManager.getFirstDataSource())
				return;

			param1 = Utils.adjustNasdToNasdaq(param1);
			this.mainManager.removeCompareTo(param1);
		}

		addCompareTo(param1: string, param2: string, param3 = false) 
		{
			if (!this.mainManager.layersManager.getFirstDataSource())
				return;

			param1 = Utils.adjustNasdToNasdaq(param1);
			this.mainManager.addCompareTo(param1, param2, param3);
		}

		getData(param1: string, param2: string) 
		{
			if (this.shouldSkipExternalInterfaceCall())
				return;

			param1 = Utils.adjustNasdToNasdaq(param1);
			if (this.javascriptRequestMade)
				return;

			this.javascriptRequestMade = true;
			flash.external.ExternalInterface.call("_sendAllDataToChart", encodeURIComponent(param1), "flash");
		}

		setLineStyle(lineStyle: string) 
		{
			if (this.mainManager.layersManager.getStyle() === LayersManager.SINGLE)
			{
				const displayManager = this.mainManager.displayManager;
				const chartLayer = displayManager.getEnabledChartLayer();
				const _loc4_ = lineStyle + "ChartLayer";
				displayManager.setEnabledChartLayer("");
				displayManager.mainController.toggleZoomIntervalButtons(chartLayer, _loc4_);
				displayManager.setEnabledChartLayer(_loc4_);
				this.setJsCurrentViewParam("lineStyle", lineStyle);
			}
		}

		removeObject(param1: string, param2: string, param3: string) 
		{
			param1 = Utils.adjustNasdToNasdaq(param1);
			this.mainManager.removeObject(param1, param2, param3);
		}

		expandChart() 
		{
			if (this.shouldSkipExternalInterfaceCall())
				return;

			flash.external.ExternalInterface.call("_expandChart");
			flash.external.ExternalInterface.call("_GF_click", "", "chs_ec", "", "");
		}

		addLayerToStyle(param1: LayerInfo, param2: string) 
		{
			const _loc3_ = this.mainManager.layersManager;
			_loc3_.addLayerToStyle(param1, param2);
		}

		setParameter(param1: string, param2: string) 
		{
			const _loc3_ = this.mainManager.layersManager;
			const _loc4_ = this.mainManager.displayManager;
			com.google.finance.MainManager.paramsObj[param1] = param2;
			if (param1 === "displayNewsPins")
				Const.DISPLAY_NEWS_PINS = "true" === param2;

			if (param1 === "displayVolume")
			{
				if (!Boolean(param2))
					_loc3_.hideViewPoint("BottomViewPoint", "single");
				else
					_loc3_.unhideViewPoint("BottomViewPoint", "single");

				_loc4_.windowResized(Const.MOVIE_WIDTH, Const.MOVIE_HEIGHT);
			}
			if (param1 === "displayExtendedHours" && com.google.finance.MainManager.paramsObj.hasExtendedHours !== "false")
			{
				if (Boolean(param2))
					_loc4_.setAfterHoursDisplay(true);
				else
					_loc4_.setAfterHoursDisplay(false);

				const _loc5_ = _loc4_.getMainViewPoint();
				if (_loc5_)
					this.setJsCurrentViewParam("defaultDisplayMinutes", _loc5_.count);

				const _loc6_ = _loc3_.getFirstDataSource();
				if (_loc6_)
					this.setForceDisplayExtendedHours(_loc6_);
			}
			if (param1 === "minZoomDays")
				_loc4_.mainController.setMinDisplayDays(Number(param2));

			_loc4_.update();
		}

		addData(param1: string, param2: string, param3: string, param4: string, param5: string) 
		{
			param1 = Utils.adjustNasdToNasdaq(param1);
			const _loc6_ = this.mainManager.dataManager;
			const _loc7_ = EventFactory.getEvent(ChartEventTypes.GET_DATA, param1, ChartEventPriorities.OPTIONAL);
			_loc6_.addData(_loc7_, decodeURIComponent(param3));
			if (param5)
				_loc6_.addData(_loc7_, decodeURIComponent(param5));
		}

		setJsChartType(param1: string) 
		{
			if (this.shouldSkipExternalInterfaceCall())
				return;

			flash.external.ExternalInterface.call("_setChartType", encodeURIComponent(param1));
		}

		private callAsFunction(param1: string, ...rest: any[]) 
		{
			switch (param1)
			{
				case "addCompareTo":
					this.addCompareTo.apply(this, rest[0]);
					break;
				case "addLayerToStyle":
					this.addLayerToStyle.apply(this, rest[0]);
					break;
				case "addObjectArray":
					this.addObjectArray.apply(this, rest[0]);
					break;
				case "changePrimaryTicker":
					this.changePrimaryTicker.apply(this, rest[0]);
					break;
				case "clearAllPins":
					this.clearAllPins.apply(this, rest[0]);
					break;
				case "enableIndicator":
					this.toggleIndicator.apply(this, rest[0]);
					break;
				case "handleMouseWheel":
					this.handleMouseWheel.apply(this, rest[0]);
					break;
				case "htmlClicked":
					this.htmlClicked.apply(this, rest[0]);
					break;
				case "removeCompareTo":
					this.removeCompareTo.apply(this, rest[0]);
					break;
				case "removeLayerFromStyle":
					this.removeLayerFromStyle.apply(this, rest[0]);
					break;
				case "setLineStyle":
					this.setLineStyle.apply(this, rest[0]);
					break;
				case "setParameter":
					this.setParameter.apply(this, rest[0]);
					break;
				case "updateLastPrice":
					this.updateLastPrice.apply(this, rest[0]);
					break;
				case "importGVizData":
					this.importGVizData.apply(this, rest[0]);
					break;
			}
		}

		updateLastPriceInDataSeries(dataSeries: DataSeries, param2: number): boolean
		{
			const _loc3_ = dataSeries.getPointsInIntervalArray(Const.INTRADAY_INTERVAL);
			const _loc4_ = Utils.getLastRealPointIndex(_loc3_);
			if (_loc4_ >= 0)
			{
				const _loc5_ = _loc3_[_loc4_];
				_loc5_.close = param2;
				_loc5_.low = Utils.extendedMin(_loc5_.low, param2);
				_loc5_.high = Utils.extendedMax(_loc5_.high, param2);
				_loc5_.realtime = true;
				return true;
			}
			return false;
		}

		clearAllPins(param1: string) 
		{
			param1 = Utils.adjustNasdToNasdaq(param1);
			this.mainManager.clearAllPins(param1);
		}

		removeObjectArray(param1: { [key: string]: string }[]) 
		{
			Utils.adjustExchangeNameOfArray(param1, "_quote");
			this.mainManager.removeObjectArray(param1);
		}

		shrinkChart() 
		{
			if (this.shouldSkipExternalInterfaceCall())
				return;

			flash.external.ExternalInterface.call("_shrinkChart");
			flash.external.ExternalInterface.call("_GF_click", "", "chs_sc", "", "");
		}

		addObjectArray(param1: any[]) 
		{
			let pinArray = param1;
			if (!pinArray)
				return;

			try
			{
				Utils.adjustExchangeNameOfArray(pinArray, "_quote");
				com.google.finance.MainManager.paramsObj.differentDividendCurrency = com.google.finance.MainManager.paramsObj.differentDividendCurrency || Utils.hasDifferentDividendCurrency(com.google.finance.MainManager.paramsObj.companyCurrency, pinArray);
				this.mainManager.addObjectArray(pinArray);
				return;
			}
			catch (er /*: TypeError*/)
			{
				return;
			}
		}

		shouldSkipExternalInterfaceCall(): boolean
		{
			return !JSProxy.isPlayingInBrowser() || !flash.external.ExternalInterface.available || com.google.finance.MainManager.paramsObj["disableExternalInterface"];
		}

		HTMLnotify(param1: Date, param2: Date, param3: number, param4: number, param5 = false) 
		{
			if (this.shouldSkipExternalInterfaceCall())
				return;

			flash.external.ExternalInterface.call("_visibleChartRangeChanged", param1, param2, param3, param4, param5);
		}

		htmlClicked(param1: string, param2: number) 
		{
			param1 = Utils.adjustNasdToNasdaq(param1);
			this.mainManager.htmlClicked(param1, param2);
		}

		setForceDisplayExtendedHours(dataSource: DataSource) 
		{
			const _loc2_ = dataSource.visibleExtendedHours.length() !== 0;
			this.setJsCurrentViewParam("forceDisplayExtendedHours", _loc2_);
		}

		iClicked(param1: string, param2: string, param3: number, param4: string) 
		{
			if (this.shouldSkipExternalInterfaceCall())
				return;

			flash.external.ExternalInterface.call("_flashClicked", param3);
			flash.external.ExternalInterface.call("_GF_click", "", param2 === "newspin" ? "n-f-" : "n-fp-", !!param4 ? param4.replace(/\\/g, "\\\\") : param3, "");
			this.mainManager.htmlClicked(param1, param3, param4);
		}

		logZoomButtonClick(param1: string) 
		{
			if (this.shouldSkipExternalInterfaceCall())
				return;

			flash.external.ExternalInterface.call("_GF_click", "", "chs_zl", param1.replace(/\\/g, "\\\\"), "");
		}
	}
}
