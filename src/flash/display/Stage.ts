import { DisplayObjectContainer } from "./DisplayObjectContainer";
import { Graphics } from "./Graphics";

export abstract class StageAlign {
	static readonly TOP_LEFT = "top-left";
}

export abstract class StageScaleMode {
	static readonly NO_SCALE = "no-scale";
}

export class Stage
	extends DisplayObjectContainer {
	align: string;
	scaleMode: string;

	constructor(elt: HTMLElement) {
		super(elt);

		Graphics.initialize();

		this.stage = this;
		this.mouseEnabled = false;

		window.addEventListener("resize", () => {
			this.element.dispatchEvent(new Event("resize"));
		});
	}

	get width() { return this.stageWidth; }
	get height() { return this.stageHeight; }

	get stageWidth(): number {
		return this.element.clientWidth;
	}

	get stageHeight(): number {
		return this.element.clientHeight;
	}

	private _mouseX: number;
	private _mouseY: number;
	get mouseX(): number { return this._mouseX; }
	get mouseY(): number { return this._mouseY; }

	setMouse(x: number, y: number) {
		const offset = offsetOf(this.element);
		this._mouseX = x - offset.left;
		this._mouseY = y - offset.top;
	}

	// tslint:disable-next-line:rule1
	static bind(fToBind: Function, oThis: any, ...rest: any[]): EventListener {
		const aArgs = Array.prototype.slice.call(arguments, 2);
		const fNOP = () => {
			// do nothing
		};
		function fBound() {
			const value = fToBind.apply(
				this instanceof fNOP ? this : oThis,
				aArgs.concat(Array.prototype.slice.call(arguments)));

			Graphics.cleanupPending();

			return value;
		}

		if (this.prototype) {
			fNOP.prototype = this.prototype;
		}

		fBound.prototype = new (fNOP as any)();

		return fBound;
	}
}
