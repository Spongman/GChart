namespace flash.display
{
	export class DisplayObject
	{
		constructor(public element: HTMLElement, name?: string)
		{
			assert(!(<any>this.element).displayObject);
			(<any>this.element).displayObject = this;

			assert(!!element);
			if (!element.parentElement)
			{
				element.classList.add("pending");
				document.body.appendChild(element);
			}

			name = name ? name + ":" : "";
			element.setAttribute("name", name + getClassName(this));

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

		name: string;

		protected _graphics: Graphics;
		get graphics(): Graphics
		{
			let graphics = this._graphics;
			if (graphics == null)
			{
				this._graphics = graphics = new Graphics(this.element);
			}
			return graphics;
		}

		stage: Stage;

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

		hitTestPoint(x: number, y: number, shapeFlag = false): boolean { return false; }

		globalToLocal(param1: flash.display.Point): flash.display.Point
		{
			let node: DisplayObject = this;
			do
			{
				param1.x -= node._x;
				param1.y -= node._y;
				node = node.parent;
			}
			while (node);
			return param1;
		}
	}

	export class Shape extends DisplayObject
	{
	}	
}