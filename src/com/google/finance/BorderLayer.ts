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

		update(borderLayer?: BorderLayer, param2 = 0, param3 = false)
		{
			if (borderLayer)
			{
				this.topViewPoint = borderLayer.topViewPoint;
			}
			else
			{
				// TODO:
				//_loc4_ = {};
				//if (this.topViewPoint.windowLayer)
				//	debugger;
				borderLayer = this;
			}

			if (!this.topViewPoint.windowLayer)
				return;

			const windowLayer = this.topViewPoint.windowLayer;
			const leftHandle = windowLayer.leftHandle;
			const rightHandle = windowLayer.rightHandle;
			let handleLeftX = Math.floor(this.topViewPoint.getHandleLeftX());
			let handleRightX = Math.floor(this.topViewPoint.getHandleRightX());
			//const _loc10_ = Const.MOVIE_WIDTH;
			const height = Const.MOVIE_HEIGHT;
			if (handleLeftX <= 0 || handleRightX <= 0)
				return;

			if (handleLeftX === handleRightX)
			{
				handleLeftX = handleLeftX - 3;
				handleRightX = handleRightX + 3;
			}
			const scrollSlider = windowLayer.scrollSlider;
			const gr = borderLayer.graphics;
			gr.clear();
			const left = Math.floor(scrollSlider.x);
			const right = Math.floor(scrollSlider.x + scrollSlider.width);
			if (handleLeftX === left - 1)
				handleLeftX = left;

			if (handleRightX === right + 1)
				handleRightX = right;

			const yPos = height - Const.SPARKLINE_HEIGHT - Const.SPARK_PADDING;
			gr.lineStyle(0, Const.BORDER_LINE_COLOR, Const.BORDER_LINE_OPACITY);
			gr.moveTo(left, height - 1);
			gr.lineTo(right, height - 1);
			gr.lineTo(right, height - Const.SCROLL_HEIGHT - 2);
			gr.lineTo(handleRightX, height - Const.SCROLL_HEIGHT - 2);
			if (windowLayer.contains(leftHandle))
			{
				gr.lineTo(handleRightX, rightHandle.y + rightHandle.height - 1);
				gr.moveTo(handleRightX, rightHandle.y + 1);
			}
			gr.lineTo(handleRightX, yPos);
			gr.lineTo(Const.MOVIE_WIDTH - 1 - 1, yPos);
			gr.lineTo(Const.MOVIE_WIDTH - 1 - 1, 1);
			gr.lineTo(1, 1);
			gr.lineTo(1, yPos);
			gr.lineTo(handleLeftX, yPos);
			if (windowLayer.contains(leftHandle))
			{
				gr.lineTo(handleLeftX, leftHandle.y + 1);
				gr.moveTo(handleLeftX, leftHandle.y + leftHandle.height - 1);
			}
			gr.lineTo(handleLeftX, height - Const.SCROLL_HEIGHT - 2);
			gr.lineTo(left, height - Const.SCROLL_HEIGHT - 2);
			gr.lineTo(left, height);
			gr.lineStyle(0, Const.BORDER_SHADOW_COLOR, 1);
			gr.moveTo(handleRightX + 1, height - Const.SCROLL_HEIGHT - 2 - 0.5);
			if (windowLayer.contains(rightHandle))
			{
				gr.lineTo(handleRightX + 1, rightHandle.y + rightHandle.height - 1);
				gr.moveTo(handleRightX + 1, rightHandle.y + 1);
			}
			gr.lineTo(handleRightX + 1, yPos + 1);
			gr.lineTo(Const.MOVIE_WIDTH - 1, yPos + 1);
			gr.lineTo(Const.MOVIE_WIDTH - 1, 0);
			gr.lineTo(0, 0);
			gr.lineTo(0, yPos + 1);
			gr.lineTo(handleLeftX - 1, yPos + 1);
			if (windowLayer.contains(leftHandle))
			{
				gr.lineTo(handleLeftX - 1, leftHandle.y + 1);
				gr.moveTo(handleLeftX - 1, leftHandle.y + leftHandle.height - 1);
			}
			gr.lineTo(handleLeftX - 1, height - Const.SCROLL_HEIGHT - 2);
			if (Const.INDICATOR_ENABLED)
			{
				gr.lineStyle(0, Const.HORIZONTAL_LINE_COLOR, 1);
				const viewPoints = this.displayManager.getViewPoints();

				let renderedViewPointIndex = 1;
				for (const viewPoint of viewPoints)
				{
					if (Const.INDEPENDENT_INDICATOR_NAMES.indexOf(viewPoint.name) !== -1 || viewPoint.name === Const.BOTTOM_VIEW_POINT_NAME)
					{
						const yPos2 = yPos - Const.TECHNICAL_INDICATOR_HEIGHT * renderedViewPointIndex;
						gr.moveTo(1, yPos2);
						gr.lineTo(Const.MOVIE_WIDTH - 1 - 1, yPos2);
						renderedViewPointIndex++;
					}
				}
			}
		}
	}
}
