namespace com.google.finance
{
	// import flash.text.TextFormat;
	// import flash.text.TextField;
	// import flash.text.TextFieldAutoSize;
	
	export class NoDataAvailableLayer extends AbstractLayer<ViewPoint>
	{
		private text: flash.text.TextField;

		constructor(param1: ViewPoint, param2: DataSource)
		{
			super(param1,param2);
		}
		
		renderLayer(param1: Context) 
		{
			if (!this.text)
			{
				this.text = new flash.text.TextField();
				const _loc2_ = new flash.text.TextFormat("Arial",12,0,false,false,false);
				this.text.defaultTextFormat = _loc2_;
				this.text.autoSize = flash.text.TextFieldAutoSize.CENTER;
				this.text.selectable = false;
				this.text.text = Messages.getMsg(Messages.NO_DATA_AVAILABLE);
			}
			if (this.contains(this.text))
				this.removeChild(this.text);

			this.text.x = (this.viewPoint.maxx - this.viewPoint.minx) / 2 - this.text.width / 2;
			this.text.y = (this.viewPoint.maxy - this.viewPoint.miny) / 2;
			this.addChild(this.text);
		}
	}
}
