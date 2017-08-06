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
		constructor(public skip: number, public interval: number) { }
	}

	export class EventCallback
	{
		constructor(public func: { (p1: any): void }, public param: any) { }
	}

	export interface IDataUnitContainer
	{
		getFirstDataUnit(): DataUnit | null;
		getLastDataUnit(param1?: DataSeries): DataUnit | null;
	}

	export abstract class IViewPoint
		extends flash.display.Sprite
		implements IDataUnitContainer
	{
		name: string;

		constructor(protected displayManager: com.google.finance.DisplayManager)
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

		abstract highlightPoint(param1: number, param2: { [key: string]: any }): void;
		abstract getMinuteOfX(param1: number): number;

		abstract getIntervalLength(param1: number): number;

		abstract getLayers(): AbstractLayer<IViewPoint>[];
		abstract update(): void;
		abstract removeAllLayers(): void;

		abstract addLayer(param1: string, param2: DataSource, param3: string): AbstractLayer<IViewPoint> | null;
		abstract clearPointInformation(): void;

		abstract getFirstMinute(): number;
		abstract getLastMinute(): number;

		abstract getFirstDataUnit(): DataUnit | null;
		abstract getLastDataUnit(param1: DataSeries): DataUnit | null;

		abstract getLastNotVisibleDataUnit(): DataUnit | null;

		abstract getMinuteXPos(param1: number): number;

		abstract HTMLnotify(param1?: boolean): void;

		abstract isAnimating(): boolean;

		myController: com.google.finance.Controller;

		abstract precomputeContexts(): void;

		abstract renderLayers(): void;

		abstract setNewCount(param1: number, param2?: boolean): void;

		abstract setNewSize(param1: Bounds): void;


		abstract zoomIn_Handler(p1: number, p2: number): void;
		abstract zoomingAnimation_ticker(param1: IViewPoint, param2: number, param3: boolean): void;
		abstract zoomChart_Handler(p1: number, p2: number): void;
		abstract moveChartBy_Handler(p1: number): void;
		abstract commitOffset_Handler(): void;
		abstract zoomInMinutes_Handler(p1: Context, p2: boolean): void;
		abstract zoomingAnimation_init(p1: Context): void;
		abstract newFinalAnimationState(param1: ViewPointState): void;
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


		protected drawingLayers: AbstractDrawingLayer<ViewPoint>[];

		private layersManager: com.google.finance.LayersManager;

		private topCanvas: flash.display.Sprite;
		
		public layersContext: Context;

		private static readonly MIN_ZOOM_CHART_AMOUNT = 6;

		medPriceY = 0;

		private xOffset = 0;

		protected descriptiveLayers: AbstractLayer<ViewPoint>[];

		bottomTextHeight = 0;

		protected zoomingFinalState: Context | null;

		maxPriceRangeViewSize: number;

		topMargin: number;
		
		private lastNotifyMinute = 0;

		protected priceSkip: number;

		protected zoomingInitialState: Context;

		protected countOffset: number;

		static readonly MAX_EDGE_DISTANCE = 25;

		private firstNotifyMinute = 0;

		readonly V_OFFSET = 2;

		protected myLabel: flash.text.TextField;

		protected forcedLayersContext: Context;

		readonly POINTS_DISTANCE = 1.5;

		private unitsPerUnit = 3;

		static readonly MIN_DISTANCE_BETWEEN_LOG_H_LINES = 12;

		static readonly MIN_EDGE_DISTANCE = 20;

		display: string;

		constructor(param1: com.google.finance.DisplayManager)
		{
			super(notnull(param1));

			this.bg = new flash.display.Sprite("bg");
			this.addChild(this.bg);
			this.textCanvas = new flash.display.Sprite("textCanvas");
			this.addChild(this.textCanvas);
			this.topCanvas = new flash.display.Sprite("topCanvas");
			this.addChild(this.topCanvas);
			this.dateTextFormat = new flash.text.TextFormat("Verdana", 9, 0);
			this.hourTextFormat = new flash.text.TextFormat("Verdana", 9, 0);
			this.priceTextFormat = new flash.text.TextFormat("Verdana", 10, 0);
			this.priceTextFormat.align = flash.text.TextFormatAlign.RIGHT;
			this.drawingLayers = [];
			this.descriptiveLayers = [];
			this.medPriceY = (this.maxy - this.miny) / 2;
			this.maxPriceRangeViewSize = this.maxy - this.miny - ViewPoint.MIN_EDGE_DISTANCE - ViewPoint.MAX_EDGE_DISTANCE;
			this.lastMinute = 0;
		}

		static sessionVisible(param1: DataUnit, param2: DataUnit, param3: Context): boolean
		{
			let _loc4_ = param3.lastMinute;
			let _loc5_ = param3.lastMinute - param3.count;
			if (param1 && param1.relativeMinutes >= _loc5_ && param1.relativeMinutes <= _loc4_)
				return true;

			if (param2 && param2.relativeMinutes >= _loc5_ && param2.relativeMinutes <= _loc4_)
				return true;

			if (param1.relativeMinutes <= _loc5_ && param2.relativeMinutes >= _loc4_)
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
				let _loc1_ = this.myController.mainManager.layersManager;
				if (_loc1_)
					return _loc1_.getFirstDataSource();
			}
			return null;
		}

		private clearTextCanvas()
		{
			Utils.removeAllChildren(this.textCanvas);
		}

		adjustBarChartContext(param1: Context, param2: number)
		{
			let _loc3_ = param1.count;
			let _loc4_ = param1.lastMinute;
			let _loc5_ = (this.getMarketDayLength() + 1) * Const.INTERVAL_PERIODS[param2].maxdays;
			let _loc6_ = (this.getMarketDayLength() + 1) * Const.INTERVAL_PERIODS[param2].mindays;
			if (_loc3_ > _loc5_)
				_loc3_ = _loc5_;
			else if (_loc3_ < _loc6_)
				_loc3_ = _loc6_;

			let _loc7_ = this.getBaseDataSource();
			if (_loc7_)
			{
				let _loc8_ = Const.getDetailLevelInterval(param2);
				let _loc9_ = _loc7_.data.getPointsInIntervalArray(_loc8_);
				if (_loc9_ && _loc9_.length > 0)
				{
					_loc5_ = _loc4_ - Math.max(_loc7_.firstOpenRelativeMinutes, _loc9_[0].relativeMinutes);
					if (_loc5_ < _loc6_)
					{
						_loc3_ = _loc6_;
						_loc4_ = _loc4_ + (_loc6_ - _loc5_);
					}
					else if (_loc3_ > _loc5_)
					{
						_loc3_ = _loc5_;
					}
				}
			}
			if (_loc3_ !== param1.count)
				return this.getNewContext(_loc4_, _loc3_);

			return param1;
		}

		private trySnapping()
		{
			if (MainManager.paramsObj.snapping === "false")
				return;

			let dataSource = this.getBaseDataSource();
			if (!dataSource)
				return;

			let _loc1_ = dataSource.data;
			let _loc2_ = this.getSnapLevel();
			let _loc3_ = this.getClosestPoint(this.getLastMinute(), _loc2_);
			let _loc4_ = this.getIntervalLength(Math.abs(_loc3_.relativeMinutes - this.getLastMinute()));
			if (_loc4_ < 15)
				this.minutesOffset = this.minutesOffset + (_loc3_.relativeMinutes - this.getLastMinute());
		}

		getIntervalForLength(param1: { count: number }, param2: number): number
		{
			return param2 * param1.count / (this.maxx - this.minx);
		}

		removeAllLayers()
		{
			let _loc1_ = 0;
			_loc1_ = 0;
			while (_loc1_ < this.drawingLayers.length)
			{
				this.removeChild(this.drawingLayers[_loc1_]);
				_loc1_++;
			}
			_loc1_ = 0;
			while (_loc1_ < this.descriptiveLayers.length)
			{
				this.removeChild(this.descriptiveLayers[_loc1_]);
				_loc1_++;
			}
			this.drawingLayers = [];
			this.descriptiveLayers = [];
		}

		protected getQuoteType(): number
		{
			if (this.myController)
				return this.myController.mainManager.getQuoteType();

			return Const.COMPANY;
		}

		getSnapLevel(): number
		{
			let _loc1_ = notnull(this.getBaseDataSource()).data;
			let _loc2_ = this.minutePix * _loc1_.marketDayLength;
			if (_loc2_ > 40)
				return Const.SNAP_DAY;

			if (_loc2_ > 15)
				return Const.SNAP_WEEK;

			if (_loc2_ * 20 > 40)
				return Const.SNAP_MONTH;

			return Const.SNAP_YEAR;
		}

		static addTextField(param1: flash.display.Sprite, param2: string, param3: number, param4: number, param5: number, param6: number, param7: string, param8: flash.text.TextFormat, param9?: string): flash.text.TextField
		{
			//if (!param2)
			//	return null;
			let _loc10_ = new flash.text.TextField();
			_loc10_.x = param3;
			_loc10_.y = param4;
			_loc10_.width = param5;
			_loc10_.height = param6;
			param8.align = param7;
			_loc10_.defaultTextFormat = param8;
			_loc10_.selectable = false;
			if (param7 === "center")
			{
				_loc10_.x = param3 + param5 / 2;
				_loc10_.width = 0;
				_loc10_.autoSize = flash.text.TextFieldAutoSize.CENTER;
			}
			if (param9)
				_loc10_.autoSize = param9;

			_loc10_.text = param2;
			param1.addChild(_loc10_);
			return _loc10_;
		}

		removeLayer(param1: string, param2?: DataSource)
		{
			let _loc3_ = this.getLayerIndex(param1, this.drawingLayers, param2);
			if (_loc3_ !== -1)
			{
				this.removeChild(this.drawingLayers[_loc3_]);
				this.drawingLayers.splice(_loc3_, 1);
			}
			_loc3_ = this.getLayerIndex(param1, this.descriptiveLayers, param2);
			if (_loc3_ !== -1)
			{
				this.removeChild(this.descriptiveLayers[_loc3_]);
				this.descriptiveLayers.splice(_loc3_, 1);
			}
		}

		getXPos(param1: DataUnit): number
		{
			return this.getMinuteXPos(param1.relativeMinutes);
		}

		private generateEvent(param1: number, param2: DataSource, param3 = 2, param4?: EventCallback[])
		{
			let _loc5_ = EventFactory.getEvent(param1, param2.quoteName, param3);
			_loc5_.callbacks = param4;
			let _loc6_ = this.displayManager.mainManager.dataManager;
			_loc6_.expectEvent(_loc5_);
			_loc6_.eventHandler(_loc5_);
		}

		addLayer(param1: string, param2: DataSource, param3: string): AbstractLayer<IViewPoint> | null
		{
			let LayerClass: typeof AbstractLayer;
			let layerType = param1;
			let dataSource = param2;
			let id = param3;
			if (layerType === "")
				return null;

			console.log("addLayer", param1)

			try
			{
				LayerClass = getDefinitionByName("com.google.finance." + layerType) as typeof AbstractLayer;
			}
			catch (re /*: ReferenceError*/)
			{
				console.log("com.google.finance." + layerType + " was not found");
				return null;
			}

			let layer = new LayerClass(this, dataSource);
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

		highlightPoint(param1: number, param2: { [key: string]: any })
		{
			for (let _loc3_ = 0; _loc3_ < this.drawingLayers.length; _loc3_++)
			{
				let _loc4_ = this.drawingLayers[_loc3_];
				_loc4_.highlightPoint(this.layersContext, param1, param2);
			}
		}

		getNewestMinute(): number
		{
			let _loc1_ = 0;
			for (let _loc2_ = 0; _loc2_ < this.drawingLayers.length; _loc2_++)
			{
				let _loc3_ = this.drawingLayers[_loc2_];
				let _loc4_ = _loc3_.getNewestMinute();
				if (_loc1_ < _loc4_)
					_loc1_ = Number(_loc4_);
			}
			return _loc1_;
		}

		getLastMinute(): number
		{
			return this.lastMinute + this.minutesOffset;
		}

		checkEvents(param1: number = -1, param2?: EventCallback[])
		{
			let _loc9_ = false;
			let _loc3_ = this.getBaseDataSource();
			if (!_loc3_)
				return;

			let _loc4_ = _loc3_.data.days.length - 1;
			let _loc5_ = DataSource.getMinuteMetaIndex(this.lastMinute - this.count, _loc3_.data.days, _loc3_.data.units);
			let _loc6_ = DataSource.getMinuteMetaIndex(this.lastMinute, _loc3_.data.days, _loc3_.data.units);
			if (_loc4_ - _loc6_ <= Const.INTRADAY_DAYS && _loc6_ - _loc5_ <= Const.INTRADAY_DAYS)
				this.generateEventForAllSources(Const.GET_5D_DATA);

			let _loc7_ = _loc4_ - _loc5_;
			if (Const.INDICATOR_ENABLED && !this.displayManager.isDifferentMarketSessionComparison())
			{
				let _loc8_ = param1 >= 0 ? param1 : this.getDetailLevelForTechnicalStyle();
				_loc9_ = !this.myController || this.myController.currentIntervalLevel === -1;
				let _loc10_ = this.displayManager.hasOhlcRequiredIndicator() || !_loc9_ ? Number(ChartEventTypes.OHLC_REQUIRED) : ChartEventTypes.OPTIONAL;
				switch (_loc8_)
				{
					case Const.INTRADAY:
						this.generateEventForAllSources(Const.GET_5D_DATA, _loc10_, param2);
						if (MainManager.paramsObj.forceDisplayExtendedHours === "true" || MainManager.paramsObj.displayExtendedHours === "true")
							this.generateEventForAllSources(Const.GET_AH_DATA, _loc10_);

						if (this.getFirstMinute() === this.getOldestBaseMinute())
						{
							this.generateEventForAllSources(Const.GET_1Y_DATA, _loc10_);
							break;
						}
						break;
					case Const.FIVE_MINUTES:
						this.generateEventForAllSources(Const.GET_1Y_DATA, _loc10_);
						this.generateEventForAllSources(Const.GET_10D_DATA, _loc10_, param2);
						if (_loc9_ && (MainManager.paramsObj.forceDisplayExtendedHours === "true" || MainManager.paramsObj.displayExtendedHours === "true"))
						{
							this.generateEventForAllSources(Const.GET_AH_DATA, _loc10_);
							break;
						}
						break;
					case Const.HALF_HOUR:
						this.generateEventForAllSources(Const.GET_1Y_DATA, _loc10_);
						this.generateEventForAllSources(Const.GET_30D_DATA, _loc10_, param2);
						if (_loc9_ && (MainManager.paramsObj.forceDisplayExtendedHours === "true" || MainManager.paramsObj.displayExtendedHours === "true"))
						{
							this.generateEventForAllSources(Const.GET_AH_DATA, _loc10_);
							break;
						}
						break;
					case Const.DAILY:
						this.generateEventForAllSources(Const.GET_1Y_DATA, _loc10_, param2);
						break;
					case Const.WEEKLY:
						this.generateEventForAllSources(Const.GET_5Y_DATA, _loc10_, param2);
						break;
				}
			}
			else
			{
				if (this.displayManager.isDifferentMarketSessionComparison())
					this.generateEventForAllSources(Const.GET_5Y_DATA);

				this.generateEventForAllSources(Const.GET_1Y_DATA);
			}
			if (_loc7_ >= Const.DAILY_DAYS)
				this.generateEventForAllSources(Const.GET_40Y_DATA);
		}

		getDetailLevelForDifferentMarketSessionComparison(param1 = NaN, param2 = NaN): number
		{
			let _loc3_ = 0;
			let _loc4_ = 0;
			if (!isNaN(param2))
				_loc3_ = param2;
			else
				_loc3_ = this.getLastMinute();

			if (!isNaN(param1))
				_loc4_ = param1;
			else
				_loc4_ = this.count;

			if (_loc4_ - _loc3_ <= Const.DAILY_DAYS)
				return Const.DAILY;

			return Const.WEEKLY;
		}

		getLayers(): AbstractLayer<IViewPoint>[]
		{
			let _loc1_: AbstractLayer<ViewPoint>[] = [];
			return _loc1_.concat(this.drawingLayers, this.descriptiveLayers);
		}

		clearAllChildrenFromTopCanvas()
		{
			while (this.topCanvas.numChildren > 0)
				this.topCanvas.removeChildAt(0);
		}

		private getClosestPoint(param1: number, param2: number): DataUnit
		{
			let _loc4_: number[];
			let _loc3_ = notnull(this.getBaseDataSource()).data;
			switch (param2)
			{
				default:
					throw new Error();
				case Const.SNAP_DAY:
					_loc4_ = _loc3_.days;
					break;
				case Const.SNAP_WEEK:
					_loc4_ = _loc3_.fridays;
					break;
				case Const.SNAP_MONTH:
					_loc4_ = _loc3_.firsts;
					break;
				case Const.SNAP_YEAR:
					_loc4_ = _loc3_.years;
					break;
			}
			let _loc5_ = DataSource.getMinuteMetaIndex(param1, _loc4_, _loc3_.units);
			let _loc6_: DataUnit;
			if (_loc4_ === _loc3_.days)
				_loc6_ = _loc3_.units[_loc4_[_loc5_]];
			else
				_loc6_ = _loc3_.units[_loc4_[_loc5_] - 1];

			let _loc7_ = this.getIntervalLength(param1 - _loc6_.relativeMinutes);
			if (_loc5_ < _loc4_.length - 1)
			{
				let _loc8_: DataUnit;

				if (_loc4_ === _loc3_.days)
					_loc8_ = _loc3_.units[_loc4_[_loc5_ + 1]];
				else
					_loc8_ = _loc3_.units[_loc4_[_loc5_ + 1] - 1];

				let _loc9_ = this.getIntervalLength(_loc8_.relativeMinutes - param1);
				if (_loc9_ < _loc7_)
					return _loc8_;

				return _loc6_;
			}
			return _loc6_;
		}

		getOldestBaseMinute(): number
		{
			let _loc1_ = this.getBaseDataSource();
			if (_loc1_)
				return _loc1_.data.getFirstRelativeMinute();

			return 0;
		}

		isAnimating(): boolean
		{
			return !!this.zoomingFinalState;
		}

		zoomInMinutes_Handler(param1: Context, param2 = false)
		{
			let context: Context | null;
			if (Const.INDICATOR_ENABLED && this.myController && this.myController.currentIntervalLevel >= 0)
				context = this.adjustBarChartContext(param1, this.myController.currentIntervalLevel);
			else
				context = this.adjustLineChartContext(param1);

			if (!context)
				return;

			this.setNewCount(Math.floor(context.count), param2);
			this.lastMinute = context.lastMinute;
			this.update(context);
			this.checkEvents();
		}

		private generateEventForAllSources(param1: number, param2 = 2, param3?: EventCallback[])
		{
			for (let _loc4_ = 0; _loc4_ < this.drawingLayers.length; _loc4_++)
			{
				let _loc5_ = this.drawingLayers[_loc4_].dataSource;
				this.generateEvent(param1, _loc5_, param2, param3);
			}
		}

		zoomIn_Handler(param1: number, param2: number)
		{
			let _loc3_ = (param2 - param1) * 1 * this.count / (this.maxx - this.minx);
			let _loc4_ = Math.abs(this.getOldestBaseMinute());
			_loc3_ = Math.min(_loc3_, _loc4_);
			let _loc5_ = this.lastMinute - this.count * (this.maxx - param2) / (this.maxx - this.minx);
			let _loc6_ = this.getNewContext(_loc5_, _loc3_);
			this.zoomInMinutes_Handler(_loc6_);
		}

		getOldestMinute(): number
		{
			let _loc4_ = NaN;
			let _loc1_ = 0;
			for (let _loc2_ = 0; _loc2_ < this.drawingLayers.length; _loc2_++)
			{
				let _loc3_ = this.drawingLayers[_loc2_];
				_loc4_ = _loc3_.getOldestMinute();
				if (_loc1_ > _loc4_)
					_loc1_ = Number(_loc4_);
			}
			return _loc1_;
		}

		zoomingAnimation_ticker(param1: ViewPoint, param2: number, param3: boolean)
		{
			let _loc8_ = NaN;
			let _loc4_ = param1.zoomingInitialState;
			let _loc5_ = notnull(param1.zoomingFinalState);
			let _loc6_ = Utils.cloneObject(_loc4_);
			for (let _loc7_ in _loc4_)
			{
				if (!isNaN(_loc4_[_loc7_]) && !isNaN(_loc5_[_loc7_]))
				{
					_loc8_ = _loc4_[_loc7_] + (_loc5_[_loc7_] - _loc4_[_loc7_]) * (1 - param2);
					_loc6_[_loc7_] = _loc8_;
				}
			}
			param1.zoomInMinutes_Handler(_loc6_);
			if (param2 === 0)
			{
				param1.HTMLnotify(param3);
				param1.zoomingFinalState = null;
			}
			this.displayManager.showContextualStaticInfo();
		}

		renderLayers()
		{
			let _loc1_ = 0;
			_loc1_ = 0;
			while (_loc1_ < this.drawingLayers.length)
			{
				this.drawingLayers[_loc1_].renderLayer(this.layersContext);
				_loc1_++;
			}
			_loc1_ = 0;
			while (_loc1_ < this.descriptiveLayers.length)
			{
				this.descriptiveLayers[_loc1_].renderLayer(this.layersContext);
				_loc1_++;
			}
		}

		getLastDataUnit(param1?: DataSeries): DataUnit | null
		{
			let _loc2_: DataSeries | null = null;
			let _loc7_ = NaN;
			let _loc3_: DataSource | null = null;
			if (param1)
			{
				_loc2_ = param1;
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
				let _loc4_ = _loc2_.units;
				let _loc5_ = new DataUnit(-1, -1, -1, -1);
				let _loc6_ = new Date();
				_loc5_.exchangeDateInUTC = _loc4_[_loc4_.length - 1].exchangeDateInUTC;
				_loc5_.close = _loc4_[_loc4_.length - 1].close;
				_loc5_.time = _loc6_.getTime();
				_loc5_.relativeMinutes = 0;
				if (_loc5_.time < _loc4_[_loc4_.length - 1].time)
					_loc5_.time = _loc4_[_loc4_.length - 1].time;

				return _loc5_;
			}
			if (_loc3_)
				return _loc3_.getVisibleDataUnitForMinute(this.getLastMinute());

			_loc7_ = _loc2_.getRelativeMinuteIndex(this.getLastMinute());
			return _loc2_.units[_loc7_];
		}

		getDetailLevel(param1 = NaN, param2 = NaN, param3?: DataSource): number
		{
			if (this.displayManager.isDifferentMarketSessionComparison())
				return this.getDetailLevelForDifferentMarketSessionComparison(param1, param2);

			let _loc4_ = this.minutePix;
			let _loc5_ = this.getLastMinute();
			let _loc6_ = this.getBaseDataSource();
			let _loc7_ = this.count;
			if (!isNaN(param1))
			{
				_loc4_ = (this.maxx - this.minx) / param1;
				_loc7_ = param1;
			}
			if (isNaN(_loc4_) || !_loc6_)
				return -1;

			if (!isNaN(param2))
				_loc5_ = param2;

			if (param3)
				_loc6_ = param3;

			let _loc8_ = _loc6_.data;
			if (!_loc8_)
				return -1;

			let _loc9_ = _loc6_.data.allSessionsLength() + 1;
			let _loc10_ = _loc9_;
			if (_loc6_.afterHoursData)
				_loc10_ = _loc10_ + (_loc6_.afterHoursData.allSessionsLength() + _loc6_.afterHoursData.dataSessions.length());

			let _loc11_ = _loc8_.getRelativeMinuteIndex(_loc5_);
			let _loc12_ = _loc8_.units[_loc11_].time;
			if (_loc7_ <= Const.INTRADAY_DAYS * _loc10_)
			{
				if (_loc8_.intervalDataContainsTime(_loc12_, Const.INTRADAY_INTERVAL) || _loc8_.intervalDataPreceedsTime(_loc12_, Const.INTRADAY_INTERVAL))
					return Const.INTRADAY;

				if (_loc8_.intervalDataContainsTime(_loc12_, Const.DAILY_INTERVAL, Const.INTRADAY_INTERVAL))
					return Const.DAILY;

				return Const.WEEKLY;
			}
			if (_loc7_ <= Const.DAILY_DAYS * _loc9_)
			{
				if (_loc8_.intervalDataContainsTime(_loc12_, Const.INTRADAY_INTERVAL, Const.DAILY_INTERVAL) || _loc8_.intervalDataPreceedsTime(_loc12_, Const.DAILY_INTERVAL))
					return Const.DAILY;

				return Const.WEEKLY;
			}
			return Const.WEEKLY;
		}

		getFirstDataUnit(): DataUnit | null
		{
			let _loc1_ = this.getBaseDataSource();
			if (!_loc1_)
				return null;

			return _loc1_.getClosestDataUnitAfterMinute(this.getFirstMinute());
		}

		getDisplayManager(): com.google.finance.DisplayManager
		{
			return this.displayManager;
		}

		getDetailLevelForTechnicalStyle(param1 = NaN, param2 = NaN): number
		{
			let _loc3_ = 0;
			let _loc4_ = 0;
			if (this.displayManager.isDifferentMarketSessionComparison())
				return this.getDetailLevelForDifferentMarketSessionComparison(param1, param2);

			if (this.myController && this.myController.currentIntervalLevel >= 0)
				return this.myController.currentIntervalLevel;

			if (!isNaN(param2))
				_loc3_ = param2;
			else
				_loc3_ = this.getLastMinute();

			if (!isNaN(param1))
				_loc4_ = param1;
			else
				_loc4_ = this.count;

			let _loc5_ = this.getQuoteType();
			let _loc6_ = this.getBaseDataSource();
			if (_loc5_ === Const.COMPANY)
			{
				if (_loc6_)
				{
					let _loc9_ = _loc6_.data.getPointsInIntervalArray(Const.INTRADAY_INTERVAL);
					if (_loc9_ && _loc9_.length > 0 && Math.abs(_loc3_ - _loc4_) <= Math.abs(_loc9_[0].relativeMinutes) + 1)
						return Const.INTRADAY;

					let _loc10_ = _loc6_.data.getPointsInIntervalArray(Const.FIVE_MINUTE_INTERVAL);
					if (_loc10_ && _loc10_.length > 0 && Math.abs(_loc3_ - _loc4_) <= Math.abs(_loc10_[0].relativeMinutes) + 1)
						return Const.FIVE_MINUTES;
				}
				else if (Const.DEFAULT_CHART_STYLE_NAME !== Const.LINE_CHART)
				{
					return Const.DEFAULT_D;
				}
			}
			let _loc7_ = Math.abs(_loc3_ - _loc4_) / (this.getMarketDayLength() + 1) + 1;
			let _loc8_: DataSeries | null = !!_loc6_ ? _loc6_.data : null;
			if (_loc7_ <= Const.FIVE_MINUTE_DAYS && _loc5_ === Const.COMPANY && !(_loc8_ && _loc8_.hasNoPointsInIntervalArray(Const.FIVE_MINUTE_INTERVAL)))
				return Const.FIVE_MINUTES;

			if (_loc7_ <= Const.HALF_HOUR_DAYS && _loc5_ === Const.COMPANY && !(_loc8_ && _loc8_.hasNoPointsInIntervalArray(Const.HALF_HOUR_INTERVAL)))
				return Const.HALF_HOUR;

			if (_loc7_ <= Const.DAILY_DAYS && !(_loc8_ && _loc8_.hasNoPointsInIntervalArray(Const.DAILY_INTERVAL)))
				return Const.DAILY;

			return Const.WEEKLY;
		}

		protected getMarketDayLength(): number
		{
			let _loc1_ = this.getBaseDataSource();
			if (!_loc1_)
				return Const.MARKET_DAY_LENGTH;

			return _loc1_.data.marketDayLength;
		}

		setController(param1: com.google.finance.Controller)
		{
			param1.addControlListener(this);
			let _loc2_ = new Bounds(this.minx, this.miny, this.maxx, this.maxy);
			param1.addBounds(_loc2_);
			this.myController = param1;
		}

		checkAfterHoursVisibility(param1: number, param2: number)
		{
			let _loc4_ = NaN;
			let _loc5_ = NaN;
			let _loc3_ = this.displayManager.layersManager;
			if (_loc3_.getStyle() !== com.google.finance.LayersManager.SINGLE)
				return;

			if (MainManager.paramsObj.displayExtendedHours !== "true")
				return;

			if (Const.INDICATOR_ENABLED)
			{
				_loc4_ = this.getDetailLevelForTechnicalStyle(param1);
				_loc5_ = this.getDetailLevelForTechnicalStyle(param2);
				if (_loc5_ >= Const.DAILY && _loc4_ < Const.DAILY)
					this.displayManager.toggleAllAfterHoursSessions(false);
				else if (_loc4_ >= Const.DAILY && _loc5_ < Const.DAILY)
					this.displayManager.toggleAllAfterHoursSessions(true);
			}
			else
			{
				_loc4_ = this.getDetailLevel(param1);
				_loc5_ = this.getDetailLevel(param2);
				if (_loc5_ > Const.INTRADAY && _loc4_ === Const.INTRADAY)
					this.displayManager.toggleAllAfterHoursSessions(false);
				else if (_loc4_ > Const.INTRADAY && _loc5_ === Const.INTRADAY)
					this.displayManager.toggleAllAfterHoursSessions(true);
			}
		}

		getLayer(param1: string, param2?: DataSource): AbstractLayer<ViewPoint> | null
		{
			let _loc3_ = this.getLayerIndex(param1, this.drawingLayers, param2);
			if (_loc3_ !== -1)
				return this.drawingLayers[_loc3_];

			_loc3_ = this.getLayerIndex(param1, this.descriptiveLayers, param2);
			if (_loc3_ !== -1)
				return this.descriptiveLayers[_loc3_];

			return null;
		}

		getFirstMinute(): number
		{
			return this.lastMinute + this.minutesOffset - this.count;
		}

		moveChartBy_Handler(param1: number)
		{
			let _loc2_ = Math.floor(this.lastMinute - Number(param1 / this.POINTS_DISTANCE) * this.unitsPerUnit);
			let _loc3_ = Math.ceil(_loc2_ - this.count);
			for (let _loc4_ = 0; _loc4_ < this.drawingLayers.length; _loc4_++)
			{
				let _loc9_ = this.drawingLayers[_loc4_].dataSource;
				let _loc10_ = _loc9_.data.getFirstRelativeMinute();
				if (_loc3_ < _loc10_)
				{
					if (Const.getZoomLevel(this.count, _loc9_.data.marketDayLength) >= Const.SCALE_5D)
						this.generateEvent(Const.GET_1Y_DATA, _loc9_);
				}
			}
			let _loc5_ = Math.abs(this.getOldestBaseMinute());
			if (this.count > _loc5_)
				return;

			let _loc6_ = Number(this.getOldestBaseMinute());
			if (Const.INDICATOR_ENABLED && this.myController && this.myController.currentIntervalLevel >= 0)
			{
				let _loc11_ = this.getBaseDataSource();
				if (_loc11_)
				{
					let _loc12_ = _loc11_.data.getPointsInIntervalArray(Const.getDetailLevelInterval(this.myController.currentIntervalLevel));
					_loc6_ = Number(!_loc12_ || _loc12_.length === 0 ? 0 : Math.max(_loc12_[0].relativeMinutes, _loc11_.firstOpenRelativeMinutes));
				}
				else
				{
					_loc6_ = 0;
				}
			}
			let _loc7_ = this.lastMinute + this.minutesOffset;
			if (_loc3_ < _loc6_)
			{
				this.minutesOffset = _loc6_ + this.count - this.lastMinute;
				this.checkAfterHoursVisibilityWhenChartMoved(_loc7_);
				this.update();
				return;
			}
			let _loc8_ = this.getNewestMinute();
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
				_loc3_ = _loc3_ * param2;

			_loc3_ = Math.max(_loc3_, ViewPoint.MIN_ZOOM_CHART_AMOUNT);
			let _loc4_ = this.POINTS_DISTANCE * _loc3_ / this.unitsPerUnit;
			switch (param1)
			{
				case Const.BACKWARD:
					this.zoomIn_Handler(this.minx - _loc4_, this.maxx);
					break;
				case Const.FORWARD:
					this.zoomIn_Handler(this.minx + _loc4_, this.maxx);
					break;
			}
		}

		commitOffset_Handler()
		{
			this.lastMinute = this.lastMinute + this.minutesOffset;
			this.minutesOffset = 0;
			this.update();
			this.checkEvents();
		}

		getLastNotVisibleDataUnit(): DataUnit | null
		{
			let _loc1_ = notnull(this.getBaseDataSource()).data;
			if (!_loc1_)
				return null;

			let _loc2_ = _loc1_.getRelativeMinuteIndex(this.getFirstMinute());
			return _loc1_.units[_loc2_];
		}

		HTMLnotify(param1 = false)
		{
			let _loc2_ = this.getLastMinute() - this.lastNotifyMinute;
			let _loc3_ = this.minutePix * _loc2_;
			let _loc4_ = this.getFirstMinute() - this.firstNotifyMinute;
			let _loc5_ = this.minutePix * _loc4_;
			if (Math.abs(_loc5_) > 20 || Math.abs(_loc3_) > 20)
			{
				this.displayManager.HTMLnotify(this.name, param1);
				this.lastNotifyMinute = this.getLastMinute();
				this.firstNotifyMinute = this.getFirstMinute();
			}
		}

		adjustLineChartContext(param1: Context)
		{
			let _loc2_ = param1.count;
			let _loc3_ = param1.lastMinute;
			let _loc4_ = this.getMinDisplayMinutes(this.getBaseDataSource());
			if (_loc2_ < _loc4_)
			{
				_loc2_ = _loc4_;
				if (this.count === _loc2_)
					return null;
			}

			let _loc5_ = Math.abs(_loc3_ - this.getOldestBaseMinute());
			_loc2_ = Math.min(_loc2_, _loc5_);
			let _loc6_ = this.POINTS_DISTANCE * _loc2_ / (this.maxx - this.minx);
			if (_loc6_ < 0.3 && !this.displayManager.isDifferentMarketSessionComparison())
				return null;

			let _loc7_ = this.getNewestMinute();
			if (_loc3_ >= _loc7_)
				_loc3_ = _loc7_;

			if (_loc2_ !== param1.count || _loc3_ !== param1.lastMinute)
				return this.getNewContext(_loc3_, _loc2_);

			return param1;
		}

		update(param1?: Context)
		{
			if (!this.stage || this.stage.stageWidth === 0)
				return;

			if (param1)
				this.layersContext = param1;
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
			let _loc3_ = NaN;
			let _loc7_ = NaN;
			_loc3_ = this.minutePix;
			let _loc4_ = Const.INTRADAY_INTERVAL / 60;
			let _loc5_ = 0;
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
				case Const.INTRADAY:
					while (_loc3_ * _loc6_ * _loc4_ < this.POINTS_DISTANCE)
						_loc6_ = Number(_loc6_ * 2);

					return new SkipInterval(_loc6_, _loc6_ * Const.INTRADAY_INTERVAL);
				case Const.DAILY:
					return new SkipInterval(1, Const.DAILY_INTERVAL);
				case Const.WEEKLY:
					_loc7_ = _loc3_ * 5 * this.getMarketDayLength();
					while (_loc6_ * _loc7_ < this.POINTS_DISTANCE)
						_loc6_ = Number(_loc6_ * 2);

					return new SkipInterval(_loc6_, _loc6_ * Const.WEEKLY_INTERVAL);
				default:
					return new SkipInterval(0, -1);
			}
		}

		newFinalAnimationState(param1: Context)
		{
			let _loc2_ = Math.max(param1.count, this.getMinDisplayMinutes(this.getBaseDataSource()));
			this.zoomingFinalState = this.getNewContext(param1.lastMinute, _loc2_);
		}

		private checkAfterHoursVisibilityWhenChartMoved(param1: number)
		{
			if (!Const.INDICATOR_ENABLED)
				return;

			if (this.displayManager.layersManager.getStyle() !== com.google.finance.LayersManager.SINGLE)
				return;

			if (MainManager.paramsObj.displayExtendedHours !== "true")
				return;

			let _loc2_ = this.getDetailLevelForTechnicalStyle(this.count, param1);
			let _loc3_ = this.getDetailLevelForTechnicalStyle();
			if (_loc3_ >= Const.DAILY && _loc2_ < Const.DAILY)
				this.displayManager.toggleAllAfterHoursSessions(false);
			else if (_loc2_ >= Const.DAILY && _loc3_ < Const.DAILY)
				this.displayManager.toggleAllAfterHoursSessions(true);
		}

		addChildToTopCanvas(param1: flash.display.Sprite)
		{
			this.topCanvas.addChild(param1);
		}

		updateObjectLayers()
		{
			for (let _loc1_ = 0; _loc1_ < this.descriptiveLayers.length; _loc1_++)
			{
				if (this.descriptiveLayers[_loc1_] instanceof PinPointsLayer || this.descriptiveLayers[_loc1_] instanceof IntervalBasedPinPointsLayer || this.descriptiveLayers[_loc1_] instanceof IndependentObjectsLayer || this.descriptiveLayers[_loc1_] instanceof IntervalBasedIndependentObjectsLayer)
					this.descriptiveLayers[_loc1_].renderLayer(this.layersContext);
			}
		}

		private drawBorders()
		{
			this.bg.graphics.clear();
			this.bg.graphics.beginFill(0xffffff, 1);
			this.bg.graphics.drawRect(this.minx, this.miny, this.maxx - this.minx, this.maxy - this.miny);
			this.bg.graphics.endFill();
			this.bg.graphics.lineStyle(0, ViewPoint.BORDER_DARK_COLOR, 1);
			this.bg.graphics.moveTo(this.minx - 1, this.miny);
			this.bg.graphics.lineTo(this.maxx, this.miny);
			this.bg.graphics.lineTo(this.maxx, this.maxy);
			this.bg.graphics.lineStyle(0, ViewPoint.BORDER_LIGHT_COLOR, 1);
			this.bg.graphics.lineTo(this.minx - 1, this.maxy);
			this.bg.graphics.lineStyle(0, ViewPoint.BORDER_DARK_COLOR, 1);
			this.bg.graphics.lineTo(this.minx - 1, this.miny);
		}

		clearPointInformation()
		{
			for (let _loc1_ = 0; _loc1_ < this.drawingLayers.length; _loc1_++)
			{
				this.drawingLayers[_loc1_].clearHighlight();
			}
		}

		getNewContext(param1: number, param2: number): Context
		{
			let _loc3_ = new Context();
			_loc3_.lastMinute = param1;
			_loc3_.count = param2;
			_loc3_.verticalScaling = MainManager.paramsObj.verticalScaling;
			for (let _loc4_ = 0; _loc4_ < this.drawingLayers.length; _loc4_++)
			{
				let _loc5_ = this.drawingLayers[_loc4_];
				_loc3_ = _loc5_.getContext(_loc3_);
			}
			return _loc3_;
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
			let _loc2_ = param1 - this.count;
			let _loc3_ = this.getOldestBaseMinute();
			if (param1 - this.count < _loc3_)
				param1 = Number(_loc3_ + this.count);

			if (param1 > 0)
				param1 = 0;

			this.lastMinute = param1;
			this.update();
		}

		private getLayerIndex(param1: string, param2: AbstractLayer<ViewPoint>[], param3?: DataSource): number
		{
			for (let _loc4_ = 0; _loc4_ < param2.length; _loc4_++)
			{
				let _loc5_ = param2[_loc4_];
				if (_loc5_.layerId === param1 && (!param3 || _loc5_.dataSource === param3))
					return _loc4_;
			}
			return -1;
		}

		precomputeContexts()
		{
			let _loc1_ = NaN;
			let _loc2_ = NaN;
			this.layersContext = this.getNewContext(this.getLastMinute(), this.count);
			if (this.zoomingFinalState)
			{
				_loc1_ = this.zoomingFinalState.lastMinute;
				_loc2_ = this.zoomingFinalState.count;
				this.zoomingFinalState = this.getNewContext(_loc1_, _loc2_);
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

		zoomingAnimation_init(param1: Context)
		{
			this.zoomingInitialState = Utils.cloneObject(this.layersContext);
			this.newFinalAnimationState(param1);
		}

		getMinuteOfX(param1: number): number
		{
			return this.getLastMinute() - (this.maxx - param1) * this.count / (this.maxx - this.minx);
		}

		setNewSize(param1: Bounds)
		{
			if (this.minx === param1.minx &&
				this.miny === param1.miny &&
				this.maxx === param1.maxx &&
				this.maxy === param1.maxy)
			{
				return;
			}

			let _loc5_ = NaN;
			if (this.myController)
			{
				let _loc3_ = new Bounds(this.minx, this.miny, this.maxx, this.maxy);
				this.myController.replaceBounds(_loc3_, param1);
			}
			this.minx = param1.minx;
			this.miny = param1.miny;
			this.maxx = param1.maxx;
			this.maxy = param1.maxy;
			this.drawBorders();
			if (this.myLabel)
			{
				this.myLabel.x = this.minx + 5;
				this.myLabel.y = this.miny + 5;
			}
			this.medPriceY = (this.maxy - this.miny) / 2;
			this.maxPriceRangeViewSize = this.maxy - this.miny - ViewPoint.MIN_EDGE_DISTANCE - ViewPoint.MAX_EDGE_DISTANCE;
			let _loc2_ = (this.maxx - this.minx) * this.unitsPerUnit / this.POINTS_DISTANCE;
			if (Const.INDICATOR_ENABLED && this.myController && this.myController.currentIntervalLevel >= 0)
			{
				let _loc4_ = new Context();
				_loc4_.count = _loc2_;
				_loc4_.lastMinute = this.lastMinute;
				_loc4_ = this.adjustBarChartContext(_loc4_, this.myController.currentIntervalLevel);
				this.lastMinute = _loc4_.lastMinute;
				this.count = _loc4_.count;
				this.unitsPerUnit = this.count * this.POINTS_DISTANCE / (this.maxx - this.minx);
			}
			else
			{
				_loc5_ = Math.abs(this.lastMinute - this.getOldestBaseMinute());
				this.count = Math.min(_loc2_, _loc5_);
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
