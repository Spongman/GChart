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

			const windowLayer = this.topViewPoint.windowLayer;
			const leftHandle = windowLayer.leftHandle;
			const rightHandle = windowLayer.rightHandle;
			let handleLeftX = Math.floor(this.topViewPoint.getHandleLeftX());
			let handleRightX = Math.floor(this.topViewPoint.getHandleRightX());
			//const _loc10_ = Const.MOVIE_WIDTH;
			const _loc11_ = Const.MOVIE_HEIGHT;
			if (handleLeftX <= 0 || handleRightX <= 0)
				return;

			if (handleLeftX === handleRightX)
			{
				handleLeftX = handleLeftX - 3;
				handleRightX = handleRightX + 3;
			}
			const scrollSlider = windowLayer.scrollSlider;
			const gr = _loc4_.graphics;
			gr.clear();
			const _loc13_ = Math.floor(scrollSlider.x);
			const _loc14_ = Math.floor(scrollSlider.x + scrollSlider.width);
			if (handleLeftX === _loc13_ - 1)
				handleLeftX = _loc13_;

			if (handleRightX === _loc14_ + 1)
				handleRightX = _loc14_;

			const _loc16_ = _loc11_ - Const.SPARKLINE_HEIGHT - Const.SPARK_PADDING;
			gr.lineStyle(0, Const.BORDER_LINE_COLOR, Const.BORDER_LINE_OPACITY);
			gr.moveTo(_loc13_, _loc11_ - 1);
			gr.lineTo(_loc14_, _loc11_ - 1);
			gr.lineTo(_loc14_, _loc11_ - Const.SCROLL_HEIGHT - 2);
			gr.lineTo(handleRightX, _loc11_ - Const.SCROLL_HEIGHT - 2);
			if (windowLayer.contains(leftHandle))
			{
				gr.lineTo(handleRightX, rightHandle.y + rightHandle.height - 1);
				gr.moveTo(handleRightX, rightHandle.y + 1);
			}
			gr.lineTo(handleRightX, _loc16_);
			gr.lineTo(Const.MOVIE_WIDTH - 1 - 1, _loc16_);
			gr.lineTo(Const.MOVIE_WIDTH - 1 - 1, 1);
			gr.lineTo(1, 1);
			gr.lineTo(1, _loc16_);
			gr.lineTo(handleLeftX, _loc16_);
			if (windowLayer.contains(leftHandle))
			{
				gr.lineTo(handleLeftX, leftHandle.y + 1);
				gr.moveTo(handleLeftX, leftHandle.y + leftHandle.height - 1);
			}
			gr.lineTo(handleLeftX, _loc11_ - Const.SCROLL_HEIGHT - 2);
			gr.lineTo(_loc13_, _loc11_ - Const.SCROLL_HEIGHT - 2);
			gr.lineTo(_loc13_, _loc11_);
			gr.lineStyle(0, Const.BORDER_SHADOW_COLOR, 1);
			gr.moveTo(handleRightX + 1, _loc11_ - Const.SCROLL_HEIGHT - 2 - 0.5);
			if (windowLayer.contains(rightHandle))
			{
				gr.lineTo(handleRightX + 1, rightHandle.y + rightHandle.height - 1);
				gr.moveTo(handleRightX + 1, rightHandle.y + 1);
			}
			gr.lineTo(handleRightX + 1, _loc16_ + 1);
			gr.lineTo(Const.MOVIE_WIDTH - 1, _loc16_ + 1);
			gr.lineTo(Const.MOVIE_WIDTH - 1, 0);
			gr.lineTo(0, 0);
			gr.lineTo(0, _loc16_ + 1);
			gr.lineTo(handleLeftX - 1, _loc16_ + 1);
			if (windowLayer.contains(leftHandle))
			{
				gr.lineTo(handleLeftX - 1, leftHandle.y + 1);
				gr.moveTo(handleLeftX - 1, leftHandle.y + leftHandle.height - 1);
			}
			gr.lineTo(handleLeftX - 1, _loc11_ - Const.SCROLL_HEIGHT - 2);
			if (Const.INDICATOR_ENABLED)
			{
				gr.lineStyle(0, Const.HORIZONTAL_LINE_COLOR, 1);
				const viewPoints = this.displayManager.getViewPoints();

				_loc19_ = 1;
				for (let viewPointIndex = 0; viewPointIndex < viewPoints.length; viewPointIndex++)
				{
					if (Const.INDEPENDENT_INDICATOR_NAMES.indexOf(viewPoints[viewPointIndex].name) !== -1 || viewPoints[viewPointIndex].name === Const.BOTTOM_VIEW_POINT_NAME)
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
