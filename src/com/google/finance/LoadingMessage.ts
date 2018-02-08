import { Sprite } from "../../../flash/display/Sprite";
import { TextFormat, TextField, TextFieldAutoSize } from '../../../flash/text/TextField';
import { Message } from './Messages';
import { Stage } from '../../../flash/display/Stage';
import { Messages } from 'Messages';

	// import flash.display.Sprite;
	// import flash.text.TextFormat;
	// import flash.text.TextField;
	// import flash.text.TextFieldAutoSize;
	// import flash.utils.setInterval;

export class LoadingMessage extends Sprite {
		private static readonly LOADING_TEXT_FORMAT = new TextFormat("Helvetica", 12, 0xffffff);

		private static readonly states: ReadonlyArray<string> = ["...", ".", ".."];

		private intervalId: number | null = null;
		private loadingText = new TextField();
		private currentState = -1;

		padding = 3;
		backgroundColor = 8439386;

		constructor() {
			super();
			this.loadingText.defaultTextFormat = LoadingMessage.LOADING_TEXT_FORMAT;
			//this.loadingText.appendText(Message.getMsg(Messages.LOADING_MESSAGE) + LoadingMessage.states[0]);
			this.loadingText.autoSize = TextFieldAutoSize.LEFT;
			this.loadingText.x = 0;
			this.loadingText.y = 0;
			this.rollMessage();
			this.addChild(this.loadingText);
			this.drawBackground();
			//this.intervalId = setInterval(Stage.bind(this.rollMessage, this), 500);
		}

		private rollMessage() {
			this.currentState = (this.currentState + 1) % LoadingMessage.states.length;
			this.loadingText.text = Message.getMsg(Messages.LOADING_MESSAGE) + LoadingMessage.states[this.currentState];
		}

		private drawBackground() {
			const gr = this.graphics;
			gr.beginFill(0x339933, 1);
			gr.drawRect(0, 0, this.loadingText.width, this.loadingText.height);
			gr.endFill();
		}

		set visible(value: boolean) {
			this.element.style.visibility = value ? "" : "hidden";
			if (value && !this.intervalId) {
				this.intervalId = setInterval(Stage.bind(this.rollMessage, this), 500);
			} else if (!value && this.intervalId) {
				clearInterval(this.intervalId);
				this.intervalId = null;
			}
		}
	}
