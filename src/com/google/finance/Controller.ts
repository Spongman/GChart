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

	export class Controller extends flash.display.Sprite
	{
		static DRAGGING_SPARKLINE = 12;
		static SELECTING = 2;
		static PRESSING_LEFT = 7;
		static DRAGGING = 1;
		static PRESSING_PAGE_RIGHT = 11;
		static SCROLLING = 4;
		static NOTHING = 0;
		static DRAGGING_LEFT_HANDLE = 5;
		static PRESSING_PAGE_LEFT = 10;
		static DRAGGING_RIGHT_HANDLE = 6;
		static PRESSING_RIGHT = 8;
		static ZOOMING_OUT = 3;
		static WINDOW = 9;

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
		private state = Controller.NOTHING
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

		displayManager: com.google.finance.DisplayManager;
		mainManager: com.google.finance.MainManager;
		currentIntervalLevel: number;
		currentZoomLevel: number;
		
		constructor(param1: com.google.finance.MainManager, param2: com.google.finance.DisplayManager)
		{
			super();
			this.listeners = [];
			this.isZh = Const.isZhLocale(com.google.i18n.locale.DateTimeLocale.getLocale());
			this.mainManager = param1;
			this.displayManager = param2;
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
			if (Const.INDICATOR_ENABLED && Const.CHART_TYPE_BUTTONS_ENABLED && param1.getQuoteType() === Const.COMPANY)
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
			const _loc2_ = this.displayManager.getMainViewPoint();
			if (_loc2_)
				this.notifyListenersToMove(param1 * (_loc2_.maxx - _loc2_.minx));
		}

		private getInitialZoomLevel(): number
		{
			if (Const.DEFAULT_DISPLAY_MINUTES !== -1)
				return -1;


			for (let _loc1_ = 0; _loc1_ < Const.SCALE_INTERVALS.length; _loc1_++)
			{
				if (Const.SCALE_INTERVALS[_loc1_].days === Const.DEFAULT_DISPLAY_DAYS && _loc1_ >= Const.SCALE_5D)
					return _loc1_;
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
				MainManager.mouseCursor.setCursor(MouseCursor.CLASSIC);
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

		private applyLastOrDefaultInterval(dataSource: DataSource | null, param2: ViewPoint) 
		{
			let _loc4_ = 0;
			if (this.lastIntervalLevel >= 0 && this.lastIntervalLevel <= Const.WEEKLY)
			{
				this.enableIntervalButtons(this.lastIntervalLevel);
				this.currentIntervalLevel = this.lastIntervalLevel;
				this.animateTo(this.lastLastMinutes, this.lastCount, 1);
			}
			else
			{
				this.enableIntervalButtons(Const.DEFAULT_D);
				this.currentIntervalLevel = Const.DEFAULT_D;
				param2.checkEvents();
				if (dataSource)
				{
					const _loc3_ = Const.INTERVAL_PERIODS[Const.DEFAULT_D].days;
					_loc4_ = dataSource.data.marketDayLength + 1;
					this.animateTo(0, _loc3_ * _loc4_, 1);
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
			for (let _loc2_ = 0; _loc2_ < this.listeners.length; _loc2_++)
			{
				if (this.listeners[_loc2_] === param1)
				{
					this.listeners.splice(_loc2_, 1);
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
			const _loc4_ = dataSource.data.units;
			const _loc5_ = dataSource.data.days;
			const _loc6_ = dataSource.getEndOfDayDataUnitFor(param3);
			let _loc7_ = DataSource.getMinuteMetaIndex(_loc6_.relativeMinutes, _loc5_, _loc4_);
			_loc7_ = Math.min(_loc7_, _loc5_.length - 1);
			let _loc8_ = 0;
			let _loc9_ = 0;
			const _loc10_ = _loc4_[_loc5_[_loc7_]].relativeMinutes;
			let _loc11_ = dataSource.getEndOfDayDataUnitFor(_loc10_);
			if (Utils.compareUtcDates(_loc11_.exchangeDateInUTC, _loc6_.exchangeDateInUTC) !== 0)
				_loc8_ = _loc8_ + (dataSource.afterHoursData.getSessionLength(Const.PRE_MARKET_NAME) + 1);

			while (_loc7_ >= 0 && _loc9_ < param2)
			{
				_loc7_--;
				let _loc12_ = _loc4_[_loc5_[_loc7_]];
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
			const _loc1_ = this.displayManager.getMainViewPoint();
			if (!_loc1_)
				return;
			const _loc2_ = <SparklineViewPoint><any>this.displayManager.getViewPoint(Const.SPARKLINE_VIEW_POINT_NAME);
			//const _loc3_ = _loc2_.dataSource;
			const _loc4_ = _loc2_.getWidth();
			const _loc5_ = _loc2_.sparkCount * (_loc1_.maxx - _loc1_.minx) / _loc1_.count;
			const _loc6_ = _loc2_.moveSparklineBy_Handler(this.cumulativeXOffset);
			const _loc7_ = (this.baseXOffset - _loc6_) * _loc5_ / _loc4_;
			this.changeListenersOffset(_loc7_);
		}

		handleMouseWheel(param1: number) 
		{
			if (param1 !== 0)
			{
				const _loc2_ = Math.abs(param1);
				if (param1 > 0)
					this.zoomStuff(Const.FORWARD, this.mouseX, _loc2_);
				else if (param1 < 0)
					this.zoomStuff(Const.BACKWARD, this.mouseY, _loc2_);

				clearInterval(this.notifyHtmlIntervalId);
				this.notifyHtmlIntervalId = setInterval(this.listenersNotifyHtml.bind(this), Controller.NOTIFY_TIMEOUT);
			}
		}

		private hitTestInsideBounds(param1: number, param2: number): boolean
		{
			for (let _loc3_ = 0; _loc3_ < this.controlledAreaBounds.length; _loc3_++)
			{
				if (this.controlledAreaBounds[_loc3_].containsPoint(param1, param2))
					return true;
			}
			return false;
		}

		checkSparklinePositioning() 
		{
			const _loc1_ = <SparklineViewPoint><any>this.displayManager.getViewPoint(Const.SPARKLINE_VIEW_POINT_NAME);
			const _loc2_ = this.displayManager.getMainViewPoint();
			if (!_loc1_ || !_loc2_)
				return;
			//const _loc3_ = _loc2_.minutesOffset;
			if (!_loc1_.windowLayer)
				return;
			const _loc4_ = _loc1_.windowLayer.getLeftX();
			const _loc5_ = _loc1_.windowLayer.getRightX();
			const _loc6_ = this.displayManager.layersManager.getFirstDataSource();
			const _loc7_ = _loc1_.getSparkLastMinute() < 0;
			let _loc8_ = _loc1_.getSparkFirstMinute() > _loc1_.getOldestMinute();
			if (this.currentIntervalLevel !== -1 && _loc6_)
			{
				const _loc9_ = _loc6_.getFirstRelativeMinute(this.currentIntervalLevel);
				_loc8_ = _loc1_.getSparkFirstMinute() > _loc9_;
			}
			if (_loc8_ && _loc4_ < _loc1_.minx + this.PAGING_AREA_WIDTH)
			{
				const _loc10_ = _loc4_ - (_loc1_.minx + this.PAGING_AREA_WIDTH);
				_loc1_.moveSparklineBy_Handler(_loc10_);
				_loc1_.commitSparklineOffset_Handler();
			}
			else if (_loc7_ && _loc5_ > _loc1_.maxx - this.PAGING_AREA_WIDTH)
			{
				const _loc10_ = _loc5_ - (_loc1_.maxx - this.PAGING_AREA_WIDTH);
				_loc1_.moveSparklineBy_Handler(_loc10_);
				_loc1_.commitSparklineOffset_Handler();
			}
		}

		setNewFinalState(param1: ViewPointState, param2: boolean = false)
		{
			if (param1.lastMinute === undefined || param1.count === undefined)
				return;

			if (this.aniManager.isAnimating())
			{
				for (let _loc3_ = 0; _loc3_ < this.listeners.length; _loc3_++)
				{
					this.listeners[_loc3_].newFinalAnimationState(param1);
				}
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
			const _loc7_ = new Context();
			_loc7_.lastMinute = param1;
			_loc7_.count = param2;
			for (let _loc8_ = 0; _loc8_ < this.listeners.length; _loc8_++)
			{
				this.listeners[_loc8_].zoomingAnimation_init(_loc7_);
				let listener = this.listeners[_loc8_];
				_loc5_[_loc8_] = listener.zoomingAnimation_ticker.bind(listener);
				_loc6_[_loc8_] = listener;
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
			if (this.state === Controller.SCROLLING)
				return;

			if (this.displayManager.isDifferentMarketSessionComparison())
				return;

			const _loc2_ = this.getZoomLevelFinalState(this.currentZoomLevel);
			if (_loc2_)
				this.setNewFinalState(_loc2_, param1);
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
			const _loc3_ = <SparklineViewPoint>this.displayManager.getViewPoint(Const.SPARKLINE_VIEW_POINT_NAME);
			//const _loc4_ = this.displayManager.getViewPoint("BottomViewPoint");
			//const _loc5_ = this.mainManager.layersManager;
			switch (this.state)
			{
				case Controller.SELECTING:
					this.drawSquare(this.initialXMouse, this.initialYMouse, this.mouseX, this.mouseY);
					break;
				case Controller.DRAGGING:
					this.displayManager.showContextualStaticInfo();
					this.changeListenersOffset(this.mouseX - this.initialXMouse);
					this.checkSparklinePositioning();
					break;
				case Controller.NOTHING:
					if (this.hitTestInsideBounds(this.mouseX, this.mouseY) && !_loc2_.isAnimating())
					{
						const _loc12_ = this.highlightPoints();
						this.displayManager.spaceText.setPointInfo(_loc12_);
						com.google.finance.MainManager.mouseCursor.setCursor(MouseCursor.OPENED_HAND);
						break;
					}
					if (_loc3_.windowLayer && param1.target !== _loc3_.windowLayer.leftHandle.button.element && param1.target !== _loc3_.windowLayer.rightHandle.button.element)
						com.google.finance.MainManager.mouseCursor.setCursor(MouseCursor.CLASSIC);

					this.clearAllHighlights();
					this.displayManager.showContextualStaticInfo();
					if (_loc3_.bg.hitTestPoint(this.mouseX, this.mouseY, false))
					{
						_loc3_.toggleHandles(true);
						break;
					}
					_loc3_.toggleHandles(false);
					break;
				case Controller.DRAGGING_SPARKLINE:
					this.mouseCursor.setCursor(MouseCursor.CLOSED_HAND);
					_loc3_.moveSparklineBy_Handler(this.initialXMouse - this.mouseX);
					break;
				case Controller.SCROLLING:
					this.displayManager.showContextualStaticInfo();
					//const _loc6_ = _loc3_.windowLayer.getLeftX();
					//const _loc7_ = _loc3_.windowLayer.getRightX();
					let _loc8_ = this.mouseX;
					_loc8_ = Math.max(_loc8_, this.scrollMouseMinX);
					_loc8_ = Math.min(_loc8_, this.scrollMouseMaxX);
					this.baseXOffset = this.initialXMouse - _loc8_;
					const _loc9_ = this.displayManager.layersManager.getFirstDataSource();
					_loc10_ = _loc3_.getSparkLastMinute() < 0;
					_loc11_ = _loc3_.getSparkFirstMinute() > _loc3_.getOldestMinute();
					if (this.currentIntervalLevel !== -1 && _loc9_)
					{
						const _loc13_ = _loc9_.getFirstRelativeMinute(this.currentIntervalLevel);
						_loc11_ = _loc3_.getSparkFirstMinute() > _loc13_;
					}
					if (_loc8_ < this.scrollMouseMinX + this.PAGING_AREA_WIDTH && _loc11_)
					{
						this.pagingAmount = _loc8_ - (this.scrollMouseMinX + this.PAGING_AREA_WIDTH);
						this.addXOffset(this, this.pagingAmount);
						clearInterval(this.intId);
						this.intId = setInterval(() => { this.addXOffset(this, this.pagingAmount); }, 20);
						break;
					}
					if (_loc8_ >= this.scrollMouseMaxX - this.PAGING_AREA_WIDTH && _loc10_)
					{
						this.pagingAmount = _loc8_ - (this.scrollMouseMaxX - this.PAGING_AREA_WIDTH);
						this.addXOffset(this, this.pagingAmount);
						clearInterval(this.intId);
						this.intId = setInterval(() => { this.addXOffset(this, this.pagingAmount); }, 20);
						break;
					}
					this.stopContinuousPaging();
					this.moveListenersByOffsets();
					break;
				case Controller.DRAGGING_LEFT_HANDLE:
					this.mouseCursor.setCursor(MouseCursor.H_ARROWS);
					_loc3_.windowLayer.initialX = this.initialXMouse;
					_loc3_.windowLayer.leftHandleXOffset = this.initialXMouse - this.mouseX;
					_loc3_.windowLayer.renderLayer();
					this.displayManager.spaceText.setTimePeriod(_loc3_.windowLayer);
					break;
				case Controller.DRAGGING_RIGHT_HANDLE:
					this.mouseCursor.setCursor(MouseCursor.H_ARROWS);
					_loc3_.windowLayer.initialX = this.initialXMouse;
					_loc3_.windowLayer.rightHandleXOffset = this.initialXMouse - this.mouseX;
					_loc3_.windowLayer.renderLayer();
					this.displayManager.spaceText.setTimePeriod(_loc3_.windowLayer);
					break;
			}
			if (this.displayManager.topBorderLayer)
				this.displayManager.topBorderLayer.update();
		}

		addControlListener(param1: IViewPoint, param2: number = NaN) 
		{
			if (param2 === Const.BOTTOM)
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
			for (let _loc1_ = 0; _loc1_ < this.listeners.length; _loc1_++)
			{
				this.listeners[_loc1_].HTMLnotify();
			}
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
			for (let _loc2_ = 0; _loc2_ < _loc1_.length; _loc2_++)
			{
				if (_loc1_[_loc2_].days >= Const.MIN_DISPLAY_DAYS)
					this.intervalButtons.addButton(Messages.getMsg(_loc1_[_loc2_].text));
			}
			this.intervalButtons.addListener(this.intervalButtonClicked, this);
		}

		jumpTo(param1: number, param2: number, param3: boolean = false)
		{
			let _loc4_ = new Context();
			_loc4_.lastMinute = param1;
			_loc4_.count = param2;
			for (let _loc5_ = 0; _loc5_ < this.listeners.length; _loc5_++)
			{
				_loc4_ = this.listeners[_loc5_].getNewContext(param1, param2);
				this.listeners[_loc5_].zoomInMinutes_Handler(_loc4_, param3);
			}
		}

		private adjustCountForAfterHours(param1: number, param2: DataSource, param3: number, param4: number): number
		{
			if (param3 === Const.INTRADAY && param4 > Const.INTRADAY)
			{
				for (let _loc5_ = 0; _loc5_ < param2.visibleExtendedHours.length(); _loc5_++)
				{
					const _loc6_ = param2.visibleExtendedHours.method_1(_loc5_);
					const _loc7_ = param2.afterHoursData.units[_loc6_.start];
					const _loc8_ = param2.afterHoursData.units[_loc6_.end];
					param1 = param1 - (_loc8_.dayMinute - _loc7_.dayMinute);
				}
			}
			else if (param3 > Const.INTRADAY && param4 === Const.INTRADAY)
			{
				for (let _loc5_ = 0; _loc5_ < param2.hiddenExtendedHours.length(); _loc5_++)				
				{
					const _loc6_ = param2.hiddenExtendedHours.method_1(_loc5_);
					const _loc7_ = param2.afterHoursData.units[_loc6_.start];
					const _loc8_ = param2.afterHoursData.units[_loc6_.end];
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
			for (let _loc3_ = _loc2_.length - 1; _loc3_ >= 0; _loc3_--)
			{
				if (_loc2_[_loc3_].days >= param1)
				{
					if (_loc2_[_loc3_].text !== Const.NO_BUTTON_TEXT)
						this.zoomButtons.addButton(Messages.getMsg(_loc2_[_loc3_].text));
				}
			}
			this.zoomButtons.addListener(this.zoomButtonClicked, this);
		}

		private computeHolderBounds() 
		{
			this.holderBounds = new com.google.finance.Bounds(Number.MAX_VALUE, Number.MAX_VALUE, 0, 0);
			for (let _loc1_ = 0; _loc1_ < this.controlledAreaBounds.length; _loc1_++)
			{
				this.holderBounds.append(this.controlledAreaBounds[_loc1_]);
			}
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
				this.isMarketOpen = com.google.finance.MainManager.paramsObj.isMarketOpenState === 1;
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
			com.google.finance.MainManager.mouseCursor.setCursor(MouseCursor.CLASSIC);
			this.clearAllHighlights();
			this.displayManager.showContextualStaticInfo();
		}

		mouseUpAction() 
		{
			//const _loc1_ = this.displayManager.getMainViewPoint();
			const _loc2_ = <SparklineViewPoint><any>this.displayManager.getViewPoint(Const.SPARKLINE_VIEW_POINT_NAME);
			switch (this.state)
			{
				case Controller.SELECTING:
					const _loc5_ = Math.min(this.initialXMouse, this.mouseX);
					const _loc6_ = Math.max(this.initialXMouse, this.mouseX);
					for (let _loc4_ = 0; _loc4_ < this.listeners.length; _loc4_++)
					{
						this.listeners[_loc4_].zoomIn_Handler(_loc5_, _loc6_);
					}
					this.listenersNotifyHtml();
					this.graphics.clear();
					break;
				case Controller.ZOOMING_OUT:
				case Controller.PRESSING_LEFT:
				case Controller.PRESSING_RIGHT:
				case Controller.PRESSING_PAGE_RIGHT:
				case Controller.PRESSING_PAGE_LEFT:
					clearInterval(this.intId);
					break;
				case Controller.DRAGGING:
				case Controller.SCROLLING:
					clearInterval(this.intId);
					_loc2_.moveSparklineBy_Handler(this.cumulativeXOffset + this.pagingAmount);
					_loc2_.commitSparklineOffset_Handler();
					this.cumulativeXOffset = 0;
					this.pagingAmount = 0;
					this.commitListenersOffset();
					if (Math.abs(this.initialXMouse - this.mouseX) >= this.MIN_PIXELS)
					{
						for (let _loc4_ = 0; _loc4_ < this.listeners.length; _loc4_++)							
						{
							this.listeners[_loc4_].HTMLnotify();
						}
						break;
					}
					break;
				case Controller.DRAGGING_LEFT_HANDLE:
					_loc2_.windowLayer.handleReleased(_loc2_.windowLayer.leftHandle);
					break;
				case Controller.DRAGGING_RIGHT_HANDLE:
					_loc2_.windowLayer.handleReleased(_loc2_.windowLayer.rightHandle);
					break;
				case Controller.WINDOW:
					return;
			}
			this.mouseCursor.setCursor(MouseCursor.CLASSIC);
			const _loc3_ = this.displayManager.getViewPoints();
			for (let _loc4_ = 0; _loc4_ < _loc3_.length; _loc4_++)
			{
				const _loc7_ = _loc3_[_loc4_];
				if (_loc7_.bg.hitTestPoint(this.mouseX, this.mouseY, false) && !_loc7_.isAnimating())
					com.google.finance.MainManager.mouseCursor.setCursor(MouseCursor.DRAGGABLE_CURSOR);
			}
			this.displayManager.topBorderLayer.update();
			this.state = Controller.NOTHING;
			this.MOUSE_DOWN = false;
		}

		private clearAllHighlights() 
		{
			const _loc1_ = this.displayManager.getViewPoints();
			for (let _loc2_ = 0; _loc2_ < _loc1_.length; _loc2_++)
			{
				_loc1_[_loc2_].clearPointInformation();
			}
		}

		moveSparkline(param1: number) 
		{
			const _loc2_ = <SparklineViewPoint><any>this.displayManager.getViewPoint(Const.SPARKLINE_VIEW_POINT_NAME);
			_loc2_.moveSparklineBy_Handler(param1 * 10);
			_loc2_.commitSparklineOffset_Handler();
			this.displayManager.topBorderLayer.update();
		}

		zoomButtonClicked(param1: string) 
		{
			const _loc2_ = this.displayManager.layersManager.getFirstDataSource();
			if (!_loc2_ || _loc2_.isEmpty())
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
			const _loc3_ = <SparklineViewPoint><any>param1.displayManager.getViewPoint(Const.SPARKLINE_VIEW_POINT_NAME);
			if (_loc3_.sparklinePagingPossible(param2))
			{
				param1.cumulativeXOffset = param1.cumulativeXOffset + param2;
				param1.moveListenersByOffsets();
			}
			else
			{
				param1.stopContinuousPaging();
			}
		}

		findBestFitDetailLevel(param1: ViewPoint, param2: DataSource | null): number
		{
			if (!param1 || !param2)
				return -1;

			const _loc3_ = param1.getFirstMinute();
			const _loc4_ = param1.count;
			if (this.isFitDetailLevel(this.lastIntervalLevel, param2, _loc3_, _loc4_))
				return this.lastIntervalLevel;

			for (let _loc5_ = Const.INTRADAY; _loc5_ <= Const.WEEKLY; _loc5_++)				
			{
				if (this.isFitDetailLevel(_loc5_, param2, _loc3_, _loc4_))
					return _loc5_;
			}
			return -1;
		}

		private drawSquare(param1: number, param2: number, param3: number, param4: number) 
		{
			const gr = this.graphics;
			gr.clear();
			gr.beginFill(Const.SELECTING_FILL_COLOR, 0.4);
			gr.lineStyle(0, Const.SELECTING_LINE_COLOR, 1);
			gr.moveTo(param1, this.holderBounds.miny);
			gr.lineTo(param1, this.holderBounds.maxy);
			gr.lineTo(param3, this.holderBounds.maxy);
			gr.lineTo(param3, this.holderBounds.miny);
			gr.endFill();
		}

		replaceBounds(param1: com.google.finance.Bounds, param2: com.google.finance.Bounds) 
		{
			const _loc3_ = this.getBoundsIndex(param1);
			if (_loc3_ !== -1)
				this.controlledAreaBounds.splice(_loc3_, 1);

			this.controlledAreaBounds.push(param2);
			this.computeHolderBounds();
		}

		private commitListenersOffset() 
		{
			for (let _loc1_ = 0; _loc1_ < this.listeners.length; _loc1_++)
			{
				this.listeners[_loc1_].commitOffset_Handler();
			}
		}

		getCustomScaleZoomLevel(dataSource: DataSource, param2: Date, param3: Date) 
		{
			if (!param2 || !param3 || param2 >= param3)
				return null;

			const _loc4_ = dataSource.data.units;
			const _loc5_ = DataSource.getTimeIndex(param2.getTime(), _loc4_);
			const _loc6_ = DataSource.getTimeIndex(param3.getTime(), _loc4_);
			const _loc7_ = _loc4_[_loc6_].relativeMinutes;
			const _loc8_ = _loc4_[_loc5_].relativeMinutes;
			return {
				"lastMinute": _loc7_,
				"count": _loc7_ - _loc8_
			};
		}

		setMinDisplayDays(param1: number) 
		{
			const _loc2_ = this.displayManager.getMainViewPoint();
			if (!_loc2_)
				return;
			const _loc3_ = _loc2_.getFirstMinute();
			const _loc4_ = _loc2_.getLastMinute();
			const _loc5_ = this.mainManager.layersManager.getFirstDataSource();
			if (!_loc5_)
				return;
			const _loc6_ = _loc5_.getEndOfDayDataUnitFor(_loc4_);
			const _loc7_ = _loc6_.relativeMinutes;
			const _loc8_ = this.getCountForDays(_loc5_, param1, _loc7_);
			Const.MIN_DISPLAY_DAYS = param1;
			if (_loc8_ > _loc4_ - _loc3_)
				this.animateTo(_loc7_, _loc8_);
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
			const _loc2_ = this.displayManager.layersManager.getFirstDataSource();
			if (!_loc2_ || _loc2_.isEmpty())
			{
				this.pollingTimer.stop();
				return;
			}
			const _loc3_ = _loc2_.data.marketCloseMinute - _loc2_.data.marketOpenMinute;
			const _loc4_ = this.getNewMarketState(this.isMarketOpen, this.stateRemainingMinutes, _loc3_);
			this.isMarketOpen = _loc4_.isMarketOpen;
			this.stateRemainingMinutes = _loc4_.stateRemainingMinutes;
			if (_loc2_.data.hasPointsInIntervalArray(Const.INTRADAY_INTERVAL) && this.shouldRequestRegularMarketData(this.isMarketOpen, this.stateRemainingMinutes, this.delayedMinutes, _loc3_))
			{
				const _loc5_ = EventFactory.getEvent(Const.GET_RT_DATA, _loc2_.quoteName, ChartEventTypes.POLLING);
				this.mainManager.dataManager.eventHandler(_loc5_);
			}
			if (com.google.finance.MainManager.paramsObj.hasExtendedHours === "true" && _loc2_.afterHoursData.hasPointsInIntervalArray(Const.INTRADAY_INTERVAL) && this.shouldRequestAfterHoursData(this.isMarketOpen, this.stateRemainingMinutes, this.delayedMinutes, _loc3_))
			{
				const _loc6_ = EventFactory.getEvent(Const.GET_RT_AH_DATA, _loc2_.quoteName, ChartEventTypes.POLLING);
				this.mainManager.dataManager.eventHandler(_loc6_);
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
				const _loc4_ = this.displayManager.layersManager.getFirstDataSource();
				if (_loc4_ && _loc3_.getFirstMinute() < _loc4_.firstOpenRelativeMinutes)
				{
					this.applyLastOrDefaultInterval(_loc4_, _loc3_);
					return;
				}
				if (this.displayManager.getDetailLevel() < Const.DAILY && com.google.finance.MainManager.paramsObj.displayExtendedHours === "true")
				{
					this.applyLastOrDefaultInterval(_loc4_, _loc3_);
					return;
				}
				const _loc5_ = this.findBestFitDetailLevel(_loc3_, _loc4_);
				if (_loc5_ === -1)
				{
					this.applyLastOrDefaultInterval(_loc4_, _loc3_);
				}
				else
				{
					this.enableIntervalButtons(_loc5_);
					this.currentIntervalLevel = _loc5_;
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
			const _loc2_ = this.getZoomLevelFinalState(param1);
			if (_loc2_)
			{
				this.currentZoomLevel = param1;
				this.animateTo(_loc2_.lastMinute, _loc2_.count);
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
				this.zoomStuff(Const.FORWARD, 0, 1);
			else if (param1.keyCode === 40)
				this.zoomStuff(Const.BACKWARD, 0, 1);
		}

		isFitDetailLevel(param1: number, param2: DataSource, param3: number, param4: number): boolean
		{
			if (!(param1 >= Const.INTRADAY && param1 <= Const.WEEKLY))
				return false;

			const _loc5_ = Const.getDetailLevelInterval(param1);
			const _loc6_ = param2.data.getPointsInIntervalArray(_loc5_);
			const _loc7_ = param2.data.marketDayLength + 1;
			return _loc6_ && _loc6_.length > 0 && _loc6_[0].relativeMinutes <= param3 && param4 <= Const.INTERVAL_PERIODS[param1].maxdays * _loc7_ && param4 >= Const.INTERVAL_PERIODS[param1].mindays * _loc7_;
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

		animateToCustomLevel(param1: Date, param2: Date) 
		{
			this.customZoomStartDate = param1;
			this.customZoomEndDate = param2;
			this.animateToLevel(Const.SCALE_CUSTOM);
		}

		intervalButtonClicked(param1: string) 
		{
			const _loc2_ = this.displayManager.layersManager.getFirstDataSource();
			if (!_loc2_ || _loc2_.isEmpty())
				return;

			const _loc3_ = Const.INTERVAL_PERIODS;
			let _loc4_ = _loc3_.length - 1;
			while (_loc4_ >= 0 && Messages.getMsg(_loc3_[_loc4_].text) !== param1)
			{
				_loc4_--;
			}
			if (_loc4_ === -1)
				return;

			com.google.finance.MainManager.jsProxy.logIntervalButtonClick(_loc3_[_loc4_].logtext);
			this.currentIntervalLevel = _loc4_;
			if (com.google.finance.MainManager.paramsObj.displayExtendedHours === "true")
			{
				if (this.currentIntervalLevel === Const.INTRADAY)
					this.displayManager.toggleAllAfterHoursSessions(true);
				else
					this.displayManager.toggleAllAfterHoursSessions(false);
			}
			this.animateTo(0, _loc3_[_loc4_].days * (_loc2_.data.marketDayLength + 1), 1);
			com.google.finance.MainManager.jsProxy.setJsCurrentViewParam("defaultDisplayInterval", Const.getDetailLevelInterval(_loc4_));
		}

		private highlightPoints() 
		{
			const _loc1_ = {};
			const _loc2_ = this.displayManager.getViewPoints();

			for (let _loc3_ = 0; _loc3_ < _loc2_.length; _loc3_++)
			{
				const _loc4_ = _loc2_[_loc3_];
				_loc4_.highlightPoint(this.mouseX, _loc1_);
			}
			return _loc1_;
		}

		getState(): number
		{
			return this.state;
		}

		private getZoomLevelFinalState(param1: number): ViewPointState | null
		{
			let _loc8_ = NaN;
			const _loc2_ = <SparklineViewPoint><any>this.displayManager.getViewPoint(Const.SPARKLINE_VIEW_POINT_NAME);
			const _loc3_ = <ViewPoint>this.displayManager.getMainViewPoint();
			const _loc4_ = this.mainManager.layersManager;
			const _loc5_ = _loc4_.getFirstDataSource();
			if (!_loc5_)
				return null;

			const _loc6_ = Const.SCALE_INTERVALS;
			let _loc7_ = _loc2_.getLastMinute();
			if (param1 === Const.SCALE_CUSTOM)
			{
				const _loc10_ = this.getCustomScaleZoomLevel(_loc5_, this.customZoomStartDate, this.customZoomEndDate);
				if (!_loc10_)
					return null;

				_loc7_ = _loc10_.lastMinute;
				_loc8_ = _loc10_.count;
			}
			else if (param1 === Const.SCALE_YTD)
			{
				const _loc11_ = _loc5_.data.units.length;
				const _loc12_ = _loc5_.data.units[_loc11_ - 1];
				const _loc13_ = new Date(_loc12_.time);
				_loc13_.setMonth(0);
				_loc13_.setDate(1);
				const _loc14_ = _loc5_.data.units;
				const _loc15_ = DataSource.getTimeIndex(_loc13_.getTime(), _loc14_);
				_loc7_ = 0;
				_loc8_ = _loc7_ - _loc14_[_loc15_].relativeMinutes;
			}
			else if (param1 === Const.SCALE_MAX)
			{
				_loc7_ = _loc3_.getNewestMinute();
				_loc8_ = Math.abs(_loc3_.getOldestBaseMinute());
			}
			else if (param1 >= 0 && param1 <= Const.SCALE_1M)
			{
				const _loc12_ = _loc2_.getLastDataUnit();
				const _loc13_ = new Date(_loc12_.time);
				_loc13_.setMonth(_loc13_.getMonth() - _loc6_[param1].months);
				const _loc14_ = _loc5_.data.units;
				const _loc15_ = DataSource.getTimeIndex(_loc13_.getTime(), _loc14_);
				_loc8_ = _loc2_.getLastMinute() - _loc14_[_loc15_].relativeMinutes;
			}
			else if (param1 >= 0 && param1 < _loc6_.length)
			{
				const _loc16_ = _loc3_.getLastMinute();
				const _loc17_ = _loc5_.getEndOfDayDataUnitFor(_loc16_);
				_loc7_ = _loc17_.relativeMinutes;
				_loc8_ = this.getCountForDays(_loc5_, _loc6_[param1].days, _loc7_);
			}
			else
			{
				return null;
			}
			const _loc9_ = this.displayManager.layersManager.getStyle();
			if (_loc9_ === LayersManager.SINGLE && com.google.finance.MainManager.paramsObj.displayExtendedHours === "true")
			{
				let _loc18_: number;
				let _loc19_: number;

				if (Const.INDICATOR_ENABLED)
				{
					_loc18_ = _loc3_.getDetailLevelForTechnicalStyle();
					_loc19_ = _loc3_.getDetailLevelForTechnicalStyle(_loc8_, _loc7_);
				}
				else
				{
					_loc18_ = _loc3_.getDetailLevel();
					_loc19_ = _loc3_.getDetailLevel(_loc8_, _loc7_);
				}
				_loc8_ = this.adjustCountForAfterHours(_loc8_, _loc5_, _loc18_, _loc19_);
			}
			if (isNaN(_loc8_) || isNaN(_loc7_))
				return null;

			return {
				"lastMinute": _loc7_,
				"count": _loc8_
			};
		}

		zoomStuff(param1: number, param2: number, param3: number = NaN) 
		{
			this.clearCurrentZoom();

			for (let _loc4_ = 0; _loc4_ < this.listeners.length; _loc4_++)
			{
				this.listeners[_loc4_].zoomChart_Handler(param1, param3);
			}
			this.displayManager.topBorderLayer.update();
			this.displayManager.showContextualStaticInfo();
		}

		private getBoundsIndex(param1: com.google.finance.Bounds): number
		{
			for (let _loc2_ = 0; _loc2_ < this.controlledAreaBounds.length; _loc2_++)
			{
				if (param1.equals(this.controlledAreaBounds[_loc2_]))
					return _loc2_;
			}
			return -1;
		}

		private changeListenersOffset(param1: number) 
		{
			for (let _loc2_ = 0; _loc2_ < this.listeners.length; _loc2_++)
			{
				this.listeners[_loc2_].moveChartBy_Handler(param1);
			}
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

		mouseDownAction(param1: number = NaN) 
		{
			const _loc2_ = <SparklineViewPoint>this.displayManager.getViewPoint(Const.SPARKLINE_VIEW_POINT_NAME);
			this.initialXMouse = this.stage.mouseX;
			this.initialYMouse = this.stage.mouseY;
			switch (param1)
			{
				case Const.SCROLL_BAR:
					this.state = Controller.SCROLLING;
					this.cumulativeXOffset = 0;
					this.pagingAmount = 0;
					const _loc3_ = _loc2_.windowLayer.getLeftX();
					const _loc4_ = _loc2_.windowLayer.getRightX();
					this.scrollMouseMinX = _loc2_.minx + this.initialXMouse - _loc3_;
					this.scrollMouseMaxX = _loc2_.maxx - (_loc4_ - this.initialXMouse);
					break;
				case Const.SCROLL_BG:
					const _loc5_ = _loc2_.windowLayer.scrollSlider;
					if (this.mouseX < _loc5_.x)
					{
						this.movePage(Const.BACKWARD);
						break;
					}
					if (this.mouseX > _loc5_.x + _loc5_.width)
					{
						this.movePage(Const.FORWARD);
						break;
					}
					break;
				case Const.LEFT_BUTTON:
					this.state = Controller.PRESSING_LEFT;
					clearInterval(this.intId);
					this.intId = setInterval(() => { this.notifyListenersToMove(Const.BACKWARD * this.BUTTON_MOVEBY_AMOUNT); }, 20);
					break;
				case Const.RIGHT_BUTTON:
					this.state = Controller.PRESSING_RIGHT;
					clearInterval(this.intId);
					this.intId = setInterval(() => { this.notifyListenersToMove(Const.FORWARD * this.BUTTON_MOVEBY_AMOUNT); }, 20);
					break;
				case Const.LEFT_HANDLE:
					this.state = Controller.DRAGGING_LEFT_HANDLE;
					this.MOUSE_DOWN = true;
					this.mouseCursor.setCursor(MouseCursor.H_ARROWS);
					return;
				case Const.RIGHT_HANDLE:
					this.state = Controller.DRAGGING_RIGHT_HANDLE;
					this.MOUSE_DOWN = true;
					this.mouseCursor.setCursor(MouseCursor.H_ARROWS);
					return;
			}
			if (!this.hitTestInsideBounds(this.mouseX, this.mouseY))
				return;

			this.MOUSE_DOWN = true;
			this.clearAllHighlights();
			if (this.CTRL_DOWN && this.SHIFT_DOWN)
			{
				this.state = Controller.ZOOMING_OUT;
				clearInterval(this.intId);
				this.intId = setInterval(() => { this.zoomStuff(Const.BACKWARD, this.stage.mouseX); }, 20);
				return;
			}
			if (this.SHIFT_DOWN)
			{
				this.state = Controller.SELECTING;
				this.mouseCursor.setCursor(MouseCursor.CLASSIC);
				return;
			}
			this.mouseCursor.setCursor(MouseCursor.CLOSED_HAND);
			this.state = Controller.DRAGGING;
		}
	}
}
