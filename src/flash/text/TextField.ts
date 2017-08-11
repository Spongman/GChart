namespace flash.text
{
	export enum TextFieldType
	{
		INPUT,
		DYNAMIC,
	}

	export class TextFormatAlign
	{
		static readonly RIGHT = "right";
	}

	export class TextFieldAutoSize
	{
		static readonly LEFT = "left";
		static readonly RIGHT = "right";
		static readonly CENTER = "center";
	}

	export class TextFormat
	{
		align: string;

		constructor(public family: string = "Arial", public size = 0, public color = 0, public bold = false, public italic = false, public underline = false) { }
	}

	export class TextField
		extends flash.display.InteractiveObject
	{
		type: TextFieldType = TextFieldType.INPUT;
		autoSize: string;
		cacheAsBitmap: boolean;
		selectable: boolean;
		wordWrap: boolean;

		constructor()
		{
			super(document.createElement("span"));
		}

		appendText(p: string)
		{
			this.element.textContent += p;
		}

		setTextFormat(p: TextFormat, start: number = -1, end: number = -1) { }
		getTextFormat(): TextFormat|null { return null; }
		set defaultTextFormat(value: TextFormat)
		{
			this.element.style.fontFamily = value.family || "Arial";
			this.element.style.fontSize = (value.size) + "px";
			this.element.style.color = cssColor(value.color);
			this.element.style.textAlign = value.align || "left";
		}
		setSelection(p1: number, p2: number) { }

		get width(): number { return this.element.offsetWidth; }
		set width(value: number) { this.element.style.width = value + "px"; }

		get height(): number { return this.element.offsetHeight; }
		set height(value: number) { this.element.style.height = value + "px"; }

		get text(): string { return this.element.textContent || ""; }
		set text(value: string) { this.element.textContent = value; }
		get htmlText(): string { return this.element.innerHTML; }
		set htmlText(value: string) { this.element.innerHTML = value; }

		private _textColor: number;
		get textColor(): number { return this._textColor }
		set textColor(value: number)
		{
			this._textColor = value;
			this.element.style.color = cssColor(value);
		}

		private _textHeight: number;
		get textHeight(): number { return this._textHeight; }
		set textHeight(value: number)
		{
			this._textHeight = value;
			this.element.style.fontSize = value + "pt";
		}
	}
}