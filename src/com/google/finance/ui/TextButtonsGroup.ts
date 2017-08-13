namespace com.google.finance.ui
{
	// import flash.events.Event;
	// import flash.display.Sprite;
	// import flash.display.SimpleButton;
	// import flash.text.TextField;

	export class TextButtonsGroup extends com.google.finance.ui.ButtonsGroup
	{
		private currentButton: number = -1;

		buttonPress(event: Event) 
		{
			super.buttonPress(event);
			let button = (<any>event.currentTarget).displayObject as flash.display.SimpleButton;
			const _loc2_ = (<flash.display.DisplayObjectContainer>button.upState).getChildAt(0) as flash.text.TextField;
			this.selectButton(_loc2_.text);
		}

		private selectButton(param1: string): number
		{
			const buttonIndex = this.getButtonIndex(param1);
			this.selectButtonByIndex(buttonIndex);
			return buttonIndex;
		}

		selectButtonByIndex(param1: number) 
		{
			this.deselectButton(this.currentButton);
			if (param1 >= 0 && param1 < this.buttons.length)
			{
				const _loc2_ = this.buttons[param1];
				const _loc3_ = (<flash.display.DisplayObjectContainer>_loc2_.upState).getChildAt(0) as flash.text.TextField;
				_loc3_.setTextFormat(this.selectedTextFormat);
				this.currentButton = param1;
			}
		}

		clearSelection() 
		{
			this.deselectButton(this.currentButton);
			this.currentButton = -1;
		}

		private deselectButton(param1: number) 
		{
			if (param1 !== -1)
			{
				const _loc2_ = this.buttons[param1];
				const _loc3_ = (<flash.display.DisplayObjectContainer>_loc2_.upState).getChildAt(0) as flash.text.TextField;
				_loc3_.setTextFormat(this.buttonTextFormat);
			}
		}
	}
}
