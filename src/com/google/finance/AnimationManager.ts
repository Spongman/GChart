/// <reference path="../../../flash/display/Sprite.ts" />

namespace com.google.finance
{
	// import flash.display.Sprite;
	// import flash.utils.setInterval;
	// import flash.utils.clearInterval;

	export class AnimationManager extends flash.display.Sprite
	{
		private static readonly ANIMATION_FRAME_LENGTH_MS = 40;
		private static readonly MAX_STEPS = 10;

		private intervalId: number;
		private stepCount = 0;
		//private listeners: any[];
		private amount = 0;

		animate(lfunctions: { (displayObject: flash.display.DisplayObject, amount: number, clicked: boolean): void }[], displayObjects: flash.display.DisplayObject[], param3 = NaN, param4 = false)
		{
			let lobjects = displayObjects;
			let opt_stepCount = param3;
			let opt_pinClicked = param4;
			this.stepCount = !!isNaN(opt_stepCount) ? AnimationManager.MAX_STEPS : opt_stepCount;
			this.amount = 1;
			this.stopAnimation();
			if (this.stepCount === 1)
			{
				for (let j = 0; j < lfunctions.length; j++)
					lfunctions[j](lobjects[j], 0, opt_pinClicked);

				return;
			}
			this.intervalId = setInterval(() =>
			{
				this.stepCount--;

				for (let functionIndex = 0; functionIndex < lfunctions.length; functionIndex++)
					lfunctions[functionIndex](lobjects[functionIndex], this.amount, opt_pinClicked);

				if (this.stepCount <= 0)
				{
					for (let functionIndex = 0; functionIndex < lfunctions.length; functionIndex++)
						lfunctions[functionIndex](lobjects[functionIndex], 0, opt_pinClicked);

					this.stopAnimation();
				}
				this.amount = this.amount / 3;
			}, AnimationManager.ANIMATION_FRAME_LENGTH_MS);
		}

		stopAnimation()
		{
			clearInterval(this.intervalId);
			this.intervalId = NaN;
		}

		isAnimating(): boolean
		{
			return !isNaN(this.intervalId);
		}
	}
}
