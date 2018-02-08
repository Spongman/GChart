import { Sprite } from "../../../flash/display/Sprite";
import { IViewPoint, ViewPointState, Context, ViewPoint } from './ViewPoint';
import { TextFormat, TextField, TextFieldAutoSize } from '../../../flash/text/TextField';
import { ToolTipMovie } from './ToolTipMovie';
import { Bounds } from './Bounds';
import { SimpleButton } from '../../../flash/display/SimpleButton';
import { Intervals, ScaleTypes, Const, QuoteTypes, Directions, TickPositions, ChartDetailTypes, ControllerComponents } from './Const';
import { MainManager } from './MainManager';
import { Bitmap } from '../../../flash/display/Bitmap';
import { Message } from './Messages';
import { Messages } from 'Messages';
import { DataSource } from './DataSource';
import { Utils } from './Utils';
import { MouseCursor, MouseCursors } from './MouseCursor';
import { EventFactory } from './EventFactory';
import { ChartEventPriorities } from './ChartEvent';
import { LayersManager } from './LayersManager';
import { DisplayManager } from './DisplayManager';
import { Controller_ExpandIcon } from './Controller_ExpandIcon';
import { AnimationManager } from './AnimationManager';
import { Controller_ShrinkIcon } from './Controller_ShrinkIcon';
import { DateTimeLocale } from '../i18n/locale/DateTimeLocale';
import { Graphics } from '../../../flash/display/Graphics';
import { Stage } from '../../../flash/display/Stage';
import { TextButtonsGroup } from './ui/TextButtonsGroup';
import { Timer, TimerEvent } from '../../../flash/utils/Timer';
import { DisplayObject } from '../../../flash/display/DisplayObject';

	// import flash.display.Sprite;
	// import Bitmap;
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

export enum ControllerStates {
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

export class Controller extends Sprite {
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
		private promotedButtonTextFormat: TextFormat;
		private zoomButtons: TextButtonsGroup;
		private chartTypeButtons: TextButtonsGroup;
		private aniManager = new AnimationManager();
		private scrollMouseMinX: number;
		private listeners: IViewPoint[];
		private separatorTextFormat: TextFormat;
		private pollingTimer: Timer;
		private chartSizeChangeToolTip: ToolTipMovie;
		private buttonTextFormat: TextFormat;
		private intId: number;
		private chartTypeNameMapping: { [key: string]: string };
		private scrollMouseMaxX: number;
		private isMarketOpen: boolean;
		private initialXMouse: number;
		private notifyHtmlIntervalId: number;
		private selectedTextFormat: TextFormat;
		private holderBounds: Bounds = new Bounds(Number.MAX_VALUE, Number.MAX_VALUE, 0, 0);
		private chartTypeText: TextField;
		private state = ControllerStates.NOTHING;
		private intervalText: TextField;
		private chartSizeChangeButton: SimpleButton;
		private customZoomEndDate: Date;
		private zoomText: TextField;
		private customZoomStartDate: Date;
		private cumulativeXOffset: number = 0;
		private stateRemainingMinutes: number;
		private lastIntervalLevel: Intervals;
		private controlledAreaBounds: Bounds[] = [];
		private lastLastMinutes: number;
		private windowTitleTextFormat: TextFormat;
		private intervalButtons: TextButtonsGroup;
		private isZh: boolean;

		currentIntervalLevel: Intervals;
		currentZoomLevel: ScaleTypes;

		constructor(readonly mainManager: MainManager, readonly displayManager: DisplayManager) {
			super();
			this.listeners = [];
			this.isZh = Const.isZhLocale(DateTimeLocale.getLocale());
			this.mouseEnabled = true;
			this.buttonTextFormat = new TextFormat("Verdana", this.isZh ? 10 : 9, 204);
			this.buttonTextFormat.underline = true;
			this.promotedButtonTextFormat = new TextFormat("Verdana", this.isZh ? 10 : 9, 14290192);
			this.promotedButtonTextFormat.underline = true;
			this.selectedTextFormat = new TextFormat("Verdana", this.isZh ? 10 : 9, 0);
			this.selectedTextFormat.underline = false;
			this.windowTitleTextFormat = new TextFormat("Verdana", 10, 0);
			this.windowTitleTextFormat.underline = false;
			this.windowTitleTextFormat.bold = true;
			this.separatorTextFormat = new TextFormat("Verdana", 9, 0);
			if (Const.INDICATOR_ENABLED && Const.CHART_TYPE_BUTTONS_ENABLED && mainManager.getQuoteType() === QuoteTypes.COMPANY) {
				this.createChartTypeButtons();
			}

			this.createZoomButtons();
			this.createIntervalButtons();
			this.enableZoomButtons();
			if (Const.EXPAND_BUTTON_ENABLED) {
				this.createChartSizeChangeButton(true);
			} else if (Const.SHRINK_BUTTON_ENABLED) {
				this.createChartSizeChangeButton(false);
								}

			this.addChild(this.aniManager);
			this.currentZoomLevel = this.getInitialZoomLevel();
		}

		private movePage(direction: Directions) {
			const mainViewPoint = this.displayManager.getMainViewPoint();
			if (mainViewPoint) {
				this.notifyListenersToMove(direction as number * (mainViewPoint.maxx - mainViewPoint.minx));
			}
		}

		private getInitialZoomLevel(): ScaleTypes {
			if (Const.DEFAULT_DISPLAY_MINUTES !== -1) {
				return -1;
			}

			for (let index = 0 as ScaleTypes; index < (Const.SCALE_INTERVALS.length as ScaleTypes); index++) {
				if (Const.SCALE_INTERVALS[index].days === Const.DEFAULT_DISPLAY_DAYS && index >= ScaleTypes.SCALE_5D) {
					return index;
				}
			}
			return ScaleTypes.INVALID;
		}

		createChartSizeChangeButton(showExpand: boolean) {
			if (this.chartSizeChangeToolTip && this.contains(this.chartSizeChangeToolTip)) {
				this.removeChild(this.chartSizeChangeToolTip);
			}

			if (this.chartSizeChangeButton && this.contains(this.chartSizeChangeButton)) {
				this.removeChild(this.chartSizeChangeButton);
			}

			this.chartSizeChangeButton = new SimpleButton("chartSizeChangeButton");
			const buttonBitmap: Bitmap = showExpand ? new Controller_ExpandIcon() : new Controller_ShrinkIcon();

			this.chartSizeChangeButton.overState = buttonBitmap;
			this.chartSizeChangeButton.downState = buttonBitmap;
			this.chartSizeChangeButton.hitTestState = buttonBitmap;
			this.chartSizeChangeButton.upState = buttonBitmap;
			this.chartSizeChangeButton.useHandCursor = true;
			this.chartSizeChangeButton.x = this.mainManager.stage.stageWidth - this.chartSizeChangeButton.width - 5;
			this.chartSizeChangeButton.y = 5;
			this.addChild(this.chartSizeChangeButton);
			this.chartSizeChangeToolTip = new ToolTipMovie();
			this.addChild(this.chartSizeChangeToolTip);
			this.chartSizeChangeButton.addEventListener(MouseEvents.MOUSE_OVER, (event: Event): void => {
				MainManager.mouseCursor.setCursor(MouseCursors.CLASSIC);
				MainManager.mouseCursor.lockOnDisplayObject(this.chartSizeChangeButton);
				this.chartSizeChangeToolTip.renderMovie(this.chartSizeChangeButton.x - 5, this.chartSizeChangeButton.y, showExpand ? Message.getMsg(Messages.LARGE_CHART) : Message.getMsg(Messages.SMALL_CHART));

				Graphics.cleanupPending();
			});
			this.chartSizeChangeButton.addEventListener(MouseEvents.MOUSE_OUT, (event: Event): void => {
				MainManager.mouseCursor.unlock();
				this.chartSizeChangeToolTip.clearMovie();

				Graphics.cleanupPending();
			});
			this.chartSizeChangeButton.addEventListener(MouseEvents.CLICK, (event: Event): void => {
				if (showExpand) {
					MainManager.jsProxy.expandChart();
				} else {
					MainManager.jsProxy.shrinkChart();
				}

				Graphics.cleanupPending();
			});
		}

		private applyLastOrDefaultInterval(dataSource: DataSource | null, viewPoint: ViewPoint) {
			if (this.lastIntervalLevel !== Intervals.INVALID && this.lastIntervalLevel <= Intervals.WEEKLY) {
				this.enableIntervalButtons(this.lastIntervalLevel);
				this.currentIntervalLevel = this.lastIntervalLevel;
				this.animateTo(this.lastLastMinutes, this.lastCount, 1);
			} else {
				this.enableIntervalButtons(Const.DEFAULT_D);
				this.currentIntervalLevel = Const.DEFAULT_D;
				viewPoint.checkEvents();
				if (dataSource) {
					this.animateTo(0, Const.INTERVAL_PERIODS[Const.DEFAULT_D].days * (dataSource.data.marketDayLength + 1), 1);
				}
			}
		}

		onMouseMove(mouseEvent: MouseEvent) {
			this.stage.setMouse(mouseEvent.pageX, mouseEvent.pageY);
			const timer = getTimer();
			if (timer - this.lastMouseMoveTime < 16) {
				return;
			}

			this.lastMouseMoveTime = timer;
			this.mouseMoveAction(mouseEvent);
		}

		removeControlListener(sprites: Sprite) {
			for (let listenerIndex = 0; listenerIndex < this.listeners.length; listenerIndex++) {
				if (this.listeners[listenerIndex] === sprites) {
					this.listeners.splice(listenerIndex, 1);
					return;
				}
			}
		}

		triggerMouseMoveAction() {
			this.mouseMoveAction(new MouseEvent(MouseEvents.MOUSE_MOVE));
		}

		getCountForDays(dataSource: DataSource, param2: number, param3: number): number {
			const units = dataSource.data.units;
			const days = dataSource.data.days;
			const endOfDayDataUnit = dataSource.getEndOfDayDataUnitFor(param3);
			let minuteMetaIndex = DataSource.getMinuteMetaIndex(endOfDayDataUnit.relativeMinutes, days, units);
			minuteMetaIndex = Math.min(minuteMetaIndex, days.length - 1);
			let _loc8_ = 0;
			let _loc9_ = 0;
			const relativeMinutes = units[days[minuteMetaIndex]].relativeMinutes;
			let _loc11_ = dataSource.getEndOfDayDataUnitFor(relativeMinutes);
			if (Utils.compareUtcDates(_loc11_.exchangeDateInUTC, endOfDayDataUnit.exchangeDateInUTC) !== 0) {
				_loc8_ += dataSource.afterHoursData.getSessionLength(Const.PRE_MARKET_NAME) + 1;
			}

			while (minuteMetaIndex >= 0 && _loc9_ < param2) {
				minuteMetaIndex--;
				let unit = units[days[minuteMetaIndex]];
				if (_loc11_.coveredDays > 0) {
					_loc8_ += _loc11_.coveredDays * (dataSource.data.marketDayLength + 1);
					_loc9_ += _loc11_.coveredDays;
				} else if (unit) {
					unit = dataSource.getEndOfDayDataUnitFor(unit.relativeMinutes);
					_loc8_ += _loc11_.relativeMinutes - unit.relativeMinutes;
					_loc9_++;
				} else {
					_loc8_ += dataSource.data.marketDayLength + 1;
					_loc9_++;
				}
				_loc11_ = unit;
			}
			_loc8_ = _loc8_ + (param2 - _loc9_) * (dataSource.data.marketDayLength + 1);
			return _loc8_;
		}

		moveListenersByOffsets() {
			const mainViewPoint = this.displayManager.getMainViewPoint();
			if (!mainViewPoint) {
				return;
			}

			const sparklineViewPoint = this.displayManager.getSparklineViewPoint();
			//const _loc3_ = _loc2_.dataSource;
			const width = sparklineViewPoint.getWidth();
			const _loc5_ = sparklineViewPoint.sparkCount * (mainViewPoint.maxx - mainViewPoint.minx) / mainViewPoint.count;
			const _loc6_ = sparklineViewPoint.moveSparklineBy_Handler(this.cumulativeXOffset);
			const _loc7_ = (this.baseXOffset - _loc6_) * _loc5_ / width;
			this.changeListenersOffset(_loc7_);
		}

		handleMouseWheel(delta: number) {
			if (delta !== 0) {
				const distance = Math.abs(delta);
				if (delta > 0) {
					this.zoomStuff(Directions.FORWARD, this.mouseX, distance);
				} else if (delta < 0) {
					this.zoomStuff(Directions.BACKWARD, this.mouseY, distance);
									}

				clearInterval(this.notifyHtmlIntervalId);
				this.notifyHtmlIntervalId = setInterval(this.listenersNotifyHtml.bind(this), Controller.NOTIFY_TIMEOUT);
			}
		}

		private hitTestInsideBounds(x: number, y: number): boolean {
			for (const bounds of this.controlledAreaBounds) {
				if (bounds.containsPoint(x, y)) {
					return true;
				}
			}
			return false;
		}

		checkSparklinePositioning() {
			const sparklineViewPoint = this.displayManager.getSparklineViewPoint();
			const mainViewPoint = this.displayManager.getMainViewPoint();
			if (!sparklineViewPoint || !mainViewPoint) {
				return;
			}

			//const _loc3_ = _loc2_.minutesOffset;
			if (!sparklineViewPoint.windowLayer) {
				return;
			}

			const leftX = sparklineViewPoint.windowLayer.getLeftX();
			const rightX = sparklineViewPoint.windowLayer.getRightX();
			const firstDataSource = this.displayManager.layersManager.getFirstDataSource();
			const sparkLastMinute = sparklineViewPoint.getSparkLastMinute() < 0;
			let sparkFirstMinute = sparklineViewPoint.getSparkFirstMinute() > sparklineViewPoint.getOldestMinute();
			if (this.currentIntervalLevel !== Intervals.INVALID && firstDataSource) {
				const tFirstRelativeMinute = firstDataSource.getFirstRelativeMinute(this.currentIntervalLevel);
				sparkFirstMinute = sparklineViewPoint.getSparkFirstMinute() > tFirstRelativeMinute;
			}
			if (sparkFirstMinute && leftX < sparklineViewPoint.minx + this.PAGING_AREA_WIDTH) {
				sparklineViewPoint.moveSparklineBy_Handler(leftX - (sparklineViewPoint.minx + this.PAGING_AREA_WIDTH));
				sparklineViewPoint.commitSparklineOffset_Handler();
			} else if (sparkLastMinute && rightX > sparklineViewPoint.maxx - this.PAGING_AREA_WIDTH) {
				sparklineViewPoint.moveSparklineBy_Handler(rightX - (sparklineViewPoint.maxx - this.PAGING_AREA_WIDTH));
				sparklineViewPoint.commitSparklineOffset_Handler();
			}
		}

		setNewFinalState(viewPointState: ViewPointState, param2: boolean = false) {
			if (viewPointState.lastMinute === undefined || viewPointState.count === undefined) {
				return;
			}

			if (this.aniManager.isAnimating()) {
				for (const listener of this.listeners) {
					listener.newFinalAnimationState(viewPointState);
				}
			} else {
				this.jumpTo(viewPointState.lastMinute, viewPointState.count, param2);
			}
		}

		animateTo(lastMinute: number, count: number, param3: number = NaN, param4 = false) {
			const _loc5_: Array<(displayObjects: DisplayObject, param2: number, param3: boolean) => void> = [];
			const _loc6_: DisplayObject[] = [];
			const context = new Context();
			context.lastMinute = lastMinute;
			context.count = count;
			for (let listenerIndex = 0; listenerIndex < this.listeners.length; listenerIndex++) {
				this.listeners[listenerIndex].zoomingAnimation_init(context);
				const listener = this.listeners[listenerIndex];
				_loc5_[listenerIndex] = listener.zoomingAnimation_ticker.bind(listener);
				_loc6_[listenerIndex] = listener;
			}
			const topBorderLayer = this.displayManager.topBorderLayer;
			_loc5_[this.listeners.length] = topBorderLayer.update.bind(topBorderLayer);
			_loc6_[this.listeners.length] = topBorderLayer;
			this.aniManager.animate(_loc5_, _loc6_, param3, param4);
		}

		chartTypeButtonClicked(param1: string) {
			MainManager.jsProxy.setJsChartType(this.chartTypeNameMapping[param1]);
		}

		onMouseUp(event: Event) {
			this.mouseUpAction();
		}

		syncZoomLevel(param1?: boolean) {
			if (this.state === ControllerStates.SCROLLING) {
				return;
			}

			if (this.displayManager.isDifferentMarketSessionComparison()) {
				return;
			}

			const zoomLevelFinalState = this.getZoomLevelFinalState(this.currentZoomLevel);
			if (zoomLevelFinalState) {
				this.setNewFinalState(zoomLevelFinalState, param1);
			}
		}

		private createChartTypeButtons() {
			this.chartTypeText = new TextField();
			this.chartTypeText.x = 5;
			this.chartTypeText.y = 5;
			this.chartTypeText.autoSize = TextFieldAutoSize.LEFT;
			this.chartTypeText.defaultTextFormat = this.windowTitleTextFormat;
			this.chartTypeText.text = Message.getMsg(Messages.TYPE) + ":";
			this.chartTypeText.selectable = false;
			this.chartTypeButtons = new TextButtonsGroup();
			this.chartTypeButtons.setSpacing("", this.isZh ? 1 : 3);
			this.chartTypeButtons.setTextFormats(this.buttonTextFormat, this.selectedTextFormat, this.separatorTextFormat);
			this.chartTypeButtons.x = this.chartTypeText.x + this.chartTypeText.width + this.chartTypeButtons.spacing;
			this.chartTypeButtons.y = this.chartTypeText.y;
			this.chartTypeButtons.addButton(Message.getMsg(Messages.LINE));
			this.chartTypeButtons.addButton(Message.getMsg(Messages.CANDLESTICK), this.promotedButtonTextFormat);
			this.chartTypeNameMapping = {};
			this.chartTypeNameMapping[Message.getMsg(Messages.LINE)] = "IntervalBasedLine";
			this.chartTypeNameMapping[Message.getMsg(Messages.CANDLESTICK)] = "CandleStick";
			this.chartTypeButtons.selectButtonByIndex(Const.CHART_STYLE_NAMES.indexOf(Const.DEFAULT_CHART_STYLE_NAME));
			this.chartTypeButtons.addListener(this.chartTypeButtonClicked, this);
			this.addChild(this.chartTypeText);
			this.addChild(this.chartTypeButtons);
		}

		mouseMoveAction(mouseEvent: MouseEvent) {
			let _loc10_ = false;
			let _loc11_ = false;
			const mainViewPoint = this.displayManager.getMainViewPoint();
			const sparklineViewPoint = this.displayManager.getSparklineViewPoint();
			//const _loc4_ = this.displayManager.getViewPoint("BottomViewPoint");
			//const _loc5_ = this.mainManager.layersManager;
			switch (this.state) {
				case ControllerStates.SELECTING:
					this.drawSquare(this.initialXMouse, this.initialYMouse, this.mouseX, this.mouseY);
					break;
				case ControllerStates.DRAGGING:
					this.displayManager.showContextualStaticInfo();
					this.changeListenersOffset(this.mouseX - this.initialXMouse);
					this.checkSparklinePositioning();
					break;
				case ControllerStates.NOTHING:
					if (this.hitTestInsideBounds(this.mouseX, this.mouseY) && !mainViewPoint.isAnimating()) {
						this.displayManager.spaceText.setPointInfo(this.highlightPoints());
						MainManager.mouseCursor.setCursor(MouseCursors.OPENED_HAND);
						break;
					}
					if (sparklineViewPoint.windowLayer && mouseEvent.target !== sparklineViewPoint.windowLayer.leftHandle.button.element && mouseEvent.target !== sparklineViewPoint.windowLayer.rightHandle.button.element) {
						MainManager.mouseCursor.setCursor(MouseCursors.CLASSIC);
					}

					this.clearAllHighlights();
					this.displayManager.showContextualStaticInfo();
					if (sparklineViewPoint.bg.hitTestPoint(this.mouseX, this.mouseY, false)) {
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
					if (this.currentIntervalLevel !== Intervals.INVALID && _loc9_) {
						const firstRelativeMinute = _loc9_.getFirstRelativeMinute(this.currentIntervalLevel);
						_loc11_ = sparklineViewPoint.getSparkFirstMinute() > firstRelativeMinute;
					}
					if (mouseX < this.scrollMouseMinX + this.PAGING_AREA_WIDTH && _loc11_) {
						this.pagingAmount = mouseX - (this.scrollMouseMinX + this.PAGING_AREA_WIDTH);
						this.addXOffset(this, this.pagingAmount);
						clearInterval(this.intId);
						this.intId = setInterval(() => { this.addXOffset(this, this.pagingAmount); }, 20);
						break;
					}
					if (mouseX >= this.scrollMouseMaxX - this.PAGING_AREA_WIDTH && _loc10_) {
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
			if (this.displayManager.topBorderLayer) {
				this.displayManager.topBorderLayer.update();
			}
		}

		addControlListener(viewPoint: IViewPoint, tickPosition: TickPositions = NaN as TickPositions) {
			if (tickPosition === TickPositions.BOTTOM) {
				this.listeners.push(viewPoint);
			} else {
				this.listeners.splice(0, 0, viewPoint);
			}
		}

		getButtonsWidth(): number {
			if (!this.zoomButtons || !this.intervalButtons) {
				return 0;
			}

			return Math.max(this.zoomButtons.x + this.zoomButtons.width, this.intervalButtons.x + this.intervalButtons.width);
		}

		listenersNotifyHtml() {
			for (const listener of this.listeners) {
				listener.HTMLnotify();
			}

			clearInterval(this.notifyHtmlIntervalId);
		}

		shouldRequestAfterHoursData(param1: boolean, param2: number, param3: number, param4: number): boolean {
			if (!param1) {
				return true;
			}

			if (param2 <= Const.REALTIME_CHART_POLLING_MARGIN || param2 >= param4 - param3 - Const.REALTIME_CHART_POLLING_MARGIN) {
				return true;
			}

			return false;
		}

		get mouseCursor(): MouseCursor {
			return MainManager.mouseCursor;
		}

		private createIntervalButtons() {
			this.intervalText = new TextField();
			this.intervalText.x = !this.chartTypeButtons ? 5 : this.chartTypeButtons.x + this.chartTypeButtons.width + 5;
			this.intervalText.y = 5;
			this.intervalText.autoSize = TextFieldAutoSize.LEFT;
			this.intervalText.defaultTextFormat = this.windowTitleTextFormat;
			this.intervalText.text = Message.getMsg(Messages.INTERVAL) + ":";
			this.intervalText.selectable = false;
			this.intervalButtons = new TextButtonsGroup();
			this.intervalButtons.setSpacing("", this.isZh ? 1 : 3);
			this.intervalButtons.setTextFormats(this.buttonTextFormat, this.selectedTextFormat, this.separatorTextFormat);
			this.intervalButtons.x = this.intervalText.x + this.intervalText.width + this.intervalButtons.spacing;
			this.intervalButtons.y = this.intervalText.y;
			const intervalPeriods = Const.INTERVAL_PERIODS;
			for (const intervalPeriod of intervalPeriods) {
				if (intervalPeriod.days >= Const.MIN_DISPLAY_DAYS) {
					this.intervalButtons.addButton(Message.getMsg(intervalPeriod.text));
				}
			}
			this.intervalButtons.addListener(this.intervalButtonClicked, this);
		}

		jumpTo(lastMinute: number, count: number, param3: boolean = false) {
			let context = new Context();
			context.lastMinute = lastMinute;
			context.count = count;
			for (const listener of this.listeners) {
				context = listener.getNewContext(lastMinute, count);
				listener.zoomInMinutes_Handler(context, param3);
			}
		}

		private adjustCountForAfterHours(param1: number, dataSource: DataSource, startInterval: Intervals, endInterval: Intervals): number {
			if (startInterval === Intervals.INTRADAY && endInterval > Intervals.INTRADAY) {
				for (let intervalIndex = 0; intervalIndex < dataSource.visibleExtendedHours.length(); intervalIndex++) {
					const interval = dataSource.visibleExtendedHours.getIntervalAt(intervalIndex);
					const startUnit = dataSource.afterHoursData.units[interval.start];
					const endUnit = dataSource.afterHoursData.units[interval.end];
					param1 -= endUnit.dayMinute - startUnit.dayMinute;
				}
			} else if (startInterval > Intervals.INTRADAY && endInterval === Intervals.INTRADAY) {
				for (let intervalIndex = 0; intervalIndex < dataSource.hiddenExtendedHours.length(); intervalIndex++) {
					const interval = dataSource.hiddenExtendedHours.getIntervalAt(intervalIndex);
					const startUnit = dataSource.afterHoursData.units[interval.start];
					const endUnit = dataSource.afterHoursData.units[interval.end];
					param1 += endUnit.dayMinute - startUnit.dayMinute;
				}
			}
			return param1;
		}

		resetZoomButtons(param1: number) {
			if (!this.zoomButtons) {
				return;
			}

			this.zoomButtons.clearSelection();
			this.zoomButtons.resetButtonsGroup();
			const scaleIntervals = Const.SCALE_INTERVALS;
			for (let index = scaleIntervals.length - 1; index >= 0; index--) {
				if (scaleIntervals[index].days >= param1) {
					if (scaleIntervals[index].text !== Const.NO_BUTTON_TEXT) {
						this.zoomButtons.addButton(Message.getMsg(scaleIntervals[index].text));
					}
				}
			}
			this.zoomButtons.addListener(this.zoomButtonClicked, this);
		}

		private computeHolderBounds() {
			this.holderBounds = new Bounds(Number.MAX_VALUE, Number.MAX_VALUE, 0, 0);
			for (const bounds of this.controlledAreaBounds) {
				this.holderBounds.append(bounds);
			}
		}

		clearCurrentInterval() {
			this.currentIntervalLevel = Intervals.INVALID;
			this.intervalButtons.clearSelection();
		}

		clearCurrentZoom() {
			this.currentZoomLevel = ScaleTypes.INVALID;
			this.zoomButtons.clearSelection();
		}

		private initPollingTimer() {
			if (Const.INDICATOR_ENABLED && Const.REALTIME_CHART_ENABLED && this.mainManager.quote.indexOf("INDEXDJX") === -1) {
				this.isMarketOpen = Number(MainManager.paramsObj.isMarketOpenState) === 1;
				this.stateRemainingMinutes = MainManager.paramsObj.stateRemainingMinutes >= 0 ? MainManager.paramsObj.stateRemainingMinutes : Number.MAX_VALUE;
				this.delayedMinutes = MainManager.paramsObj.delayedMinutes >= 0 ? MainManager.paramsObj.delayedMinutes : 0;
				this.pollingTimer = new Timer(Const.REALTIME_CHART_POLLING_INTERVAL);
				this.pollingTimer.addEventListener(TimerEvents.TIMER, Stage.bind(this.pollingTimerHandler, this));
				this.pollingTimer.start();
			}
		}

		onMouseLeave(event: Event) {
			MainManager.jsProxy.setChartFocus(false);
			MainManager.mouseCursor.setCursor(MouseCursors.CLASSIC);
			this.clearAllHighlights();
			this.displayManager.showContextualStaticInfo();
		}

		mouseUpAction() {
			//const _loc1_ = this.displayManager.getMainViewPoint();
			const sparklineViewPoint = this.displayManager.getSparklineViewPoint();
			switch (this.state) {
				case ControllerStates.SELECTING:
					const _loc5_ = Math.min(this.initialXMouse, this.mouseX);
					const _loc6_ = Math.max(this.initialXMouse, this.mouseX);
					for (const listener of this.listeners) {
						listener.zoomIn_Handler(_loc5_, _loc6_);
					}

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
					if (Math.abs(this.initialXMouse - this.mouseX) >= this.MIN_PIXELS) {
						for (const listener of this.listeners) {
							listener.HTMLnotify();
						}
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
			for (const viewPoint of viewPoints) {
				if (viewPoint.bg.hitTestPoint(this.mouseX, this.mouseY, false) && !viewPoint.isAnimating()) {
					MainManager.mouseCursor.setCursor(MouseCursor.DRAGGABLE_CURSOR);
				}
			}
			this.displayManager.topBorderLayer.update();
			this.state = ControllerStates.NOTHING;
			this.MOUSE_DOWN = false;
		}

		private clearAllHighlights() {
			const viewPoints = this.displayManager.getViewPoints();
			for (const viewPoint of viewPoints) {
				viewPoint.clearPointInformation();
			}
		}

		moveSparkline(param1: number) {
			const sparklineViewPoint = this.displayManager.getSparklineViewPoint();
			sparklineViewPoint.moveSparklineBy_Handler(param1 * 10);
			sparklineViewPoint.commitSparklineOffset_Handler();
			this.displayManager.topBorderLayer.update();
		}

		zoomButtonClicked(param1: string) {
			const firstDataSource = this.displayManager.layersManager.getFirstDataSource();
			if (!firstDataSource || firstDataSource.isEmpty()) {
				return;
			}

			const scaleIntervals = Const.SCALE_INTERVALS;
			let index = scaleIntervals.length - 1;
			while (index >= 0 && Message.getMsg(scaleIntervals[index].text) !== param1) {
				index--;
			}

			if (index === -1) {
				return;
			}

			MainManager.jsProxy.logZoomButtonClick(scaleIntervals[index].logtext);
			this.animateToLevel(index as ScaleTypes);
		}

		private addXOffset(controller: Controller, param2: number) {
			const sparklineViewPoint = notnull(controller.displayManager.getSparklineViewPoint());
			if (sparklineViewPoint.sparklinePagingPossible(param2)) {
				controller.cumulativeXOffset += param2;
				controller.moveListenersByOffsets();
			} else {
				controller.stopContinuousPaging();
			}
		}

		findBestFitDetailLevel(viewPoint: ViewPoint, dataSource: DataSource | null): Intervals {
			if (!viewPoint || !dataSource) {
				return Intervals.INVALID;
			}

			const firstMinute = viewPoint.getFirstMinute();
			const count = viewPoint.count;
			if (this.isFitDetailLevel(this.lastIntervalLevel, dataSource, firstMinute, count)) {
				return this.lastIntervalLevel;
			}

			for (let intervalIndex = Intervals.INTRADAY; intervalIndex <= Intervals.WEEKLY; intervalIndex++) {
				if (this.isFitDetailLevel(intervalIndex, dataSource, firstMinute, count)) {
					return intervalIndex;
				}
			}
			return Intervals.INVALID;
		}

		private drawSquare(x: number, param2: number, right: number, param4: number) {
			const gr = this.graphics;
			gr.clear();
			gr.beginFill(Const.SELECTING_FILL_COLOR, 0.4);
			gr.lineStyle(0, Const.SELECTING_LINE_COLOR, 1);
			gr.drawRect(
				x, this.holderBounds.miny,
				right - x, this.holderBounds.maxy - this.holderBounds.miny);
			/*
			gr.moveTo(param1, this.holderBounds.miny);
			gr.lineTo(param1, this.holderBounds.maxy);
			gr.lineTo(param3, this.holderBounds.maxy);
			gr.lineTo(param3, this.holderBounds.miny);
			*/
			gr.endFill();
		}

		replaceBounds(remove: Bounds, add: Bounds) {
			const boundsIndex = this.getBoundsIndex(remove);
			if (boundsIndex !== -1) {
				this.controlledAreaBounds.splice(boundsIndex, 1);
			}

			this.controlledAreaBounds.push(add);
			this.computeHolderBounds();
		}

		private commitListenersOffset() {
			for (const listener of this.listeners) {
				listener.commitOffset_Handler();
			}
		}

		getCustomScaleZoomLevel(dataSource: DataSource, startDate: Date, endDate: Date) {
			if (!startDate || !endDate || startDate >= endDate) {
				return null;
			}

			const units = dataSource.data.units;
			const firstTimeIndex = DataSource.getTimeIndex(startDate.getTime(), units);
			const lastTimeIndex = DataSource.getTimeIndex(endDate.getTime(), units);
			const lastRelativeMinute = units[lastTimeIndex].relativeMinutes;
			const firstRelativeMinute = units[firstTimeIndex].relativeMinutes;
			return {
				lastMinute: lastRelativeMinute,
				count: lastRelativeMinute - firstRelativeMinute,
			};
		}

		setMinDisplayDays(minDisplayDays: number) {
			const mainViewPoint = this.displayManager.getMainViewPoint();
			if (!mainViewPoint) {
				return;
			}
			const firstMinute = mainViewPoint.getFirstMinute();
			const lastMinute = mainViewPoint.getLastMinute();
			const firstDataSource = this.mainManager.layersManager.getFirstDataSource();
			if (!firstDataSource) {
				return;
			}
			const endOfDayDataUnit = firstDataSource.getEndOfDayDataUnitFor(lastMinute);
			const endOfDayMinute = endOfDayDataUnit.relativeMinutes;
			const countForDays = this.getCountForDays(firstDataSource, minDisplayDays, endOfDayMinute);
			Const.MIN_DISPLAY_DAYS = minDisplayDays;
			if (countForDays > lastMinute - firstMinute) {
				this.animateTo(endOfDayMinute, countForDays);
			}
		}

		private notifyListenersToMove(param1: number) {
			this.changeListenersOffset(param1);
			this.checkSparklinePositioning();
			this.commitListenersOffset();
			this.displayManager.showContextualStaticInfo();
			this.displayManager.topBorderLayer.update();
			clearInterval(this.notifyHtmlIntervalId);
			this.notifyHtmlIntervalId = setInterval(Stage.bind(this.listenersNotifyHtml, this), Controller.NOTIFY_TIMEOUT);
		}

		private stopContinuousPaging() {
			clearInterval(this.intId);
			this.pagingAmount = 0;
		}

		private enableZoomButtons() {
			if (this.contains(this.zoomButtons)) {
				return;
			}

			this.addChild(this.zoomText);
			this.addChild(this.zoomButtons);
			if (this.contains(this.intervalButtons)) {
				this.removeChild(this.intervalButtons);
				this.removeChild(this.intervalText);
			}
			this.clearCurrentInterval();
		}

		private pollingTimerHandler(timerEvent: TimerEvent) {
			const firstDataSource = this.displayManager.layersManager.getFirstDataSource();
			if (!firstDataSource || firstDataSource.isEmpty()) {
				this.pollingTimer.stop();
				return;
			}
			const minutes = firstDataSource.data.marketCloseMinute - firstDataSource.data.marketOpenMinute;
			const newMarketState = this.getNewMarketState(this.isMarketOpen, this.stateRemainingMinutes, minutes);
			this.isMarketOpen = newMarketState.isMarketOpen;
			this.stateRemainingMinutes = newMarketState.stateRemainingMinutes;
			if (firstDataSource.data.hasPointsInIntervalArray(Const.INTRADAY_INTERVAL) && this.shouldRequestRegularMarketData(this.isMarketOpen, this.stateRemainingMinutes, this.delayedMinutes, minutes)) {
				const event = EventFactory.getEvent(ChartDetailTypes.GET_RT_DATA, firstDataSource.quoteName, ChartEventPriorities.POLLING);
				this.mainManager.dataManager.eventHandler(event);
			}
			if (Boolean(MainManager.paramsObj.hasExtendedHours) && firstDataSource.afterHoursData.hasPointsInIntervalArray(Const.INTRADAY_INTERVAL) && this.shouldRequestAfterHoursData(this.isMarketOpen, this.stateRemainingMinutes, this.delayedMinutes, minutes)) {
				const event = EventFactory.getEvent(ChartDetailTypes.GET_RT_AH_DATA, firstDataSource.quoteName, ChartEventPriorities.POLLING);
				this.mainManager.dataManager.eventHandler(event);
			}
		}

		updateChartSizeChangeButtonPosition() {
			if (this.chartSizeChangeButton) {
				this.chartSizeChangeButton.x = this.mainManager.stage.stageWidth - this.chartSizeChangeButton.width - 5;
			}
		}

		toggleZoomIntervalButtons(param1: string, param2: string) {
			if (param1 === param2) {
				return;
			}

			if (this.chartTypeButtons) {
				this.chartTypeButtons.selectButtonByIndex(Const.CHART_STYLE_NAMES.indexOf(param2));
			}

			const mainViewPoint = this.displayManager.getMainViewPoint();
			if (param1 === Const.LINE_CHART) {
				const firstDataSource = this.displayManager.layersManager.getFirstDataSource();
				if (firstDataSource && mainViewPoint.getFirstMinute() < firstDataSource.firstOpenRelativeMinutes) {
					this.applyLastOrDefaultInterval(firstDataSource, mainViewPoint);
					return;
				}
				if (this.displayManager.getDetailLevel() < Intervals.DAILY && Boolean(MainManager.paramsObj.displayExtendedHours)) {
					this.applyLastOrDefaultInterval(firstDataSource, mainViewPoint);
					return;
				}
				const dBestFitDetailLevel = this.findBestFitDetailLevel(mainViewPoint, firstDataSource);
				if (dBestFitDetailLevel === Intervals.INVALID) {
					this.applyLastOrDefaultInterval(firstDataSource, mainViewPoint);
				} else {
					this.enableIntervalButtons(dBestFitDetailLevel);
					this.currentIntervalLevel = dBestFitDetailLevel;
					mainViewPoint.checkEvents();
				}
			} else if (param2 === Const.LINE_CHART) {
				this.lastIntervalLevel = this.currentIntervalLevel;
				this.lastCount = mainViewPoint.count;
				this.lastLastMinutes = mainViewPoint.lastMinute;
				this.enableZoomButtons();
			}
		}

		addBounds(bounds: Bounds) {
			this.controlledAreaBounds.push(bounds);
			this.holderBounds.append(bounds);
		}

		animateToLevel(currentZoomLevel: ScaleTypes) {
			const zoomLevelFinalState = this.getZoomLevelFinalState(currentZoomLevel);
			if (zoomLevelFinalState) {
				this.currentZoomLevel = currentZoomLevel;
				this.animateTo(zoomLevelFinalState.lastMinute, zoomLevelFinalState.count);
			}
		}

		private createZoomButtons() {
			this.zoomText = new TextField();
			this.zoomText.x = !this.chartTypeButtons ? 5 : this.chartTypeButtons.x + this.chartTypeButtons.width + 5;
			this.zoomText.y = 5;
			this.zoomText.autoSize = TextFieldAutoSize.LEFT;
			this.zoomText.defaultTextFormat = this.windowTitleTextFormat;
			this.zoomText.text = Message.getMsg(Messages.ZOOM) + ":";
			this.zoomText.selectable = false;
			this.zoomButtons = new TextButtonsGroup();
			this.zoomButtons.setSpacing("", this.isZh ? 1 : 3);
			this.zoomButtons.setTextFormats(this.buttonTextFormat, this.selectedTextFormat, this.separatorTextFormat);
			this.zoomButtons.x = this.zoomText.x + this.zoomText.width + this.zoomButtons.spacing;
			this.zoomButtons.y = this.zoomText.y;
			this.resetZoomButtons(Const.MIN_DISPLAY_DAYS);
		}

		private onKeyDown(keyboardEvent: KeyboardEvent) {
			this.CTRL_DOWN = keyboardEvent.ctrlKey;
			this.SHIFT_DOWN = keyboardEvent.shiftKey;
			if (keyboardEvent.charCode === "vVeElLcC".charCodeAt(0)) {
				MainManager.jsProxy.setParameter("displayVolume", "false");
			} else if (keyboardEvent.charCode === "vVeElLcC".charCodeAt(1)) {
				MainManager.jsProxy.setParameter("displayVolume", "true");
								} else if (keyboardEvent.charCode === "vVeElLcC".charCodeAt(2)) {
				MainManager.jsProxy.setParameter("displayExtendedHours", "true");
								} else if (keyboardEvent.charCode === "vVeElLcC".charCodeAt(3)) {
				MainManager.jsProxy.setParameter("displayExtendedHours", "false");
								} else if (keyboardEvent.charCode === "vVeElLcC".charCodeAt(4)) {
				MainManager.jsProxy.setParameter("verticalScaling", "Logarithmic");
								} else if (keyboardEvent.charCode === "vVeElLcC".charCodeAt(5)) {
				MainManager.jsProxy.setParameter("verticalScaling", "Linear");
								} else if (keyboardEvent.keyCode === 38) {
				this.zoomStuff(Directions.FORWARD, 0, 1);
								} else if (keyboardEvent.keyCode === 40) {
				this.zoomStuff(Directions.BACKWARD, 0, 1);
								}
		}

		isFitDetailLevel(detailLevel: Intervals, dataSource: DataSource, param3: number, param4: number): boolean {
			if (!(detailLevel >= Intervals.INTRADAY && detailLevel <= Intervals.WEEKLY)) {
				return false;
			}

			const interval = Const.getDetailLevelInterval(detailLevel);
			const points = dataSource.data.getPointsInIntervalArray(interval);
			const _loc7_ = dataSource.data.marketDayLength + 1;
			return points && points.length > 0 && points[0].relativeMinutes <= param3 && param4 <= Const.INTERVAL_PERIODS[detailLevel].maxdays * _loc7_ && param4 >= Const.INTERVAL_PERIODS[detailLevel].mindays * _loc7_;
		}

		onMouseDown(mouseEvent: MouseEvent) {
			MainManager.jsProxy.setChartFocus(true);
			this.SHIFT_DOWN = mouseEvent.shiftKey;
			this.CTRL_DOWN = mouseEvent.ctrlKey;
			if (!this.displayManager.spaceText.isDateFieldClicked(mouseEvent)) {
				this.displayManager.spaceText.resetInfoText();
			}

			this.mouseDownAction();
		}

		private onKeyUp(keyboardEvent: KeyboardEvent) {
			this.CTRL_DOWN = keyboardEvent.ctrlKey;
			this.SHIFT_DOWN = keyboardEvent.shiftKey;
			clearInterval(this.intId);
		}

		removeAllBounds() {
			this.controlledAreaBounds.splice(0);
			this.computeHolderBounds();
		}

		shouldRequestRegularMarketData(param1: boolean, param2: number, param3: number, param4: number): boolean {
			if (param1) {
				return true;
			}

			if (param2 <= Const.REALTIME_CHART_POLLING_MARGIN || param2 >= Const.MIN_PER_DAY - param4 - param3 - Const.REALTIME_CHART_POLLING_MARGIN) {
				return true;
			}

			return false;
		}

		animateToCustomLevel(startDate: Date, endDate: Date) {
			this.customZoomStartDate = startDate;
			this.customZoomEndDate = endDate;
			this.animateToLevel(ScaleTypes.SCALE_CUSTOM);
		}

		intervalButtonClicked(param1: string) {
			const firstDataSource = this.displayManager.layersManager.getFirstDataSource();
			if (!firstDataSource || firstDataSource.isEmpty()) {
				return;
			}

			const intervalPeriods = Const.INTERVAL_PERIODS;
			let intervalIndex = (intervalPeriods.length - 1) as Intervals;
			while (intervalIndex !== Intervals.INVALID && Message.getMsg(intervalPeriods[intervalIndex].text) !== param1) {
				intervalIndex--;
			}

			if (intervalIndex === Intervals.INVALID) {
				return;
			}

			MainManager.jsProxy.logIntervalButtonClick(intervalPeriods[intervalIndex].logtext);
			this.currentIntervalLevel = intervalIndex;
			if (Boolean(MainManager.paramsObj.displayExtendedHours)) {
				if (this.currentIntervalLevel === Intervals.INTRADAY) {
					this.displayManager.toggleAllAfterHoursSessions(true);
				} else {
					this.displayManager.toggleAllAfterHoursSessions(false);
				}
			}
			this.animateTo(0, intervalPeriods[intervalIndex].days * (firstDataSource.data.marketDayLength + 1), 1);
			MainManager.jsProxy.setJsCurrentViewParam("defaultDisplayInterval", Const.getDetailLevelInterval(intervalIndex));
		}

		private highlightPoints() {
			const pointInfo = {};
			const viewPoints = this.displayManager.getViewPoints();

			for (const viewPoint of viewPoints) {
				viewPoint.highlightPoint(this.mouseX, pointInfo);
			}

			return pointInfo;
		}

		getState(): ControllerStates {
			return this.state;
		}

		private getZoomLevelFinalState(scaleIntervalIndex: ScaleTypes): ViewPointState | null {
			let count = NaN;
			const sparklineViewPoint = this.displayManager.getSparklineViewPoint();
			const mainViewPoint = this.displayManager.getMainViewPoint();
			const layersManager = this.mainManager.layersManager;
			const firstDataSource = layersManager.getFirstDataSource();
			if (!firstDataSource) {
				return null;
			}

			const scaleIntervals = Const.SCALE_INTERVALS;
			let lastMinute = sparklineViewPoint.getLastMinute();
			if (scaleIntervalIndex === ScaleTypes.SCALE_CUSTOM) {
				const customScaleZoomLevel = this.getCustomScaleZoomLevel(firstDataSource, this.customZoomStartDate, this.customZoomEndDate);
				if (!customScaleZoomLevel) {
					return null;
				}

				lastMinute = customScaleZoomLevel.lastMinute;
				count = customScaleZoomLevel.count;
			} else if (scaleIntervalIndex === ScaleTypes.SCALE_YTD) {
				const date = new Date(firstDataSource.data.units[firstDataSource.data.units.length - 1].time);
				date.setMonth(0);
				date.setDate(1);
				const units = firstDataSource.data.units;
				lastMinute = 0;
				count = lastMinute - units[DataSource.getTimeIndex(date.getTime(), units)].relativeMinutes;
			} else if (scaleIntervalIndex === ScaleTypes.SCALE_MAX) {
				lastMinute = mainViewPoint.getNewestMinute();
				count = Math.abs(mainViewPoint.getOldestBaseMinute());
			} else if (scaleIntervalIndex !== ScaleTypes.INVALID && scaleIntervalIndex <= ScaleTypes.SCALE_1M) {
				const date = new Date(sparklineViewPoint.getLastDataUnit().time);
				date.setMonth(date.getMonth() - scaleIntervals[scaleIntervalIndex].months);
				const units = firstDataSource.data.units;
				const timeIndex = DataSource.getTimeIndex(date.getTime(), units);
				count = sparklineViewPoint.getLastMinute() - units[timeIndex].relativeMinutes;
			} else if (scaleIntervalIndex >= 0 && scaleIntervalIndex < scaleIntervals.length) {
				lastMinute = firstDataSource.getEndOfDayDataUnitFor(mainViewPoint.getLastMinute()).relativeMinutes;
				count = this.getCountForDays(firstDataSource, scaleIntervals[scaleIntervalIndex].days, lastMinute);
			} else {
				return null;
			}

			const style = this.displayManager.layersManager.getStyle();
			if (style === LayersManager.SINGLE && Boolean(MainManager.paramsObj.displayExtendedHours)) {
				let startInterval: Intervals;
				let endInterval: Intervals;

				if (Const.INDICATOR_ENABLED) {
					startInterval = mainViewPoint.getDetailLevelForTechnicalStyle();
					endInterval = mainViewPoint.getDetailLevelForTechnicalStyle(count, lastMinute);
				} else {
					startInterval = mainViewPoint.getDetailLevel();
					endInterval = mainViewPoint.getDetailLevel(count, lastMinute);
				}
				count = this.adjustCountForAfterHours(count, firstDataSource, startInterval, endInterval);
			}
			if (isNaN(count) || isNaN(lastMinute)) {
				return null;
			}

			return { lastMinute, count };
		}

		zoomStuff(direction: Directions, param2: number, param3: number = NaN) {
			this.clearCurrentZoom();

			for (const listener of this.listeners) {
				listener.zoomChart_Handler(direction, param3);
			}

			this.displayManager.topBorderLayer.update();
			this.displayManager.showContextualStaticInfo();
		}

		private getBoundsIndex(bounds: Bounds): number {
			for (let boundsIndex = 0; boundsIndex < this.controlledAreaBounds.length; boundsIndex++) {
				if (bounds.equals(this.controlledAreaBounds[boundsIndex])) {
					return boundsIndex;
				}
			}
			return -1;
		}

		private changeListenersOffset(param1: number) {
			for (const listener of this.listeners) {
				listener.moveChartBy_Handler(param1);
			}
		}

		getNewMarketState(param1: boolean, param2: number, minutes: number) {
			if (param2 === 0) {
				param1 = !param1;
				param2 = param1 ? minutes : Const.MIN_PER_DAY - minutes;
			}
			param2 -= Const.REALTIME_CHART_POLLING_INTERVAL / Const.MS_PER_MINUTE;
			return {
				isMarketOpen: param1,
				stateRemainingMinutes: param2,
			};
		}

		initEventListeners() {
			if (!this.stage) {
				return;
			}

			const stage = this.stage;
			//var stage = document.body;

			stage.addEventListener(KeyboardEvents.KEY_DOWN, Stage.bind(this.onKeyDown, this));
			stage.addEventListener(KeyboardEvents.KEY_UP, Stage.bind(this.onKeyUp, this));
			stage.addEventListener(MouseEvents.MOUSE_MOVE, Stage.bind(this.onMouseMove, this));
			stage.addEventListener(MouseEvents.MOUSE_LEAVE, Stage.bind(this.onMouseLeave, this));
			stage.addEventListener(MouseEvents.MOUSE_DOWN, Stage.bind(this.onMouseDown, this));
			stage.addEventListener(MouseEvents.MOUSE_UP, Stage.bind(this.onMouseUp, this));
			this.initPollingTimer();
		}

		enableIntervalButtons(detailLevel: Intervals) {
			if (this.contains(this.intervalButtons)) {
				return;
			}

			this.addChild(this.intervalText);
			this.addChild(this.intervalButtons);
			this.intervalButtons.selectButtonByIndex(detailLevel as number);
			if (this.contains(this.zoomButtons)) {
				this.removeChild(this.zoomButtons);
				this.removeChild(this.zoomText);
			}
			this.clearCurrentZoom();
		}

		mouseDownAction(controllerComponent: ControllerComponents = NaN as ControllerComponents) {
			const sparklineViewPoint = this.displayManager.getSparklineViewPoint();
			this.initialXMouse = this.stage.mouseX;
			this.initialYMouse = this.stage.mouseY;
			switch (controllerComponent) {
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
					if (this.mouseX < scrollSlider.x) {
						this.movePage(Directions.BACKWARD);
						break;
					}
					if (this.mouseX > scrollSlider.x + scrollSlider.width) {
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
			if (!this.hitTestInsideBounds(this.mouseX, this.mouseY)) {
				return;
			}

			this.MOUSE_DOWN = true;
			this.clearAllHighlights();
			if (this.CTRL_DOWN && this.SHIFT_DOWN) {
				this.state = ControllerStates.ZOOMING_OUT;
				clearInterval(this.intId);
				this.intId = setInterval(() => { this.zoomStuff(Directions.BACKWARD, this.stage.mouseX); }, 20);
				return;
			}
			if (this.SHIFT_DOWN) {
				this.state = ControllerStates.SELECTING;
				this.mouseCursor.setCursor(MouseCursors.CLASSIC);
				return;
			}
			this.mouseCursor.setCursor(MouseCursors.CLOSED_HAND);
			this.state = ControllerStates.DRAGGING;
		}
	}
