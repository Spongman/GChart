namespace com.google.finance
{
	// import flash.text.TextFormat;
	// import flash.text.TextField;
	// import flash.text.TextFieldAutoSize;

	export class NoDataAvailableLayer extends AbstractLayer<ViewPoint>
	{
		private text: flash.text.TextField;

		renderLayer(context: Context)
		{
			if (!this.text)
			{
				this.text = new flash.text.TextField();
				this.text.defaultTextFormat = new flash.text.TextFormat("Arial", 12, 0, false, false, false);
				this.text.autoSize = flash.text.TextFieldAutoSize.CENTER;
				this.text.selectable = false;
				this.text.text = Message.getMsg(Messages.NO_DATA_AVAILABLE);
			}
			if (this.contains(this.text))
				this.removeChild(this.text);

			this.text.x = (this.viewPoint.maxx - this.viewPoint.minx) / 2 - this.text.width / 2;
			this.text.y = (this.viewPoint.maxy - this.viewPoint.miny) / 2;
			this.addChild(this.text);
		}
	}
}
