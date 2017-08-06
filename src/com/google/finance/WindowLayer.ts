namespace com.google.finance
{
	// import flash.display.Bitmap;
	// import flash.display.Sprite;
	// import flash.display.DisplayObject;
	// import flash.events.MouseEvent;

	export class WindowLayer extends AbstractDrawingLayer<SparklineViewPoint>
	{
		private static MIN_WINDOW_WIDTH = 6;


		private currentHandlesVisibility: boolean;

		private readonly SparkHandle = WindowLayer_SparkHandle;

		private sliderBg: flash.display.Sprite;

		private readonly ScrollBarBg = WindowLayer_ScrollBarBg;

		scrollSlider: com.google.finance.ScrollSlider;

		leftHandle: com.google.finance.DraggableHandle;

		initialX: number;

		leftHandleXOffset = 0;

		rightHandle: com.google.finance.DraggableHandle;

		rightHandleXOffset = 0;

		private readonly SparkHandleActive = WindowLayer_SparkHandleActive;

		private leftX: number;

		private rightX: number;

		constructor(param1: SparklineViewPoint, param2: DataSource)
		{
			super(param1, param2);
			let viewPoint = param1;
			let dataSource = param2;
			this.sliderBg = new flash.display.Sprite("sliderBg");
			let sliderBgBitmap = new this.ScrollBarBg();
			sliderBgBitmap.y = viewPoint.maxy - 1;
			sliderBgBitmap.x = viewPoint.minx;
			sliderBgBitmap.width = viewPoint.maxx - viewPoint.minx;
			this.sliderBg.addChild(sliderBgBitmap);
			this.addChild(this.sliderBg);
			this.sliderBg.addEventListener(MouseEvents.CLICK, () =>
			{
				viewPoint.myController.mouseDownAction(Const.SCROLL_BG);
			});
			this.scrollSlider = new com.google.finance.ScrollSlider("scrollSlider");
			this.addChild(this.scrollSlider);
			this.scrollSlider.y = viewPoint.maxy - 1;
			this.scrollSlider.x = viewPoint.minx;
			this.rightHandle = new com.google.finance.DraggableHandle(this.SparkHandle, this.SparkHandleActive);
			this.rightHandle.y = Math.floor((viewPoint.maxy + viewPoint.miny) / 2 - this.rightHandle.height / 2);
			this.rightHandle.x = viewPoint.minx;
			this.addChild(this.rightHandle);
			this.leftHandle = new com.google.finance.DraggableHandle(this.SparkHandle, this.SparkHandleActive);
			this.leftHandle.y = Math.floor((viewPoint.maxy + viewPoint.miny) / 2 - this.leftHandle.height / 2);
			this.leftHandle.x = viewPoint.minx;
			this.addChild(this.leftHandle);
			this.scrollSlider.addEventListener(MouseEvents.MOUSE_DOWN, () =>
			{
				viewPoint.myController.mouseDownAction(Const.SCROLL_BAR);
			});
			let controller = viewPoint.myController;
			this.leftHandle.addEventListener(MouseEvents.ROLL_OVER, () =>
			{
				MainManager.mouseCursor.setCursor(MouseCursor.H_ARROWS);
			});
			this.leftHandle.addEventListener(MouseEvents.ROLL_OUT, () =>
			{
				if (controller.getState() !== Controller.DRAGGING_LEFT_HANDLE)
					MainManager.mouseCursor.setCursor(MouseCursor.CLASSIC);
			});
			this.leftHandle.addEventListener(MouseEvents.MOUSE_DOWN, () =>
			{
				viewPoint.myController.mouseDownAction(Const.LEFT_HANDLE);
			});
			this.rightHandle.addEventListener(MouseEvents.ROLL_OVER, () =>
			{
				MainManager.mouseCursor.setCursor(MouseCursor.H_ARROWS);
			});
			this.rightHandle.addEventListener(MouseEvents.ROLL_OUT, () =>
			{
				if (controller.getState() !== Controller.DRAGGING_RIGHT_HANDLE)
					MainManager.mouseCursor.setCursor(MouseCursor.CLASSIC);
			});
			this.rightHandle.addEventListener(MouseEvents.MOUSE_DOWN, () =>
			{
				viewPoint.myController.mouseDownAction(Const.RIGHT_HANDLE);
			});
			this.currentHandlesVisibility = true;
			this.toggleHandles(false);
		}

		getLastDataUnit(): DataUnit
		{
			let _loc1_ = this.getHandleRightX();
			let _loc2_ = this.viewPoint.dataSource.data;
			let _loc3_ = this.viewPoint.getMinuteOfX(_loc1_);
			return _loc2_.units[_loc2_.getRelativeMinuteIndex(_loc3_)];
		}

		updateFixedElements() 
		{
			let _loc1_ = this.sliderBg.getChildAt(0) as flash.display.Bitmap;
			_loc1_.y = this.viewPoint.maxy - 1;
			_loc1_.width = this.viewPoint.maxx - this.viewPoint.minx;
			this.scrollSlider.y = this.viewPoint.maxy - 1;
			this.rightHandle.y = Math.floor((this.viewPoint.maxy + this.viewPoint.miny) / 2 - this.rightHandle.height / 2);
			this.leftHandle.y = Math.floor((this.viewPoint.maxy + this.viewPoint.miny) / 2 - this.leftHandle.height / 2);
		}

		getHandleRightX(): number
		{
			return this.rightHandle.x + this.rightHandle.width / 2;
		}

		private checkHandlePosition(param1: flash.display.DisplayObject) 
		{
			if (param1.x < this.viewPoint.minx - param1.width / 2)
				param1.x = this.viewPoint.minx - param1.width / 2;

			if (param1.x > this.viewPoint.maxx - param1.width / 2)
				param1.x = this.viewPoint.maxx - param1.width / 2;
		}

		renderLayer(param1?: Context) 
		{
			if (this.stage.stageWidth === 0)
				return;

			if (!this.dataSource || this.dataSource.isEmpty())
				return;

			let _loc2_ = this.dataSource.data;
			let _loc3_ = <SparklineViewPoint><any>this.viewPoint;
			this.graphics.clear();
			let _loc4_ = _loc2_.getRelativeMinuteIndex(_loc3_.getLastMinute());
			let _loc5_ = Number(_loc2_.getRelativeMinuteIndex(_loc3_.getFirstMinute()) - 1);
			if (_loc5_ < 0)
				_loc5_ = 0;

			this.rightX = _loc3_.getMinuteXPos(_loc3_.getLastMinute());
			this.leftX = _loc3_.getMinuteXPos(_loc3_.getFirstMinute());
			let _loc6_ = this.rightX;
			let _loc7_ = this.leftX;
			if (_loc6_ > _loc3_.maxx)
				_loc6_ = _loc3_.maxx;

			if (_loc6_ < _loc3_.minx + WindowLayer.MIN_WINDOW_WIDTH - 1)
				_loc6_ = _loc3_.minx + WindowLayer.MIN_WINDOW_WIDTH - 1;

			if (_loc6_ - _loc7_ <= WindowLayer.MIN_WINDOW_WIDTH)
			{
				_loc6_ = (_loc7_ + _loc6_) / 2;
				if (_loc6_ > _loc3_.maxx - (this.rightHandle.width - 2) / 2 + 2)
					_loc6_ = _loc3_.maxx - (this.rightHandle.width - 2) / 2 + 2;

				_loc7_ = _loc6_;
			}
			this.rightHandle.x = _loc6_ - this.rightHandle.width / 2 - this.rightHandleXOffset;
			this.checkHandlePosition(this.rightHandle);
			this.leftHandle.x = _loc7_ - this.leftHandle.width / 2 - this.leftHandleXOffset;
			this.checkHandlePosition(this.leftHandle);
			this.scrollSlider.x = Math.round(_loc7_) - 2;
			this.scrollSlider.setWidth(Math.round(_loc6_ - _loc7_) + 2);
			if (this.scrollSlider.width + 2 > _loc6_ - _loc7_)
				this.scrollSlider.x = (_loc6_ + _loc7_) / 2 - this.scrollSlider.width / 2;

			if (this.scrollSlider.x + this.scrollSlider.width > this.viewPoint.maxx)
				this.scrollSlider.x = this.viewPoint.maxx - this.scrollSlider.width;

			if (this.scrollSlider.x < this.viewPoint.minx)
				this.scrollSlider.x = this.viewPoint.minx;
		}

		getHandleLeftX(): number
		{
			return this.leftHandle.x + this.leftHandle.width / 2;
		}

		toggleHandles(param1: boolean) 
		{
			//return false;	// TODO (hitTestPoint)
			let visibility = param1;
			if (visibility === this.currentHandlesVisibility)
				return;

			this.currentHandlesVisibility = visibility;
			if (visibility === true)
			{
				this.addChild(this.leftHandle);
				this.addChild(this.rightHandle);
			}
			else
			{
				try
				{
					this.removeChild(this.leftHandle);
					this.removeChild(this.rightHandle);
					return;
				}
				catch (ae /*:ArgumentError*/)
				{
					return;
				}
			}
		}

		getFirstDataUnit(): DataUnit
		{
			let _loc1_ = this.getHandleLeftX();
			let _loc2_ = this.viewPoint.dataSource.data;
			let _loc3_ = this.viewPoint.getMinuteOfX(_loc1_);
			return _loc2_.units[_loc2_.getRelativeMinuteIndex(_loc3_) + 1];
		}

		handleReleased(param1: com.google.finance.DraggableHandle) 
		{
			let _loc7_ = NaN;
			let _loc2_ = this.rightHandle.x + this.rightHandle.width / 2;
			let _loc3_ = this.leftHandle.x + this.leftHandle.width / 2;
			if (_loc2_ === _loc3_)
				_loc3_ = _loc2_ - WindowLayer.MIN_WINDOW_WIDTH;

			let _loc4_ = this.dataSource.data;
			let _loc5_ = <SparklineViewPoint><any>this.viewPoint;
			let _loc6_ = _loc5_.sparkCount * Math.abs(_loc2_ - _loc3_) / (_loc5_.maxx - _loc5_.minx);
			switch (param1)
			{
				case this.leftHandle:
					if (_loc3_ < _loc2_)
					{
						_loc7_ = Number(_loc5_.getLastMinute());
						break;
					}
					_loc7_ = Number(_loc5_.getLastMinute() + _loc6_);
					break;
				case this.rightHandle:
					if (_loc3_ < _loc2_)
					{
						_loc7_ = Number(_loc5_.getFirstMinute() + _loc6_);
						break;
					}
					_loc7_ = Number(_loc5_.getFirstMinute());
					break;
			}
			if (_loc7_ > 0)
				_loc7_ = 0;

			_loc5_.myController.clearCurrentZoom();
			_loc5_.myController.animateTo(_loc7_, _loc6_);
			param1.x = this.initialX;
			this.leftHandleXOffset = 0;
			this.rightHandleXOffset = 0;
		}

		getRightX(): number
		{
			return this.rightX;
		}

		getLeftX(): number
		{
			return this.leftX;
		}
	}
}
