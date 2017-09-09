/// <reference path="../../../../flash/display/Sprite.ts" />

namespace com.google.finance.ui
{
	// import flash.display.Sprite;
	// import flash.text.TextFormat;
	// import flash.text.TextField;
	// import flash.display.SimpleButton;
	// import flash.events.MouseEvent;
	// import flash.text.TextFieldAutoSize;
	// import flash.events.Event;

	export class ButtonsGroup extends flash.display.Sprite
	{
		private static readonly DEFAULT_SPACING = 5;
		private static readonly DEFAULT_SEPARATOR = "";
		private static readonly DEFAULT_LEFT_PADDING = 0;

		private currentX: number;
		private currentY: number;

		listenerObjects: flash.display.DisplayObject[];
		buttons: flash.display.SimpleButton[];
		spacing = ButtonsGroup.DEFAULT_SPACING;
		listenerFunctions: ((object: any, text: string) => void)[];
		separatorTextFormat: flash.text.TextFormat;
		leftPadding = ButtonsGroup.DEFAULT_LEFT_PADDING;
		buttonTextFormat: flash.text.TextFormat;
		separator = ButtonsGroup.DEFAULT_SEPARATOR;
		selectedTextFormat: flash.text.TextFormat;

		constructor()
		{
			super();
			this.resetButtonsGroup();
		}

		private getNextButtonPosition()
		{
			return {
				x: this.currentX,
				y: this.currentY
			};
		}

		setSpacing(separator: string, spacing: number)
		{
			this.separator = separator;
			this.spacing = spacing;
		}

		addButton(text: string, textFormat?: flash.text.TextFormat, param3 = NaN, param4 = NaN)
		{
			if (this.buttons.length > 0 && this.separator !== "")
			{
				this.currentX += this.putSeparator(this.currentX, this.currentY, this.separator).width;
			}
			const button = this.attachButton(text, textFormat, param3, param4);
			this.currentX += button.width + this.spacing;
			this.buttons.push(button);
			button.addEventListener(MouseEvents.MOUSE_DOWN, (event) => { this.buttonPress(event); });
		}

		protected getButtonIndex(name: string): number
		{
			let index = this.buttons.length - 1;
			while (index >= 0 && this.buttons[index].name !== name)
				index--;

			return index;
		}

		private putSeparator(x: number, y: number, text: string): flash.text.TextField
		{
			const textField = new flash.text.TextField();
			textField.x = x - this.spacing / 2;
			textField.y = y;
			textField.defaultTextFormat = this.separatorTextFormat;
			textField.autoSize = flash.text.TextFieldAutoSize.LEFT;
			textField.selectable = false;
			textField.text = text;
			this.addChild(textField);
			return textField;
		}

		protected attachButton(text: string, textFormat?: flash.text.TextFormat, param3 = NaN, param4 = NaN): flash.display.SimpleButton
		{
			const simpleButton = new flash.display.SimpleButton();
			const nextButtonPosition = this.getNextButtonPosition();
			simpleButton.x = nextButtonPosition.x;
			simpleButton.y = nextButtonPosition.y;
			simpleButton.useHandCursor = true;
			const textField = new flash.text.TextField();
			const sprite = new flash.display.Sprite();
			sprite.addChild(textField);
			//const _loc7_ = _loc8_;
			textField.defaultTextFormat = textFormat ? textFormat : this.buttonTextFormat;
			textField.text = text;
			textField.autoSize = flash.text.TextFieldAutoSize.LEFT;
			simpleButton.upState = sprite;
			simpleButton.downState = sprite;
			simpleButton.overState = sprite;
			simpleButton.hitTestState = sprite;
			simpleButton.name = text;
			this.addChild(simpleButton);
			return simpleButton;
		}

		setLeftPadding(x: number)
		{
			this.leftPadding = x;
			this.currentX = x;
		}

		resetButtonsGroup()
		{
			const numButtons = this.buttons ? this.buttons.length : 0;
			for (let buttonIndex = 0; buttonIndex < numButtons; buttonIndex++)
			{
				this.buttons[buttonIndex].removeEventListener(MouseEvents.MOUSE_DOWN, this.buttonPress);
				this.removeChild(this.buttons[buttonIndex]);
			}
			this.buttons = [];
			this.listenerFunctions = [];
			this.listenerObjects = [];
			this.currentX = 0;
			this.currentY = 0;
		}

		buttonPress(event: Event)
		{
			const button = (<any>event.currentTarget).displayObject as flash.display.SimpleButton;
			const textField = (<flash.display.DisplayObjectContainer>button.upState).getChildAt(0) as flash.text.TextField;
			const buttonIndex = this.getButtonIndex(textField.text);
			if (buttonIndex !== -1)
			{
				for (let functionIndex = 0; functionIndex < this.listenerFunctions.length; functionIndex++)
				{
					this.listenerFunctions[functionIndex].call(this.listenerObjects[functionIndex], textField.text);
				}
			}
		}

		setTextFormats(buttonTextFormat: flash.text.TextFormat, selectedTextFormat: flash.text.TextFormat, separatorTextFormat: flash.text.TextFormat)
		{
			this.buttonTextFormat = buttonTextFormat;
			this.selectedTextFormat = selectedTextFormat;
			this.separatorTextFormat = separatorTextFormat;
		}

		addListener(listenerFunction: (object: any, text: string) => void, displayObject: flash.display.DisplayObject)
		{
			this.listenerFunctions.push(listenerFunction);
			this.listenerObjects.push(displayObject);
		}

		addPlainText(text: string, width = NaN)
		{
			const nextButtonPosition = this.getNextButtonPosition();
			const textField = this.putSeparator(nextButtonPosition.x, nextButtonPosition.y, text);
			if (!isNaN(width))
				this.currentX += width;
			else
				this.currentX += textField.width;
		}
	}
}
