import { DisplayObject } from './DisplayObject';

export class BitmapData
{
	width: number;
	height: number;
}

export class Bitmap extends DisplayObject
{
	protected _width: number;
	protected _height: number;

	constructor()
	{
		super(document.createElement("img"));
		(this.element as HTMLImageElement).onload = () =>
		{
			if (!this.element.style.width)
			{
				this.element.style.width = (this.element as HTMLImageElement).naturalWidth + "px";
			}
			if (!this.element.style.height)
			{
				this.element.style.height = (this.element as HTMLImageElement).naturalHeight + "px";
			}
		};
		// console.log(getClassName(this) + ".png");
		(this.element as HTMLImageElement).src = "images/" + getClassName(this) + ".png";
	}

	get width() { return this._width || this.element.scrollWidth; }
	set width(value: number) { this.element.style.width = value + "px"; }

	get height() { return this._height || this.element.scrollHeight; }
	set height(value: number) { this.element.style.height = value + "px"; }
}
