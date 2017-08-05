namespace mx.core
{
	// import flash.display.Bitmap;
	// import mx.utils.NameUtil;
	// import flash.display.BitmapData;

	export class FlexBitmap extends flash.display.Bitmap
	{
		constructor(public bitmapData: flash.display.BitmapData|null = null, pixelSnapping = "auto", smoothing: boolean = false)
		{
			super();
			//super(bitmapData, pixelSnapping, smoothing);
			try
			{
				this.name = mx.utils.NameUtil.createUniqueName(this);
				return;
			}
			catch (e /*:Error*/)
			{
				return;
			}
		}

		toString(): string
		{
			return mx.utils.NameUtil.displayObjectToString(this);
		}
	}
}
