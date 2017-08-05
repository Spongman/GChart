namespace com.google.finance
{
	export class BottomBarLayer extends AbstractLayer<ViewPoint>
	{
		bottomTextHeight = 15;

		constructor(param1: ViewPoint, param2: DataSource)
		{
			super(param1, param2);
			param1.bottomTextHeight = this.bottomTextHeight;
		}

		private drawRectangle(param1: number, param2: number, param3: number, param4: number, param5: number, param6: number) 
		{
			this.graphics.lineStyle(0, 0, 0);
			this.graphics.beginFill(param1, param2);
			this.graphics.moveTo(param3, param4);
			this.graphics.lineTo(param5, param4);
			this.graphics.lineTo(param5, param6);
			this.graphics.lineTo(param3, param6);
			this.graphics.lineTo(param3, param4);
			this.graphics.endFill();
		}

		renderLayer(context: Context) 
		{
			this.graphics.clear();
			this.drawRectangle(Const.TEXT_BACKGROUND_COLOR, 80, this.viewPoint.minx, this.viewPoint.maxy - this.bottomTextHeight, this.viewPoint.maxx, this.viewPoint.maxy);
		}
	}
}
