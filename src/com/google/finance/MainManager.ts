/// <reference path="../../../flash/display/Sprite.ts" />
namespace com.google.finance
{
	export class MainManager extends flash.display.Sprite
	{
		public static paramsObj: any;
		public static jsProxy: JSProxy;
		public static console: Console;
		public static mouseCursor: MouseCursor;

		//private defaultDays: number;
		private firstDataNotified = false;
		//private minZoomLevel: number;
		private endTime: number;
		private startTime: number;
		private quoteType: QuoteTypes;
		private waitSizeIntId: number;

		public quote: string;
		public displayManager: DisplayManager;
		public layersManager: LayersManager;
		public dataManager: DataManager;
		public stickyArgs: string;
		public url: string;
		public weekdayBitmap: number;

		constructor(stage: flash.display.Stage)
		{
			super();
			stage.addChild(this);

			MainManager.paramsObj = window.loaderInfo.parameters;
			MainManager.jsProxy = new JSProxy(this);
			if (this.stage.stageWidth === 0)
				this.waitSizeIntId = setInterval(flash.display.Stage.bind(this.checkSize, this), 20);
			else
				this.init();
		}

		dataIsHere(dataSource: DataSource, param2: AddStreamResults)
		{
			if (dataSource.countEvents(ChartEventPriorities.REQUIRED) + dataSource.countEvents(ChartEventPriorities.EXPECTED) > 0)
				return;

			const detailLevel = this.displayManager.getDetailLevel();
			if (this.shouldToggleAfterHours(detailLevel))
				this.displayManager.toggleAllAfterHoursSessions(true, dataSource);
			else
				this.displayManager.toggleAllAfterHoursSessions(false, dataSource);

			if (Boolean(MainManager.paramsObj.forceDisplayExtendedHours))
				MainManager.paramsObj.forceDisplayExtendedHours = "false";

			if (!this.displayManager.isDifferentMarketSessionComparison())
				this.displayManager.computeRelativeTimes(dataSource);

			const firstDataSource = this.layersManager.getFirstDataSource();
			if (firstDataSource)
			{
				this.dataManager.syncDataSources(dataSource, this.displayManager);
				this.displayManager.mainController.syncZoomLevel();
			}
			if (this.displayManager.isDifferentMarketSessionComparison())
				this.displayManager.computeRelativeTimesForDiffSessionComparison();

			this.layersManager.newData(dataSource);
			if (this.firstDataNotified === false)
			{
				this.firstDataNotified = true;
				MainManager.jsProxy.firstDataIsHere();
				this.displayManager.HTMLnotify(Const.MAIN_VIEW_POINT_NAME);
			}
		}

		private parseSettingString(param1: string, param2: number): (string | null)[] | null
		{
			const parts: (string | null)[] | null = param1 ? param1.split(';') : null;
			if (!parts || parts.length !== param2)
				return null;

			for (let partIndex = 0; partIndex < parts.length; partIndex++)
			{
				if (parts[partIndex] === "")
					parts[partIndex] = null;
			}
			return parts;
		}

		private needAfterHoursData(quote: string): ChartEvent | null
		{
			if (quote === this.quote && (Boolean(MainManager.paramsObj.forceDisplayExtendedHours) || Boolean(MainManager.paramsObj.displayExtendedHours)))
				return EventFactory.getEvent(ChartDetailTypes.GET_AH_DATA, quote, ChartEventPriorities.REQUIRED);

			return null;
		}

		private init()
		{
			this.stage.align = flash.display.StageAlign.TOP_LEFT;
			this.stage.scaleMode = flash.display.StageScaleMode.NO_SCALE;
			this.stage.addEventListener(Events.RESIZE, flash.display.Stage.bind(this.onResize, this));
			Const.MOVIE_HEIGHT = this.stage.stageHeight;
			Const.MOVIE_WIDTH = this.stage.stageWidth;
			this.quote = MainManager.paramsObj.q || Const.DEFAULT_Q;
			this.quoteType = Const.getQuoteType(this.quote);
			this.startTime = MainManager.paramsObj.startTime || NaN;
			this.endTime = MainManager.paramsObj.endTime || NaN;
			this.weekdayBitmap = MainManager.paramsObj.weekdayBitmap || Const.DEFAULT_WEEKDAY_BITMAP;
			const url = window.loaderInfo.url;
			const _loc2_ = url.substring(0, url.indexOf("/finance/"));
			if (MainManager.paramsObj.u)
			{
				if (MainManager.paramsObj.u.indexOf("/finance/") === -1)
					this.url = _loc2_ + "/finance/" + MainManager.paramsObj.u;
				else
					this.url = _loc2_ + MainManager.paramsObj.u.substring(MainManager.paramsObj.u.indexOf("/finance/"));
			}
			else
			{
				this.url = "about:blank";
				console.log("ERROR: No URL was provided!");
			}
			this.stickyArgs = MainManager.paramsObj.sa === undefined ? "" : MainManager.paramsObj.sa;
			MainManager.console = new Console(this);
			this.checkParameters();
			this.displayManager = new DisplayManager(this);
			this.addChild(this.displayManager);
			this.addChild(MainManager.console);
			this.dataManager = new DataManager(this, this.startTime, this.endTime);
			this.displayManager.init(this.stage.stageWidth, this.stage.stageHeight);
			this.layersManager = new LayersManager(this.displayManager, this);
			const _loc4_ = MainManager.paramsObj.compareTo && MainManager.paramsObj.compareToDiffMarketSessions && MainManager.paramsObj.compareToDiffMarketSessions.indexOf('1') !== -1;
			this.getQuote(this.quote, MainManager.paramsObj.displayName, Const.getDefaultDisplayDays(_loc4_), true);
			this.addDefaultCompareToTickers();
			MainManager.mouseCursor = new MouseCursor();
			this.addChild(MainManager.mouseCursor);
			MainManager.mouseCursor.initListeners();
			MainManager.jsProxy.initIndicators();

			flash.display.Graphics.cleanupPending();
		}

		private checkParameters()
		{
			const _loc1_ = MainManager.paramsObj.lineStyle || "IntervalBasedLine";
			Const.DEFAULT_CHART_STYLE_NAME = _loc1_ + "ChartLayer";
			Const.INTRADAY_INTERVAL = MainManager.paramsObj.intradayInterval || Const.INTRADAY_INTERVAL;
			Const.MIN_DISPLAY_DAYS = MainManager.paramsObj.minZoomDays || Const.MIN_DISPLAY_DAYS;
			Const.DEFAULT_DISPLAY_DAYS = MainManager.paramsObj.defaultZoomDays || Const.DEFAULT_DISPLAY_DAYS;
			if (MainManager.paramsObj.defaultDisplayInterval)
				Const.DEFAULT_D = Const.getIntervalDetailLevel(MainManager.paramsObj.defaultDisplayInterval);
			else if (MainManager.paramsObj.defaultInterval)
				Const.DEFAULT_D = Const.getIntervalDetailLevel(MainManager.paramsObj.defaultInterval);

			Const.DEFAULT_DISPLAY_MINUTES = MainManager.paramsObj.defaultDisplayMinutes || Const.DEFAULT_DISPLAY_MINUTES;
			if (Const.DEFAULT_DISPLAY_DAYS < Const.MIN_DISPLAY_DAYS)
				Const.DEFAULT_DISPLAY_DAYS = Const.MIN_DISPLAY_DAYS;

			MainManager.paramsObj.sparklineType = MainManager.paramsObj.sparklineType || Const.DYNAMIC;
			MainManager.paramsObj.snapping = Utils.checkUndefined(MainManager.paramsObj.snapping, "true");
			MainManager.paramsObj.displayExtendedHours = Utils.checkUndefined(MainManager.paramsObj.displayExtendedHours, "true");
			MainManager.paramsObj.hasExtendedHours = Utils.checkUndefined(MainManager.paramsObj.hasExtendedHours, "false");
			MainManager.paramsObj.displayExtendedHours = Utils.checkUndefined(MainManager.paramsObj.displayExtendedHours, "false");
			if (!Boolean(MainManager.paramsObj.hasExtendedHours))
				MainManager.paramsObj.displayExtendedHours = "false";

			Const.INFO_TEXT_ALIGN = MainManager.paramsObj.infoTextAlign || Const.INFO_TEXT_ALIGN;
			Const.INFO_TEXT_TOP_PADDING = MainManager.paramsObj.infoTextTopPadding || Const.INFO_TEXT_TOP_PADDING;
			Const.DISPLAY_DIVIDENDS_UNITS = MainManager.paramsObj.displayDividendsUnits || Const.DISPLAY_DIVIDENDS_UNITS;
			Const.POSITIVE_DIFFERENCE_COLOR = MainManager.paramsObj.positiveColor || Const.POSITIVE_DIFFERENCE_COLOR;
			Const.NEGATIVE_DIFFERENCE_COLOR = MainManager.paramsObj.negativeColor || Const.NEGATIVE_DIFFERENCE_COLOR;
			Const.ENABLE_CUSTOM_DATE_ENTRY = Utils.checkUndefined(MainManager.paramsObj.enableCustomDateEntry, "false");
			Const.ENABLE_COMPACT_FLAGS = Utils.checkUndefined(MainManager.paramsObj.enableCompactFlags, "true");
			Const.INDICATOR_ENABLED = "true" === String(Utils.checkUndefined(MainManager.paramsObj.enableIndicator, false));
			Const.REALTIME_CHART_ENABLED = "true" === String(Utils.checkUndefined(MainManager.paramsObj.enableRealtimeChart, false));
			if (MainManager.paramsObj.displayNewsPins !== undefined)
				Const.DISPLAY_NEWS_PINS = "true" === String(MainManager.paramsObj.displayNewsPins);

			if (Const.INDICATOR_ENABLED)
				Const.SPARKLINE_HEIGHT -= 20;

			Const.VOLUME_PLUS_ENABLED = "true" === String(Utils.checkUndefined(MainManager.paramsObj.enableVolumePlus, Const.isZhLocale(i18n.locale.DateTimeLocale.getLocale())));
			Const.CHART_TYPE_BUTTONS_ENABLED = "true" === String(Utils.checkUndefined(MainManager.paramsObj.enableChartTypeButtons, Const.isZhLocale(i18n.locale.DateTimeLocale.getLocale())));
			Const.APPLY_CHINESE_STYLE_MACD = "true" === String(Utils.checkUndefined(MainManager.paramsObj.applyChineseStyleMacd, i18n.locale.DateTimeLocale.getLocale() === Const.ZH_CN_LOCALE));
			Const.EXPAND_BUTTON_ENABLED = "true" === String(Utils.checkUndefined(MainManager.paramsObj.expandButtonEnabled, false));
			Const.SHRINK_BUTTON_ENABLED = "true" === String(Utils.checkUndefined(MainManager.paramsObj.shrinkButtonEnabled, false));
			if (MainManager.paramsObj.lclc !== undefined)
				Const.LINE_CHART_LINE_COLOR = MainManager.paramsObj.lclc;

			if (MainManager.paramsObj.lcfc !== undefined)
				Const.LINE_CHART_FILL_COLOR = MainManager.paramsObj.lcfc;

			if (MainManager.paramsObj.salc !== undefined)
				Const.SPARK_ACTIVE_LINE_COLOR = MainManager.paramsObj.salc;

			if (MainManager.paramsObj.safc !== undefined)
				Const.SPARK_ACTIVE_FILL_COLOR = MainManager.paramsObj.safc;

			if (MainManager.paramsObj.silc !== undefined)
				Const.SPARK_INACTIVE_LINE_COLOR = MainManager.paramsObj.silc;

			if (MainManager.paramsObj.sifc !== undefined)
				Const.SPARK_INACTIVE_FILL_COLOR = MainManager.paramsObj.sifc;

			if (MainManager.paramsObj.tbg !== undefined)
				Const.TEXT_BACKGROUND_COLOR = MainManager.paramsObj.tbg;

			if (MainManager.paramsObj.rtc !== undefined)
				Const.RANGE_TEXT_COLOR = MainManager.paramsObj.rtc;

			if (MainManager.paramsObj.dc !== undefined)
				Const.DOT_COLOR = MainManager.paramsObj.dc;

			if (MainManager.paramsObj.vc !== undefined)
				Const.VOLUME_HIGHLIGHT_COLOR = MainManager.paramsObj.vc;

			if (MainManager.paramsObj.ecnlc !== undefined)
				Const.ECN_LINE_CHART_LINE_COLOR = MainManager.paramsObj.ecnlc;

			if (MainManager.paramsObj.ecnfc !== undefined)
				Const.ECN_LINE_CHART_FILL_COLOR = MainManager.paramsObj.ecnfc;
		}

		removeCompareTo(param1: string)
		{
			this.layersManager.removeCompareTo(param1);
		}

		addCompareTo(param1: string, param2?: string, param3: boolean = false)
		{
			this.dataManager.checkDataSourceExistance(param1, param2);
			this.layersManager.addCompareTo(param1, param3);
		}

		getQuoteType(): QuoteTypes
		{
			return this.quoteType;
		}

		private checkSize()
		{
			if (this.stage.stageWidth !== 0)
			{
				clearInterval(this.waitSizeIntId);
				this.init();
			}
		}

		clearAllPins(param1: string)
		{
			this.dataManager.clearAllObjects(param1, "newspin");
			const mainViewPoint = this.displayManager.getMainViewPoint();
			mainViewPoint.updateObjectLayers();
		}

		removeObjectArray(objects: any[])
		{
			for (const obj of objects)
			{
				this.dataManager.removeObject(obj._quote, obj._type, obj._id.toString());
			}
			const _loc3_ = this.displayManager.getMainViewPoint();
			_loc3_.updateObjectLayers();
		}

		addObject(param1: any)
		{
			this.dataManager.addObject(param1);
			const _loc2_ = this.displayManager.getMainViewPoint();
			_loc2_.updateObjectLayers();
		}

		private addDefaultCompareToTickers()
		{
			if (this.quote !== "" && MainManager.paramsObj.compareTo)
			{
				const _loc1_ = MainManager.paramsObj.compareTo.split(';');
				const _loc2_ = this.parseSettingString(MainManager.paramsObj.compareToDisplayName, _loc1_.length);
				const _loc3_ = this.parseSettingString(MainManager.paramsObj.compareToDiffMarketSessions, _loc1_.length);
				for (let partIndex = 0; partIndex < _loc1_.length; partIndex++)
				{
					const _loc5_ = Utils.adjustNasdToNasdaq(_loc1_[partIndex]);
					if (_loc5_ !== "" && _loc5_ !== this.quote)
						this.addCompareTo(_loc5_, _loc2_ && _loc2_[partIndex] || undefined, _loc3_ && _loc3_[partIndex] === '1' || undefined);	// TODO
				}
			}
		}

		getQuote(param1: string, param2?: string, param3 = NaN, param4: boolean = false)
		{
			let _loc5_: number;
			const mainViewPoint = notnull(this.displayManager.getMainViewPoint());
			const firstDataSource = this.layersManager.getFirstDataSource();
			this.dataManager.checkDataSourceExistance(param1, param2);
			if (!isNaN(param3))
			{
				_loc5_ = param3;
			}
			else if (!isNaN(mainViewPoint.count) && firstDataSource)
			{
				_loc5_ = mainViewPoint.count / (this.displayManager.isDifferentMarketSessionComparison() ? 1 : firstDataSource.data.marketDayLength);
			}
			else
			{
				_loc5_ = Const.getDefaultDisplayDays();
			}
			if (Const.INDICATOR_ENABLED && Const.DEFAULT_CHART_STYLE_NAME !== Const.LINE_CHART && this.layersManager.getStyle() === LayersManager.SINGLE)
				this.getQuoteForBarChart(param1, _loc5_, param4);
			else
				this.getQuoteForLineChart(param1, _loc5_, param4);
		}

		private getQuoteForBarChart(param1: string, param2: number, param3: boolean)
		{
			const event = EventFactory.getEvent(ChartDetailTypes.GET_5D_DATA, param1, ChartEventPriorities.REQUIRED);

			let _loc7_: ChartEvent;
			if (MainManager.paramsObj.sparklineType === Const.STATIC || param2 > Const.SCALE_INTERVALS[ScaleTypes.SCALE_1Y].days)
				_loc7_ = EventFactory.getEvent(ChartDetailTypes.GET_40Y_DATA, param1, ChartEventPriorities.REQUIRED);
			else
				_loc7_ = EventFactory.getEvent(ChartDetailTypes.GET_5Y_DATA, param1, ChartEventPriorities.REQUIRED);

			let _loc5_: ChartEvent | null = null;
			let _loc6_: ChartEvent | null = null;
			switch (Const.DEFAULT_D)
			{
				case Intervals.INTRADAY:
					_loc6_ = this.needAfterHoursData(param1);
					break;
				case Intervals.FIVE_MINUTES:
					_loc5_ = EventFactory.getEvent(ChartDetailTypes.GET_1Y_DATA, param1, ChartEventPriorities.REQUIRED);
					_loc6_ = EventFactory.getEvent(ChartDetailTypes.GET_10D_DATA, param1, ChartEventPriorities.REQUIRED);
					break;
				case Intervals.HALF_HOUR:
					_loc5_ = EventFactory.getEvent(ChartDetailTypes.GET_1Y_DATA, param1, ChartEventPriorities.REQUIRED);
					_loc6_ = EventFactory.getEvent(ChartDetailTypes.GET_30D_DATA, param1, ChartEventPriorities.REQUIRED);
					break;
				case Intervals.DAILY:
					_loc6_ = EventFactory.getEvent(ChartDetailTypes.GET_1Y_DATA, param1, ChartEventPriorities.REQUIRED);
					break;
			}
			this.dataManager.expectEvent(event);
			this.dataManager.expectEvent(_loc5_);
			this.dataManager.expectEvent(_loc7_);
			this.dataManager.expectEvent(_loc6_);
			this.dataManager.eventHandler(event, !param3);
			//this.dataManager.eventHandler(_loc8_, !param3);
			this.dataManager.eventHandler(_loc5_, !param3);
			this.dataManager.eventHandler(_loc7_, !param3);
			this.dataManager.eventHandler(_loc6_, !param3);
		}

		private shouldToggleAfterHours(detailLevel: Intervals): boolean
		{
			if (Boolean(MainManager.paramsObj.forceDisplayExtendedHours))
				return true;

			if (MainManager.paramsObj.displayExtendedHours !== "true" || this.layersManager.getStyle() !== LayersManager.SINGLE)
				return false;

			if (detailLevel === Intervals.INTRADAY || Const.INDICATOR_ENABLED && detailLevel < Intervals.DAILY && this.displayManager.getEnabledChartLayer() === Const.LINE_CHART)
				return true;

			return false;
		}

		changePrimaryTicker(param1: string, param2: string, param3: boolean = false)
		{
			const _loc4_ = String(Utils.checkUndefined(param1, this.quote));
			if (_loc4_ === this.quote)
				return;

			this.quote = _loc4_;
			this.quoteType = Const.getQuoteType(this.quote);
			this.dataManager.checkDataSourceExistance(this.quote, param2);
			this.layersManager.replaceFirstDataSource(this.dataManager.dataSources[this.quote]);
			const _loc5_ = this.layersManager.numComparedTickers() > 0 ? LayersManager.COMPARISON : LayersManager.SINGLE;
			const style = param3 ? LayersManager.PERCENT : _loc5_;
			this.layersManager.resetLayersForNewQuote(this.dataManager.dataSources[this.quote], style);
			if (this.dataManager.dataSources[this.quote].isEmpty())
			{
				this.getQuote(this.quote, param2);
			}
			else
			{
				this.layersManager.setStyle(style);
				this.displayManager.update();
			}
		}

		removeObject(ticker: string, id: number, objectType: string)
		{
			this.dataManager.removeObject(ticker, id, objectType);
			const mainViewPoint = this.displayManager.getMainViewPoint();
			mainViewPoint.updateObjectLayers();
		}

		private getQuoteForLineChart(param1: string, param2: number, param3: boolean)
		{
			let _loc4_: ChartEvent | null = null;
			let _loc5_: ChartEvent | null = null;
			let _loc6_: ChartEvent | null = null;
			let _loc7_: ChartEvent | null = null;
			let _loc8_: ChartEvent | null = null;
			if (param2 > Const.INTRADAY_DAYS)
			{
				_loc5_ = EventFactory.getEvent(ChartDetailTypes.GET_1Y_DATA, param1, ChartEventPriorities.REQUIRED);
				if (!Const.INDICATOR_ENABLED || this.quoteType === QuoteTypes.COMPANY)
				{
					_loc4_ = EventFactory.getEvent(ChartDetailTypes.GET_5D_DATA, param1, ChartEventPriorities.REQUIRED);
					this.dataManager.expectEvent(_loc4_);
				}
			}
			else if (this.quoteType === QuoteTypes.MUTUAL_FUND)
			{
				_loc5_ = EventFactory.getEvent(ChartDetailTypes.MUTF_5D_DATA, param1, ChartEventPriorities.REQUIRED);
			}
			else
			{
				_loc5_ = EventFactory.getEvent(ChartDetailTypes.GET_5D_DATA, param1, ChartEventPriorities.REQUIRED);
			}
			if (this.layersManager.getStyle() === LayersManager.SINGLE && Const.INDICATOR_ENABLED && this.quoteType === QuoteTypes.COMPANY)
			{
				if (param2 <= Const.HALF_HOUR_DAYS && param2 > Const.FIVE_MINUTE_DAYS)
					_loc8_ = EventFactory.getEvent(ChartDetailTypes.GET_30D_DATA, param1, ChartEventPriorities.REQUIRED);

				if (param2 <= Const.FIVE_MINUTE_DAYS && param2 > Const.INTRADAY_DAYS)
					_loc8_ = EventFactory.getEvent(ChartDetailTypes.GET_10D_DATA, param1, ChartEventPriorities.REQUIRED);
			}
			if (MainManager.paramsObj.sparklineType === Const.STATIC || param2 > Const.SCALE_INTERVALS[ScaleTypes.SCALE_1Y].days)
				_loc6_ = EventFactory.getEvent(ChartDetailTypes.GET_40Y_DATA, param1, ChartEventPriorities.REQUIRED);
			else
				_loc6_ = EventFactory.getEvent(ChartDetailTypes.GET_5Y_DATA, param1, ChartEventPriorities.REQUIRED);

			if (Const.INDICATOR_ENABLED)
			{
				if (param2 <= Const.HALF_HOUR_DAYS)
					_loc7_ = this.needAfterHoursData(param1);
			}
			else
			{
				_loc7_ = this.needAfterHoursData(param1);
			}
			this.dataManager.expectEvent(_loc5_);
			this.dataManager.expectEvent(_loc8_);
			this.dataManager.expectEvent(_loc6_);
			this.dataManager.expectEvent(_loc7_);
			this.dataManager.eventHandler(_loc4_, !param3);
			this.dataManager.eventHandler(_loc5_, !param3);
			this.dataManager.eventHandler(_loc8_, !param3);
			this.dataManager.eventHandler(_loc6_, !param3);
			this.dataManager.eventHandler(_loc7_, !param3);
		}

		private onResize(event: Event)
		{
			if (this.stage.stageWidth !== 0)
				Const.MOVIE_WIDTH = this.stage.stageWidth;

			if (this.stage.stageHeight !== 0)
				Const.MOVIE_HEIGHT = this.stage.stageHeight;

			if (Const.MOVIE_WIDTH !== 0 && this.stage.stageWidth !== 0)
			{
				this.displayManager.windowResized(Const.MOVIE_WIDTH, Const.MOVIE_HEIGHT);
				MainManager.console.positionLoadingMessage();
				(this.displayManager.getMainViewPoint()).checkEvents();
			}
		}

		addObjectArray(param1: any[])
		{
			let i = 0;
			const objectsArray = param1;
			if (objectsArray.length === 0)
				return;

			try
			{
				i = 0;
				let object: any = null;
				while (i < objectsArray.length)
				{
					object = objectsArray[i];
					if (object)
						this.dataManager.addObject(object);

					i++;
				}
				object = objectsArray[0];
				this.dataManager.sortObjects(object._quote, object._type);
			}
			catch (er /*: TypeError*/)
			{
			}
			const mvp = this.displayManager.getMainViewPoint();
			mvp.updateObjectLayers();
		}

		htmlClicked(ticker: string, param2: number, param3?: string)
		{
			const _loc4_ = <PinPoint>this.dataManager.selectObject(ticker, "newspin", param2, param3);
			const _loc5_ = this.displayManager.getMainViewPoint();
			_loc5_.updateObjectLayers();
			this.displayManager.animateToSelectedPin(_loc4_);
		}
	}
}
