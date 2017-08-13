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
		listenerFunctions: { (p1: any, text: string): void }[];
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
				"x": this.currentX,
				"y": this.currentY
			};
		}

		setSpacing(param1: string, param2: number) 
		{
			this.separator = param1;
			this.spacing = param2;
		}

		addButton(param1: string, param2?: flash.text.TextFormat, param3 = NaN, param4 = NaN) 
		{
			if (this.buttons.length > 0 && this.separator !== "")
			{
				const _loc6_ = this.putSeparator(this.currentX, this.currentY, this.separator);
				this.currentX = this.currentX + _loc6_.width;
			}
			const _loc5_ = this.attachButton(param1, param2, param3, param4);
			this.currentX = this.currentX + (_loc5_.width + this.spacing);
			this.buttons.push(_loc5_);
			_loc5_.addEventListener(MouseEvents.MOUSE_DOWN, (event) => { this.buttonPress(event); });
		}

		protected getButtonIndex(param1: string): number
		{
			let _loc2_ = this.buttons.length - 1;
			while (_loc2_ >= 0 && this.buttons[_loc2_].name !== param1)
				_loc2_--;

			return _loc2_;
		}

		private putSeparator(param1: number, param2: number, param3: string): flash.text.TextField
		{
			const textField = new flash.text.TextField();
			textField.x = param1 - this.spacing / 2;
			textField.y = param2;
			textField.defaultTextFormat = this.separatorTextFormat;
			textField.autoSize = flash.text.TextFieldAutoSize.LEFT;
			textField.selectable = false;
			textField.text = param3;
			this.addChild(textField);
			return textField;
		}

		protected attachButton(param1: string, param2?: flash.text.TextFormat, param3 = NaN, param4 = NaN): flash.display.SimpleButton
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
			textField.defaultTextFormat = !!param2 ? param2 : this.buttonTextFormat;
			textField.text = param1;
			textField.autoSize = flash.text.TextFieldAutoSize.LEFT;
			simpleButton.upState = sprite;
			simpleButton.downState = sprite;
			simpleButton.overState = sprite;
			simpleButton.hitTestState = sprite;
			simpleButton.name = param1;
			this.addChild(simpleButton);
			return simpleButton;
		}

		setLeftPadding(param1: number) 
		{
			this.leftPadding = param1;
			this.currentX = param1;
		}

		resetButtonsGroup() 
		{
			const _loc1_ = !!this.buttons ? this.buttons.length : 0;
			for (let _loc2_ = 0; _loc2_ < _loc1_; _loc2_++)
			{
				this.buttons[_loc2_].removeEventListener(MouseEvents.MOUSE_DOWN, this.buttonPress);
				this.removeChild(this.buttons[_loc2_]);
			}
			this.buttons = [];
			this.listenerFunctions = [];
			this.listenerObjects = [];
			this.currentX = 0;
			this.currentY = 0;
		}

		buttonPress(event: Event) 
		{
			let button = (<any>event.currentTarget).displayObject as flash.display.SimpleButton;
			const _loc2_ = (<flash.display.DisplayObjectContainer>button.upState).getChildAt(0) as flash.text.TextField;
			const buttonIndex = this.getButtonIndex(_loc2_.text);
			if (buttonIndex !== -1)
			{
				for (let _loc4_ = 0; _loc4_ < this.listenerFunctions.length; _loc4_++)
				{
					const _loc5_ = this.listenerFunctions[_loc4_];
					_loc5_.call(this.listenerObjects[_loc4_], _loc2_.text);
				}
			}
		}

		setTextFormats(param1: flash.text.TextFormat, param2: flash.text.TextFormat, param3: flash.text.TextFormat) 
		{
			this.buttonTextFormat = param1;
			this.selectedTextFormat = param2;
			this.separatorTextFormat = param3;
		}

		addListener(param1: { (p1: any, text: string): void }, param2: flash.display.DisplayObject) 
		{
			this.listenerFunctions.push(param1);
			this.listenerObjects.push(param2);
		}

		addPlainText(param1: string, param2 = NaN) 
		{
			const nextButtonPosition = this.getNextButtonPosition();
			const _loc4_ = this.putSeparator(nextButtonPosition.x, nextButtonPosition.y, param1);
			if (!isNaN(param2))
				this.currentX = this.currentX + param2;
			else
				this.currentX = this.currentX + _loc4_.width;
		}
	}
}
