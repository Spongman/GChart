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
				(<Dictionary>mainManager.stage.element)["callAsFunction"] = flash.display.Stage.bind(this.callAsFunction, this);
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

		addObject(ticker: string, type: string, date: Date, letter: string, id: number)
		{
			ticker = Utils.adjustNasdToNasdaq(ticker);
			const obj = {
				_qname: ticker,
				_type: type,
				_date: date,
				_id: id,
				_letter: letter
			};
			this.mainManager.addObject(obj);
		}

		removeLayerFromStyle(layerInfo: LayerInfo, param2: string)
		{
			const layersManager = this.mainManager.layersManager;
			layersManager.removeLayerFromStyle(layerInfo, param2);
		}

		initIndicators()
		{
			if (this.shouldSkipExternalInterfaceCall())
				return;

			if (!Const.INDICATOR_ENABLED)
				return;

			flash.external.ExternalInterface.call("google.finance.initTechnicals");
		}

		private handleMouseWheel(delta: number)
		{
			this.mainManager.displayManager.mainController.handleMouseWheel(delta);
		}

		logIntervalButtonClick(param1: string)
		{
			if (this.shouldSkipExternalInterfaceCall())
				return;

			flash.external.ExternalInterface.call("_GF_click", "", "chs_in", param1.replace(/\\/g, "\\\\"), "");
		}

		changePrimaryTicker(ticker: string, param2: string, param3 = false)
		{
			ticker = Utils.adjustNasdToNasdaq(ticker);
			this.mainManager.changePrimaryTicker(ticker, param2, param3);
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

		importGVizData(param1: any, indicatorName: string, param3: number)
		{
			const firstDataSource = this.mainManager.layersManager.getFirstDataSource();
			if (!firstDataSource)
				return;

			if (!firstDataSource.indicators[indicatorName])
				firstDataSource.indicators[indicatorName] = new Indicator();

			GVizFormatConverter.convertGVizData(param1, param3, firstDataSource.data, firstDataSource.indicators[indicatorName]);
		}

		updateLastPrice(param1: boolean, param2: number)
		{
			const firstDataSource = this.mainManager.layersManager.getFirstDataSource();
			const displayManager = this.mainManager.displayManager;
			if (!firstDataSource)
				return;

			if (this.updateLastPriceInDataSeries(!!param1 ? firstDataSource.afterHoursData : firstDataSource.data, param2))
			{
				if (displayManager.getDetailLevel() === Intervals.INTRADAY)
					displayManager.update(true);
			}
		}

		private playerMouseWheelHandler(mouseWheelEvent: MouseWheelEvent)
		{
			let delta = mouseWheelEvent.wheelDelta < 0 ? -3 : 3;
			this.handleMouseWheel(delta);

			mouseWheelEvent.preventDefault();
			mouseWheelEvent.stopPropagation();
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
			const layersManager = this.mainManager.layersManager;
			const displayManager = this.mainManager.displayManager;
			const _loc5_ = param2.split("*");
			if (Const.DEPENDENT_INDICATOR_NAMES.indexOf(param1) !== -1 || Const.VOLUME_DEPENDENT_INDICATOR_NAMES.indexOf(param1) !== -1)
			{
				const _loc6_ = Const.DEPENDENT_INDICATOR_NAMES.indexOf(param1) !== -1 ? Const.MAIN_VIEW_POINT_NAME : Const.BOTTOM_VIEW_POINT_NAME;
				if (Boolean(_loc5_[0]))
				{
					displayManager.enableIndicatorConfig(param1, true);
					displayManager.enableIndicatorLayer(param1, _loc6_, true);
					displayManager.setIndicatorInstanceArray(param1, this.getIndicatorInstanceArray(param1, _loc5_));
				}
				else
				{
					displayManager.enableIndicatorConfig(param1, false);
					displayManager.enableIndicatorLayer(param1, _loc6_, false);
				}
			}
			else if (Const.INDEPENDENT_INDICATOR_NAMES.indexOf(param1) !== -1)
			{
				if (Boolean(_loc5_[0]))
				{
					if (!displayManager.isIndicatorConfigEnabled(param1))
					{
						this.mainManager.layersManager.chartHeightInStyle[LayersManager.SINGLE] = this.mainManager.layersManager.chartHeightInStyle[LayersManager.SINGLE] + Const.TECHNICAL_INDICATOR_HEIGHT;
						displayManager.enableIndicatorConfig(param1, true);
						layersManager.unhideViewPoint(param1, LayersManager.SINGLE);
						displayManager.setIndicatorInstanceArray(param1, this.getIndicatorInstanceArray(param1, _loc5_));
						Const.MOVIE_HEIGHT = this.mainManager.stage.stageHeight;
					}
				}
				else if (displayManager.isIndicatorConfigEnabled(param1))
				{
					this.mainManager.layersManager.chartHeightInStyle[LayersManager.SINGLE] = this.mainManager.layersManager.chartHeightInStyle[LayersManager.SINGLE] - Const.TECHNICAL_INDICATOR_HEIGHT;
					displayManager.enableIndicatorConfig(param1, false);
					layersManager.hideViewPoint(param1, LayersManager.SINGLE);
					Const.MOVIE_HEIGHT = this.mainManager.stage.stageHeight;
				}
				const mainViewPoint = displayManager.getMainViewPoint();
				if (mainViewPoint)
					mainViewPoint.checkEvents();

				displayManager.update();
			}
		}

		removeCompareTo(ticker: string)
		{
			if (!this.mainManager.layersManager.getFirstDataSource())
				return;

			ticker = Utils.adjustNasdToNasdaq(ticker);
			this.mainManager.removeCompareTo(ticker);
		}

		addCompareTo(ticker: string, param2: string, param3 = false)
		{
			if (!this.mainManager.layersManager.getFirstDataSource())
				return;

			ticker = Utils.adjustNasdToNasdaq(ticker);
			this.mainManager.addCompareTo(ticker, param2, param3);
		}

		getData(ticker: string, param2: string)
		{
			if (this.shouldSkipExternalInterfaceCall())
				return;

			ticker = Utils.adjustNasdToNasdaq(ticker);
			if (this.javascriptRequestMade)
				return;

			this.javascriptRequestMade = true;
			flash.external.ExternalInterface.call("_sendAllDataToChart", encodeURIComponent(ticker), "flash");
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

		removeObject(ticker: string, param2: string, param3: string)
		{
			ticker = Utils.adjustNasdToNasdaq(ticker);
			this.mainManager.removeObject(ticker, param2, param3);
		}

		expandChart()
		{
			if (this.shouldSkipExternalInterfaceCall())
				return;

			flash.external.ExternalInterface.call("_expandChart");
			flash.external.ExternalInterface.call("_GF_click", "", "chs_ec", "", "");
		}

		addLayerToStyle(layerInfo: LayerInfo, param2: string)
		{
			const layersManager = this.mainManager.layersManager;
			layersManager.addLayerToStyle(layerInfo, param2);
		}

		setParameter(param1: string, param2: string)
		{
			const layersManager = this.mainManager.layersManager;
			const displayManager = this.mainManager.displayManager;
			com.google.finance.MainManager.paramsObj[param1] = param2;
			if (param1 === "displayNewsPins")
				Const.DISPLAY_NEWS_PINS = "true" === param2;

			if (param1 === "displayVolume")
			{
				if (!Boolean(param2))
					layersManager.hideViewPoint("BottomViewPoint", "single");
				else
					layersManager.unhideViewPoint("BottomViewPoint", "single");

				displayManager.windowResized(Const.MOVIE_WIDTH, Const.MOVIE_HEIGHT);
			}
			if (param1 === "displayExtendedHours" && com.google.finance.MainManager.paramsObj.hasExtendedHours !== "false")
			{
				if (Boolean(param2))
					displayManager.setAfterHoursDisplay(true);
				else
					displayManager.setAfterHoursDisplay(false);

				const mainViewPoint = displayManager.getMainViewPoint();
				if (mainViewPoint)
					this.setJsCurrentViewParam("defaultDisplayMinutes", mainViewPoint.count);

				const firstDataSource = layersManager.getFirstDataSource();
				if (firstDataSource)
					this.setForceDisplayExtendedHours(firstDataSource);
			}
			if (param1 === "minZoomDays")
				displayManager.mainController.setMinDisplayDays(Number(param2));

			displayManager.update();
		}

		addData(ticker: string, param2: string, param3: string, param4: string, param5: string)
		{
			ticker = Utils.adjustNasdToNasdaq(ticker);
			const dataManager = this.mainManager.dataManager;
			const event = EventFactory.getEvent(ChartEventTypes.GET_DATA, ticker, ChartEventPriorities.OPTIONAL);
			dataManager.addData(event, decodeURIComponent(param3));
			if (param5)
				dataManager.addData(event, decodeURIComponent(param5));
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
			const pointsInIntervalArray = dataSeries.getPointsInIntervalArray(Const.INTRADAY_INTERVAL);
			const lastRealPointIndex = Utils.getLastRealPointIndex(pointsInIntervalArray);
			if (lastRealPointIndex >= 0)
			{
				const _loc5_ = pointsInIntervalArray[lastRealPointIndex];
				_loc5_.close = param2;
				_loc5_.low = Utils.extendedMin(_loc5_.low, param2);
				_loc5_.high = Utils.extendedMax(_loc5_.high, param2);
				_loc5_.realtime = true;
				return true;
			}
			return false;
		}

		clearAllPins(ticker: string)
		{
			ticker = Utils.adjustNasdToNasdaq(ticker);
			this.mainManager.clearAllPins(ticker);
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

		HTMLnotify(startDate: Date, endDate: Date, param3: number, param4: number, param5 = false)
		{
			if (this.shouldSkipExternalInterfaceCall())
				return;

			flash.external.ExternalInterface.call("_visibleChartRangeChanged", startDate, endDate, param3, param4, param5);
		}

		htmlClicked(ticker: string, param2: number)
		{
			ticker = Utils.adjustNasdToNasdaq(ticker);
			this.mainManager.htmlClicked(ticker, param2);
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
