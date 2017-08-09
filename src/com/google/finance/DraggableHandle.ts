/// <reference path="../../../flash/display/Sprite.ts" />

namespace com.google.finance
{
	// import flash.display.Sprite;
	// import flash.display.SimpleButton;

	export class DraggableHandle extends flash.display.Sprite
	{
		readonly button = new flash.display.SimpleButton();

		constructor(param1: typeof flash.display.Bitmap, param2: typeof flash.display.Bitmap)
		{
			super();
			this.button.overState = this.button.downState = new param2();
			this.button.hitTestState = this.button.upState = new param1();
			this.button.useHandCursor = false;
			this.addChild(this.button);
		}
	}
}
