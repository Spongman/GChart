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

		static drawVerticalLine(displayObject: flash.display.DisplayObject, x: number, color: number, alpha: number, param5: number, param6: number, param7: number, param8: number, param9 = true) 
		{
			x = Math.floor(x) + 0.5;
			const gr = displayObject.graphics;
			gr.moveTo(x, param5 + 1);
			switch (param8)
			{
				case TickPositions.BOTTOM:
					gr.lineStyle(0, color, alpha);
					gr.lineTo(x, param6 - param7);
					gr.lineStyle(0, Const.BOTTOM_TICK_COLOR, 1);
					gr.lineTo(x, param6);
					break;
				case TickPositions.TOP:
					gr.lineStyle(0, Const.TOP_TICK_COLOR, 1);
					gr.lineTo(x, param5 + 1 + param7);
					if (param9)
					{
						gr.lineStyle(0, color, alpha);
						gr.lineTo(x, param6);
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
