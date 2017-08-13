/// <reference path="../../../flash/display/Sprite.ts" />

namespace com.google.finance
{
	// import flash.display.Sprite;
	// import flash.display.Bitmap;
	// import flash.display.SimpleButton;
	// import flash.events.MouseEvent;
	// import flash.events.Event;
	// import flash.utils.getTimer;
	// import flash.text.TextFormat;
	// import flash.utils.clearInterval;
	// import flash.utils.setInterval;
	// import com.google.finance.ui.TextButtonsGroup;
	// import flash.text.TextField;
	// import flash.text.TextFieldAutoSize;
	// import flash.utils.Timer;
	// import flash.events.TimerEvent;
	// import flash.events.KeyboardEvent;
	// import com.google.i18n.locale.DateTimeLocale;

	export enum ControllerStates
	{
		NOTHING = 0,
		DRAGGING = 1,
		SELECTING = 2,
		ZOOMING_OUT = 3,
		SCROLLING = 4,
		DRAGGING_LEFT_HANDLE = 5,
		DRAGGING_RIGHT_HANDLE = 6,
		PRESSING_LEFT = 7,
		PRESSING_RIGHT = 8,
		WINDOW = 9,
		PRESSING_PAGE_LEFT = 10,
		PRESSING_PAGE_RIGHT = 11,
		DRAGGING_SPARKLINE = 12,
	}

	export class Controller extends flash.display.Sprite
	{
		private static NOTIFY_TIMEOUT = 500;

		private PAGING_AREA_WIDTH = 100;
		private MOUSE_DOWN = false;
		private BUTTON_MOVEBY_AMOUNT = 40;
		private MIN_PIXELS = 2;
		private SHIFT_DOWN = false;
		private CTRL_DOWN = false;
		
		private pagingAmount: number = 0;
		private lastMouseMoveTime: number;
		private initialYMouse: number;
		private lastCount: number;
		private delayedMinutes: number;
		private baseXOffset: number;
		private promotedButtonTextFormat: flash.text.TextFormat;
		private zoomButtons: com.google.finance.ui.TextButtonsGroup;
		private chartTypeButtons: com.google.finance.ui.TextButtonsGroup;
		private aniManager = new com.google.finance.AnimationManager()
		private scrollMouseMinX: number;
		private listeners: IViewPoint[];
		private separatorTextFormat: flash.text.TextFormat;
		private pollingTimer: flash.utils.Timer;
		private chartSizeChangeToolTip: com.google.finance.ToolTipMovie;
		private buttonTextFormat: flash.text.TextFormat;
		private intId: number;
		private chartTypeNameMapping: { [key: string]: string };
		private scrollMouseMaxX: number;
		private isMarketOpen: boolean;
		private initialXMouse: number;
		private notifyHtmlIntervalId: number;
		private selectedTextFormat: flash.text.TextFormat;
		private holderBounds: com.google.finance.Bounds = new com.google.finance.Bounds(Number.MAX_VALUE, Number.MAX_VALUE, 0, 0);
		private chartTypeText: flash.text.TextField;
		private state = ControllerStates.NOTHING
		private intervalText: flash.text.TextField;
		private chartSizeChangeButton: flash.display.SimpleButton;
		private customZoomEndDate: Date;
		private zoomText: flash.text.TextField;
		private customZoomStartDate: Date;
		private cumulativeXOffset: number = 0;
		private stateRemainingMinutes: number;
		private lastIntervalLevel: number;
		private controlledAreaBounds: Bounds[] = [];
		private lastLastMinutes: number;
		private windowTitleTextFormat: flash.text.TextFormat;
		private intervalButtons: com.google.finance.ui.TextButtonsGroup;
		private isZh: boolean;

		currentIntervalLevel: number;
		currentZoomLevel: number;
		
		constructor(public readonly mainManager: com.google.finance.MainManager, public readonly displayManager: com.google.finance.DisplayManager)
		{
			super();
			this.listeners = [];
			this.isZh = Const.isZhLocale(com.google.i18n.locale.DateTimeLocale.getLocale());
			this.mouseEnabled = true;
			this.buttonTextFormat = new flash.text.TextFormat("Verdana", !!this.isZh ? 10 : 9, 204);
			this.buttonTextFormat.underline = true;
			this.promotedButtonTextFormat = new flash.text.TextFormat("Verdana", !!this.isZh ? 10 : 9, 14290192);
			this.promotedButtonTextFormat.underline = true;
			this.selectedTextFormat = new flash.text.TextFormat("Verdana", !!this.isZh ? 10 : 9, 0);
			this.selectedTextFormat.underline = false;
			this.windowTitleTextFormat = new flash.text.TextFormat("Verdana", 10, 0);
			this.windowTitleTextFormat.underline = false;
			this.windowTitleTextFormat.bold = true;
			this.separatorTextFormat = new flash.text.TextFormat("Verdana", 9, 0);
			if (Const.INDICATOR_ENABLED && Const.CHART_TYPE_BUTTONS_ENABLED && mainManager.getQuoteType() === QuoteTypes.COMPANY)
				this.createChartTypeButtons();

			this.createZoomButtons();
			this.createIntervalButtons();
			this.enableZoomButtons();
			if (Const.EXPAND_BUTTON_ENABLED)
				this.createChartSizeChangeButton(true);
			else if (Const.SHRINK_BUTTON_ENABLED)
				this.createChartSizeChangeButton(false);

			this.addChild(this.aniManager);
			this.currentZoomLevel = this.getInitialZoomLevel();
		}

		private movePage(param1: number) 
		{
			const mainViewPoint = this.displayManager.getMainViewPoint();
			if (mainViewPoint)
				this.notifyListenersToMove(param1 * (mainViewPoint.maxx - mainViewPoint.minx));
		}

		private getInitialZoomLevel(): number
		{
			if (Const.DEFAULT_DISPLAY_MINUTES !== -1)
				return -1;


			for (let index = 0; index < Const.SCALE_INTERVALS.length; index++)
			{
				if (Const.SCALE_INTERVALS[index].days === Const.DEFAULT_DISPLAY_DAYS && index >= ScaleTypes.SCALE_5D)
					return index;
			}
			return -1;
		}

		createChartSizeChangeButton(param1: boolean) 
		{
			let showExpand = param1;
			if (this.chartSizeChangeToolTip && this.contains(this.chartSizeChangeToolTip))
				this.removeChild(this.chartSizeChangeToolTip);

			if (this.chartSizeChangeButton && this.contains(this.chartSizeChangeButton))
				this.removeChild(this.chartSizeChangeButton);

			this.chartSizeChangeButton = new flash.display.SimpleButton("chartSizeChangeButton");
			let buttonBitmap: flash.display.Bitmap;
			if (showExpand)
				buttonBitmap = new Controller_ExpandIcon();
			else
				buttonBitmap = new Controller_ShrinkIcon();

			this.chartSizeChangeButton.overState = buttonBitmap;
			this.chartSizeChangeButton.downState = buttonBitmap;
			this.chartSizeChangeButton.hitTestState = buttonBitmap;
			this.chartSizeChangeButton.upState = buttonBitmap;
			this.chartSizeChangeButton.useHandCursor = true;
			this.chartSizeChangeButton.x = this.mainManager.stage.stageWidth - this.chartSizeChangeButton.width - 5;
			this.chartSizeChangeButton.y = 5;
			this.addChild(this.chartSizeChangeButton);
			this.chartSizeChangeToolTip = new com.google.finance.ToolTipMovie();
			this.addChild(this.chartSizeChangeToolTip);
			this.chartSizeChangeButton.addEventListener(MouseEvents.MOUSE_OVER, (param1: Event): void =>
			{
				MainManager.mouseCursor.setCursor(MouseCursors.CLASSIC);
				MainManager.mouseCursor.lockOnDisplayObject(this.chartSizeChangeButton);
				this.chartSizeChangeToolTip.renderMovie(this.chartSizeChangeButton.x - 5, this.chartSizeChangeButton.y, !!showExpand ? Messages.getMsg(Messages.LARGE_CHART) : Messages.getMsg(Messages.SMALL_CHART));

				flash.display.Graphics.cleanupPending();
			});
			this.chartSizeChangeButton.addEventListener(MouseEvents.MOUSE_OUT, (param1: Event): void =>
			{
				MainManager.mouseCursor.unlock();
				this.chartSizeChangeToolTip.clearMovie();

				flash.display.Graphics.cleanupPending();
			});
			this.chartSizeChangeButton.addEventListener(MouseEvents.CLICK, (param1: Event): void =>
			{
				if (showExpand)
					MainManager.jsProxy.expandChart();
				else
					MainManager.jsProxy.shrinkChart();

				flash.display.Graphics.cleanupPending();
			});
		}

		private applyLastOrDefaultInterval(dataSource: DataSource | null, viewPoint: ViewPoint) 
		{
			if (this.lastIntervalLevel >= 0 && this.lastIntervalLevel <= Intervals.WEEKLY)
			{
				this.enableIntervalButtons(this.lastIntervalLevel);
				this.currentIntervalLevel = this.lastIntervalLevel;
				this.animateTo(this.lastLastMinutes, this.lastCount, 1);
			}
			else
			{
				this.enableIntervalButtons(Const.DEFAULT_D);
				this.currentIntervalLevel = Const.DEFAULT_D;
				viewPoint.checkEvents();
				if (dataSource)
				{
					const days = Const.INTERVAL_PERIODS[Const.DEFAULT_D].days;
					this.animateTo(0, days * (dataSource.data.marketDayLength + 1), 1);
				}
			}
		}

		onMouseMove(param1: MouseEvent) 
		{
			this.stage.setMouse(param1.pageX, param1.pageY);
			const _loc2_ = getTimer();
			if (_loc2_ - this.lastMouseMoveTime < 16)
				return;

			this.lastMouseMoveTime = _loc2_;
			this.mouseMoveAction(param1);
		}

		removeControlListener(param1: flash.display.Sprite) 
		{
			for (let listenerIndex = 0; listenerIndex < this.listeners.length; listenerIndex++)
			{
				if (this.listeners[listenerIndex] === param1)
				{
					this.listeners.splice(listenerIndex, 1);
					return;
				}
			}
		}

		triggerMouseMoveAction() 
		{
			this.mouseMoveAction(new MouseEvent(MouseEvents.MOUSE_MOVE));
		}

		getCountForDays(dataSource: DataSource, param2: number, param3: number): number
		{
			const units = dataSource.data.units;
			const days = dataSource.data.days;
			const endOfDayDataUnit = dataSource.getEndOfDayDataUnitFor(param3);
			let minuteMetaIndex = DataSource.getMinuteMetaIndex(endOfDayDataUnit.relativeMinutes, days, units);
			minuteMetaIndex = Math.min(minuteMetaIndex, days.length - 1);
			let _loc8_ = 0;
			let _loc9_ = 0;
			const relativeMinutes = units[days[minuteMetaIndex]].relativeMinutes;
			let _loc11_ = dataSource.getEndOfDayDataUnitFor(relativeMinutes);
			if (Utils.compareUtcDates(_loc11_.exchangeDateInUTC, endOfDayDataUnit.exchangeDateInUTC) !== 0)
				_loc8_ = _loc8_ + (dataSource.afterHoursData.getSessionLength(Const.PRE_MARKET_NAME) + 1);

			while (minuteMetaIndex >= 0 && _loc9_ < param2)
			{
				minuteMetaIndex--;
				let _loc12_ = units[days[minuteMetaIndex]];
				if (_loc11_.coveredDays > 0)
				{
					_loc8_ = _loc8_ + _loc11_.coveredDays * (dataSource.data.marketDayLength + 1);
					_loc9_ = _loc9_ + _loc11_.coveredDays;
				}
				else if (_loc12_)
				{
					_loc12_ = dataSource.getEndOfDayDataUnitFor(_loc12_.relativeMinutes);
					_loc8_ = _loc8_ + (_loc11_.relativeMinutes - _loc12_.relativeMinutes);
					_loc9_++;
				}
				else
				{
					_loc8_ = _loc8_ + (dataSource.data.marketDayLength + 1);
					_loc9_++;
				}
				_loc11_ = _loc12_;
			}
			_loc8_ = _loc8_ + (param2 - _loc9_) * (dataSource.data.marketDayLength + 1);
			return _loc8_;
		}

		moveListenersByOffsets() 
		{
			const mainViewPoint = this.displayManager.getMainViewPoint();
			if (!mainViewPoint)
				return;

			const sparklineViewPoint = <SparklineViewPoint><any>this.displayManager.getViewPoint(Const.SPARKLINE_VIEW_POINT_NAME);
			//const _loc3_ = _loc2_.dataSource;
			const width = sparklineViewPoint.getWidth();
			const _loc5_ = sparklineViewPoint.sparkCount * (mainViewPoint.maxx - mainViewPoint.minx) / mainViewPoint.count;
			const _loc6_ = sparklineViewPoint.moveSparklineBy_Handler(this.cumulativeXOffset);
			const _loc7_ = (this.baseXOffset - _loc6_) * _loc5_ / width;
			this.changeListenersOffset(_loc7_);
		}

		handleMouseWheel(param1: number) 
		{
			if (param1 !== 0)
			{
				const _loc2_ = Math.abs(param1);
				if (param1 > 0)
					this.zoomStuff(Directions.FORWARD, this.mouseX, _loc2_);
				else if (param1 < 0)
					this.zoomStuff(Directions.BACKWARD, this.mouseY, _loc2_);

				clearInterval(this.notifyHtmlIntervalId);
				this.notifyHtmlIntervalId = setInterval(this.listenersNotifyHtml.bind(this), Controller.NOTIFY_TIMEOUT);
			}
		}

		private hitTestInsideBounds(param1: number, param2: number): boolean
		{
			for (let boundsIndex = 0; boundsIndex < this.controlledAreaBounds.length; boundsIndex++)
			{
				if (this.controlledAreaBounds[boundsIndex].containsPoint(param1, param2))
					return true;
			}
			return false;
		}

		checkSparklinePositioning() 
		{
			const sparklineViewPoint = <SparklineViewPoint><any>this.displayManager.getViewPoint(Const.SPARKLINE_VIEW_POINT_NAME);
			const mainViewPoint = this.displayManager.getMainViewPoint();
			if (!sparklineViewPoint || !mainViewPoint)
				return;

			//const _loc3_ = _loc2_.minutesOffset;
			if (!sparklineViewPoint.windowLayer)
				return;

			const leftX = sparklineViewPoint.windowLayer.getLeftX();
			const rightX = sparklineViewPoint.windowLayer.getRightX();
			const firstDataSource = this.displayManager.layersManager.getFirstDataSource();
			const sparkLastMinute = sparklineViewPoint.getSparkLastMinute() < 0;
			let sparkFirstMinute = sparklineViewPoint.getSparkFirstMinute() > sparklineViewPoint.getOldestMinute();
			if (this.currentIntervalLevel !== -1 && firstDataSource)
			{
				const tFirstRelativeMinute = firstDataSource.getFirstRelativeMinute(this.currentIntervalLevel);
				sparkFirstMinute = sparklineViewPoint.getSparkFirstMinute() > tFirstRelativeMinute;
			}
			if (sparkFirstMinute && leftX < sparklineViewPoint.minx + this.PAGING_AREA_WIDTH)
			{
				const _loc10_ = leftX - (sparklineViewPoint.minx + this.PAGING_AREA_WIDTH);
				sparklineViewPoint.moveSparklineBy_Handler(_loc10_);
				sparklineViewPoint.commitSparklineOffset_Handler();
			}
			else if (sparkLastMinute && rightX > sparklineViewPoint.maxx - this.PAGING_AREA_WIDTH)
			{
				const _loc10_ = rightX - (sparklineViewPoint.maxx - this.PAGING_AREA_WIDTH);
				sparklineViewPoint.moveSparklineBy_Handler(_loc10_);
				sparklineViewPoint.commitSparklineOffset_Handler();
			}
		}

		setNewFinalState(param1: ViewPointState, param2: boolean = false)
		{
			if (param1.lastMinute === undefined || param1.count === undefined)
				return;

			if (this.aniManager.isAnimating())
			{
				for (let listenerIndex = 0; listenerIndex < this.listeners.length; listenerIndex++)
					this.listeners[listenerIndex].newFinalAnimationState(param1);
			}
			else
			{
				this.jumpTo(param1.lastMinute, param1.count, param2);
			}
		}

		animateTo(param1: number, param2: number, param3: number = NaN, param4 = false) 
		{
			const _loc5_: { (param1: flash.display.DisplayObject, param2: number, param3: boolean): void }[] = [];
			const _loc6_: flash.display.DisplayObject[] = [];
			const context = new Context();
			context.lastMinute = param1;
			context.count = param2;
			for (let listenerIndex = 0; listenerIndex < this.listeners.length; listenerIndex++)
			{
				this.listeners[listenerIndex].zoomingAnimation_init(context);
				let listener = this.listeners[listenerIndex];
				_loc5_[listenerIndex] = listener.zoomingAnimation_ticker.bind(listener);
				_loc6_[listenerIndex] = listener;
			}
			let topBorderLayer = this.displayManager.topBorderLayer;
			_loc5_[this.listeners.length] = topBorderLayer.update.bind(topBorderLayer);
			_loc6_[this.listeners.length] = topBorderLayer;
			this.aniManager.animate(_loc5_, _loc6_, param3, param4);
		}

		chartTypeButtonClicked(param1: string) 
		{
			com.google.finance.MainManager.jsProxy.setJsChartType(this.chartTypeNameMapping[param1]);
		}

		onMouseUp(param1: Event) 
		{
			this.mouseUpAction();
		}

		syncZoomLevel(param1?: boolean)
		{
			if (this.state === ControllerStates.SCROLLING)
				return;

			if (this.displayManager.isDifferentMarketSessionComparison())
				return;

			const zoomLevelFinalState = this.getZoomLevelFinalState(this.currentZoomLevel);
			if (zoomLevelFinalState)
				this.setNewFinalState(zoomLevelFinalState, param1);
		}

		private createChartTypeButtons() 
		{
			this.chartTypeText = new flash.text.TextField();
			this.chartTypeText.x = 5;
			this.chartTypeText.y = 5;
			this.chartTypeText.autoSize = flash.text.TextFieldAutoSize.LEFT;
			this.chartTypeText.defaultTextFormat = this.windowTitleTextFormat;
			this.chartTypeText.text = Messages.getMsg(Messages.TYPE) + ":";
			this.chartTypeText.selectable = false;
			this.chartTypeButtons = new com.google.finance.ui.TextButtonsGroup();
			this.chartTypeButtons.setSpacing("", !!this.isZh ? 1 : 3);
			this.chartTypeButtons.setTextFormats(this.buttonTextFormat, this.selectedTextFormat, this.separatorTextFormat);
			this.chartTypeButtons.x = this.chartTypeText.x + this.chartTypeText.width + this.chartTypeButtons.spacing;
			this.chartTypeButtons.y = this.chartTypeText.y;
			this.chartTypeButtons.addButton(Messages.getMsg(Messages.LINE));
			this.chartTypeButtons.addButton(Messages.getMsg(Messages.CANDLESTICK), this.promotedButtonTextFormat);
			this.chartTypeNameMapping = {};
			this.chartTypeNameMapping[Messages.getMsg(Messages.LINE)] = "IntervalBasedLine";
			this.chartTypeNameMapping[Messages.getMsg(Messages.CANDLESTICK)] = "CandleStick";
			this.chartTypeButtons.selectButtonByIndex(Const.CHART_STYLE_NAMES.indexOf(Const.DEFAULT_CHART_STYLE_NAME));
			this.chartTypeButtons.addListener(this.chartTypeButtonClicked, this);
			this.addChild(this.chartTypeText);
			this.addChild(this.chartTypeButtons);
		}

		mouseMoveAction(param1: MouseEvent) 
		{
			let _loc10_ = false;
			let _loc11_ = false;
			const _loc2_ = <ViewPoint>this.displayManager.getMainViewPoint();
			const sparklineViewPoint = <SparklineViewPoint>this.displayManager.getViewPoint(Const.SPARKLINE_VIEW_POINT_NAME);
			//const _loc4_ = this.displayManager.getViewPoint("BottomViewPoint");
			//const _loc5_ = this.mainManager.layersManager;
			switch (this.state)
			{
				case ControllerStates.SELECTING:
					this.drawSquare(this.initialXMouse, this.initialYMouse, this.mouseX, this.mouseY);
					break;
				case ControllerStates.DRAGGING:
					this.displayManager.showContextualStaticInfo();
					this.changeListenersOffset(this.mouseX - this.initialXMouse);
					this.checkSparklinePositioning();
					break;
				case ControllerStates.NOTHING:
					if (this.hitTestInsideBounds(this.mouseX, this.mouseY) && !_loc2_.isAnimating())
					{
						const _loc12_ = this.highlightPoints();
						this.displayManager.spaceText.setPointInfo(_loc12_);
						com.google.finance.MainManager.mouseCursor.setCursor(MouseCursors.OPENED_HAND);
						break;
					}
					if (sparklineViewPoint.windowLayer && param1.target !== sparklineViewPoint.windowLayer.leftHandle.button.element && param1.target !== sparklineViewPoint.windowLayer.rightHandle.button.element)
						com.google.finance.MainManager.mouseCursor.setCursor(MouseCursors.CLASSIC);

					this.clearAllHighlights();
					this.displayManager.showContextualStaticInfo();
					if (sparklineViewPoint.bg.hitTestPoint(this.mouseX, this.mouseY, false))
					{
						sparklineViewPoint.toggleHandles(true);
						break;
					}
					sparklineViewPoint.toggleHandles(false);
					break;
				case ControllerStates.DRAGGING_SPARKLINE:
					this.mouseCursor.setCursor(MouseCursors.CLOSED_HAND);
					sparklineViewPoint.moveSparklineBy_Handler(this.initialXMouse - this.mouseX);
					break;
				case ControllerStates.SCROLLING:
					this.displayManager.showContextualStaticInfo();
					//const _loc6_ = _loc3_.windowLayer.getLeftX();
					//const _loc7_ = _loc3_.windowLayer.getRightX();
					let mouseX = this.mouseX;
					mouseX = Math.max(mouseX, this.scrollMouseMinX);
					mouseX = Math.min(mouseX, this.scrollMouseMaxX);
					this.baseXOffset = this.initialXMouse - mouseX;
					const _loc9_ = this.displayManager.layersManager.getFirstDataSource();
					_loc10_ = sparklineViewPoint.getSparkLastMinute() < 0;
					_loc11_ = sparklineViewPoint.getSparkFirstMinute() > sparklineViewPoint.getOldestMinute();
					if (this.currentIntervalLevel !== -1 && _loc9_)
					{
						const firstRelativeMinute = _loc9_.getFirstRelativeMinute(this.currentIntervalLevel);
						_loc11_ = sparklineViewPoint.getSparkFirstMinute() > firstRelativeMinute;
					}
					if (mouseX < this.scrollMouseMinX + this.PAGING_AREA_WIDTH && _loc11_)
					{
						this.pagingAmount = mouseX - (this.scrollMouseMinX + this.PAGING_AREA_WIDTH);
						this.addXOffset(this, this.pagingAmount);
						clearInterval(this.intId);
						this.intId = setInterval(() => { this.addXOffset(this, this.pagingAmount); }, 20);
						break;
					}
					if (mouseX >= this.scrollMouseMaxX - this.PAGING_AREA_WIDTH && _loc10_)
					{
						this.pagingAmount = mouseX - (this.scrollMouseMaxX - this.PAGING_AREA_WIDTH);
						this.addXOffset(this, this.pagingAmount);
						clearInterval(this.intId);
						this.intId = setInterval(() => { this.addXOffset(this, this.pagingAmount); }, 20);
						break;
					}
					this.stopContinuousPaging();
					this.moveListenersByOffsets();
					break;
				case ControllerStates.DRAGGING_LEFT_HANDLE:
					this.mouseCursor.setCursor(MouseCursors.H_ARROWS);
					sparklineViewPoint.windowLayer.initialX = this.initialXMouse;
					sparklineViewPoint.windowLayer.leftHandleXOffset = this.initialXMouse - this.mouseX;
					sparklineViewPoint.windowLayer.renderLayer();
					this.displayManager.spaceText.setTimePeriod(sparklineViewPoint.windowLayer);
					break;
				case ControllerStates.DRAGGING_RIGHT_HANDLE:
					this.mouseCursor.setCursor(MouseCursors.H_ARROWS);
					sparklineViewPoint.windowLayer.initialX = this.initialXMouse;
					sparklineViewPoint.windowLayer.rightHandleXOffset = this.initialXMouse - this.mouseX;
					sparklineViewPoint.windowLayer.renderLayer();
					this.displayManager.spaceText.setTimePeriod(sparklineViewPoint.windowLayer);
					break;
			}
			if (this.displayManager.topBorderLayer)
				this.displayManager.topBorderLayer.update();
		}

		addControlListener(param1: IViewPoint, param2: number = NaN) 
		{
			if (param2 === TickPositions.BOTTOM)
				this.listeners.push(param1);
			else
				this.listeners.splice(0, 0, param1);
		}

		getButtonsWidth(): number
		{
			if (!this.zoomButtons || !this.intervalButtons)
				return 0;

			return Math.max(this.zoomButtons.x + this.zoomButtons.width, this.intervalButtons.x + this.intervalButtons.width);
		}

		listenersNotifyHtml() 
		{
			for (let listenerIndex = 0; listenerIndex < this.listeners.length; listenerIndex++)
				this.listeners[listenerIndex].HTMLnotify();

			clearInterval(this.notifyHtmlIntervalId);
		}

		shouldRequestAfterHoursData(param1: boolean, param2: number, param3: number, param4: number): boolean
		{
			if (!param1)
				return true;

			if (param2 <= Const.REALTIME_CHART_POLLING_MARGIN || param2 >= param4 - param3 - Const.REALTIME_CHART_POLLING_MARGIN)
				return true;

			return false;
		}

		get mouseCursor(): MouseCursor
		{
			return com.google.finance.MainManager.mouseCursor;
		}

		private createIntervalButtons() 
		{
			this.intervalText = new flash.text.TextField();
			this.intervalText.x = !this.chartTypeButtons ? 5 : this.chartTypeButtons.x + this.chartTypeButtons.width + 5;
			this.intervalText.y = 5;
			this.intervalText.autoSize = flash.text.TextFieldAutoSize.LEFT;
			this.intervalText.defaultTextFormat = this.windowTitleTextFormat;
			this.intervalText.text = Messages.getMsg(Messages.INTERVAL) + ":";
			this.intervalText.selectable = false;
			this.intervalButtons = new com.google.finance.ui.TextButtonsGroup();
			this.intervalButtons.setSpacing("", !!this.isZh ? 1 : 3);
			this.intervalButtons.setTextFormats(this.buttonTextFormat, this.selectedTextFormat, this.separatorTextFormat);
			this.intervalButtons.x = this.intervalText.x + this.intervalText.width + this.intervalButtons.spacing;
			this.intervalButtons.y = this.intervalText.y;
			const _loc1_ = Const.INTERVAL_PERIODS;
			for (let index = 0; index < _loc1_.length; index++)
			{
				if (_loc1_[index].days >= Const.MIN_DISPLAY_DAYS)
					this.intervalButtons.addButton(Messages.getMsg(_loc1_[index].text));
			}
			this.intervalButtons.addListener(this.intervalButtonClicked, this);
		}

		jumpTo(param1: number, param2: number, param3: boolean = false)
		{
			let context = new Context();
			context.lastMinute = param1;
			context.count = param2;
			for (let listenerIndex = 0; listenerIndex < this.listeners.length; listenerIndex++)
			{
				context = this.listeners[listenerIndex].getNewContext(param1, param2);
				this.listeners[listenerIndex].zoomInMinutes_Handler(context, param3);
			}
		}

		private adjustCountForAfterHours(param1: number, param2: DataSource, param3: number, param4: number): number
		{
			if (param3 === Intervals.INTRADAY && param4 > Intervals.INTRADAY)
			{
				for (let intervalIndex = 0; intervalIndex < param2.visibleExtendedHours.length(); intervalIndex++)
				{
					const interval = param2.visibleExtendedHours.getIntervalAt(intervalIndex);
					const _loc7_ = param2.afterHoursData.units[interval.start];
					const _loc8_ = param2.afterHoursData.units[interval.end];
					param1 = param1 - (_loc8_.dayMinute - _loc7_.dayMinute);
				}
			}
			else if (param3 > Intervals.INTRADAY && param4 === Intervals.INTRADAY)
			{
				for (let intervalIndex = 0; intervalIndex < param2.hiddenExtendedHours.length(); intervalIndex++)				
				{
					const interval = param2.hiddenExtendedHours.getIntervalAt(intervalIndex);
					const _loc7_ = param2.afterHoursData.units[interval.start];
					const _loc8_ = param2.afterHoursData.units[interval.end];
					param1 = param1 + (_loc8_.dayMinute - _loc7_.dayMinute);
				}
			}
			return param1;
		}

		resetZoomButtons(param1: number) 
		{
			if (!this.zoomButtons)
				return;

			this.zoomButtons.clearSelection();
			this.zoomButtons.resetButtonsGroup();
			const _loc2_ = Const.SCALE_INTERVALS;
			for (let index = _loc2_.length - 1; index >= 0; index--)
			{
				if (_loc2_[index].days >= param1)
				{
					if (_loc2_[index].text !== Const.NO_BUTTON_TEXT)
						this.zoomButtons.addButton(Messages.getMsg(_loc2_[index].text));
				}
			}
			this.zoomButtons.addListener(this.zoomButtonClicked, this);
		}

		private computeHolderBounds() 
		{
			this.holderBounds = new com.google.finance.Bounds(Number.MAX_VALUE, Number.MAX_VALUE, 0, 0);
			for (let boundsIndex = 0; boundsIndex < this.controlledAreaBounds.length; boundsIndex++)
				this.holderBounds.append(this.controlledAreaBounds[boundsIndex]);
		}

		clearCurrentInterval() 
		{
			this.currentIntervalLevel = -1;
			this.intervalButtons.clearSelection();
		}

		clearCurrentZoom() 
		{
			this.currentZoomLevel = -1;
			this.zoomButtons.clearSelection();
		}

		private initPollingTimer() 
		{
			if (Const.INDICATOR_ENABLED && Const.REALTIME_CHART_ENABLED && this.mainManager.quote.indexOf("INDEXDJX") === -1)
			{
				this.isMarketOpen = Number(com.google.finance.MainManager.paramsObj.isMarketOpenState) === 1;
				this.stateRemainingMinutes = com.google.finance.MainManager.paramsObj.stateRemainingMinutes >= 0 ? com.google.finance.MainManager.paramsObj.stateRemainingMinutes : Number.MAX_VALUE;
				this.delayedMinutes = com.google.finance.MainManager.paramsObj.delayedMinutes >= 0 ? com.google.finance.MainManager.paramsObj.delayedMinutes : 0;
				this.pollingTimer = new flash.utils.Timer(Const.REALTIME_CHART_POLLING_INTERVAL);
				this.pollingTimer.addEventListener(TimerEvents.TIMER, flash.display.Stage.bind(this.pollingTimerHandler, this));
				this.pollingTimer.start();
			}
		}

		onMouseLeave(param1: Event) 
		{
			com.google.finance.MainManager.jsProxy.setChartFocus(false);
			com.google.finance.MainManager.mouseCursor.setCursor(MouseCursors.CLASSIC);
			this.clearAllHighlights();
			this.displayManager.showContextualStaticInfo();
		}

		mouseUpAction() 
		{
			//const _loc1_ = this.displayManager.getMainViewPoint();
			const sparklineViewPoint = <SparklineViewPoint><any>this.displayManager.getViewPoint(Const.SPARKLINE_VIEW_POINT_NAME);
			switch (this.state)
			{
				case ControllerStates.SELECTING:
					const _loc5_ = Math.min(this.initialXMouse, this.mouseX);
					const _loc6_ = Math.max(this.initialXMouse, this.mouseX);
					for (let listenerIndex = 0; listenerIndex < this.listeners.length; listenerIndex++)
						this.listeners[listenerIndex].zoomIn_Handler(_loc5_, _loc6_);

					this.listenersNotifyHtml();
					this.graphics.clear();
					break;
				case ControllerStates.ZOOMING_OUT:
				case ControllerStates.PRESSING_LEFT:
				case ControllerStates.PRESSING_RIGHT:
				case ControllerStates.PRESSING_PAGE_RIGHT:
				case ControllerStates.PRESSING_PAGE_LEFT:
					clearInterval(this.intId);
					break;
				case ControllerStates.DRAGGING:
				case ControllerStates.SCROLLING:
					clearInterval(this.intId);
					sparklineViewPoint.moveSparklineBy_Handler(this.cumulativeXOffset + this.pagingAmount);
					sparklineViewPoint.commitSparklineOffset_Handler();
					this.cumulativeXOffset = 0;
					this.pagingAmount = 0;
					this.commitListenersOffset();
					if (Math.abs(this.initialXMouse - this.mouseX) >= this.MIN_PIXELS)
					{
						for (let listenerIndex = 0; listenerIndex < this.listeners.length; listenerIndex++)							
							this.listeners[listenerIndex].HTMLnotify();
						break;
					}
					break;
				case ControllerStates.DRAGGING_LEFT_HANDLE:
					sparklineViewPoint.windowLayer.handleReleased(sparklineViewPoint.windowLayer.leftHandle);
					break;
				case ControllerStates.DRAGGING_RIGHT_HANDLE:
					sparklineViewPoint.windowLayer.handleReleased(sparklineViewPoint.windowLayer.rightHandle);
					break;
				case ControllerStates.WINDOW:
					return;
			}
			this.mouseCursor.setCursor(MouseCursors.CLASSIC);
			const viewPoints = this.displayManager.getViewPoints();
			for (let viewPointIndex = 0; viewPointIndex < viewPoints.length; viewPointIndex++)
			{
				const _loc7_ = viewPoints[viewPointIndex];
				if (_loc7_.bg.hitTestPoint(this.mouseX, this.mouseY, false) && !_loc7_.isAnimating())
					com.google.finance.MainManager.mouseCursor.setCursor(MouseCursor.DRAGGABLE_CURSOR);
			}
			this.displayManager.topBorderLayer.update();
			this.state = ControllerStates.NOTHING;
			this.MOUSE_DOWN = false;
		}

		private clearAllHighlights() 
		{
			const viewPoints = this.displayManager.getViewPoints();
			for (let viewPointIndex = 0; viewPointIndex < viewPoints.length; viewPointIndex++)
			{
				viewPoints[viewPointIndex].clearPointInformation();
			}
		}

		moveSparkline(param1: number) 
		{
			const sparklineViewPoint = <SparklineViewPoint><any>this.displayManager.getViewPoint(Const.SPARKLINE_VIEW_POINT_NAME);
			sparklineViewPoint.moveSparklineBy_Handler(param1 * 10);
			sparklineViewPoint.commitSparklineOffset_Handler();
			this.displayManager.topBorderLayer.update();
		}

		zoomButtonClicked(param1: string) 
		{
			const firstDataSource = this.displayManager.layersManager.getFirstDataSource();
			if (!firstDataSource || firstDataSource.isEmpty())
				return;

			const _loc3_ = Const.SCALE_INTERVALS;
			let _loc4_ = _loc3_.length - 1;
			while (_loc4_ >= 0 && Messages.getMsg(_loc3_[_loc4_].text) !== param1)
			{
				_loc4_--;
			}
			if (_loc4_ === -1)
				return;

			com.google.finance.MainManager.jsProxy.logZoomButtonClick(_loc3_[_loc4_].logtext);
			this.animateToLevel(_loc4_);
		}

		private addXOffset(param1: Controller, param2: number) 
		{
			const sparklineViewPoint = <SparklineViewPoint><any>param1.displayManager.getViewPoint(Const.SPARKLINE_VIEW_POINT_NAME);
			if (sparklineViewPoint.sparklinePagingPossible(param2))
			{
				param1.cumulativeXOffset = param1.cumulativeXOffset + param2;
				param1.moveListenersByOffsets();
			}
			else
			{
				param1.stopContinuousPaging();
			}
		}

		findBestFitDetailLevel(viewPoint: ViewPoint, param2: DataSource | null): number
		{
			if (!viewPoint || !param2)
				return -1;

			const firstMinute = viewPoint.getFirstMinute();
			const count = viewPoint.count;
			if (this.isFitDetailLevel(this.lastIntervalLevel, param2, firstMinute, count))
				return this.lastIntervalLevel;

			for (let intervalIndex = Intervals.INTRADAY; intervalIndex <= Intervals.WEEKLY; intervalIndex++)				
			{
				if (this.isFitDetailLevel(intervalIndex, param2, firstMinute, count))
					return intervalIndex;
			}
			return -1;
		}

		private drawSquare(param1: number, param2: number, param3: number, param4: number) 
		{
			const gr = this.graphics;
			gr.clear();
			gr.beginFill(Const.SELECTING_FILL_COLOR, 0.4);
			gr.lineStyle(0, Const.SELECTING_LINE_COLOR, 1);
			gr.drawRect(
				param1, this.holderBounds.miny,
				param3 - param1, this.holderBounds.maxy - this.holderBounds.miny);
			/*
			gr.moveTo(param1, this.holderBounds.miny);
			gr.lineTo(param1, this.holderBounds.maxy);
			gr.lineTo(param3, this.holderBounds.maxy);
			gr.lineTo(param3, this.holderBounds.miny);
			*/
			gr.endFill();
		}

		replaceBounds(param1: com.google.finance.Bounds, param2: com.google.finance.Bounds) 
		{
			const boundsIndex = this.getBoundsIndex(param1);
			if (boundsIndex !== -1)
				this.controlledAreaBounds.splice(boundsIndex, 1);

			this.controlledAreaBounds.push(param2);
			this.computeHolderBounds();
		}

		private commitListenersOffset() 
		{
			for (let listenerIndex = 0; listenerIndex < this.listeners.length; listenerIndex++)
				this.listeners[listenerIndex].commitOffset_Handler();
		}

		getCustomScaleZoomLevel(dataSource: DataSource, startDate: Date, endDate: Date) 
		{
			if (!startDate || !endDate || startDate >= endDate)
				return null;

			const units = dataSource.data.units;
			const firstTimeIndex = DataSource.getTimeIndex(startDate.getTime(), units);
			const lastTimeIndex = DataSource.getTimeIndex(endDate.getTime(), units);
			const lastRelativeMinute = units[lastTimeIndex].relativeMinutes;
			const firstRelativeMinute = units[firstTimeIndex].relativeMinutes;
			return {
				"lastMinute": lastRelativeMinute,
				"count": lastRelativeMinute - firstRelativeMinute
			};
		}

		setMinDisplayDays(param1: number) 
		{
			const mainViewPoint = this.displayManager.getMainViewPoint();
			if (!mainViewPoint)
				return;
			const firstMinute = mainViewPoint.getFirstMinute();
			const lastMinute = mainViewPoint.getLastMinute();
			const firstDataSource = this.mainManager.layersManager.getFirstDataSource();
			if (!firstDataSource)
				return;
			const endOfDayDataUnit = firstDataSource.getEndOfDayDataUnitFor(lastMinute);
			const endOfDayMinute = endOfDayDataUnit.relativeMinutes;
			const countForDays = this.getCountForDays(firstDataSource, param1, endOfDayMinute);
			Const.MIN_DISPLAY_DAYS = param1;
			if (countForDays > lastMinute - firstMinute)
				this.animateTo(endOfDayMinute, countForDays);
		}

		private notifyListenersToMove(param1: number) 
		{
			this.changeListenersOffset(param1);
			this.checkSparklinePositioning();
			this.commitListenersOffset();
			this.displayManager.showContextualStaticInfo();
			this.displayManager.topBorderLayer.update();
			clearInterval(this.notifyHtmlIntervalId);
			this.notifyHtmlIntervalId = setInterval(flash.display.Stage.bind(this.listenersNotifyHtml,this), Controller.NOTIFY_TIMEOUT);
		}

		private stopContinuousPaging() 
		{
			clearInterval(this.intId);
			this.pagingAmount = 0;
		}

		private enableZoomButtons() 
		{
			if (this.contains(this.zoomButtons))
				return;

			this.addChild(this.zoomText);
			this.addChild(this.zoomButtons);
			if (this.contains(this.intervalButtons))
			{
				this.removeChild(this.intervalButtons);
				this.removeChild(this.intervalText);
			}
			this.clearCurrentInterval();
		}

		private pollingTimerHandler(param1: flash.utils.TimerEvent) 
		{
			const firstDataSource = this.displayManager.layersManager.getFirstDataSource();
			if (!firstDataSource || firstDataSource.isEmpty())
			{
				this.pollingTimer.stop();
				return;
			}
			const _loc3_ = firstDataSource.data.marketCloseMinute - firstDataSource.data.marketOpenMinute;
			const newMarketState = this.getNewMarketState(this.isMarketOpen, this.stateRemainingMinutes, _loc3_);
			this.isMarketOpen = newMarketState.isMarketOpen;
			this.stateRemainingMinutes = newMarketState.stateRemainingMinutes;
			if (firstDataSource.data.hasPointsInIntervalArray(Const.INTRADAY_INTERVAL) && this.shouldRequestRegularMarketData(this.isMarketOpen, this.stateRemainingMinutes, this.delayedMinutes, _loc3_))
			{
				const event = EventFactory.getEvent(ChartEventStyles.GET_RT_DATA, firstDataSource.quoteName, ChartEventPriorities.POLLING);
				this.mainManager.dataManager.eventHandler(event);
			}
			if (Boolean(com.google.finance.MainManager.paramsObj.hasExtendedHours) && firstDataSource.afterHoursData.hasPointsInIntervalArray(Const.INTRADAY_INTERVAL) && this.shouldRequestAfterHoursData(this.isMarketOpen, this.stateRemainingMinutes, this.delayedMinutes, _loc3_))
			{
				const event = EventFactory.getEvent(ChartEventStyles.GET_RT_AH_DATA, firstDataSource.quoteName, ChartEventPriorities.POLLING);
				this.mainManager.dataManager.eventHandler(event);
			}
		}

		updateChartSizeChangeButtonPosition() 
		{
			if (this.chartSizeChangeButton)
				this.chartSizeChangeButton.x = this.mainManager.stage.stageWidth - this.chartSizeChangeButton.width - 5;
		}

		toggleZoomIntervalButtons(param1: string, param2: string) 
		{
			if (param1 === param2)
				return;

			if (this.chartTypeButtons)
				this.chartTypeButtons.selectButtonByIndex(Const.CHART_STYLE_NAMES.indexOf(param2));

			const _loc3_ = <ViewPoint>this.displayManager.getMainViewPoint();
			if (param1 === Const.LINE_CHART)
			{
				const firstDataSource = this.displayManager.layersManager.getFirstDataSource();
				if (firstDataSource && _loc3_.getFirstMinute() < firstDataSource.firstOpenRelativeMinutes)
				{
					this.applyLastOrDefaultInterval(firstDataSource, _loc3_);
					return;
				}
				if (this.displayManager.getDetailLevel() < Intervals.DAILY && Boolean(com.google.finance.MainManager.paramsObj.displayExtendedHours))
				{
					this.applyLastOrDefaultInterval(firstDataSource, _loc3_);
					return;
				}
				const dBestFitDetailLevel = this.findBestFitDetailLevel(_loc3_, firstDataSource);
				if (dBestFitDetailLevel === -1)
				{
					this.applyLastOrDefaultInterval(firstDataSource, _loc3_);
				}
				else
				{
					this.enableIntervalButtons(dBestFitDetailLevel);
					this.currentIntervalLevel = dBestFitDetailLevel;
					_loc3_.checkEvents();
				}
			}
			else if (param2 === Const.LINE_CHART)
			{
				this.lastIntervalLevel = this.currentIntervalLevel;
				this.lastCount = _loc3_.count;
				this.lastLastMinutes = _loc3_.lastMinute;
				this.enableZoomButtons();
			}
		}

		addBounds(param1: com.google.finance.Bounds) 
		{
			this.controlledAreaBounds.push(param1);
			this.holderBounds.append(param1);
		}

		animateToLevel(param1: number) 
		{
			const zoomLevelFinalState = this.getZoomLevelFinalState(param1);
			if (zoomLevelFinalState)
			{
				this.currentZoomLevel = param1;
				this.animateTo(zoomLevelFinalState.lastMinute, zoomLevelFinalState.count);
			}
		}

		private createZoomButtons() 
		{
			this.zoomText = new flash.text.TextField();
			this.zoomText.x = !this.chartTypeButtons ? 5 : this.chartTypeButtons.x + this.chartTypeButtons.width + 5;
			this.zoomText.y = 5;
			this.zoomText.autoSize = flash.text.TextFieldAutoSize.LEFT;
			this.zoomText.defaultTextFormat = this.windowTitleTextFormat;
			this.zoomText.text = Messages.getMsg(Messages.ZOOM) + ":";
			this.zoomText.selectable = false;
			this.zoomButtons = new com.google.finance.ui.TextButtonsGroup();
			this.zoomButtons.setSpacing("", !!this.isZh ? 1 : 3);
			this.zoomButtons.setTextFormats(this.buttonTextFormat, this.selectedTextFormat, this.separatorTextFormat);
			this.zoomButtons.x = this.zoomText.x + this.zoomText.width + this.zoomButtons.spacing;
			this.zoomButtons.y = this.zoomText.y;
			this.resetZoomButtons(Const.MIN_DISPLAY_DAYS);
		}

		private onKeyDown(param1: KeyboardEvent) 
		{
			this.CTRL_DOWN = param1.ctrlKey;
			this.SHIFT_DOWN = param1.shiftKey;
			if (param1.charCode === "vVeElLcC".charCodeAt(0))
				com.google.finance.MainManager.jsProxy.setParameter("displayVolume", "false");
			else if (param1.charCode === "vVeElLcC".charCodeAt(1))
				com.google.finance.MainManager.jsProxy.setParameter("displayVolume", "true");
			else if (param1.charCode === "vVeElLcC".charCodeAt(2))
				com.google.finance.MainManager.jsProxy.setParameter("displayExtendedHours", "true");
			else if (param1.charCode === "vVeElLcC".charCodeAt(3))
				com.google.finance.MainManager.jsProxy.setParameter("displayExtendedHours", "false");
			else if (param1.charCode === "vVeElLcC".charCodeAt(4))
				com.google.finance.MainManager.jsProxy.setParameter("verticalScaling", "Logarithmic");
			else if (param1.charCode === "vVeElLcC".charCodeAt(5))
				com.google.finance.MainManager.jsProxy.setParameter("verticalScaling", "Linear");
			else if (param1.keyCode === 38)
				this.zoomStuff(Directions.FORWARD, 0, 1);
			else if (param1.keyCode === 40)
				this.zoomStuff(Directions.BACKWARD, 0, 1);
		}

		isFitDetailLevel(param1: Intervals, param2: DataSource, param3: number, param4: number): boolean
		{
			if (!(param1 >= Intervals.INTRADAY && param1 <= Intervals.WEEKLY))
				return false;

			const detailLevelInterval = Const.getDetailLevelInterval(param1);
			const pointsInIntervalArray = param2.data.getPointsInIntervalArray(detailLevelInterval);
			const _loc7_ = param2.data.marketDayLength + 1;
			return pointsInIntervalArray && pointsInIntervalArray.length > 0 && pointsInIntervalArray[0].relativeMinutes <= param3 && param4 <= Const.INTERVAL_PERIODS[param1].maxdays * _loc7_ && param4 >= Const.INTERVAL_PERIODS[param1].mindays * _loc7_;
		}

		onMouseDown(param1: MouseEvent) 
		{
			com.google.finance.MainManager.jsProxy.setChartFocus(true);
			this.SHIFT_DOWN = param1.shiftKey;
			this.CTRL_DOWN = param1.ctrlKey;
			if (!this.displayManager.spaceText.isDateFieldClicked(param1))
				this.displayManager.spaceText.resetInfoText();

			this.mouseDownAction();
		}

		private onKeyUp(param1: KeyboardEvent) 
		{
			this.CTRL_DOWN = param1.ctrlKey;
			this.SHIFT_DOWN = param1.shiftKey;
			clearInterval(this.intId);
		}

		removeAllBounds() 
		{
			this.controlledAreaBounds.splice(0);
			this.computeHolderBounds();
		}

		shouldRequestRegularMarketData(param1: boolean, param2: number, param3: number, param4: number): boolean
		{
			if (param1)
				return true;

			if (param2 <= Const.REALTIME_CHART_POLLING_MARGIN || param2 >= Const.MIN_PER_DAY - param4 - param3 - Const.REALTIME_CHART_POLLING_MARGIN)
				return true;

			return false;
		}

		animateToCustomLevel(startDate: Date, endDate: Date) 
		{
			this.customZoomStartDate = startDate;
			this.customZoomEndDate = endDate;
			this.animateToLevel(Const.SCALE_CUSTOM);
		}

		intervalButtonClicked(param1: string) 
		{
			const firstDataSource = this.displayManager.layersManager.getFirstDataSource();
			if (!firstDataSource || firstDataSource.isEmpty())
				return;

			const _loc3_ = Const.INTERVAL_PERIODS;
			let _loc4_:Intervals = _loc3_.length - 1;
			while (_loc4_ >= 0 && Messages.getMsg(_loc3_[_loc4_].text) !== param1)
				_loc4_--;

			if (_loc4_ === -1)
				return;

			com.google.finance.MainManager.jsProxy.logIntervalButtonClick(_loc3_[_loc4_].logtext);
			this.currentIntervalLevel = _loc4_;
			if (Boolean(com.google.finance.MainManager.paramsObj.displayExtendedHours))
			{
				if (this.currentIntervalLevel === Intervals.INTRADAY)
					this.displayManager.toggleAllAfterHoursSessions(true);
				else
					this.displayManager.toggleAllAfterHoursSessions(false);
			}
			this.animateTo(0, _loc3_[_loc4_].days * (firstDataSource.data.marketDayLength + 1), 1);
			com.google.finance.MainManager.jsProxy.setJsCurrentViewParam("defaultDisplayInterval", Const.getDetailLevelInterval(_loc4_));
		}

		private highlightPoints() 
		{
			const _loc1_ = {};
			const viewPoints = this.displayManager.getViewPoints();

			for (let viewPointIndex = 0; viewPointIndex < viewPoints.length; viewPointIndex++)
			{
				const _loc4_ = viewPoints[viewPointIndex];
				_loc4_.highlightPoint(this.mouseX, _loc1_);
			}
			return _loc1_;
		}

		getState(): ControllerStates
		{
			return this.state;
		}

		private getZoomLevelFinalState(param1: number): ViewPointState | null
		{
			let _loc8_ = NaN;
			const sparklineViewPoint = <SparklineViewPoint><any>this.displayManager.getViewPoint(Const.SPARKLINE_VIEW_POINT_NAME);
			const _loc3_ = <ViewPoint>this.displayManager.getMainViewPoint();
			const layersManager = this.mainManager.layersManager;
			const firstDataSource = layersManager.getFirstDataSource();
			if (!firstDataSource)
				return null;

			const _loc6_ = Const.SCALE_INTERVALS;
			let lastMinute = sparklineViewPoint.getLastMinute();
			if (param1 === Const.SCALE_CUSTOM)
			{
				const customScaleZoomLevel = this.getCustomScaleZoomLevel(firstDataSource, this.customZoomStartDate, this.customZoomEndDate);
				if (!customScaleZoomLevel)
					return null;

				lastMinute = customScaleZoomLevel.lastMinute;
				_loc8_ = customScaleZoomLevel.count;
			}
			else if (param1 === ScaleTypes.SCALE_YTD)
			{
				const numUnits = firstDataSource.data.units.length;
				const _loc12_ = firstDataSource.data.units[numUnits - 1];
				const _loc13_ = new Date(_loc12_.time);
				_loc13_.setMonth(0);
				_loc13_.setDate(1);
				const units = firstDataSource.data.units;
				const timeIndex = DataSource.getTimeIndex(_loc13_.getTime(), units);
				lastMinute = 0;
				_loc8_ = lastMinute - units[timeIndex].relativeMinutes;
			}
			else if (param1 === ScaleTypes.SCALE_MAX)
			{
				lastMinute = _loc3_.getNewestMinute();
				_loc8_ = Math.abs(_loc3_.getOldestBaseMinute());
			}
			else if (param1 >= 0 && param1 <= ScaleTypes.SCALE_1M)
			{
				const lastDataUnit = sparklineViewPoint.getLastDataUnit();
				const date = new Date(lastDataUnit.time);
				date.setMonth(date.getMonth() - _loc6_[param1].months);
				const units = firstDataSource.data.units;
				const timeIndex = DataSource.getTimeIndex(date.getTime(), units);
				_loc8_ = sparklineViewPoint.getLastMinute() - units[timeIndex].relativeMinutes;
			}
			else if (param1 >= 0 && param1 < _loc6_.length)
			{
				const _loc16_ = _loc3_.getLastMinute();
				const _loc17_ = firstDataSource.getEndOfDayDataUnitFor(_loc16_);
				lastMinute = _loc17_.relativeMinutes;
				_loc8_ = this.getCountForDays(firstDataSource, _loc6_[param1].days, lastMinute);
			}
			else
			{
				return null;
			}

			const style = this.displayManager.layersManager.getStyle();
			if (style === LayersManager.SINGLE && Boolean(com.google.finance.MainManager.paramsObj.displayExtendedHours))
			{
				let _loc18_: Intervals;
				let _loc19_: Intervals;

				if (Const.INDICATOR_ENABLED)
				{
					_loc18_ = _loc3_.getDetailLevelForTechnicalStyle();
					_loc19_ = _loc3_.getDetailLevelForTechnicalStyle(_loc8_, lastMinute);
				}
				else
				{
					_loc18_ = _loc3_.getDetailLevel();
					_loc19_ = _loc3_.getDetailLevel(_loc8_, lastMinute);
				}
				_loc8_ = this.adjustCountForAfterHours(_loc8_, firstDataSource, _loc18_, _loc19_);
			}
			if (isNaN(_loc8_) || isNaN(lastMinute))
				return null;

			return {
				"lastMinute": lastMinute,
				"count": _loc8_
			};
		}

		zoomStuff(param1: number, param2: number, param3: number = NaN) 
		{
			this.clearCurrentZoom();

			for (let listenerIndex = 0; listenerIndex < this.listeners.length; listenerIndex++)
				this.listeners[listenerIndex].zoomChart_Handler(param1, param3);

			this.displayManager.topBorderLayer.update();
			this.displayManager.showContextualStaticInfo();
		}

		private getBoundsIndex(param1: com.google.finance.Bounds): number
		{
			for (let boundsIndex = 0; boundsIndex < this.controlledAreaBounds.length; boundsIndex++)
			{
				if (param1.equals(this.controlledAreaBounds[boundsIndex]))
					return boundsIndex;
			}
			return -1;
		}

		private changeListenersOffset(param1: number) 
		{
			for (let listenerIndex = 0; listenerIndex < this.listeners.length; listenerIndex++)
				this.listeners[listenerIndex].moveChartBy_Handler(param1);
		}

		getNewMarketState(param1: boolean, param2: number, param3: number) 
		{
			if (param2 === 0)
			{
				param1 = !param1;
				param2 = !!param1 ? param3 : Const.MIN_PER_DAY - param3;
			}
			param2 = param2 - Const.REALTIME_CHART_POLLING_INTERVAL / Const.MS_PER_MINUTE;
			return {
				"isMarketOpen": param1,
				"stateRemainingMinutes": param2
			};
		}

		initEventListeners() 
		{
			if (!this.stage)
				return;

			let stage = this.stage;
			//var stage = document.body;

			stage.addEventListener(KeyboardEvents.KEY_DOWN, flash.display.Stage.bind(this.onKeyDown, this));
			stage.addEventListener(KeyboardEvents.KEY_UP, flash.display.Stage.bind(this.onKeyUp, this));
			stage.addEventListener(MouseEvents.MOUSE_MOVE, flash.display.Stage.bind(this.onMouseMove, this));
			stage.addEventListener(MouseEvents.MOUSE_LEAVE, flash.display.Stage.bind(this.onMouseLeave, this));
			stage.addEventListener(MouseEvents.MOUSE_DOWN, flash.display.Stage.bind(this.onMouseDown, this));
			stage.addEventListener(MouseEvents.MOUSE_UP, flash.display.Stage.bind(this.onMouseUp, this));
			this.initPollingTimer();
		}

		enableIntervalButtons(param1: number) 
		{
			if (this.contains(this.intervalButtons))
				return;

			this.addChild(this.intervalText);
			this.addChild(this.intervalButtons);
			this.intervalButtons.selectButtonByIndex(param1);
			if (this.contains(this.zoomButtons))
			{
				this.removeChild(this.zoomButtons);
				this.removeChild(this.zoomText);
			}
			this.clearCurrentZoom();
		}

		mouseDownAction(param1: ControllerComponents = NaN) 
		{
			const sparklineViewPoint = <SparklineViewPoint>this.displayManager.getViewPoint(Const.SPARKLINE_VIEW_POINT_NAME);
			this.initialXMouse = this.stage.mouseX;
			this.initialYMouse = this.stage.mouseY;
			switch (param1)
			{
				case ControllerComponents.SCROLL_BAR:
					this.state = ControllerStates.SCROLLING;
					this.cumulativeXOffset = 0;
					this.pagingAmount = 0;
					const leftX = sparklineViewPoint.windowLayer.getLeftX();
					const rightX = sparklineViewPoint.windowLayer.getRightX();
					this.scrollMouseMinX = sparklineViewPoint.minx + this.initialXMouse - leftX;
					this.scrollMouseMaxX = sparklineViewPoint.maxx - (rightX - this.initialXMouse);
					break;
				case ControllerComponents.SCROLL_BG:
					const scrollSlider = sparklineViewPoint.windowLayer.scrollSlider;
					if (this.mouseX < scrollSlider.x)
					{
						this.movePage(Directions.BACKWARD);
						break;
					}
					if (this.mouseX > scrollSlider.x + scrollSlider.width)
					{
						this.movePage(Directions.FORWARD);
						break;
					}
					break;
				case ControllerComponents.LEFT_BUTTON:
					this.state = ControllerStates.PRESSING_LEFT;
					clearInterval(this.intId);
					this.intId = setInterval(() => { this.notifyListenersToMove(Directions.BACKWARD * this.BUTTON_MOVEBY_AMOUNT); }, 20);
					break;
				case ControllerComponents.RIGHT_BUTTON:
					this.state = ControllerStates.PRESSING_RIGHT;
					clearInterval(this.intId);
					this.intId = setInterval(() => { this.notifyListenersToMove(Directions.FORWARD * this.BUTTON_MOVEBY_AMOUNT); }, 20);
					break;
				case ControllerComponents.LEFT_HANDLE:
					this.state = ControllerStates.DRAGGING_LEFT_HANDLE;
					this.MOUSE_DOWN = true;
					this.mouseCursor.setCursor(MouseCursors.H_ARROWS);
					return;
				case ControllerComponents.RIGHT_HANDLE:
					this.state = ControllerStates.DRAGGING_RIGHT_HANDLE;
					this.MOUSE_DOWN = true;
					this.mouseCursor.setCursor(MouseCursors.H_ARROWS);
					return;
			}
			if (!this.hitTestInsideBounds(this.mouseX, this.mouseY))
				return;

			this.MOUSE_DOWN = true;
			this.clearAllHighlights();
			if (this.CTRL_DOWN && this.SHIFT_DOWN)
			{
				this.state = ControllerStates.ZOOMING_OUT;
				clearInterval(this.intId);
				this.intId = setInterval(() => { this.zoomStuff(Directions.BACKWARD, this.stage.mouseX); }, 20);
				return;
			}
			if (this.SHIFT_DOWN)
			{
				this.state = ControllerStates.SELECTING;
				this.mouseCursor.setCursor(MouseCursors.CLASSIC);
				return;
			}
			this.mouseCursor.setCursor(MouseCursors.CLOSED_HAND);
			this.state = ControllerStates.DRAGGING;
		}
	}
}
