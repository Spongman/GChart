/// <reference path="../../../flash/display/DisplayObject.ts"/>

namespace com.google.finance
{
	// import flash.display.Shape;
	// import flash.display.DisplayObject;

	export class BorderLayer extends flash.display.Shape
	{
		constructor(public readonly displayManager: com.google.finance.DisplayManager, public topViewPoint: com.google.finance.SparklineViewPoint)
		{
			super(document.createElement("div"));
		}

		update(param1?: BorderLayer, param2 = 0, param3 = false) 
		{
			const _loc4_: BorderLayer = param1 || this;
			let _loc19_ = 0;
			if (param1)
			{
				this.topViewPoint = param1.topViewPoint;
			}
			else
			{
				// TODO:
				//_loc4_ = {};
				//if (this.topViewPoint.windowLayer)
				//	debugger;
			}
			if (!this.topViewPoint.windowLayer)
				return;

			const _loc5_ = this.topViewPoint.windowLayer;
			const _loc6_ = _loc5_.leftHandle;
			const _loc7_ = _loc5_.rightHandle;
			let _loc8_ = Math.floor(this.topViewPoint.getHandleLeftX());
			let _loc9_ = Math.floor(this.topViewPoint.getHandleRightX());
			//const _loc10_ = Const.MOVIE_WIDTH;
			const _loc11_ = Const.MOVIE_HEIGHT;
			if (_loc8_ <= 0 || _loc9_ <= 0)
				return;

			if (_loc8_ === _loc9_)
			{
				_loc8_ = _loc8_ - 3;
				_loc9_ = _loc9_ + 3;
			}
			const _loc12_ = _loc5_.scrollSlider;
			const gr = _loc4_.graphics;
			gr.clear();
			const _loc13_ = Math.floor(_loc12_.x);
			const _loc14_ = Math.floor(_loc12_.x + _loc12_.width);
			if (_loc8_ === _loc13_ - 1)
				_loc8_ = _loc13_;

			if (_loc9_ === _loc14_ + 1)
				_loc9_ = _loc14_;

			const _loc16_ = _loc11_ - Const.SPARKLINE_HEIGHT - Const.SPARK_PADDING;
			gr.lineStyle(0, Const.BORDER_LINE_COLOR, Const.BORDER_LINE_OPACITY);
			gr.moveTo(_loc13_, _loc11_ - 1);
			gr.lineTo(_loc14_, _loc11_ - 1);
			gr.lineTo(_loc14_, _loc11_ - Const.SCROLL_HEIGHT - 2);
			gr.lineTo(_loc9_, _loc11_ - Const.SCROLL_HEIGHT - 2);
			if (_loc5_.contains(_loc6_))
			{
				gr.lineTo(_loc9_, _loc7_.y + _loc7_.height - 1);
				gr.moveTo(_loc9_, _loc7_.y + 1);
			}
			gr.lineTo(_loc9_, _loc16_);
			gr.lineTo(Const.MOVIE_WIDTH - 1 - 1, _loc16_);
			gr.lineTo(Const.MOVIE_WIDTH - 1 - 1, 1);
			gr.lineTo(1, 1);
			gr.lineTo(1, _loc16_);
			gr.lineTo(_loc8_, _loc16_);
			if (_loc5_.contains(_loc6_))
			{
				gr.lineTo(_loc8_, _loc6_.y + 1);
				gr.moveTo(_loc8_, _loc6_.y + _loc6_.height - 1);
			}
			gr.lineTo(_loc8_, _loc11_ - Const.SCROLL_HEIGHT - 2);
			gr.lineTo(_loc13_, _loc11_ - Const.SCROLL_HEIGHT - 2);
			gr.lineTo(_loc13_, _loc11_);
			gr.lineStyle(0, Const.BORDER_SHADOW_COLOR, 1);
			gr.moveTo(_loc9_ + 1, _loc11_ - Const.SCROLL_HEIGHT - 2 - 0.5);
			if (_loc5_.contains(_loc7_))
			{
				gr.lineTo(_loc9_ + 1, _loc7_.y + _loc7_.height - 1);
				gr.moveTo(_loc9_ + 1, _loc7_.y + 1);
			}
			gr.lineTo(_loc9_ + 1, _loc16_ + 1);
			gr.lineTo(Const.MOVIE_WIDTH - 1, _loc16_ + 1);
			gr.lineTo(Const.MOVIE_WIDTH - 1, 0);
			gr.lineTo(0, 0);
			gr.lineTo(0, _loc16_ + 1);
			gr.lineTo(_loc8_ - 1, _loc16_ + 1);
			if (_loc5_.contains(_loc6_))
			{
				gr.lineTo(_loc8_ - 1, _loc6_.y + 1);
				gr.moveTo(_loc8_ - 1, _loc6_.y + _loc6_.height - 1);
			}
			gr.lineTo(_loc8_ - 1, _loc11_ - Const.SCROLL_HEIGHT - 2);
			if (Const.INDICATOR_ENABLED)
			{
				gr.lineStyle(0, Const.HORIZONTAL_LINE_COLOR, 1);
				const _loc17_ = this.displayManager.getViewPoints();

				_loc19_ = 1;
				for (let _loc18_ = 0; _loc18_ < _loc17_.length; _loc18_++)
				{
					if (Const.INDEPENDENT_INDICATOR_NAMES.indexOf(_loc17_[_loc18_].name) !== -1 || _loc17_[_loc18_].name === Const.BOTTOM_VIEW_POINT_NAME)
					{
						const _loc20_ = _loc16_ - Const.TECHNICAL_INDICATOR_HEIGHT * _loc19_;
						gr.moveTo(1, _loc20_);
						gr.lineTo(Const.MOVIE_WIDTH - 1 - 1, _loc20_);
						_loc19_++;
					}
				}
			}
		}
	}
}
