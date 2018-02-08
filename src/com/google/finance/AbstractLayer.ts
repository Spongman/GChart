import { Sprite } from "../../../flash/display/Sprite";
import { Context, IViewPoint } from './ViewPoint';
import { DataSeries } from './DataSeries';
import { TickPositions, Const } from './Const';
import { DataSource } from './DataSource';
import { DisplayObject } from '../../../flash/display/DisplayObject';

export class AbstractLayer<T extends IViewPoint> extends Sprite
{
	layerId: string|undefined;
	layerType: string|undefined;

	textCanvas: Sprite|undefined;

	lineColor: number|undefined;
	lineThickness: number|undefined;
	lineVisibility: number|undefined;

	hasText: boolean|undefined;
	type: string|undefined;

	constructor(public readonly viewPoint: T, public dataSource: DataSource)
	{
		super();
	}

	static drawVerticalLine(displayObject: DisplayObject, x: number, color: number, alpha: number, top: number, bottom: number, tickHeight: number, tickPosition: TickPositions, param9 = true)
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