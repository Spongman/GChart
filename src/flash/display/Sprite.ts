namespace flash.display
{
	export class Graphics
	{
		private static _pending: Graphics[] = [];
		private static _blitCanvas:HTMLCanvasElement;
		private static _blitContext:CanvasRenderingContext2D;

		private _context: CanvasRenderingContext2D;
		private _fill = false;
		private _path = false;
		private _pending = false;

		constructor(private element: HTMLElement)
		{
			//this._context = context;
		}

		
		static initialize() {
			Graphics._blitCanvas = document.createElement('canvas');
			Graphics._blitContext = Graphics._blitCanvas.getContext('2d')!;
			Graphics._blitContext.globalCompositeOperation = "copy";
		}


		static cleanupPending()
		{
			var pending = Graphics._pending;
			for (var i = 0; i < pending.length; i++)
			{
				var graphics = pending[i];
				if (graphics._pending)
				{
					graphics._pending = false;
					graphics.endStroke();
				}
			}

			pending.length = 0;
		}

		private _width = 0;
		get width() { return this._width; }

		private _height = 0;
		get height() { return this._height; }

		private ensureCanvas() {

			if (!this._context) {
				
				var canvas = document.createElement("canvas");
				//canvas.style.border = "2px dotted red";
				canvas.width = canvas.height = 0;
				//canvas.width = this.element.offsetWidth;
				//canvas.height = this.element.offsetHeight;
				this.element.appendChild(canvas);
				this._context = canvas.getContext("2d")!;
			}
		}

		private _sized = false;
		_minx: number;
		_maxx: number;
		_miny: number;
		_maxy: number;


		private ensure(w: number, h: number)
		{
			if (w <= this._width && h <= this._height)
				return;

			if (w < this._width)
				w = this._width;
			if (h < this._height)
				w = this._height;

			var context = this._context;
			var canvas = context.canvas;

			if (Graphics._blitCanvas.width < canvas.width)
				Graphics._blitCanvas.width = canvas.width;
			if (Graphics._blitCanvas.height < canvas.height)
				Graphics._blitCanvas.height = canvas.height;

			var foo = context.globalCompositeOperation;
			context.globalCompositeOperation = "copy";
			Graphics._blitContext.globalCompositeOperation = "copy";
			Graphics._blitContext.drawImage(canvas, 0, 0);
			context.globalCompositeOperation = foo;

			canvas.width = w;
			canvas.height = h;
			context.drawImage(Graphics._blitCanvas,
				0, 0, w, h,
				0, 0, w, h
			);

			this._width = w;
			this._height = h;
			
			this.setStyle();
			return;

			if (w >= 0 && h >= 0)
			{
				if (this._sized) {
					if (this._minx > w)
						this._minx = w;
					if (this._maxx < w)
						this._maxx = w;
					
					if (this._miny > h)
						this._miny = h;
					if (this._maxy < h)
						this._maxy = h;
				}
				else {
					this._minx = this._maxx = w;
					this._miny = this._maxy = h;
					this._sized = true;
				}

				//console.log(this._minx + "," + this._miny + "->" + this._maxx + "," + this._maxy);

				if (w > this._width || h > this._height)
				{
					var context = this._context;
					var canvas = context.canvas;
					w += 5 + context.lineWidth / 2;
					h += 5 + context.lineWidth / 2;

					var oldWidth = canvas.width;
					var oldHeight = canvas.height;
					if (oldWidth > 0 && oldHeight > 0)
					{
						let temp_cnvs = document.createElement('canvas');
						let temp_cntx = notnull(temp_cnvs.getContext('2d'));
						temp_cnvs.width = canvas.width;
						temp_cnvs.height = canvas.height;
						temp_cntx.drawImage(canvas, 0, 0);

						canvas.width = w;
						canvas.height = h;
						context.drawImage(temp_cnvs, 0, 0);
					}
					else
					{
						canvas.width = w;
						canvas.height = h;

						//context.clearRect(0, 0, w, h);
					}

					this._width = w;
					this._height = h;
					
					this.setStyle();
					//context.moveTo(this._x, this._y);
				}
			}
		}

		private endStroke()
		{
			this.endFill();
			if (this._path)
			{
				this._path = false;
				if (this._alpha > 0)
					this._context.stroke();
			}
		}

		private beginStroke()
		{
			if (!this._path)
			{
				this._path = true;
				this.ensureCanvas();
				this._context.beginPath();
				this._context.moveTo(this._x, this._y);

				if (!this._pending)
				{
					this._pending = true;
					Graphics._pending.push(this);
				}
			}
		}

		_x: number;
		_y: number;

		moveTo(x: number, y: number)
		{
			this.beginStroke();
			this.ensure(x, y);
			this._context.moveTo(x, y);
			this._x = x;
			this._y = y;
		}

		lineTo(x: number, y: number)
		{
			x = Math.floor(x);
			y = Math.floor(y);

			this.beginStroke();
			this.ensure(x, y);
			this._context.lineTo(x, y);
			this._x = x;
			this._y = y;
		}

		_thickness: number;
		_color: number;
		_alpha: number;

		lineStyle(thickness: number, color: number, alpha = 1)
		{
			if (thickness < 0)
				thickness = 0;

			if (alpha > 1)
				alpha = 1;

			if (thickness === this._thickness &&
				color === this._color &&
				alpha === this._alpha)
			{
				return;
			}

			this._thickness = thickness;
			this._alpha = alpha;
			this._color = color;

			this.endStroke();
			this.setStyle();
		}

		private setStyle()
		{
			this.ensureCanvas();
			this._context.strokeStyle = cssColor(this._color, this._alpha);
			var thickness = this._thickness;
			this._context.lineWidth = thickness;
			if (thickness > 4)
				this._context.lineCap = "round";
			else
				this._context.lineCap = "butt";
		}

		beginFill(color: number, alpha = 1)
		{
			this.endStroke();

			this.ensureCanvas();
			this._context.fillStyle = cssColor(color, alpha);
			this._context.beginPath();
			this._fill = true;
		}
		endFill()
		{
			if (this._fill)
			{
				this._context.fill();
				this._fill = false;
				this.endStroke();
			}
		}
		clear()
		{
			if (!this._context)
				return;

			this.endStroke();

			//if (!this._sized)
			//	return false;
			
			console.log("clear: " + this._minx + "," + this._miny + "->" + this._maxx + "," + this._maxy);
			
			this._sized = false;

			//this._context.clearRect(this._minx, this._miny, this._maxx - this._minx, this._maxy - this._miny);
			this._context.clearRect(0, 0, this._context.canvas.width, this._context.canvas.height);
		}

		drawRect(x: number, y: number, w: number, h: number)
		{
			//return;
			this.endStroke();

			console.log("drawRect: " + x + ", " + y + " " + w + " x " + h);
			this.ensure(x + w, y + h);

			if (this._fill)
				this._context.fillRect(x, y, w, h);
			else
				this._context.rect(x, y, w, h);
		}

		drawRoundRect(x: number, y: number, w: number, h: number, rx: number, ry: number)
		{
			this.endStroke();

			this.drawRect(x, y, w, h);
		}
	}

	export class Point
	{
		constructor(public x: number, public y: number) { }
	}

	export class Rectangle
	{
		constructor() { }
	}

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
			var graphics = this._graphics;
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

	export class InteractiveObject
		extends DisplayObject
	{
		get mouseEnabled() { return this.element.classList.contains("mouseEnabled"); }
		set mouseEnabled(value: boolean) { this.element.classList.toggle("mouseEnabled", value); }

		constructor(public element: HTMLElement, name?: string)
		{
			super(element, name);
			element.classList.add("mouseEnabled");
		}
	}

	export class DisplayObjectContainer
		extends InteractiveObject
	{
		children: DisplayObject[] = [];
		get numChildren() { return this.children.length; }

		private prepareChild(child: DisplayObject)
		{
			assert(!!child && !!child.element);

			if (child.parent)
				child.parent.removeChild(child);

			var childElement = child.element;
			if (childElement.parentElement)
			{
				assert(childElement.parentElement === document.body);
				childElement.remove();
				childElement.classList.remove("pending");
			}

			child.parent = this;
			child.stage = this.stage;
		}

		addChild(child: DisplayObject)
		{
			assert(!!this.element);

			this.prepareChild(child);

			this.children.push(child);
			this.element.appendChild(child.element);
			return child;
		}
		addChildAt(child: DisplayObject, index: number)
		{
			assert(!!this.element);

			this.prepareChild(child);

			var childBefore = this.children[index];
			this.children.splice(index, 0, child);
			return this.element.insertBefore(child.element, childBefore && childBefore.element);
		}
		removeChild(child: DisplayObject)
		{
			assert(!!child);

			this.removeChildAt(this.getChildIndex(child));
		}
		removeChildAt(i: number)
		{
			assert(i >= 0 && i < this.children.length);

			var child = this.getChildAt(i);
			//this.element.removeChild(child.element);
			child.element.remove();
			this.children.splice(i, 1);
			delete child.parent;
			delete child.stage;
		}
		getChildAt(i: number): DisplayObject
		{
			assert(i >= 0 && i < this.children.length);
			return this.children[i];
		}
		getChildIndex(child: DisplayObject): number
		{
			assert(!!child);

			return this.children.indexOf(child);
		}
		swapChildrenAt(i1: number, i2: number)
		{
			assert(i1 >= 0 && i1 < this.children.length);
			assert(i2 >= 0 && i2 < this.children.length);

			var child1 = this.children[i1];
			var child2 = this.children[i2];
			this.children[i1] = child2;
			this.children[i2] = child1;
			// TODO: swap elements
		}

		contains(child: DisplayObject): boolean
		{
			assert(!!child);

			return this.getChildIndex(child) >= 0;
		}

		_width: number;
		_height: number;

		get width()
		{
			if (this._width != null)
				return this._width;

			let w = 0;
			for (let i = 0; i < this.children.length; i++)
			{
				let child = this.children[i];
				if (child.element.classList.contains("pending"))
					continue;
				let x = child.x + child.width;
				if (w < x)
					w = x;
			}
			if (this._graphics)
			{
				if (w < this._graphics.width)
					w = this._graphics.width;
			}
			return w;
		}

		set width(value: number)
		{
			this._width = value;
			this.element.style.width = value + "px";
		}

		get height()
		{
			if (this._height != null)
				return this._height;

			let h = 0;
			for (let i = 0; i < this.children.length; i++)
			{
				let child = this.children[i];
				if (child.element.classList.contains("pending"))
					continue;
				let y = child.y + child.height;
				if (h < y)
					h = y;
			}
			if (this._graphics)
			{
				if (h < this._graphics.height)
					h = this._graphics.height;
			}
			return h;
		}

		set height(value: number)
		{
			this._height = value;
			this.element.style.height = value + "px";
		}
	}

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
		constructor(elt: HTMLElement)
		{
			super(elt);
			this.stage = this;
			this.mouseEnabled = false;

			/*
			window.addEventListener("resize", () => {
				this.element.dispatchEvent(new Event("resize"));
			});
			*/

			this._width = this.element.clientWidth;
			this._height = this.element.clientHeight;
		}

		align: string;
		get stageWidth(): number
		{
			return this._width; //this.element.clientWidth;
		}

		get stageHeight(): number
		{
			return this._height; //this.element.clientHeight;
		}
		scaleMode: string;

		private _mouseX: number;
		private _mouseY: number;
		get mouseX(): number { return this._mouseX; }
		get mouseY(): number { return this._mouseY; }

		setMouse(x: number, y: number)
		{
			var offset = offsetOf(this.element);
			this._mouseX = x - offset.left;
			this._mouseY = y - offset.top;
		}

		static bind(fToBind: EventListener, oThis: any, ...rest: any[]): EventListener
		{
			var aArgs = Array.prototype.slice.call(arguments, 2),
				fNOP = function () { },
				fBound = function ()
				{
					var value = fToBind.apply(this instanceof fNOP
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
			fBound.prototype = new fNOP();

			return fBound;
		}
	}


	export class Sprite extends DisplayObjectContainer
	{
		constructor(name?: string)
		{
			super(document.createElement("div"), name);
		}
		//mouseCursor: Sprite;
	}


	export class BitmapData
	{
		width: number;
		height: number;
	}

	export class Bitmap extends flash.display.DisplayObject
	{
		protected _width: number;
		protected _height: number;

		constructor()
		{
			super(document.createElement("img"));
			(<HTMLImageElement>this.element).onload = () =>
			{
				if (!this.element.style.width)
					this.element.style.width = (<HTMLImageElement>this.element).naturalWidth + "px";
				if (!this.element.style.height)
					this.element.style.height = (<HTMLImageElement>this.element).naturalHeight + "px";
			};
			(<HTMLImageElement>this.element).src = "images/" + getClassName(this) + ".png";
		}

		get width() { return this._width || this.element.scrollWidth; }
		set width(value: number) { this.element.style.width = value + "px"; }

		get height() { return this._height || this.element.scrollHeight; }
		set height(value: number) { this.element.style.height = value + "px"; }
	}

	export class Shape extends DisplayObject
	{
	}

	export class SimpleButton extends DisplayObjectContainer
	{
		constructor(name?: string)
		{
			var elt = document.createElement("div");
			super(elt, name);
		}

		private _overState: flash.display.DisplayObject;
		get overState() { return this._overState; }
		set overState(value: flash.display.DisplayObject)
		{
			if (this._overState)
			{
				this._overState.element.classList.remove("overState");
				this.removeChild(this._overState);
			}
			this._overState = value;
			if (value)
			{
				this._overState.element.classList.add("overState");
				this.addChild(this._overState);
			}
		}

		private _downState: flash.display.DisplayObject;
		get downState() { return this._downState; }
		set downState(value: flash.display.DisplayObject)
		{
			if (this._downState)
			{
				this._downState.element.classList.remove("downState");
				this.removeChild(this._downState);
			}
			this._downState = value;
			if (value)
			{
				this._downState.element.classList.add("downState");
				this.addChild(this._downState);
			}
		}

		private _hitTestState: flash.display.DisplayObject;
		get hitTestState() { return this._hitTestState; }
		set hitTestState(value: flash.display.DisplayObject)
		{
			if (this._hitTestState)
			{
				this._hitTestState.element.classList.remove("hitTestState");
				this.removeChild(this._hitTestState);
			}
			this._hitTestState = value;
			if (value)
			{
				this._hitTestState.element.classList.add("hitTestState");
				this.addChild(this._hitTestState);
			}
		}

		private _upState: flash.display.DisplayObject;
		get upState() { return this._upState; }
		set upState(value: flash.display.DisplayObject)
		{
			if (this._upState)
			{
				this._upState.element.classList.remove("upState");
				this.removeChild(this._upState);
			}
			this._upState = value;
			if (value)
			{
				this._upState.element.classList.add("upState");
				this.addChild(this._upState);
			}
		}

		get useHandCursor(): boolean { return this.element.classList.contains("handCursor"); }
		set useHandCursor(value: boolean) { this.element.classList.toggle("handCursor", value); }
		enabled: boolean;

		scaleX: number;
		scaleY: number;
	}

	Graphics.initialize();
}