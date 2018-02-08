
	export class Graphics {
		private static _pending: Graphics[] = [];
		private static _blitCanvas: HTMLCanvasElement;
		private static _blitContext: CanvasRenderingContext2D;

		private _context: CanvasRenderingContext2D;
		private _fill = false;
		private _path = false;
		private _pending = false;

		constructor(private readonly element: HTMLElement) {
			// this._context = context;
		}

		static initialize() {
			Graphics._blitCanvas = document.createElement("canvas");
			Graphics._blitContext = Graphics._blitCanvas.getContext("2d")!;
		}

		static cleanupPending() {
			const pending = Graphics._pending;
			for (const graphics of pending) {
				if (graphics._pending) {
					graphics._pending = false;
					graphics.endFill();
					graphics.endStroke();
				}
			}

			pending.length = 0;
		}

		get width() { return this._maxx || 0; }
		get height() { return this._maxy || 0; }

		private ensureCanvas() {
			if (!this._context) {
				const canvas = document.createElement("canvas");
				canvas.width = canvas.height = 0;
				this.element.appendChild(canvas);
				this._context = canvas.getContext("2d")!;
			}
		}

		private _sized = false;
		_minx: number;
		_maxx: number;
		_miny: number;
		_maxy: number;

		private ensure(x: number, y: number) {
			if (isNaN(x) || isNaN(y)) {
				// TODO: track these down
				return;
			}

			this.ensureCanvas();

			const context = this._context;
			const canvas = context.canvas;

			const to2 = this._thickness / 2 || 0;
			const minx = Math.floor(x - to2);
			const maxx = Math.ceil(x + to2);
			const miny = Math.floor(y - to2);
			const maxy = Math.ceil(y - to2);

			if (!this._sized) {
				this._minx = minx;
				this._maxx = maxx;
				this._miny = miny;
				this._maxy = maxy;
				canvas.style.left = this._minx + "px";
				canvas.style.top = this._miny + "px";
				this._sized = true;
				// if (this._fill || this._path)
				//	console.log("ensure during path");

				context.lineWidth = this._thickness;
				context.lineCap = (this._thickness > 4) ? "round" : "butt";
				context.strokeStyle = cssColor(this._color, this._alpha);

				return;
			}

			if (this._minx <= minx && this._maxx >= maxx &&
				this._miny <= miny && this._maxy >= maxy) {
				return;
			}

			// if (this._fill || this._path)
			//	console.log("ensure during path");

			const oldminx = this._minx;
			const oldminy = this._miny;
			// let oldmaxx = this._maxx;
			// let oldmaxy = this._maxy;

			if (this._minx > minx) {
				this._minx = Math.floor(minx);
				canvas.style.left = this._minx + "px";
			}
			if (this._maxx < maxx) {
				this._maxx = Math.ceil(maxx);
			}

			if (this._miny > miny) {
				this._miny = Math.floor(miny);
				canvas.style.top = this._miny + "px";
			}
			if (this._maxy < maxy) {
				this._maxy = Math.ceil(maxy);
			}

			const w = this._maxx - this._minx;
			const h = this._maxy - this._miny;

			/*
			if (w <= 0 || h <= 0)
				return;
			*/

			const oldWidth = canvas.width;
			const oldHeight = canvas.height;

			if (oldWidth === 0 || oldHeight === 0) {
				canvas.width = w + 5;
				canvas.height = h + 5;
			} else {
				if (Graphics._blitCanvas.width < oldWidth) {
					Graphics._blitCanvas.width = oldWidth;
				}
				if (Graphics._blitCanvas.height < oldHeight) {
					Graphics._blitCanvas.height = oldHeight;
				}

				const globalCompositeOperation = context.globalCompositeOperation;
				context.globalCompositeOperation = "copy";
				Graphics._blitContext.globalCompositeOperation = "copy";
				Graphics._blitContext.drawImage(canvas, 0, 0);
				context.globalCompositeOperation = globalCompositeOperation;

				canvas.width = w + 5;
				canvas.height = h + 5;

				context.drawImage(
					Graphics._blitCanvas,
					0, 0,
					oldWidth, oldHeight,
					oldminx - this._minx, oldminy - this._miny,
					oldWidth, oldHeight,
				);
			}

			context.lineWidth = this._thickness;
			context.lineCap = (this._thickness > 4) ? "round" : "butt";
			context.strokeStyle = cssColor(this._color, this._alpha);
		}

		_x: number;
		_y: number;

		moveTo(x: number, y: number) {
			this.ensure(x, y);

			this.beginStroke();
			this._ops.push(() => {
				this._context.moveTo(x - this._minx, y - this._miny);
			});
			this._x = x;
			this._y = y;
		}

		lineTo(x: number, y: number) {
			this.ensure(x, y);

			this.beginStroke();
			this._ops.push(() => {
				this._context.lineTo(x - this._minx, y - this._miny);
			});
			this._x = x;
			this._y = y;
		}

		beginFill(color: number, alpha = 1) {
			this.endFill();
			this.endStroke();

			this.ensureCanvas();
			this._ops.push(() => {
				this._context.fillStyle = cssColor(color, alpha);
				this._context.beginPath();
			});
			this._fill = true;
		}

		endFill() {
			if (this._fill) {
				this._fill = false;
				this.flushOps();
				this._context.fill();
				this.endStroke();
			}
		}

		_thickness: number = 1;
		_color: number = 0;
		_alpha: number = 1;

		lineStyle(thickness: number, color: number, alpha = 1) {
			if (thickness < 0) {
				thickness = 0;
			}

			if (alpha > 1) {
				alpha = 1;
			}

			if (this._fill && this._path) {
				console.log("second lineStyle during fill");
			}
			this.endStroke();

			this.ensureCanvas();

			if (this._thickness !== thickness) {
				this._thickness = thickness;
				this._ops.push(() => {
					this._context.lineWidth = thickness;
					this._context.lineCap = (thickness > 4) ? "round" : "butt";
				});
			}

			if (this._alpha !== alpha || this._color !== color) {
				this._alpha = alpha;
				this._color = color;
				this._ops.push(() => {
					this._context.strokeStyle = cssColor(color, alpha);
				});
			}
		}

		private _ops: Array<() => void> = [];
		private flushOps() {
			for (const op of this._ops) {
				op();
			}
			this._ops.length = 0;
		}

		private beginStroke() {
			if (!this._path && !this._fill) {
				this._path = true;
				this.ensureCanvas();
				const x = this._x;
				const y = this._y;
				this._ops.push(() => {
					this._context.beginPath();
					this._context.moveTo(x - this._minx, y - this._miny);
				});

				if (!this._pending) {
					this._pending = true;
					Graphics._pending.push(this);
				}
			}
		}

		private endStroke() {
			// this.endFill();
			if (this._path) {
				this.flushOps();
				this._path = false;
				// if (this._alpha > 0)
				this._context.stroke();
			}
		}

		clear() {
			if (!this._context) {
				return;
			}

			this._fill = false;
			this._path = false;
			this._ops.length = 0;
			// this.endFill();
			// this.endStroke();

			this._context.clearRect(0, 0, this._context.canvas.width, this._context.canvas.height);
		}

		drawRect(x: number, y: number, w: number, h: number) {
			this.ensure(x, y);
			this.ensure(x + w, y + h);

			if (this._fill) {
				this._ops.push(() => {
					this._context.fillRect(x - this._minx, y - this._miny, w, h);
				});
			} else {
				this._ops.push(() => {
					this._context.rect(x - this._minx, y - this._miny, w, h);
				});
			}
		}

		drawRoundRect(x: number, y: number, w: number, h: number, rx: number, ry: number) {
			this.drawRect(x, y, w, h);
		}
	}
