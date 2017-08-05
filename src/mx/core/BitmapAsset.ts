namespace mx.core
{
	// import flash.display.BitmapData;

	export class BitmapAsset
		extends flash.display.DisplayObject
		//implements IFlexAsset
	{
		visible: boolean;

		constructor(public bitmapData: flash.display.BitmapData|null = null, param2 = "auto", param3: boolean = false)
		{
			super(document.createElement("img"));
		}

		get measuredWidth(): number
		{
			if (this.bitmapData)
			{
				return this.bitmapData.width;
			}
			return 0;
		}

		get measuredHeight(): number
		{
			if (this.bitmapData)
			{
				return this.bitmapData.height;
			}
			return 0;
		}

		/*
		setActualSize(param1: number, param2: number) 
		{
			this.width = param1;
			this.height = param2;
		}
		*/
		move(param1: number, param2: number) 
		{
			this.x = param1;
			this.y = param2;
		}
	}
}
