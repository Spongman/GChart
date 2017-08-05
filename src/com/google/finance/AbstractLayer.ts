/// <reference path="../../../flash/display/Sprite.ts" />

namespace com.google.finance
{
	export class AbstractLayer<T extends IViewPoint> extends flash.display.Sprite
	{
		private _dataSource: com.google.finance.DataSource;

		layerId: string;
		layerType: string;

		textCanvas: flash.display.Sprite;

		lineColor: number;
		lineThickness: number;
		lineVisibility: number;

		hasText: boolean;

		type: string;
		
		constructor(public viewPoint: T, public dataSource: com.google.finance.DataSource)
		{
			super();
		}

		static drawVerticalLine(param1: flash.display.DisplayObject, param2: number, param3: number, param4: number, param5: number, param6: number, param7: number, param8: number, param9 = true) 
		{
			param2 = Math.floor(param2) + 0.5;
			param1.graphics.moveTo(param2, param5 + 1);
			switch (param8)
			{
				case Const.BOTTOM:
					param1.graphics.lineStyle(0, param3, param4);
					param1.graphics.lineTo(param2, param6 - param7);
					param1.graphics.lineStyle(0, Const.BOTTOM_TICK_COLOR, 1);
					param1.graphics.lineTo(param2, param6);
					break;
				case Const.TOP:
					param1.graphics.lineStyle(0, Const.TOP_TICK_COLOR, 1);
					param1.graphics.lineTo(param2, param5 + 1 + param7);
					if (param9)
					{
						param1.graphics.lineStyle(0, param3, param4);
						param1.graphics.lineTo(param2, param6);
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
