namespace flash.display
{
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
}