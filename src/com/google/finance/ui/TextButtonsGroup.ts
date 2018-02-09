import { DisplayObjectContainer } from "../../../../flash/display/DisplayObjectContainer";
import { SimpleButton } from "../../../../flash/display/SimpleButton";
import { TextField } from "../../../../flash/text/TextField";
import { ButtonsGroup } from "./ButtonsGroup";

	// import flash.events.Event;
	// import flash.display.Sprite;
	// import flash.display.SimpleButton;
	// import flash.text.TextField;

export class TextButtonsGroup extends ButtonsGroup {
		private currentButton: number = -1;

		buttonPress(event: Event) {
			super.buttonPress(event);
			const button = (event.currentTarget as any).displayObject as SimpleButton;
			const textField = (button.upState as DisplayObjectContainer).getChildAt(0) as TextField;
			this.selectButton(textField.text);
		}

		private selectButton(name: string): number {
			const buttonIndex = this.getButtonIndex(name);
			this.selectButtonByIndex(buttonIndex);
			return buttonIndex;
		}

		selectButtonByIndex(buttonIndex: number) {
			this.deselectButton(this.currentButton);
			if (buttonIndex >= 0 && buttonIndex < this.buttons.length) {
				const button = this.buttons[buttonIndex];
				const textField = (button.upState as DisplayObjectContainer).getChildAt(0) as TextField;
				textField.setTextFormat(this.selectedTextFormat);
				this.currentButton = buttonIndex;
			}
		}

		clearSelection() {
			this.deselectButton(this.currentButton);
			this.currentButton = -1;
		}

		private deselectButton(buttonIndex: number) {
			if (buttonIndex !== -1) {
				const button = this.buttons[buttonIndex];
				const textField = (button.upState as DisplayObjectContainer).getChildAt(0) as TextField;
				textField.setTextFormat(this.buttonTextFormat);
			}
		}
	}
