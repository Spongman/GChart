import { Sprite } from "../../../flash/display/Sprite";
import { SimpleButton } from '../../../flash/display/SimpleButton';
import { Bitmap } from '../../../flash/display/Bitmap';

	// import flash.display.Sprite;
	// import flash.display.SimpleButton;

export class DraggableHandle extends Sprite {
		readonly button = new SimpleButton();

		constructor(param1: typeof Bitmap, param2: typeof Bitmap) {
			super();
			this.button.overState = this.button.downState = new param2();
			this.button.hitTestState = this.button.upState = new param1();
			this.button.useHandCursor = false;
			this.addChild(this.button);
		}
	}
