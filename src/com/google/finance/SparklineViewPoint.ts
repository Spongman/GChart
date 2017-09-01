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
		static readonly TEXT_VERTICAL_OFFSET = -1;
		static readonly TEXT_HORIZONTAL_OFFSET = 5;
		static readonly TEXT_FIELD_WIDTH = 200;
		readonly POINTS_DISTANCE = 2;

		private readonly leftScrollButton = new flash.display.SimpleButton("leftScrollButton");
		//private currentSparkTimeLength = 0;
		private readonly ScrollbarButtonRight = SparklineViewPoint_ScrollbarButtonRight;
		private sparklineType: string;
		private graySparkline: com.google.finance.SparklineLayer;
		private layers: AbstractLayer<SparklineViewPoint>[] = [];
		private passiveLayers: AbstractLayer<SparklineViewPoint>[] = [];
		private sparkline: com.google.finance.SparklineLayer;
		private readonly rightScrollButton = new flash.display.SimpleButton("rightScrollButton");
		private displayThresholds: { chartDays: number, sparkDays: number }[];
		// private textCanvas: flash.display.Sprite;
		private readonly scrollBg = new flash.display.Sprite("scrollBg");
		private readonly ScrollbarButtonLeft = SparklineViewPoint_ScrollbarButtonLeft;
		// private displayManager: com.google.finance.DisplayManager;

		sparkLastMinute: number;
		my_minx: number;
		my_miny: number;
		sparkCount: number;
		windowLayer: com.google.finance.WindowLayer;
		readonly bg = new flash.display.Sprite("bg");
		my_maxx: number;
		my_maxy: number;
		lastMinute: number;
		dataSource: com.google.finance.DataSource;
		//myController: com.google.finance.Controller;
		sparkButtonMinutes: number;
		sparkMinutesOffset: number = 0;
		hourTextFormat: flash.text.TextFormat;
		readonly priceTextFormat = new flash.text.TextFormat("_sans", 10, 0x666666);
		readonly dateTextFormat = new flash.text.TextFormat("Verdana", 10, 0x6f6f6f);
		topBorder = 0;

		constructor(private readonly dataManager: com.google.finance.DataManager, readonly displayManager: com.google.finance.DisplayManager)
		{
			super(displayManager);

			this.addChild(this.bg);
			this.textCanvas = new flash.display.Sprite("textCanvas");
			this.addChild(this.textCanvas);
			this.dateTextFormat.bold = false;
			this.priceTextFormat.align = "right";
			const scrollbarButtonLeft = new this.ScrollbarButtonLeft();
			this.leftScrollButton.downState = scrollbarButtonLeft;
			this.leftScrollButton.overState = scrollbarButtonLeft;
			this.leftScrollButton.upState = scrollbarButtonLeft;
			this.leftScrollButton.hitTestState = scrollbarButtonLeft;
			this.leftScrollButton.useHandCursor = true;
			this.addChild(this.leftScrollButton);
			const scrollbarButtonRight = new this.ScrollbarButtonRight();
			this.rightScrollButton.downState = scrollbarButtonRight;
			this.rightScrollButton.overState = scrollbarButtonRight;
			this.rightScrollButton.upState = scrollbarButtonRight;
			this.rightScrollButton.hitTestState = scrollbarButtonRight;
			this.rightScrollButton.useHandCursor = true;
			this.addChild(this.rightScrollButton);
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
			for (const layer of this.layers)
				this.removeChild(layer);
			this.layers = [];
		}

		setNewSize(bounds: Bounds)
		{
			this.my_minx = bounds.minx;
			this.my_miny = bounds.miny;
			this.my_maxx = bounds.maxx;
			this.my_maxy = bounds.maxy;
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

		generateEvent(style: ChartEventStyles, dataSource: com.google.finance.DataSource)
		{
			const event = EventFactory.getEvent(style, dataSource.quoteName, ChartEventPriorities.OPTIONAL);
			this.dataManager.expectEvent(event);
			this.dataManager.eventHandler(event);
		}

		addLayer(layerTypeName: string, dataSource: com.google.finance.DataSource, name: string): AbstractLayer<IViewPoint> | null
		{
			if (layerTypeName === "")
				return null;

			this.addDataSource(dataSource);
			const layerType = getDefinitionByName("com.google.finance." + layerTypeName) as typeof AbstractLayer;
			const layer = new layerType(this, dataSource);
			layer.name = name;
			layer.layerId = name;
			if (layer instanceof com.google.finance.WindowLayer)
			{
				if (this.windowLayer && this.contains(this.windowLayer))
				{
					this.removeChild(this.windowLayer);
					const indexOfWindow = this.layers.indexOf(this.windowLayer);
					if (indexOfWindow !== -1)
						this.layers.splice(indexOfWindow, 1);
				}
				this.windowLayer = layer;
			}
			this.addChild(layer);
			this.layers.push(layer);

			return layer;
		}

		commitSparklineOffset_Handler()
		{
			this.sparkLastMinute += this.sparkMinutesOffset;
			this.sparkMinutesOffset = 0;
		}

		private adjustWindowToSparkline()
		{
			const lastMinute = this.getLastMinute();
			const firstMinute = this.getFirstMinute();
			const sparkLastMinute = this.getSparkLastMinute();
			const sparkFirstMinute = this.getSparkFirstMinute();
			if (lastMinute > sparkLastMinute)
			{
				this.myController.jumpTo(sparkLastMinute, lastMinute - firstMinute);
			}
			else if (firstMinute < sparkFirstMinute)
			{
				const count = lastMinute - firstMinute;
				this.myController.jumpTo(sparkFirstMinute + count, count);
			}
		}

		getLayers(): AbstractLayer<SparklineViewPoint>[]
		{
			return this.layers;
		}

		highlightPoint(param1: number, state: Dictionary)
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

		replaceSparklineDataSource(dataSource: com.google.finance.DataSource)
		{
			this.sparkline.dataSource = dataSource;
			this.graySparkline.dataSource = dataSource;
		}

		zoomIn_Handler(param1: number, param2: number)
		{
			this.renderLayers();
			this.moveMask();
		}

		getYScaling()
		{
			return { maxPriceRange: 0 };
		}

		getXPos(param1: number, param2: number, dataUnit: DataUnit): number
		{
			const sparkLastMinute = this.getSparkLastMinute();
			const relativeMinutes = dataUnit.relativeMinutes;
			return Math.round(param1 - (sparkLastMinute - relativeMinutes) * (param1 - param2) / this.sparkCount);
		}

		zoomInMinutes_Handler(context: Context, param2 = false)
		{
			this.checkResizeSparkline(context.count);
		}

		renderPassiveLayers()
		{
			for (const layer of this.passiveLayers)
				layer.renderLayer();
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
			const mainViewPoint = this.displayManager.getMainViewPoint();
			return mainViewPoint.getLastMinute();
		}

		onMouseUp(event: Event)
		{
			this.myController.mouseUpAction();
		}

		private moveMask()
		{
			if (!this.windowMask)
				return;

			const lastMinuteXPos = this.getMinuteXPos(this.getLastMinute());
			let firstMinuteXPos = this.getMinuteXPos(this.getFirstMinute());
			if (lastMinuteXPos - firstMinuteXPos <= 4)
				firstMinuteXPos = lastMinuteXPos - 4;

			this.windowMask.x = firstMinuteXPos;
			this.windowMask.y = this.my_miny - 1;
			this.windowMask.width = lastMinuteXPos - firstMinuteXPos;
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
			return { medPrice: 0 };
		}

		get minx(): number
		{
			return this.my_minx + 14;
		}

		getFirstDataUnit(): DataUnit
		{
			const mainViewPoint = this.displayManager.getMainViewPoint();
			return notnull(mainViewPoint.getFirstDataUnit());
		}

		zoomingAnimation_ticker(sparklineViewPoint: SparklineViewPoint, param2: number, param3: boolean)
		{
			sparklineViewPoint.checkResizeSparkline();
			sparklineViewPoint.renderLayers();
			sparklineViewPoint.moveMask();
		}

		renderLayers()
		{
			for (const layer of this.layers)
				layer.renderLayer();
		}

		getLastDataUnit(): DataUnit
		{
			const mainViewPoint = this.displayManager.getMainViewPoint();
			return notnull(mainViewPoint.getLastDataUnit());
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

		setController(controller: com.google.finance.Controller)
		{
			controller.addControlListener(this, TickPositions.BOTTOM);
			this.myController = controller;
		}

		getFirstMinute(): number
		{
			const mainViewPoint = this.displayManager.getMainViewPoint();
			return mainViewPoint.getFirstMinute();
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
			const mainViewPoint = this.displayManager.getMainViewPoint();
			return notnull(mainViewPoint.getLastNotVisibleDataUnit());
		}

		zoomChart_Handler(direction: Directions, param2 = NaN)
		{
			this.renderLayers();
			this.moveMask();
		}

		newFinalAnimationState(viewPoint: IViewPoint)
		{
		}

		onMouseDown(event: Event)
		{
			switch (event.currentTarget)
			{
				case this.leftScrollButton.element:
					this.myController.mouseDownAction(ControllerComponents.LEFT_BUTTON);
					break;
				case this.rightScrollButton.element:
					this.myController.mouseDownAction(ControllerComponents.RIGHT_BUTTON);
					break;
			}
		}

		update()
		{
			if (this.stage.stageWidth === 0 || !this.dataSource || !this.dataSource.data || this.dataSource.data.points.length === 0)
				return;

			const points = this.dataSource.data.points;
			const firstRelativeMinute = this.dataSource.data.getFirstRelativeMinute();
			if (this.dataSource && points.length !== 0)
			{
				if (this.sparkCount !== Math.abs(firstRelativeMinute) && this.sparklineType === Const.STATIC)
					this.sparkCount = Math.abs(firstRelativeMinute);

				this.checkResizeSparkline();

				this.resetCanvas();
				this.renderPassiveLayers();
				this.renderLayers();
				this.moveMask();
			}
		}

		sparklinePagingPossible(param1: number): boolean
		{
			const sparkLastMinute = this.getSparkLastMinute() < 0;
			const sparkFirstMinute = this.getSparkFirstMinute() > this.getOldestMinute();
			return param1 < 0 && sparkFirstMinute || param1 > 0 && sparkLastMinute;
		}

		private checkResizeSparkline(param1 = NaN)
		{
			if (this.sparklineType === Const.STATIC)
				return;

			let minutes = this.getLastMinute() - this.getFirstMinute();
			if (!isNaN(param1))
				minutes = param1;

			if (!this.dataSource || !this.dataSource.data)
				return;

			const marketDayLength = this.dataSource.data.marketDayLength;
			let _loc4_ = 0;
			while (_loc4_ < this.displayThresholds.length - 1 && minutes > this.displayThresholds[_loc4_].chartDays * marketDayLength)
			{
				_loc4_++;
			}
			let _loc5_ = this.displayThresholds[_loc4_].sparkDays * marketDayLength;
			const _loc6_ = Math.abs(this.dataSource.data.getFirstRelativeMinute());
			_loc5_ = Math.min(_loc5_, _loc6_);
			if (_loc5_ !== this.sparkCount && !isNaN(_loc5_))
			{
				this.sparkCount = _loc5_;
				this.sparkButtonMinutes = (this.leftScrollButton.width - 2) * this.sparkCount / (this.maxx - this.minx);
				if (this.sparkLastMinute - this.sparkCount < this.dataSource.data.getFirstRelativeMinute())
					this.sparkLastMinute = 0;

				if (_loc4_ === this.displayThresholds.length - 1)
					this.generateEvent(ChartEventStyles.GET_40Y_DATA, this.dataSource);

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
			const gr = this.bg.graphics;
			gr.clear();
			gr.beginFill(0xffffff);
			gr.drawRect(
				this.my_minx, this.my_miny - this.topBorder,
				this.my_maxx - this.my_minx, this.my_maxy - (this.my_miny - this.topBorder)
			);
			/*
			gr.moveTo(this.my_minx, this.my_miny - this.topBorder);
			gr.lineTo(this.my_maxx, this.my_miny - this.topBorder);
			gr.lineTo(this.my_maxx, this.my_maxy);
			gr.lineTo(this.my_minx, this.my_maxy);
			*/
			gr.endFill();
			this.textCanvas.graphics.clear();
		}

		getMinuteXPos(param1: number): number
		{
			const _loc2_ = this.maxx - (this.getSparkLastMinute() - param1) * (this.maxx - this.minx) / this.sparkCount;
			return Math.round(_loc2_);
		}

		getSparkLastMinute(): number
		{
			return this.sparkLastMinute + this.sparkMinutesOffset;
		}

		private initDisplayCountThresholds()
		{
			let _loc1_ = false;
			if (MainManager.paramsObj.displayThresholds)
			{
				this.displayThresholds = Utils.decodeObjects(MainManager.paramsObj.displayThresholds);
				_loc1_ = true;
				for (const threshold of this.displayThresholds)
				{
					if (isNaN(threshold.chartDays) || isNaN(threshold.sparkDays))
						_loc1_ = false;
				}
			}
			if (!_loc1_)
			{
				const _loc3_ = Number.POSITIVE_INFINITY;
				this.displayThresholds = [{
					chartDays: 230,
					sparkDays: 520
				}, {
					chartDays: _loc3_,
					sparkDays: _loc3_
				}];
			}
		}

		private addDataSource(dataSource: com.google.finance.DataSource)
		{
			if (!this.dataSource)
			{
				this.sparkMinutesOffset = 0;
				if (this.sparklineType === Const.DYNAMIC)
					this.sparkCount = dataSource.data.marketDayLength * this.displayThresholds[0].sparkDays;
				else
					this.sparkCount = Math.abs(dataSource.data.getFirstRelativeMinute());

				this.sparkButtonMinutes = (this.leftScrollButton.width - 2) * this.sparkCount / (this.my_maxx - this.my_minx);
				this.sparkLastMinute = 0;
				this.graySparkline = new com.google.finance.SparklineLayer(this, dataSource);
				this.graySparkline.layerId = "GraySparkline";
				this.graySparkline.fillColor = Const.SPARK_INACTIVE_FILL_COLOR;
				this.graySparkline.lineColor = Const.SPARK_INACTIVE_LINE_COLOR;
				this.addChildAt(this.graySparkline, 1);
				this.graySparkline.hasBackground = true;
				this.graySparkline.bgColor = 0xffffff;
				this.graySparkline.borderColor = 0xdddddd;
				this.passiveLayers.push(this.graySparkline);
				this.sparkline = new com.google.finance.SparklineLayer(this, dataSource);
				this.sparkline.layerId = "Sparkline";
				this.sparkline.fillColor = Const.SPARK_ACTIVE_FILL_COLOR;
				this.sparkline.lineColor = Const.SPARK_ACTIVE_LINE_COLOR;
				this.addChildAt(this.sparkline, 2);
				this.sparkline.hasBackground = true;
				this.sparkline.bgColor = 0xffffff;
				this.sparkline.borderColor = 0xffffff;
				this.passiveLayers.push(this.sparkline);
				this.windowMask = this.createSparklineMask();
				// TODO: this.sparkline.mask = this.windowMask;
				const sparklineDateLinesLayer = new SparklineDateLinesLayer(this, dataSource);
				sparklineDateLinesLayer.textCanvas = this.textCanvas;
				this.addChild(sparklineDateLinesLayer);
				this.passiveLayers.push(sparklineDateLinesLayer);
			}
			this.rightScrollButton.enabled = true;
			this.leftScrollButton.enabled = true;
			this.dataSource = dataSource;
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
			const _loc4_ = _loc2_;
			if (this.sparkLastMinute + _loc2_ > 0)
			{
				_loc2_ = -this.sparkLastMinute;
			}
			else if (_loc3_ < this.getOldestMinute())
			{
				_loc2_ = this.getOldestMinute() + this.sparkCount - this.sparkLastMinute;
				this.generateEvent(ChartEventStyles.GET_40Y_DATA, this.dataSource);
			}
			const firstDataSource = this.displayManager.layersManager.getFirstDataSource();
			if (this.myController.currentIntervalLevel !== <Intervals>-1 && firstDataSource)
			{
				_loc3_ = this.sparkLastMinute + _loc2_ - this.sparkCount;
				if (_loc3_ > this.getOldestMinute() && _loc3_ < firstDataSource.firstOpenRelativeMinutes)
					_loc2_ = firstDataSource.firstOpenRelativeMinutes + this.sparkCount - this.sparkLastMinute;
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
			const lastMinute = this.getLastMinute();
			const firstMinute = this.getFirstMinute();
			const sparkLastMinute = this.getSparkLastMinute();
			const sparkFirstMinute = this.getSparkFirstMinute();
			if (lastMinute > sparkLastMinute && lastMinute <= 0)
				this.sparkLastMinute += lastMinute - sparkLastMinute;
			else if (firstMinute < sparkFirstMinute)
				this.sparkLastMinute += firstMinute - sparkFirstMinute;
			else
				return;

			this.resetCanvas();
			this.renderPassiveLayers();
			this.renderLayers();
			this.moveMask();
		}

		getMinuteOfX(param1: number): number
		{
			return this.getSparkLastMinute() - (this.maxx - param1) * this.sparkCount / (this.maxx - this.minx);
		}

		zoomingAnimation_init(context: Context)
		{
		}

		getNewContext(lastMinute: number, count: number): Context
		{
			const context = new Context();
			context.lastMinute = lastMinute;
			context.count = count;
			return context;
		}
	}
}
