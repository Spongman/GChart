import { DisplayObject } from "../../../flash/display/DisplayObject";
import { Sprite } from "../../../flash/display/Sprite";

// import flash.display.Sprite;
// import flash.utils.setInterval;
// import flash.utils.clearInterval;

export class AnimationManager extends Sprite {
	private static readonly ANIMATION_FRAME_LENGTH_MS = 40;
	private static readonly MAX_STEPS = 10;

	private intervalId: number;
	private stepCount = 0;
	// private listeners: any[];
	private amount = 0;

	animate(lfunctions: Array<(displayObject: DisplayObject, amount: number, clicked: boolean) => void>, displayObjects: DisplayObject[], param3 = NaN, param4 = false) {
		const lobjects = displayObjects;
		const opt_stepCount = param3;
		const opt_pinClicked = param4;
		this.stepCount = isNaN(opt_stepCount) ? AnimationManager.MAX_STEPS : opt_stepCount;
		this.amount = 1;
		this.stopAnimation();
		if (this.stepCount === 1) {
			for (let j = 0; j < lfunctions.length; j++) {
				lfunctions[j](lobjects[j], 0, opt_pinClicked);
			}

			return;
		}
		this.intervalId = setInterval(() => {
			this.stepCount--;

			for (let functionIndex = 0; functionIndex < lfunctions.length; functionIndex++) {
				lfunctions[functionIndex](lobjects[functionIndex], this.amount, opt_pinClicked);
			}

			if (this.stepCount <= 0) {
				for (let functionIndex = 0; functionIndex < lfunctions.length; functionIndex++) {
					lfunctions[functionIndex](lobjects[functionIndex], 0, opt_pinClicked);
				}

				this.stopAnimation();
			}
			this.amount = this.amount / 3;
		},
			AnimationManager.ANIMATION_FRAME_LENGTH_MS,
		);
	}

	stopAnimation() {
		clearInterval(this.intervalId);
		this.intervalId = NaN;
	}

	isAnimating(): boolean {
		return !isNaN(this.intervalId);
	}
}
