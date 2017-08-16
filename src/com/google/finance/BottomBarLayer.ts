namespace com.google.finance
{
	export class BottomBarLayer extends AbstractLayer<ViewPoint>
	{
		bottomTextHeight = 15;

		constructor(viewPoint: ViewPoint, dataSource: DataSource)
		{
			super(viewPoint, dataSource);
			viewPoint.bottomTextHeight = this.bottomTextHeight;
		}

		private drawRectangle(color: number, alpha: number, x1: number, y1: number, x2: number, y2: number)
		{
			const gr = this.graphics;
			gr.lineStyle(0, 0, 0);
			gr.beginFill(color, alpha);
			gr.drawRect(x1, y1, x2 - x1, y2 - y1);
			/*
			gr.moveTo(param3, param4);
			gr.lineTo(param5, param4);
			gr.lineTo(param5, param6);
			gr.lineTo(param3, param6);
			gr.lineTo(param3, param4);
			*/
			gr.endFill();
		}

		renderLayer(context: Context)
		{
			this.graphics.clear();
			this.drawRectangle(Const.TEXT_BACKGROUND_COLOR, 80, this.viewPoint.minx, this.viewPoint.maxy - this.bottomTextHeight, this.viewPoint.maxx, this.viewPoint.maxy);
		}
	}
}
