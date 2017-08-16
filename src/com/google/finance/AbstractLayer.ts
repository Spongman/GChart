/// <reference path="../../../flash/display/Sprite.ts" />

namespace com.google.finance
{
	export class AbstractLayer<T extends IViewPoint> extends flash.display.Sprite
	{
		layerId: string;
		layerType: string;

		textCanvas: flash.display.Sprite;

		lineColor: number;
		lineThickness: number;
		lineVisibility: number;

		hasText: boolean;
		type: string;

		constructor(public readonly viewPoint: T, public dataSource: com.google.finance.DataSource)
		{
			super();
		}

		static drawVerticalLine(displayObject: flash.display.DisplayObject, x: number, color: number, alpha: number, top: number, bottom: number, tickHeight: number, tickPosition: TickPositions, param9 = true)
		{
			x = Math.floor(x) + 0.5;
			const gr = displayObject.graphics;
			gr.moveTo(x, top + 1);
			switch (tickPosition)
			{
				case TickPositions.BOTTOM:
					gr.lineStyle(0, color, alpha);
					gr.lineTo(x, bottom - tickHeight);
					gr.lineStyle(0, Const.BOTTOM_TICK_COLOR, 1);
					gr.lineTo(x, bottom);
					break;
				case TickPositions.TOP:
					gr.lineStyle(0, Const.TOP_TICK_COLOR, 1);
					gr.lineTo(x, top + 1 + tickHeight);
					if (param9)
					{
						gr.lineStyle(0, color, alpha);
						gr.lineTo(x, bottom);
					}
					break;
			}
		}

		renderLayer(context?: Context)
		{
		}

		getDataSeries(context?: Context): DataSeries | null
		{
			return this.dataSource.data;
		}
	}
}
