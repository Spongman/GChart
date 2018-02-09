import { DisplayObjectContainer } from "./DisplayObjectContainer";
import { TextFieldAutoSize, TextField, TextFormat } from '../text/TextField';

export class Sprite extends DisplayObjectContainer {
	constructor(name?: string) {
		super(document.createElement("div"), name);
	}
	// mouseCursor: Sprite;


	static createLabel(sprite: Sprite, text: string, textFormat: TextFormat): TextField {
		const textField = new TextField();
		sprite.addChild(textField);
		textField.autoSize = TextFieldAutoSize.LEFT;
		textField.defaultTextFormat = textFormat;
		textField.selectable = false;
		textField.text = text;
		return textField;
	}
}
