namespace flash.display
{
	export class SimpleButton extends DisplayObjectContainer
	{
		constructor(name?: string)
		{
			const elt = document.createElement("div");
			super(elt, name);
		}

		private _overState: DisplayObject;
		get overState() { return this._overState; }
		set overState(value: DisplayObject)
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

		private _downState: DisplayObject;
		get downState() { return this._downState; }
		set downState(value: DisplayObject)
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

		private _hitTestState: DisplayObject;
		get hitTestState() { return this._hitTestState; }
		set hitTestState(value: DisplayObject)
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

		private _upState: DisplayObject;
		get upState() { return this._upState; }
		set upState(value: DisplayObject)
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
}
