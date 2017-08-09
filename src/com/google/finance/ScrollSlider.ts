/// <reference path="../../../flash/display/Sprite.ts" />

namespace com.google.finance
{
	// import flash.display.Sprite;
	// import flash.display.Bitmap;

	export class ScrollSlider extends flash.display.Sprite
	{
		private static readonly MIN_WIDTH = 18;
		private static readonly ScrollBarGrip = ScrollSlider_ScrollBarGrip;
		private static readonly ScrollBarBg = ScrollSlider_ScrollBarBg;

		private readonly middle = new ScrollSlider.ScrollBarGrip();
		private readonly bg = new ScrollSlider.ScrollBarBg();

		constructor(name?:string)
		{
			super(name);
			this.addChild(this.bg);
			this.addChild(this.middle);
		}

		setWidth(param1: number) 
		{
			if (param1 < ScrollSlider.MIN_WIDTH)
				param1 = ScrollSlider.MIN_WIDTH;

			this.middle.x = Math.floor(param1 / 2) - this.middle.width / 2;
			this.bg.width = param1 - 2;
		}
	}
}
