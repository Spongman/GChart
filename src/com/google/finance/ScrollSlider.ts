import { Sprite } from "../../../flash/display/Sprite";
import { ScrollSlider_ScrollBarBg } from "./ScrollSlider_ScrollBarBg";
import { ScrollSlider_ScrollBarGrip } from "./ScrollSlider_ScrollBarGrip";

	// import flash.display.Sprite;
	// import Bitmap;

export class ScrollSlider extends Sprite {
		private static readonly MIN_WIDTH = 18;
		private static readonly ScrollBarGrip = ScrollSlider_ScrollBarGrip;
		private static readonly ScrollBarBg = ScrollSlider_ScrollBarBg;

		private readonly middle = new ScrollSlider.ScrollBarGrip();
		private readonly bg = new ScrollSlider.ScrollBarBg();

		constructor(name?: string) {
			super(name);
			this.addChild(this.bg);
			this.addChild(this.middle);
		}

		setWidth(width: number) {
			if (width < ScrollSlider.MIN_WIDTH) {
				width = ScrollSlider.MIN_WIDTH;
			}

			this.middle.x = Math.floor(width / 2) - this.middle.width / 2;
			this.bg.width = width - 2;
		}
	}
