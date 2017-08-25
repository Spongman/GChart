/// <reference path="../../../flash/display/Sprite.ts" />
/// <reference path="ScrollSlider_ScrollBarGrip.ts" />
/// <reference path="ScrollSlider_ScrollBarBg.ts" />

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

		constructor(name?: string)
		{
			super(name);
			this.addChild(this.bg);
			this.addChild(this.middle);
		}

		setWidth(width: number)
		{
			if (width < ScrollSlider.MIN_WIDTH)
				width = ScrollSlider.MIN_WIDTH;

			this.middle.x = Math.floor(width / 2) - this.middle.width / 2;
			this.bg.width = width - 2;
		}
	}
}
