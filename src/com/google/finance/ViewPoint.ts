/// <reference path="../../../flash/display/Sprite.ts" />

namespace com.google.finance
{
	// import flash.display.Sprite;
	// import flash.text.TextField;
	// import flash.text.TextFormat;
	// import flash.text.TextFieldAutoSize;
	// import flash.utils.getDefinitionByName;
	// import flash.text.TextFormatAlign;

	export type ViewPointState = { count: number, lastMinute: number };

	export class SkipInterval
	{
		constructor(public readonly skip: number, public readonly interval: number) { }
	}

	export class EventCallback
	{
		constructor(public readonly func: { (p1: any): void }, public readonly param: any) { }
	}

	export interface IDataUnitContainer
	{
		getFirstDataUnit(): DataUnit | null;
		getLastDataUnit(dataSeries?: DataSeries): DataUnit | null;
	}

	export abstract class IViewPoint
		extends flash.display.Sprite
		implements IDataUnitContainer
	{
		name: string;

		constructor(protected readonly displayManager: com.google.finance.DisplayManager)
		{
			super();
		}

		protected textCanvas: flash.display.Sprite;
		protected windowMask: flash.display.Sprite;
		bg: flash.display.Sprite;
		dateTextFormat: flash.text.TextFormat;

		minx: number;
		miny: number;
		maxx: number;
		maxy: number;

		hourTextFormat: flash.text.TextFormat;
		lastMinute: number;

		priceTextFormat: flash.text.TextFormat;

		minutesOffset = 0;

		count: number;

		minutePix: number;

		abstract getNewContext(param1: number, param2: number): Context;

		abstract highlightPoint(param1: number, state: Dictionary): void;
		abstract getMinuteOfX(param1: number): number;

		abstract getIntervalLength(param1: number): number;

		abstract getLayers(): AbstractLayer<IViewPoint>[];
		abstract update(): void;
		abstract removeAllLayers(): void;

		abstract addLayer(param1: string, dataSource: DataSource, param3: string): AbstractLayer<IViewPoint> | null;
		abstract clearPointInformation(): void;

		abstract getFirstMinute(): number;
		abstract getLastMinute(): number;

		abstract getFirstDataUnit(): DataUnit | null;
		abstract getLastDataUnit(dataSeries: DataSeries): DataUnit | null;

		abstract getLastNotVisibleDataUnit(): DataUnit | null;

		abstract getMinuteXPos(param1: number): number;

		abstract HTMLnotify(param1?: boolean): void;

		abstract isAnimating(): boolean;

		myController: com.google.finance.Controller;

		abstract precomputeContexts(): void;

		abstract renderLayers(): void;

		abstract setNewCount(param1: number, param2?: boolean): void;

		abstract setNewSize(bounds: Bounds): void;

		abstract zoomIn_Handler(p1: number, p2: number): void;
		abstract zoomingAnimation_ticker(viewPoint: IViewPoint, param2: number, param3: boolean): void;
		abstract zoomChart_Handler(p1: number, p2: number): void;
		abstract moveChartBy_Handler(p1: number): void;
		abstract commitOffset_Handler(): void;
		abstract zoomInMinutes_Handler(p1: Context, p2: boolean): void;
		abstract zoomingAnimation_init(p1: Context): void;
		abstract newFinalAnimationState(viewPointState: ViewPointState): void;
	}

	export class ViewPoint
		extends IViewPoint
	{
		static readonly MIN_DISTANCE_BETWEEN_V_LINES = 100;
		static readonly GRID_TEXT_VERTICAL_OFFSET = 3;
		static readonly TICK_SIZE_SMALL = 3;
		static readonly TICK_SIZE_BIG = 5;
		static readonly TICK_SIZE_NONE = 0;
		static readonly BORDER_LIGHT_COLOR = 0xdddddd;
		static readonly TEXT_VERTICAL_OFFSET = 0;
		static readonly BORDER_DARK_COLOR = 0xcccccc;
		static readonly TEXT_FIELD_WIDTH = 200;
		static readonly MIN_DISTANCE_BETWEEN_H_LINES = 60;
		static readonly TEXT_HORIZONTAL_OFFSET = 2;
		static readonly TEXT_FIELD_HEIGHT = 16;
		static readonly MAX_EDGE_DISTANCE = 25;
		static readonly MIN_DISTANCE_BETWEEN_LOG_H_LINES = 12;
		static readonly MIN_EDGE_DISTANCE = 20;

		private static readonly MIN_ZOOM_CHART_AMOUNT = 6;

		//private layersManager: com.google.finance.LayersManager;
		//private xOffset = 0;
		private topCanvas = new flash.display.Sprite("topCanvas");
		private lastNotifyMinute = 0;
		private firstNotifyMinute = 0;
		private unitsPerUnit = 3;

		protected priceSkip: number;
		protected zoomingInitialState: Context;
		protected countOffset: number;
		protected myLabel: flash.text.TextField;
		protected forcedLayersContext: Context;
		protected descriptiveLayers: AbstractLayer<ViewPoint>[] = [];
		protected drawingLayers: AbstractDrawingLayer<ViewPoint>[] = [];
		protected zoomingFinalState: Context | null;

		readonly POINTS_DISTANCE = 1.5;
		readonly V_OFFSET = 2;

		layersContext: Context;
		medPriceY = 0;
		bottomTextHeight = 0;
		maxPriceRangeViewSize: number;
		topMargin: number;

		display: string;

		constructor(displayManager: com.google.finance.DisplayManager)
		{
			super(displayManager);

			this.bg = new flash.display.Sprite("bg");
			this.addChild(this.bg);
			this.textCanvas = new flash.display.Sprite("textCanvas");
			this.addChild(this.textCanvas);
			this.addChild(this.topCanvas);
			this.dateTextFormat = new flash.text.TextFormat("Verdana", 9, 0);
			this.hourTextFormat = new flash.text.TextFormat("Verdana", 9, 0);
			this.priceTextFormat = new flash.text.TextFormat("Verdana", 10, 0);
			this.priceTextFormat.align = flash.text.TextFormatAlign.RIGHT;
			this.medPriceY = (this.maxy - this.miny) / 2;
			this.maxPriceRangeViewSize = this.maxy - this.miny - ViewPoint.MIN_EDGE_DISTANCE - ViewPoint.MAX_EDGE_DISTANCE;
			this.lastMinute = 0;
		}

		static sessionVisible(param1: DataUnit, param2: DataUnit, context: Context): boolean
		{
			const lastMinute = context.lastMinute;
			const _loc5_ = context.lastMinute - context.count;
			if (param1 && param1.relativeMinutes >= _loc5_ && param1.relativeMinutes <= lastMinute)
				return true;

			if (param2 && param2.relativeMinutes >= _loc5_ && param2.relativeMinutes <= lastMinute)
				return true;

			if (param1.relativeMinutes <= _loc5_ && param2.relativeMinutes >= lastMinute)
				return true;

			return false;
		}

		getIntervalLength(param1: number): number
		{
			return param1 * (this.maxx - this.minx) / this.count;
		}

		getBaseDataSource(): DataSource | null
		{
			if (this.myController)
			{
				const layersManager = this.myController.mainManager.layersManager;
				if (layersManager)
					return layersManager.getFirstDataSource();
			}
			return null;
		}

		private clearTextCanvas()
		{
			Utils.removeAllChildren(this.textCanvas);
		}

		adjustBarChartContext(context: Context, param2: number)
		{
			let _loc3_ = context.count;
			let _loc4_ = context.lastMinute;
			let _loc5_ = (this.getMarketDayLength() + 1) * Const.INTERVAL_PERIODS[param2].maxdays;
			const _loc6_ = (this.getMarketDayLength() + 1) * Const.INTERVAL_PERIODS[param2].mindays;
			if (_loc3_ > _loc5_)
				_loc3_ = _loc5_;
			else if (_loc3_ < _loc6_)
				_loc3_ = _loc6_;

			const baseDataSource = this.getBaseDataSource();
			if (baseDataSource)
			{
				const detailLevelInterval = Const.getDetailLevelInterval(param2);
				const points = baseDataSource.data.getPointsInIntervalArray(detailLevelInterval);
				if (points && points.length > 0)
				{
					_loc5_ = _loc4_ - Math.max(baseDataSource.firstOpenRelativeMinutes, points[0].relativeMinutes);
					if (_loc5_ < _loc6_)
					{
						_loc3_ = _loc6_;
						_loc4_ += _loc6_ - _loc5_;
					}
					else if (_loc3_ > _loc5_)
					{
						_loc3_ = _loc5_;
					}
				}
			}
			if (_loc3_ !== context.count)
				return this.getNewContext(_loc4_, _loc3_);

			return context;
		}

		private trySnapping()
		{
			if (!Boolean(MainManager.paramsObj.snapping))
				return;

			const dataSource = this.getBaseDataSource();
			if (!dataSource)
				return;

			//const _loc1_ = dataSource.data;
			const snapLevel = this.getSnapLevel();
			const point = this.getClosestPoint(this.getLastMinute(), snapLevel);
			const intervalLength = this.getIntervalLength(Math.abs(point.relativeMinutes - this.getLastMinute()));
			if (intervalLength < 15)
				this.minutesOffset += point.relativeMinutes - this.getLastMinute();
		}

		getIntervalForLength(param1: { count: number }, param2: number): number
		{
			return param2 * param1.count / (this.maxx - this.minx);
		}

		removeAllLayers()
		{
			for (const layer of this.drawingLayers)
				this.removeChild(layer);

			for (const layer of this.descriptiveLayers)
				this.removeChild(layer);

			this.drawingLayers = [];
			this.descriptiveLayers = [];
		}

		protected getQuoteType(): QuoteTypes
		{
			if (this.myController)
				return this.myController.mainManager.getQuoteType();

			return QuoteTypes.COMPANY;
		}

		getSnapLevel(): number
		{
			const baseDataSource = notnull(this.getBaseDataSource()).data;
			const _loc2_ = this.minutePix * baseDataSource.marketDayLength;
			if (_loc2_ > 40)
				return Snaps.SNAP_DAY;

			if (_loc2_ > 15)
				return Snaps.SNAP_WEEK;

			if (_loc2_ * 20 > 40)
				return Snaps.SNAP_MONTH;

			return Snaps.SNAP_YEAR;
		}

		static addTextField(sprite: flash.display.Sprite, param2: string, param3: number, param4: number, param5: number, param6: number, param7: string, textFormat: flash.text.TextFormat, param9?: string): flash.text.TextField
		{
			//if (!param2)
			//	return null;
			const textField = new flash.text.TextField();
			textField.x = param3;
			textField.y = param4;
			textField.width = param5;
			textField.height = param6;
			textFormat.align = param7;
			textField.defaultTextFormat = textFormat;
			textField.selectable = false;
			if (param7 === "center")
			{
				textField.x = param3 + param5 / 2;
				textField.width = 0;
				textField.autoSize = flash.text.TextFieldAutoSize.CENTER;
			}
			if (param9)
				textField.autoSize = param9;

			textField.text = param2;
			sprite.addChild(textField);
			return textField;
		}

		removeLayer(layerId: string, dataSource?: DataSource)
		{
			let layerIndex = this.getLayerIndex(layerId, this.drawingLayers, dataSource);
			if (layerIndex !== -1)
			{
				this.removeChild(this.drawingLayers[layerIndex]);
				this.drawingLayers.splice(layerIndex, 1);
			}
			layerIndex = this.getLayerIndex(layerId, this.descriptiveLayers, dataSource);
			if (layerIndex !== -1)
			{
				this.removeChild(this.descriptiveLayers[layerIndex]);
				this.descriptiveLayers.splice(layerIndex, 1);
			}
		}

		getXPos(dataUnit: DataUnit): number
		{
			return this.getMinuteXPos(dataUnit.relativeMinutes);
		}

		private generateEvent(param1: number, dataSource: DataSource, param3 = 2, eventCallbacks?: EventCallback[])
		{
			const event = EventFactory.getEvent(param1, dataSource.quoteName, param3);
			event.callbacks = eventCallbacks;
			const dataManager = this.displayManager.mainManager.dataManager;
			dataManager.expectEvent(event);
			dataManager.eventHandler(event);
		}

		addLayer(param1: string, dataSource: DataSource, param3: string): AbstractLayer<IViewPoint> | null
		{
			let LayerClass: typeof AbstractLayer;
			const layerType = param1;
			const id = param3;
			if (layerType === "")
				return null;

			try
			{
				LayerClass = getDefinitionByName("com.google.finance." + layerType) as typeof AbstractLayer;
			}
			catch (re /*: ReferenceError*/)
			{
				console.log("com.google.finance." + layerType + " was not found");
				return null;
			}

			const layer = new LayerClass(this, dataSource);
			layer.textCanvas = this.textCanvas;
			layer.layerType = layerType;
			layer.layerId = id;
			if (layer instanceof AbstractDrawingLayer)
				this.drawingLayers.push(layer);
			else
				this.descriptiveLayers.push(layer);

			this.addChild(layer);
			Utils.displayObjectToTop(this.textCanvas, this);
			Utils.displayObjectToTop(this.topCanvas, this);

			return layer;
		}

		highlightPoint(param1: number, state: Dictionary)
		{
			for (const layer of this.drawingLayers)
				layer.highlightPoint(this.layersContext, param1, state);
		}

		getNewestMinute(): number
		{
			let _loc1_ = 0;
			for (const layer of this.drawingLayers)
			{
				const newestMinute = layer.getNewestMinute();
				if (_loc1_ < newestMinute)
					_loc1_ = newestMinute;
			}
			return _loc1_;
		}

		getLastMinute(): number
		{
			return this.lastMinute + this.minutesOffset;
		}

		checkEvents(interval: Intervals = -1, eventCallbacks?: EventCallback[])
		{
			let _loc9_ = false;
			const baseDataSource = this.getBaseDataSource();
			if (!baseDataSource)
				return;

			const _loc4_ = baseDataSource.data.days.length - 1;
			const _loc5_ = DataSource.getMinuteMetaIndex(this.lastMinute - this.count, baseDataSource.data.days, baseDataSource.data.units);
			const _loc6_ = DataSource.getMinuteMetaIndex(this.lastMinute, baseDataSource.data.days, baseDataSource.data.units);
			if (_loc4_ - _loc6_ <= Const.INTRADAY_DAYS && _loc6_ - _loc5_ <= Const.INTRADAY_DAYS)
				this.generateEventForAllSources(ChartEventStyles.GET_5D_DATA);

			const _loc7_ = _loc4_ - _loc5_;
			if (Const.INDICATOR_ENABLED && !this.displayManager.isDifferentMarketSessionComparison())
			{
				const _loc8_ = interval >= 0 ? interval : this.getDetailLevelForTechnicalStyle();
				_loc9_ = !this.myController || this.myController.currentIntervalLevel === -1;
				const _loc10_ = this.displayManager.hasOhlcRequiredIndicator() || !_loc9_ ? ChartEventPriorities.OHLC_REQUIRED : ChartEventPriorities.OPTIONAL;
				switch (_loc8_)
				{
					case Intervals.INTRADAY:
						this.generateEventForAllSources(ChartEventStyles.GET_5D_DATA, _loc10_, eventCallbacks);
						if (Boolean(MainManager.paramsObj.forceDisplayExtendedHours) || Boolean(MainManager.paramsObj.displayExtendedHours))
							this.generateEventForAllSources(ChartEventStyles.GET_AH_DATA, _loc10_);

						if (this.getFirstMinute() === this.getOldestBaseMinute())
						{
							this.generateEventForAllSources(ChartEventStyles.GET_1Y_DATA, _loc10_);
							break;
						}
						break;
					case Intervals.FIVE_MINUTES:
						this.generateEventForAllSources(ChartEventStyles.GET_1Y_DATA, _loc10_);
						this.generateEventForAllSources(ChartEventStyles.GET_10D_DATA, _loc10_, eventCallbacks);
						if (_loc9_ && (Boolean(MainManager.paramsObj.forceDisplayExtendedHours) || Boolean(MainManager.paramsObj.displayExtendedHours)))
						{
							this.generateEventForAllSources(ChartEventStyles.GET_AH_DATA, _loc10_);
							break;
						}
						break;
					case Intervals.HALF_HOUR:
						this.generateEventForAllSources(ChartEventStyles.GET_1Y_DATA, _loc10_);
						this.generateEventForAllSources(ChartEventStyles.GET_30D_DATA, _loc10_, eventCallbacks);
						if (_loc9_ && (Boolean(MainManager.paramsObj.forceDisplayExtendedHours) || Boolean(MainManager.paramsObj.displayExtendedHours)))
						{
							this.generateEventForAllSources(ChartEventStyles.GET_AH_DATA, _loc10_);
							break;
						}
						break;
					case Intervals.DAILY:
						this.generateEventForAllSources(ChartEventStyles.GET_1Y_DATA, _loc10_, eventCallbacks);
						break;
					case Intervals.WEEKLY:
						this.generateEventForAllSources(ChartEventStyles.GET_5Y_DATA, _loc10_, eventCallbacks);
						break;
				}
			}
			else
			{
				if (this.displayManager.isDifferentMarketSessionComparison())
					this.generateEventForAllSources(ChartEventStyles.GET_5Y_DATA);

				this.generateEventForAllSources(ChartEventStyles.GET_1Y_DATA);
			}
			if (_loc7_ >= Const.DAILY_DAYS)
				this.generateEventForAllSources(ChartEventStyles.GET_40Y_DATA);
		}

		getDetailLevelForDifferentMarketSessionComparison(param1 = NaN, param2 = NaN): Intervals
		{
			let _loc3_;
			if (!isNaN(param2))
				_loc3_ = param2;
			else
				_loc3_ = this.getLastMinute();

			let _loc4_;
			if (!isNaN(param1))
				_loc4_ = param1;
			else
				_loc4_ = this.count;

			if (_loc4_ - _loc3_ <= Const.DAILY_DAYS)
				return Intervals.DAILY;

			return Intervals.WEEKLY;
		}

		getLayers(): AbstractLayer<IViewPoint>[]
		{
			const abstractLayers: AbstractLayer<ViewPoint>[] = [];
			return abstractLayers.concat(this.drawingLayers, this.descriptiveLayers);
		}

		clearAllChildrenFromTopCanvas()
		{
			while (this.topCanvas.numChildren > 0)
				this.topCanvas.removeChildAt(0);
		}

		private getClosestPoint(param1: number, param2: number): DataUnit
		{
			let _loc4_: number[];
			const baseDataSource = notnull(this.getBaseDataSource()).data;
			switch (param2)
			{
				default:
					throw new Error();
				case Snaps.SNAP_DAY:
					_loc4_ = baseDataSource.days;
					break;
				case Snaps.SNAP_WEEK:
					_loc4_ = baseDataSource.fridays;
					break;
				case Snaps.SNAP_MONTH:
					_loc4_ = baseDataSource.firsts;
					break;
				case Snaps.SNAP_YEAR:
					_loc4_ = baseDataSource.years;
					break;
			}
			const minuteMetaIndex = DataSource.getMinuteMetaIndex(param1, _loc4_, baseDataSource.units);
			let _loc6_: DataUnit;
			if (_loc4_ === baseDataSource.days)
				_loc6_ = baseDataSource.units[_loc4_[minuteMetaIndex]];
			else
				_loc6_ = baseDataSource.units[_loc4_[minuteMetaIndex] - 1];

			const intervalLength = this.getIntervalLength(param1 - _loc6_.relativeMinutes);
			if (minuteMetaIndex < _loc4_.length - 1)
			{
				let _loc8_: DataUnit;

				if (_loc4_ === baseDataSource.days)
					_loc8_ = baseDataSource.units[_loc4_[minuteMetaIndex + 1]];
				else
					_loc8_ = baseDataSource.units[_loc4_[minuteMetaIndex + 1] - 1];

				const _loc9_ = this.getIntervalLength(_loc8_.relativeMinutes - param1);
				if (_loc9_ < intervalLength)
					return _loc8_;

				return _loc6_;
			}
			return _loc6_;
		}

		getOldestBaseMinute(): number
		{
			const baseDataSource = this.getBaseDataSource();
			if (baseDataSource)
				return baseDataSource.data.getFirstRelativeMinute();

			return 0;
		}

		isAnimating(): boolean
		{
			return !!this.zoomingFinalState;
		}

		zoomInMinutes_Handler(context: Context, param2 = false)
		{
			let newContext: Context | null;
			if (Const.INDICATOR_ENABLED && this.myController && this.myController.currentIntervalLevel >= 0)
				newContext = this.adjustBarChartContext(context, this.myController.currentIntervalLevel);
			else
				newContext = this.adjustLineChartContext(context);

			if (newContext)
			{
				this.setNewCount(Math.floor(newContext.count), param2);
				this.lastMinute = newContext.lastMinute;
				this.update(newContext);
				this.checkEvents();
			}
		}

		private generateEventForAllSources(param1: number, param2 = 2, eventCallbacks?: EventCallback[])
		{
			for (const layer of this.drawingLayers)
				this.generateEvent(param1, layer.dataSource, param2, eventCallbacks);
		}

		zoomIn_Handler(param1: number, param2: number)
		{
			let _loc3_ = (param2 - param1) * 1 * this.count / (this.maxx - this.minx);
			const oldestBaseMinute = Math.abs(this.getOldestBaseMinute());
			_loc3_ = Math.min(_loc3_, oldestBaseMinute);
			const _loc5_ = this.lastMinute - this.count * (this.maxx - param2) / (this.maxx - this.minx);
			const newContext = this.getNewContext(_loc5_, _loc3_);
			this.zoomInMinutes_Handler(newContext);
		}

		getOldestMinute(): number
		{
			let oldestMinute = 0;
			for (const layer of this.drawingLayers)
			{
				const minute = layer.getOldestMinute();
				if (oldestMinute > minute)
					oldestMinute = Number(minute);
			}
			return oldestMinute;
		}

		zoomingAnimation_ticker(viewPoint: ViewPoint, param2: number, param3: boolean)
		{
			const zoomingInitialState = viewPoint.zoomingInitialState;
			const _loc5_ = notnull(viewPoint.zoomingFinalState);
			const _loc6_ = Utils.cloneObject(zoomingInitialState);
			for (const key of Object.keys(zoomingInitialState))
			{
				if (!isNaN(zoomingInitialState[key]) && !isNaN(_loc5_[key]))
				{
					const _loc8_ = zoomingInitialState[key] + (_loc5_[key] - zoomingInitialState[key]) * (1 - param2);
					_loc6_[key] = _loc8_;
				}
			}
			viewPoint.zoomInMinutes_Handler(_loc6_);
			if (param2 === 0)
			{
				viewPoint.HTMLnotify(param3);
				viewPoint.zoomingFinalState = null;
			}
			this.displayManager.showContextualStaticInfo();
		}

		renderLayers()
		{
			for (const layer of this.drawingLayers)
				layer.renderLayer(this.layersContext);

			for (const layer of this.descriptiveLayers)
				layer.renderLayer(this.layersContext);
		}

		getLastDataUnit(dataSeries?: DataSeries): DataUnit | null
		{
			let _loc2_: DataSeries | null = null;
			let _loc3_: DataSource | null = null;
			if (dataSeries)
			{
				_loc2_ = dataSeries;
			}
			else
			{
				_loc3_ = this.getBaseDataSource();
				_loc2_ = !!_loc3_ ? _loc3_.data : null;
			}
			if (!_loc2_)
				return null;

			if (this.getLastMinute() === this.getNewestMinute())
			{
				const units = _loc2_.units;
				const dataUnit = new DataUnit(-1, -1, -1, -1);
				const date = new Date();
				dataUnit.exchangeDateInUTC = units[units.length - 1].exchangeDateInUTC;
				dataUnit.close = units[units.length - 1].close;
				dataUnit.time = date.getTime();
				dataUnit.relativeMinutes = 0;
				if (dataUnit.time < units[units.length - 1].time)
					dataUnit.time = units[units.length - 1].time;

				return dataUnit;
			}
			if (_loc3_)
				return _loc3_.getVisibleDataUnitForMinute(this.getLastMinute());

			return _loc2_.units[_loc2_.getRelativeMinuteIndex(this.getLastMinute())];
		}

		getDetailLevel(param1 = NaN, param2 = NaN, dataSource?: DataSource): Intervals
		{
			if (this.displayManager.isDifferentMarketSessionComparison())
				return this.getDetailLevelForDifferentMarketSessionComparison(param1, param2);

			let _loc4_ = this.minutePix;
			let lastMinute = this.getLastMinute();
			let baseDataSource = this.getBaseDataSource();
			let _loc7_ = this.count;
			if (!isNaN(param1))
			{
				_loc4_ = (this.maxx - this.minx) / param1;
				_loc7_ = param1;
			}
			if (isNaN(_loc4_) || !baseDataSource)
				return -1;

			if (!isNaN(param2))
				lastMinute = param2;

			if (dataSource)
				baseDataSource = dataSource;

			const data = baseDataSource.data;
			if (!data)
				return -1;

			const _loc9_ = baseDataSource.data.allSessionsLength() + 1;
			let _loc10_ = _loc9_;
			if (baseDataSource.afterHoursData)
				_loc10_ += baseDataSource.afterHoursData.allSessionsLength() + baseDataSource.afterHoursData.dataSessions.length();

			const _loc11_ = data.getRelativeMinuteIndex(lastMinute);
			const time = data.units[_loc11_].time;
			if (_loc7_ <= Const.INTRADAY_DAYS * _loc10_)
			{
				if (data.intervalDataContainsTime(time, Const.INTRADAY_INTERVAL) || data.intervalDataPreceedsTime(time, Const.INTRADAY_INTERVAL))
					return Intervals.INTRADAY;

				if (data.intervalDataContainsTime(time, Const.DAILY_INTERVAL, Const.INTRADAY_INTERVAL))
					return Intervals.DAILY;

				return Intervals.WEEKLY;
			}
			if (_loc7_ <= Const.DAILY_DAYS * _loc9_)
			{
				if (data.intervalDataContainsTime(time, Const.INTRADAY_INTERVAL, Const.DAILY_INTERVAL) || data.intervalDataPreceedsTime(time, Const.DAILY_INTERVAL))
					return Intervals.DAILY;

				return Intervals.WEEKLY;
			}
			return Intervals.WEEKLY;
		}

		getFirstDataUnit(): DataUnit | null
		{
			const baseDataSource = this.getBaseDataSource();
			if (!baseDataSource)
				return null;

			return baseDataSource.getClosestDataUnitAfterMinute(this.getFirstMinute());
		}

		getDisplayManager(): com.google.finance.DisplayManager
		{
			return this.displayManager;
		}

		getDetailLevelForTechnicalStyle(param1 = NaN, param2 = NaN): Intervals
		{
			if (this.displayManager.isDifferentMarketSessionComparison())
				return this.getDetailLevelForDifferentMarketSessionComparison(param1, param2);

			if (this.myController && this.myController.currentIntervalLevel >= 0)
				return this.myController.currentIntervalLevel;

			let _loc3_;
			if (!isNaN(param2))
				_loc3_ = param2;
			else
				_loc3_ = this.getLastMinute();

			let _loc4_;
			if (!isNaN(param1))
				_loc4_ = param1;
			else
				_loc4_ = this.count;

			const quoteType = this.getQuoteType();
			const baseDataSource = this.getBaseDataSource();
			if (quoteType === QuoteTypes.COMPANY)
			{
				if (baseDataSource)
				{
					const _loc9_ = baseDataSource.data.getPointsInIntervalArray(Const.INTRADAY_INTERVAL);
					if (_loc9_ && _loc9_.length > 0 && Math.abs(_loc3_ - _loc4_) <= Math.abs(_loc9_[0].relativeMinutes) + 1)
						return Intervals.INTRADAY;

					const _loc10_ = baseDataSource.data.getPointsInIntervalArray(Const.FIVE_MINUTE_INTERVAL);
					if (_loc10_ && _loc10_.length > 0 && Math.abs(_loc3_ - _loc4_) <= Math.abs(_loc10_[0].relativeMinutes) + 1)
						return Intervals.FIVE_MINUTES;
				}
				else if (Const.DEFAULT_CHART_STYLE_NAME !== Const.LINE_CHART)
				{
					return Const.DEFAULT_D;
				}
			}
			const _loc7_ = Math.abs(_loc3_ - _loc4_) / (this.getMarketDayLength() + 1) + 1;
			const dataSeries: DataSeries | null = !!baseDataSource ? baseDataSource.data : null;
			if (_loc7_ <= Const.FIVE_MINUTE_DAYS && quoteType === QuoteTypes.COMPANY && !(dataSeries && dataSeries.hasNoPointsInIntervalArray(Const.FIVE_MINUTE_INTERVAL)))
				return Intervals.FIVE_MINUTES;

			if (_loc7_ <= Const.HALF_HOUR_DAYS && quoteType === QuoteTypes.COMPANY && !(dataSeries && dataSeries.hasNoPointsInIntervalArray(Const.HALF_HOUR_INTERVAL)))
				return Intervals.HALF_HOUR;

			if (_loc7_ <= Const.DAILY_DAYS && !(dataSeries && dataSeries.hasNoPointsInIntervalArray(Const.DAILY_INTERVAL)))
				return Intervals.DAILY;

			return Intervals.WEEKLY;
		}

		protected getMarketDayLength(): number
		{
			const baseDataSource = this.getBaseDataSource();
			if (!baseDataSource)
				return Const.MARKET_DAY_LENGTH;

			return baseDataSource.data.marketDayLength;
		}

		setController(controller: com.google.finance.Controller)
		{
			controller.addControlListener(this);
			const bounds = new Bounds(this.minx, this.miny, this.maxx, this.maxy);
			controller.addBounds(bounds);
			this.myController = controller;
		}

		checkAfterHoursVisibility(param1: number, param2: number)
		{
			const layersManager = this.displayManager.layersManager;
			if (layersManager.getStyle() !== com.google.finance.LayersManager.SINGLE)
				return;

			if (MainManager.paramsObj.displayExtendedHours !== "true")
				return;

			if (Const.INDICATOR_ENABLED)
			{
				const _loc4_ = this.getDetailLevelForTechnicalStyle(param1);
				const _loc5_ = this.getDetailLevelForTechnicalStyle(param2);
				if (_loc5_ >= Intervals.DAILY && _loc4_ < Intervals.DAILY)
					this.displayManager.toggleAllAfterHoursSessions(false);
				else if (_loc4_ >= Intervals.DAILY && _loc5_ < Intervals.DAILY)
					this.displayManager.toggleAllAfterHoursSessions(true);
			}
			else
			{
				const _loc4_ = this.getDetailLevel(param1);
				const _loc5_ = this.getDetailLevel(param2);
				if (_loc5_ > Intervals.INTRADAY && _loc4_ === Intervals.INTRADAY)
					this.displayManager.toggleAllAfterHoursSessions(false);
				else if (_loc4_ > Intervals.INTRADAY && _loc5_ === Intervals.INTRADAY)
					this.displayManager.toggleAllAfterHoursSessions(true);
			}
		}

		getLayer(layerId: string, dataSource?: DataSource): AbstractLayer<ViewPoint> | null
		{
			let layerIndex = this.getLayerIndex(layerId, this.drawingLayers, dataSource);
			if (layerIndex !== -1)
				return this.drawingLayers[layerIndex];

			layerIndex = this.getLayerIndex(layerId, this.descriptiveLayers, dataSource);
			if (layerIndex !== -1)
				return this.descriptiveLayers[layerIndex];

			return null;
		}

		getFirstMinute(): number
		{
			return this.lastMinute + this.minutesOffset - this.count;
		}

		moveChartBy_Handler(param1: number)
		{
			const _loc2_ = Math.floor(this.lastMinute - Number(param1 / this.POINTS_DISTANCE) * this.unitsPerUnit);
			const _loc3_ = Math.ceil(_loc2_ - this.count);
			for (const layer of this.drawingLayers)
			{
				const dataSource = layer.dataSource;
				const firstRelativeMinute = dataSource.data.getFirstRelativeMinute();
				if (_loc3_ < firstRelativeMinute)
				{
					if (Const.getZoomLevel(this.count, dataSource.data.marketDayLength) >= ScaleTypes.SCALE_5D)
						this.generateEvent(ChartEventStyles.GET_1Y_DATA, dataSource);
				}
			}
			const _loc5_ = Math.abs(this.getOldestBaseMinute());
			if (this.count > _loc5_)
				return;

			let _loc6_ = Number(this.getOldestBaseMinute());
			if (Const.INDICATOR_ENABLED && this.myController && this.myController.currentIntervalLevel >= 0)
			{
				const baseDataSource = this.getBaseDataSource();
				if (baseDataSource)
				{
					const _loc12_ = baseDataSource.data.getPointsInIntervalArray(Const.getDetailLevelInterval(this.myController.currentIntervalLevel));
					_loc6_ = Number(!_loc12_ || _loc12_.length === 0 ? 0 : Math.max(_loc12_[0].relativeMinutes, baseDataSource.firstOpenRelativeMinutes));
				}
				else
				{
					_loc6_ = 0;
				}
			}
			const _loc7_ = this.lastMinute + this.minutesOffset;
			if (_loc3_ < _loc6_)
			{
				this.minutesOffset = _loc6_ + this.count - this.lastMinute;
				this.checkAfterHoursVisibilityWhenChartMoved(_loc7_);
				this.update();
				return;
			}
			const _loc8_ = this.getNewestMinute();
			if (_loc2_ <= _loc8_)
				this.minutesOffset = -Math.floor(Number(param1 / this.POINTS_DISTANCE) * this.unitsPerUnit);
			else if (_loc2_ > _loc8_)
				this.minutesOffset = _loc8_ - this.lastMinute;

			this.checkAfterHoursVisibilityWhenChartMoved(_loc7_);
			this.trySnapping();
			this.update();
		}

		zoomChart_Handler(param1: number, param2 = NaN)
		{
			let _loc3_ = Math.floor(this.count / 40);
			if (!isNaN(param2))
				_loc3_ *= param2;

			_loc3_ = Math.max(_loc3_, ViewPoint.MIN_ZOOM_CHART_AMOUNT);
			const _loc4_ = this.POINTS_DISTANCE * _loc3_ / this.unitsPerUnit;
			switch (param1)
			{
				case Directions.BACKWARD:
					this.zoomIn_Handler(this.minx - _loc4_, this.maxx);
					break;
				case Directions.FORWARD:
					this.zoomIn_Handler(this.minx + _loc4_, this.maxx);
					break;
			}
		}

		commitOffset_Handler()
		{
			this.lastMinute += this.minutesOffset;
			this.minutesOffset = 0;
			this.update();
			this.checkEvents();
		}

		getLastNotVisibleDataUnit(): DataUnit | null
		{
			const data = notnull(this.getBaseDataSource()).data;
			if (!data)
				return null;

			const _loc2_ = data.getRelativeMinuteIndex(this.getFirstMinute());
			return data.units[_loc2_];
		}

		HTMLnotify(param1 = false)
		{
			const _loc2_ = this.getLastMinute() - this.lastNotifyMinute;
			const _loc3_ = this.minutePix * _loc2_;
			const _loc4_ = this.getFirstMinute() - this.firstNotifyMinute;
			const _loc5_ = this.minutePix * _loc4_;
			if (Math.abs(_loc5_) > 20 || Math.abs(_loc3_) > 20)
			{
				this.displayManager.HTMLnotify(this.name, param1);
				this.lastNotifyMinute = this.getLastMinute();
				this.firstNotifyMinute = this.getFirstMinute();
			}
		}

		adjustLineChartContext(context: Context)
		{
			let _loc2_ = context.count;
			let _loc3_ = context.lastMinute;
			const _loc4_ = this.getMinDisplayMinutes(this.getBaseDataSource());
			if (_loc2_ < _loc4_)
			{
				_loc2_ = _loc4_;
				if (this.count === _loc2_)
					return null;
			}

			const _loc5_ = Math.abs(_loc3_ - this.getOldestBaseMinute());
			_loc2_ = Math.min(_loc2_, _loc5_);
			const _loc6_ = this.POINTS_DISTANCE * _loc2_ / (this.maxx - this.minx);
			if (_loc6_ < 0.3 && !this.displayManager.isDifferentMarketSessionComparison())
				return null;

			const newestMinute = this.getNewestMinute();
			if (_loc3_ >= newestMinute)
				_loc3_ = newestMinute;

			if (_loc2_ !== context.count || _loc3_ !== context.lastMinute)
				return this.getNewContext(_loc3_, _loc2_);

			return context;
		}

		update(context?: Context)
		{
			if (!this.stage || this.stage.stageWidth === 0)
				return;

			if (context)
				this.layersContext = context;
			else if (this.forcedLayersContext)
				this.layersContext = this.forcedLayersContext;
			else
				this.precomputeContexts();

			this.clearTextCanvas();
			this.renderLayers();
		}

		addLabel(param1: string)
		{
			this.myLabel = new flash.text.TextField();
			this.myLabel.text = "Volume (millions)";
			this.myLabel.x = this.minx + 5;
			this.myLabel.y = this.miny + 5;
			this.addChild(this.myLabel);
		}

		setNewCount(param1: number, param2 = false)
		{
			if (isNaN(param1))
				return;

			if (param2 !== true)
				this.checkAfterHoursVisibility(this.count, param1);

			this.count = param1;
			this.unitsPerUnit = this.POINTS_DISTANCE * this.count / (this.maxx - this.minx);
			this.minutePix = (this.maxx - this.minx) / this.count;
		}

		getSkipInterval(param1 = NaN, param2 = NaN): SkipInterval
		{
			let _loc3_ = this.minutePix;
			const _loc4_ = Const.INTRADAY_INTERVAL / 60;
			let _loc5_: number;
			let _loc6_ = 1;
			if (!isNaN(param1))
			{
				_loc3_ = (this.maxx - this.minx) / param1;
				_loc5_ = Number(this.getDetailLevel(param1, param2));
			}
			else
			{
				_loc5_ = Number(this.getDetailLevel());
			}
			switch (_loc5_)
			{
				case Intervals.INTRADAY:
					while (_loc3_ * _loc6_ * _loc4_ < this.POINTS_DISTANCE)
						_loc6_ = Number(_loc6_ * 2);

					return new SkipInterval(_loc6_, _loc6_ * Const.INTRADAY_INTERVAL);
				case Intervals.DAILY:
					return new SkipInterval(1, Const.DAILY_INTERVAL);
				case Intervals.WEEKLY:
					const _loc7_ = _loc3_ * 5 * this.getMarketDayLength();
					while (_loc6_ * _loc7_ < this.POINTS_DISTANCE)
						_loc6_ = Number(_loc6_ * 2);

					return new SkipInterval(_loc6_, _loc6_ * Const.WEEKLY_INTERVAL);
				default:
					return new SkipInterval(0, -1);
			}
		}

		newFinalAnimationState(context: Context)
		{
			const _loc2_ = Math.max(context.count, this.getMinDisplayMinutes(this.getBaseDataSource()));
			this.zoomingFinalState = this.getNewContext(context.lastMinute, _loc2_);
		}

		private checkAfterHoursVisibilityWhenChartMoved(param1: number)
		{
			if (!Const.INDICATOR_ENABLED)
				return;

			if (this.displayManager.layersManager.getStyle() !== com.google.finance.LayersManager.SINGLE)
				return;

			if (MainManager.paramsObj.displayExtendedHours !== "true")
				return;

			const _loc2_ = this.getDetailLevelForTechnicalStyle(this.count, param1);
			const _loc3_ = this.getDetailLevelForTechnicalStyle();
			if (_loc3_ >= Intervals.DAILY && _loc2_ < Intervals.DAILY)
				this.displayManager.toggleAllAfterHoursSessions(false);
			else if (_loc2_ >= Intervals.DAILY && _loc3_ < Intervals.DAILY)
				this.displayManager.toggleAllAfterHoursSessions(true);
		}

		addChildToTopCanvas(sprite: flash.display.Sprite)
		{
			this.topCanvas.addChild(sprite);
		}

		updateObjectLayers()
		{
			for (const layer of this.descriptiveLayers)
			{
				if (layer instanceof PinPointsLayer || layer instanceof IntervalBasedPinPointsLayer || layer instanceof IndependentObjectsLayer || layer instanceof IntervalBasedIndependentObjectsLayer)
					layer.renderLayer(this.layersContext);
			}
		}

		private drawBorders()
		{
			const gr = this.bg.graphics;
			gr.clear();
			gr.beginFill(0xffffff, 1);
			gr.drawRect(this.minx, this.miny, this.maxx - this.minx, this.maxy - this.miny);
			gr.endFill();
			gr.lineStyle(0, ViewPoint.BORDER_DARK_COLOR, 1);
			gr.moveTo(this.minx - 1, this.miny);
			gr.lineTo(this.maxx, this.miny);
			gr.lineTo(this.maxx, this.maxy);
			gr.lineStyle(0, ViewPoint.BORDER_LIGHT_COLOR, 1);
			gr.lineTo(this.minx - 1, this.maxy);
			gr.lineStyle(0, ViewPoint.BORDER_DARK_COLOR, 1);
			gr.lineTo(this.minx - 1, this.miny);
		}

		clearPointInformation()
		{
			for (const layer of this.drawingLayers)
				layer.clearHighlight();
		}

		getNewContext(param1: number, param2: number): Context
		{
			let context = new Context();
			context.lastMinute = param1;
			context.count = param2;
			context.verticalScaling = MainManager.paramsObj.verticalScaling;
			for (const layer of this.drawingLayers)
				context = layer.getContext(context);
			return context;
		}

		getMinuteXPos(param1: number): number
		{
			return this.maxx - (this.getLastMinute() - param1) * this.minutePix;
		}

		getNumberOfDays(): number
		{
			return Math.round(this.count / Const.MARKET_DAY_LENGTH);
		}

		newLastMinute_Handler(param1: number)
		{
			//const _loc2_ = param1 - this.count;
			const _loc3_ = this.getOldestBaseMinute();
			if (param1 - this.count < _loc3_)
				param1 = Number(_loc3_ + this.count);

			if (param1 > 0)
				param1 = 0;

			this.lastMinute = param1;
			this.update();
		}

		private getLayerIndex(layerId: string, abstractLayers: AbstractLayer<ViewPoint>[], dataSource?: DataSource): number
		{
			for (let layerIndex = 0; layerIndex < abstractLayers.length; layerIndex++)
			{
				const _loc5_ = abstractLayers[layerIndex];
				if (_loc5_.layerId === layerId && (!dataSource || _loc5_.dataSource === dataSource))
					return layerIndex;
			}
			return -1;
		}

		precomputeContexts()
		{
			this.layersContext = this.getNewContext(this.getLastMinute(), this.count);
			if (this.zoomingFinalState)
			{
				const lastMinute = this.zoomingFinalState.lastMinute;
				const count = this.zoomingFinalState.count;
				this.zoomingFinalState = this.getNewContext(lastMinute, count);
			}
		}

		getMinDisplayMinutes(dataSource: DataSource | null): number
		{
			let _loc2_ = Const.MARKET_DAY_LENGTH;
			if (dataSource && !isNaN(dataSource.data.marketDayLength))
				_loc2_ = dataSource.data.marketDayLength + 1;

			if (Const.INDICATOR_ENABLED && this.myController && this.myController.currentIntervalLevel >= 0)
				return Const.INTERVAL_PERIODS[this.myController.currentIntervalLevel].mindays * _loc2_;

			if (this.displayManager.isDifferentMarketSessionComparison())
				return Const.DIF_MKT_COMPARISON_MIN_DISPLAY_DAYS;

			return Const.MIN_DISPLAY_DAYS * _loc2_;
		}

		zoomingAnimation_init(context: Context)
		{
			this.zoomingInitialState = Utils.cloneObject(this.layersContext);
			this.newFinalAnimationState(context);
		}

		getMinuteOfX(xPos: number): number
		{
			return this.getLastMinute() - (this.maxx - xPos) * this.count / (this.maxx - this.minx);
		}

		setNewSize(bounds: Bounds)
		{
			if (this.minx === bounds.minx &&
				this.miny === bounds.miny &&
				this.maxx === bounds.maxx &&
				this.maxy === bounds.maxy)
			{
				return;
			}

			if (this.myController)
			{
				const newBounds = new Bounds(this.minx, this.miny, this.maxx, this.maxy);
				this.myController.replaceBounds(newBounds, bounds);
			}
			this.minx = bounds.minx;
			this.miny = bounds.miny;
			this.maxx = bounds.maxx;
			this.maxy = bounds.maxy;
			this.drawBorders();
			if (this.myLabel)
			{
				this.myLabel.x = this.minx + 5;
				this.myLabel.y = this.miny + 5;
			}
			this.medPriceY = (this.maxy - this.miny) / 2;
			this.maxPriceRangeViewSize = this.maxy - this.miny - ViewPoint.MIN_EDGE_DISTANCE - ViewPoint.MAX_EDGE_DISTANCE;
			const _loc2_ = (this.maxx - this.minx) * this.unitsPerUnit / this.POINTS_DISTANCE;
			if (Const.INDICATOR_ENABLED && this.myController && this.myController.currentIntervalLevel >= 0)
			{
				let context = new Context();
				context.count = _loc2_;
				context.lastMinute = this.lastMinute;
				context = this.adjustBarChartContext(context, this.myController.currentIntervalLevel);
				this.lastMinute = context.lastMinute;
				this.count = context.count;
				this.unitsPerUnit = this.count * this.POINTS_DISTANCE / (this.maxx - this.minx);
			}
			else
			{
				this.count = Math.min(_loc2_, Math.abs(this.lastMinute - this.getOldestBaseMinute()));
			}
			this.minutePix = (this.maxx - this.minx) / this.count;
			this.precomputeContexts();
			this.update();
		}
	}

	export interface MinMaxMedPrice
	{
		maxPrice: number;
		minPrice: number;
		medPrice: number;
	}

	export class Context
		//extends ViewPoint
		implements MinMaxMedPrice
	{
		[key: string]: any;

		//lastMinute: number;
		//count: number;
		verticalScaling: string;

		maxPrice: number;
		minPrice: number;
		medPrice: number;

		maxPriceRange: number;

		maxValue: number;
		minValue: number;

		maxVolume: number;

		maxRangeLowerBound: number;
		maxRangeUpperBound: number;

		plusVariation: number;
		minusVariation: number;

		scaleVariation: number;
		localYAdjustment: number;
		plusSize: number;

		lastMinute: number;
		count: number;
	}
}
