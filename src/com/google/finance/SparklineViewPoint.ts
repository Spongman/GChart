/// <reference path="ViewPoint.ts" />

namespace com.google.finance
{
	// import flash.display.Sprite;
	// import flash.display.SimpleButton;
	// import flash.utils.getDefinitionByName;
	// import flash.events.Event;
	// import flash.text.TextFormat;
	// import flash.display.Bitmap;
	// import flash.events.MouseEvent;

	export class SparklineViewPoint
		extends IViewPoint
	{
		// private windowMask: flash.display.Sprite;

		static readonly TEXT_FIELD_HEIGHT = 50;

		private leftScrollButton: flash.display.SimpleButton;

		sparkLastMinute: number;

		private currentSparkTimeLength = 0;

		my_minx: number;

		my_miny: number;

		private readonly ScrollbarButtonRight = SparklineViewPoint_ScrollbarButtonRight;

		private sparklineType: string;

		private graySparkline: com.google.finance.SparklineLayer;

		sparkCount: number;

		windowLayer: com.google.finance.WindowLayer;

		bg: flash.display.Sprite;

		my_maxx: number;

		private layers: AbstractLayer<SparklineViewPoint>[];

		my_maxy: number;

		private passiveLayers: AbstractLayer<SparklineViewPoint>[];

		private sparkline: com.google.finance.SparklineLayer;

		lastMinute: number;

		dataSource: com.google.finance.DataSource;

		// public myController: com.google.finance.Controller;

		static readonly TEXT_VERTICAL_OFFSET = -1;

		sparkButtonMinutes: number;

		sparkMinutesOffset: number;

		static readonly TEXT_HORIZONTAL_OFFSET = 5;

		hourTextFormat: flash.text.TextFormat;

		// private displayManager: com.google.finance.DisplayManager;

		private rightScrollButton: flash.display.SimpleButton;

		private dataManager: com.google.finance.DataManager;

		priceTextFormat: flash.text.TextFormat;

		readonly POINTS_DISTANCE = 2;

		dateTextFormat: flash.text.TextFormat;

		topBorder = 0;

		private displayThresholds: { chartDays: number, sparkDays: number }[];

		// private textCanvas: flash.display.Sprite;

		static readonly TEXT_FIELD_WIDTH = 200;

		private scrollBg: flash.display.Sprite;

		private readonly ScrollbarButtonLeft = SparklineViewPoint_ScrollbarButtonLeft;

		constructor(param1: com.google.finance.DataManager, param2: com.google.finance.DisplayManager)
		{
			super(param2);

			this.dataManager = param1;
			this.bg = new flash.display.Sprite("bg");
			this.addChild(this.bg);
			this.textCanvas = new flash.display.Sprite("textCanvas");
			this.addChild(this.textCanvas);
			this.dateTextFormat = new flash.text.TextFormat("Verdana", 10, 0x6f6f6f);
			this.dateTextFormat.bold = false;
			this.priceTextFormat = new flash.text.TextFormat("_sans", 10, 0x666666);
			this.priceTextFormat.align = "right";
			this.leftScrollButton = new flash.display.SimpleButton("leftScrollButton");
			let _loc3_ = new this.ScrollbarButtonLeft();
			this.leftScrollButton.downState = _loc3_;
			this.leftScrollButton.overState = _loc3_;
			this.leftScrollButton.upState = _loc3_;
			this.leftScrollButton.hitTestState = _loc3_;
			this.leftScrollButton.useHandCursor = true;
			this.addChild(this.leftScrollButton);
			this.rightScrollButton = new flash.display.SimpleButton("rightScrollButton");
			let _loc4_ = new this.ScrollbarButtonRight();
			this.rightScrollButton.downState = _loc4_;
			this.rightScrollButton.overState = _loc4_;
			this.rightScrollButton.upState = _loc4_;
			this.rightScrollButton.hitTestState = _loc4_;
			this.rightScrollButton.useHandCursor = true;
			this.addChild(this.rightScrollButton);
			this.scrollBg = new flash.display.Sprite("scrollBg");
			this.bg.addChild(this.scrollBg);
			this.positionElements();
			this.leftScrollButton.addEventListener(MouseEvents.MOUSE_DOWN, flash.display.Stage.bind(this.onMouseDown, this));
			this.rightScrollButton.addEventListener(MouseEvents.MOUSE_DOWN, flash.display.Stage.bind(this.onMouseDown, this));
			this.leftScrollButton.addEventListener(MouseEvents.MOUSE_UP, flash.display.Stage.bind(this.onMouseUp, this));
			this.rightScrollButton.addEventListener(MouseEvents.MOUSE_UP, flash.display.Stage.bind(this.onMouseUp, this));
			this.initDisplayCountThresholds();
			if (MainManager.paramsObj.sparklineType === Const.STATIC || MainManager.paramsObj.sparklineType === Const.DYNAMIC)
				this.sparklineType = MainManager.paramsObj.sparklineType;
			else
				this.sparklineType = Const.STATIC;

			this.layers = [];
			this.passiveLayers = [];
			this.sparkMinutesOffset = 0;
		}

		getIntervalLength(param1: number): number
		{
			return param1 * (this.maxx - this.minx) / this.sparkCount;
		}

		private redraw() 
		{
			this.adjustWindowToSparkline();

			this.resetCanvas();
			this.renderLayers();
			this.moveMask();
			this.renderPassiveLayers();
		}

		removeAllLayers() 
		{
			for (let _loc1_ = 0; _loc1_ < this.layers.length; _loc1_++)
			{
				this.removeChild(this.layers[_loc1_]);
			}
			this.layers = [];
		}

		setNewSize(param1: Bounds) 
		{
			this.my_minx = param1.minx;
			this.my_miny = param1.miny;
			this.my_maxx = param1.maxx;
			this.my_maxy = param1.maxy;
			this.drawBorders();
			this.positionElements();
			if (this.sparkline)
			{
				this.sparkline.fillColor = Const.SPARK_ACTIVE_FILL_COLOR;
				this.sparkline.lineColor = Const.SPARK_ACTIVE_LINE_COLOR;
				this.sparkline.renderLayer();
			}
			if (this.graySparkline)
			{
				this.graySparkline.fillColor = Const.SPARK_INACTIVE_FILL_COLOR;
				this.graySparkline.lineColor = Const.SPARK_INACTIVE_LINE_COLOR;
				this.graySparkline.renderLayer();
			}
			if (this.windowLayer)
			{
				this.windowLayer.updateFixedElements();
				this.update();
			}
		}

		getWidth(): number
		{
			return this.maxx - this.minx;
		}

		generateEvent(param1: number, param2: com.google.finance.DataSource) 
		{
			let _loc3_ = EventFactory.getEvent(param1, param2.quoteName, ChartEventTypes.OPTIONAL);
			this.dataManager.expectEvent(_loc3_);
			this.dataManager.eventHandler(_loc3_);
		}

		addLayer(param1: string, param2: com.google.finance.DataSource, param3: string): AbstractLayer<IViewPoint> | null
		{
			let _loc6_ = 0;
			if (param1 === "")
				return null;

			this.addDataSource(param2);
			let _loc4_ = getDefinitionByName("com.google.finance." + param1) as typeof AbstractLayer;
			let _loc5_ = new _loc4_(this, param2);
			_loc5_.name = param3;
			_loc5_.layerId = param3;
			if (_loc5_ instanceof com.google.finance.WindowLayer)
			{
				if (this.windowLayer && this.contains(this.windowLayer))
				{
					this.removeChild(this.windowLayer);
					_loc6_ = this.layers.indexOf(this.windowLayer);
					if (_loc6_ !== -1)
						this.layers.splice(_loc6_, 1);
				}
				this.windowLayer = _loc5_;
			}
			this.addChild(_loc5_);
			this.layers.push(_loc5_);

			return _loc5_;
		}

		commitSparklineOffset_Handler() 
		{
			this.sparkLastMinute = this.sparkLastMinute + this.sparkMinutesOffset;
			this.sparkMinutesOffset = 0;
		}

		private adjustWindowToSparkline() 
		{
			let _loc5_ = NaN;
			let _loc6_ = NaN;
			let _loc1_ = this.getLastMinute();
			let _loc2_ = this.getFirstMinute();
			let _loc3_ = this.getSparkLastMinute();
			let _loc4_ = this.getSparkFirstMinute();
			if (_loc1_ > _loc3_)
			{
				this.myController.jumpTo(_loc3_, _loc1_ - _loc2_);
			}
			else if (_loc2_ < _loc4_)
			{
				_loc5_ = _loc1_ - _loc2_;
				_loc6_ = _loc4_ + _loc5_;
				this.myController.jumpTo(_loc6_, _loc5_);
			}
		}

		getLayers(): AbstractLayer<SparklineViewPoint>[]
		{
			return this.layers;
		}

		highlightPoint(param1: number, param2: { [key: string]: any }) 
		{
		}

		getSparkFirstMinute(): number
		{
			return this.getSparkLastMinute() - this.sparkCount;
		}

		precomputeContexts() 
		{
		}

		private positionElements() 
		{
			this.leftScrollButton.x = -1;
			this.leftScrollButton.y = this.maxy - 1;
			this.rightScrollButton.x = this.maxx - 1;
			this.rightScrollButton.y = this.maxy - 1;
			this.scrollBg.x = this.minx;
			this.scrollBg.y = this.maxy - 1;
			this.scrollBg.width = this.maxx - this.minx;
		}

		replaceSparklineDataSource(param1: com.google.finance.DataSource) 
		{
			this.sparkline.dataSource = param1;
			this.graySparkline.dataSource = param1;
		}

		zoomIn_Handler(param1: number, param2: number) 
		{
			this.renderLayers();
			this.moveMask();
		}

		getYScaling() 
		{
			return { "maxPriceRange": 0 };
		}

		getXPos(param1: number, param2: number, param3: DataUnit): number
		{
			let _loc4_ = this.getSparkLastMinute();
			let _loc5_ = param3.relativeMinutes;
			let _loc6_ = param1 - (_loc4_ - _loc5_) * (param1 - param2) / this.sparkCount;
			return Math.round(_loc6_);
		}

		zoomInMinutes_Handler(param1: Context, param2 = false) 
		{
			this.checkResizeSparkline(param1.count);
		}

		renderPassiveLayers() 
		{
			for (let _loc1_ = 0; _loc1_ < this.passiveLayers.length; _loc1_++)
			{
				this.passiveLayers[_loc1_].renderLayer();
			}
		}

		isAnimating(): boolean
		{
			return false;
		}

		toggleHandles(param1: boolean) 
		{
			if (this.windowLayer)
				this.windowLayer.toggleHandles(param1);
		}

		getLastMinute(): number
		{
			let _loc1_ = notnull(<ViewPoint><any>this.displayManager.getMainViewPoint());
			return _loc1_.getLastMinute();
		}

		onMouseUp(param1: Event) 
		{
			this.myController.mouseUpAction();
		}

		private moveMask() 
		{
			if (!this.windowMask)
				return;

			let _loc1_ = this.getMinuteXPos(this.getLastMinute());
			let _loc2_ = this.getMinuteXPos(this.getFirstMinute());
			if (_loc1_ - _loc2_ <= 4)
				_loc2_ = _loc1_ - 4;

			this.windowMask.x = _loc2_;
			this.windowMask.y = this.my_miny - 1;
			this.windowMask.width = _loc1_ - _loc2_;
		}

		private createSparklineMask(): flash.display.Sprite
		{
			this.windowMask = new flash.display.Sprite("windowMask");
			this.windowMask.graphics.beginFill(0);
			this.windowMask.graphics.drawRect(0, 0, 10, this.my_maxy - this.my_miny + 1);
			this.windowMask.y = this.my_miny - 1;
			this.addChildAt(this.windowMask, 3);
			return this.windowMask;
		}

		getMinutesForLength(param1: number): number
		{
			return param1 * this.sparkCount / (this.maxx - this.minx);
		}

		get miny(): number
		{
			return this.my_miny;
		}

		getOldestMinute(): number
		{
			return this.dataSource.data.getFirstRelativeMinute();
		}

		getMedPrice() 
		{
			return { "medPrice": 0 };
		}

		get minx(): number
		{
			return this.my_minx + 14;
		}

		getFirstDataUnit(): DataUnit
		{
			let _loc1_ = notnull(<ViewPoint><any>this.displayManager.getMainViewPoint());
			return notnull(_loc1_.getFirstDataUnit());
		}

		zoomingAnimation_ticker(param1: SparklineViewPoint, param2: number, param3: boolean) 
		{
			param1.checkResizeSparkline();
			param1.renderLayers();
			param1.moveMask();
		}

		renderLayers() 
		{
			for (let _loc1_ = 0; _loc1_ < this.layers.length; _loc1_++)
			{
				this.layers[_loc1_].renderLayer();
			}
		}

		getLastDataUnit(): DataUnit
		{
			let _loc1_ = this.displayManager.getMainViewPoint();
			return notnull(_loc1_).getLastDataUnit();
		}

		getLeftX(): number
		{
			if (this.windowLayer)
				return this.windowLayer.getLeftX();

			return 0;
		}

		getHandleRightX(): number
		{
			if (this.windowLayer)
				return this.windowLayer.getHandleRightX();

			return 0;
		}

		private resetCanvas() 
		{
			this.textCanvas.graphics.clear();
			//Utils.removeAllChildren(this.textCanvas);
		}

		get maxy(): number
		{
			return this.my_maxy - 14;
		}

		commitOffset_Handler() 
		{
			this.renderLayers();
			this.moveMask();
		}

		setController(param1: com.google.finance.Controller) 
		{
			param1.addControlListener(this, Const.BOTTOM);
			this.myController = param1;
		}

		getFirstMinute(): number
		{
			let _loc1_ = <ViewPoint><any>this.displayManager.getMainViewPoint();
			return _loc1_.getFirstMinute();
		}

		moveChartBy_Handler(param1: number) 
		{
			this.adjustSparklineToWindow();
			this.renderLayers();
			this.moveMask();
		}

		getRightX(): number
		{
			if (this.windowLayer)
				return this.windowLayer.getRightX();

			return 0;
		}

		getHandleLeftX(): number
		{
			if (this.windowLayer)
				return this.windowLayer.getHandleLeftX();

			return 0;
		}

		HTMLnotify(param1 = false) 
		{
		}

		get maxx(): number
		{
			return this.my_maxx - 14;
		}

		getLastNotVisibleDataUnit(): DataUnit
		{
			let _loc1_ = <ViewPoint><any>this.displayManager.getMainViewPoint();
			return notnull(_loc1_.getLastNotVisibleDataUnit());
		}

		zoomChart_Handler(param1: number, param2 = NaN) 
		{
			this.renderLayers();
			this.moveMask();
		}

		newFinalAnimationState(param1: IViewPoint) 
		{
		}

		onMouseDown(param1: Event) 
		{
			switch (param1.currentTarget)
			{
				case this.leftScrollButton.element:
					this.myController.mouseDownAction(Const.LEFT_BUTTON);
					break;
				case this.rightScrollButton.element:
					this.myController.mouseDownAction(Const.RIGHT_BUTTON);
					break;
			}
		}

		update() 
		{
			if (this.stage.stageWidth === 0 || !this.dataSource || !this.dataSource.data || this.dataSource.data.points.length === 0)
				return;

			let _loc1_ = this.dataSource.data.points;
			let _loc2_ = this.dataSource.data.getFirstRelativeMinute();
			if (this.dataSource && _loc1_.length !== 0)
			{
				if (this.sparkCount !== Math.abs(_loc2_) && this.sparklineType === Const.STATIC)
					this.sparkCount = Math.abs(_loc2_);

				this.checkResizeSparkline();

				this.resetCanvas();
				this.renderPassiveLayers();
				this.renderLayers();
				this.moveMask();
			}
		}

		sparklinePagingPossible(param1: number): boolean
		{
			let _loc2_ = this.getSparkLastMinute() < 0;
			let _loc3_ = this.getSparkFirstMinute() > this.getOldestMinute();
			return param1 < 0 && _loc3_ || param1 > 0 && _loc2_;
		}

		private checkResizeSparkline(param1 = NaN) 
		{
			if (this.sparklineType === Const.STATIC)
				return;

			let _loc2_ = this.getLastMinute() - this.getFirstMinute();
			if (!isNaN(param1))
				_loc2_ = param1;

			if (!this.dataSource || !this.dataSource.data)
				return;

			let _loc3_ = this.dataSource.data.marketDayLength;
			let _loc4_ = 0;
			while (_loc4_ < this.displayThresholds.length - 1 && _loc2_ > this.displayThresholds[_loc4_].chartDays * _loc3_)
			{
				_loc4_++;
			}
			let _loc5_ = this.displayThresholds[_loc4_].sparkDays * _loc3_;
			let _loc6_ = Math.abs(this.dataSource.data.getFirstRelativeMinute());
			_loc5_ = Math.min(_loc5_, _loc6_);
			if (_loc5_ !== this.sparkCount && !isNaN(_loc5_))
			{
				this.sparkCount = _loc5_;
				this.sparkButtonMinutes = (this.leftScrollButton.width - 2) * this.sparkCount / (this.maxx - this.minx);
				if (this.sparkLastMinute - this.sparkCount < this.dataSource.data.getFirstRelativeMinute())
					this.sparkLastMinute = 0;

				if (_loc4_ === this.displayThresholds.length - 1)
					this.generateEvent(Const.GET_40Y_DATA, this.dataSource);

				this.redraw();
			}
			this.adjustSparklineToWindow();
		}

		setNewCount(param1: number) 
		{
			this.checkResizeSparkline(param1);
		}

		drawBorders() 
		{
			this.bg.graphics.clear();
			this.bg.graphics.beginFill(0xffffff);
			this.bg.graphics.moveTo(this.my_minx, this.my_miny - this.topBorder);
			this.bg.graphics.lineTo(this.my_maxx, this.my_miny - this.topBorder);
			this.bg.graphics.lineTo(this.my_maxx, this.my_maxy);
			this.bg.graphics.lineTo(this.my_minx, this.my_maxy);
			this.bg.graphics.endFill();
			this.textCanvas.graphics.clear();
		}

		getMinuteXPos(param1: number): number
		{
			let _loc2_ = this.maxx - (this.getSparkLastMinute() - param1) * (this.maxx - this.minx) / this.sparkCount;
			return Math.round(_loc2_);
		}

		getSparkLastMinute(): number
		{
			return this.sparkLastMinute + this.sparkMinutesOffset;
		}

		private initDisplayCountThresholds() 
		{
			let _loc2_ = 0;
			let _loc3_ = NaN;
			let _loc1_ = false;
			if (MainManager.paramsObj.displayThresholds)
			{
				this.displayThresholds = Utils.decodeObjects(MainManager.paramsObj.displayThresholds);
				_loc1_ = true;
				_loc2_ = 0;
				while (_loc2_ < this.displayThresholds.length)
				{
					if (isNaN(this.displayThresholds[_loc2_].chartDays) || isNaN(this.displayThresholds[_loc2_].sparkDays))
						_loc1_ = false;

					_loc2_++;
				}
			}
			if (!_loc1_)
			{
				_loc3_ = Number.POSITIVE_INFINITY;
				this.displayThresholds = [{
					"chartDays": 230,
					"sparkDays": 520
				}, {
					"chartDays": _loc3_,
					"sparkDays": _loc3_
				}];
			}
		}

		private addDataSource(param1: com.google.finance.DataSource) 
		{
			if (!this.dataSource)
			{
				this.sparkMinutesOffset = 0;
				if (this.sparklineType === Const.DYNAMIC)
					this.sparkCount = param1.data.marketDayLength * this.displayThresholds[0].sparkDays;
				else
					this.sparkCount = Math.abs(param1.data.getFirstRelativeMinute());

				this.sparkButtonMinutes = (this.leftScrollButton.width - 2) * this.sparkCount / (this.my_maxx - this.my_minx);
				this.sparkLastMinute = 0;
				this.graySparkline = new com.google.finance.SparklineLayer(this, param1);
				this.graySparkline.layerId = "GraySparkline";
				this.graySparkline.fillColor = Const.SPARK_INACTIVE_FILL_COLOR;
				this.graySparkline.lineColor = Const.SPARK_INACTIVE_LINE_COLOR;
				this.addChildAt(this.graySparkline, 1);
				this.graySparkline.hasBackground = true;
				this.graySparkline.bgColor = 0xffffff;
				this.graySparkline.borderColor = 0xdddddd;
				this.passiveLayers.push(this.graySparkline);
				this.sparkline = new com.google.finance.SparklineLayer(this, param1);
				this.sparkline.layerId = "Sparkline";
				this.sparkline.fillColor = Const.SPARK_ACTIVE_FILL_COLOR;
				this.sparkline.lineColor = Const.SPARK_ACTIVE_LINE_COLOR;
				this.addChildAt(this.sparkline, 2);
				this.sparkline.hasBackground = true;
				this.sparkline.bgColor = 0xffffff;
				this.sparkline.borderColor = 0xffffff;
				this.passiveLayers.push(this.sparkline);
				this.windowMask = this.createSparklineMask();
				this.sparkline.mask = this.windowMask;
				let _loc2_ = new SparklineDateLinesLayer(this, param1);
				_loc2_.textCanvas = this.textCanvas;
				this.addChild(_loc2_);
				this.passiveLayers.push(_loc2_);
			}
			this.rightScrollButton.enabled = true;
			this.leftScrollButton.enabled = true;
			this.dataSource = param1;
			this.update();
		}

		clearPointInformation() 
		{
		}

		moveSparklineBy_Handler(param1: number): number
		{
			if (!this.dataSource || this.dataSource.data.points.length === 0)
				return 0;

			if (this.sparklineType === Const.STATIC)
				return param1;

			let _loc2_ = param1 * this.sparkCount / (this.maxx - this.minx);
			let _loc3_ = this.sparkLastMinute + _loc2_ - this.sparkCount;
			let _loc4_ = _loc2_;
			if (this.sparkLastMinute + _loc2_ > 0)
			{
				_loc2_ = -this.sparkLastMinute;
			}
			else if (_loc3_ < this.getOldestMinute())
			{
				_loc2_ = this.getOldestMinute() + this.sparkCount - this.sparkLastMinute;
				this.generateEvent(Const.GET_40Y_DATA, this.dataSource);
			}
			let _loc5_ = this.displayManager.layersManager.getFirstDataSource();
			if (this.myController.currentIntervalLevel !== -1 && _loc5_)
			{
				_loc3_ = this.sparkLastMinute + _loc2_ - this.sparkCount;
				if (_loc3_ > this.getOldestMinute() && _loc3_ < _loc5_.firstOpenRelativeMinutes)
					_loc2_ = _loc5_.firstOpenRelativeMinutes + this.sparkCount - this.sparkLastMinute;
			}
			if (_loc2_ !== this.sparkMinutesOffset)
			{
				this.sparkMinutesOffset = _loc2_;
				this.redraw();
			}
			if (_loc4_ === 0)
				return 0;

			return param1 * (_loc2_ / _loc4_);
		}

		private adjustSparklineToWindow() 
		{
			let _loc1_ = this.getLastMinute();
			let _loc2_ = this.getFirstMinute();
			let _loc3_ = this.getSparkLastMinute();
			let _loc4_ = this.getSparkFirstMinute();
			if (_loc1_ > _loc3_ && _loc1_ <= 0)
				this.sparkLastMinute = this.sparkLastMinute + (_loc1_ - _loc3_);
			else if (_loc2_ < _loc4_)
				this.sparkLastMinute = this.sparkLastMinute + (_loc2_ - _loc4_);
			else
				return;

			this.resetCanvas();
			this.renderPassiveLayers();
			this.renderLayers();
			this.moveMask();
		}

		getMinuteOfX(param1: number): number
		{
			let _loc2_ = this.getSparkLastMinute() - (this.maxx - param1) * this.sparkCount / (this.maxx - this.minx);
			return _loc2_;
		}

		zoomingAnimation_init(param1: Context) 
		{
		}

		getNewContext(param1: number, param2: number): Context
		{
			var context = new Context();
			context.lastMinute = param1;
			context.count = param2;
			return context;
		}
	}
}
