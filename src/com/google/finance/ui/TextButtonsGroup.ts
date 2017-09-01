namespace com.google.finance.ui
{
	// import flash.events.Event;
	// import flash.display.Sprite;
	// import flash.display.SimpleButton;
	// import flash.text.TextField;

	export class TextButtonsGroup extends ButtonsGroup
	{
		private currentButton: number = -1;

		buttonPress(event: Event)
		{
			super.buttonPress(event);
			const button = (<any>event.currentTarget).displayObject as flash.display.SimpleButton;
			const textField = (<flash.display.DisplayObjectContainer>button.upState).getChildAt(0) as flash.text.TextField;
			this.selectButton(textField.text);
		}

		private selectButton(param1: string): number
		{
			const buttonIndex = this.getButtonIndex(param1);
			this.selectButtonByIndex(buttonIndex);
			return buttonIndex;
		}

		selectButtonByIndex(buttonIndex: number)
		{
			this.deselectButton(this.currentButton);
			if (buttonIndex >= 0 && buttonIndex < this.buttons.length)
			{
				const button = this.buttons[buttonIndex];
				const textField = (<flash.display.DisplayObjectContainer>button.upState).getChildAt(0) as flash.text.TextField;
				textField.setTextFormat(this.selectedTextFormat);
				this.currentButton = buttonIndex;
			}
		}

		clearSelection()
		{
			this.deselectButton(this.currentButton);
			this.currentButton = -1;
		}

		private deselectButton(buttonIndex: number)
		{
			if (buttonIndex !== -1)
			{
				const button = this.buttons[buttonIndex];
				const textField = (<flash.display.DisplayObjectContainer>button.upState).getChildAt(0) as flash.text.TextField;
				textField.setTextFormat(this.buttonTextFormat);
			}
		}
	}
}
