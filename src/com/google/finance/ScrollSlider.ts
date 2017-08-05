/// <reference path="../../../flash/display/Sprite.ts" />

namespace com.google.finance
{
	// import flash.display.Sprite;
	// import flash.display.Bitmap;

	export class ScrollSlider extends flash.display.Sprite
	{
		static readonly MIN_WIDTH = 18;


		private middle: flash.display.Bitmap;

		private readonly ScrollBarGrip = ScrollSlider_ScrollBarGrip;

		private readonly ScrollBarBg = ScrollSlider_ScrollBarBg;

		private bg: flash.display.Bitmap;

		constructor(name?:string)
		{
			super(name);
			this.middle = new this.ScrollBarGrip();
			this.bg = new this.ScrollBarBg();
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
