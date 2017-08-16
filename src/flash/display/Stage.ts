namespace flash.display
{

	export abstract class StageAlign
	{
		static readonly TOP_LEFT = "top-left";
	}

	export abstract class StageScaleMode
	{
		static readonly NO_SCALE = "no-scale";
	}

	export class Stage
		extends DisplayObjectContainer
	{
		align: string;
		scaleMode: string;

		constructor(elt: HTMLElement)
		{
			super(elt);

			flash.display.Graphics.initialize();

			this.stage = this;
			this.mouseEnabled = false;

			window.addEventListener("resize", () =>
			{
				this.element.dispatchEvent(new Event("resize"));
			});
		}

		get width() { return this.stageWidth; }
		get height() { return this.stageHeight; }

		get stageWidth(): number
		{
			return this.element.clientWidth;
		}

		get stageHeight(): number
		{
			return this.element.clientHeight;
		}

		private _mouseX: number;
		private _mouseY: number;
		get mouseX(): number { return this._mouseX; }
		get mouseY(): number { return this._mouseY; }

		setMouse(x: number, y: number)
		{
			let offset = offsetOf(this.element);
			this._mouseX = x - offset.left;
			this._mouseY = y - offset.top;
		}

		static bind(fToBind: Function, oThis: any, ...rest: any[]): EventListener
		{
			let aArgs = Array.prototype.slice.call(arguments, 2),
				fNOP = function () { },
				fBound = function ()
				{
					let value = fToBind.apply(this instanceof fNOP
						? this
						: oThis,
						aArgs.concat(Array.prototype.slice.call(arguments)));

					flash.display.Graphics.cleanupPending();

					return value;
				};

			if (this.prototype)
			{
				// Function.prototype doesn't have a prototype property
				fNOP.prototype = this.prototype;
			}
			fBound.prototype = new (<any>fNOP)();

			return fBound;
		}
	}
}