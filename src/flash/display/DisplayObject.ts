namespace flash.display
{
	export class DisplayObject
	{
		public name: string;

		constructor(public readonly element: HTMLElement, name?: string)
		{
			assert(!(<any>element).displayObject);
			(<any>element).displayObject = this;

			assert(!!element);
			if (!element.parentElement)
			{
				element.classList.add("pending");
				document.body.appendChild(element);
			}

			this.name = (name ? name + ":" : "") + getClassName(this);
			element.setAttribute("name", this.name);

			/*
			try
			{
				throw new Error();
			}
			catch (error)
			{
				element.setAttribute("stack", error.stack);
			}
			*/
		}

		protected _graphics: Graphics;
		get graphics(): Graphics
		{
			return this._graphics || (this._graphics = new Graphics(this.element));
		}

		protected _stage: Stage;
		get stage() { return this._stage; }
		set stage(value: Stage) { this._stage = value; }

		_x = 0;
		get x(): number { return this._x; }
		set x(value: number)
		{
			this._x = value;
			this.element.style.left = value + "px";
		}

		_y = 0;
		get y(): number { return this._y; }
		set y(value: number)
		{
			this._y = value;
			this.element.style.top = value + "px";
		}

		get width() { return this.element.offsetWidth; }
		get height() { return this.element.offsetHeight; }

		get visible() { return this.element.style.visibility !== "hidden"; }
		set visible(value: boolean) { this.element.style.visibility = value ? "" : "hidden"; }

		get mouseX(): number { return this._x + this.parent.mouseX; }
		get mouseY(): number { return this._y + this.parent.mouseY; }

		background: boolean;
		backgroundColor: number;
		borderColor: number;
		border: boolean;
		focusRect: Rectangle;

		tabEnabled: boolean;
		tabIndex: number;

		scaleX: number;
		scaleY: number;

		parent: DisplayObjectContainer;

		addEventListener(e: string, f: EventListenerOrEventListenerObject)
		{
			this.element.addEventListener(e, f);
		}

		removeEventListener(type: string, listener?: EventListenerOrEventListenerObject, useCapture?: boolean): void
		{
			this.element.removeEventListener(type, listener);
		}

		hitTestPoint(x: number, y: number, shapeFlag = false): boolean
		{
			const pt = this.globalToLocal(new flash.display.Point(x, y));
			return pt.x >= 0 && pt.x < this.width &&
				pt.y >= 0 && pt.y < this.height;
		}

		globalToLocal(point: flash.display.Point): flash.display.Point
		{
			let node: DisplayObject = this;
			do
			{
				point.x -= node._x;
				point.y -= node._y;
				node = node.parent;
			}
			while (node);
			return point;
		}
	}

	export class Shape extends DisplayObject
	{
	}
}
