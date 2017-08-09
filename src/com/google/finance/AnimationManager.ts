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

		animate(param1: { (param1: flash.display.DisplayObject, param2: number, param3: boolean): void }[], param2: flash.display.DisplayObject[], param3 = NaN, param4 = false) 
		{
			let lfunctions = param1;
			let lobjects = param2;
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

				for (let _loc1_ = 0; _loc1_ < lfunctions.length; _loc1_++)
					lfunctions[_loc1_](lobjects[_loc1_], this.amount, opt_pinClicked);

				if (this.stepCount <= 0)
				{
					for (let _loc1_ = 0; _loc1_ < lfunctions.length; _loc1_++)
						lfunctions[_loc1_](lobjects[_loc1_], 0, opt_pinClicked);

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
