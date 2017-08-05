/// <reference path="../../../flash/display/Sprite.ts" />

namespace com.google.finance
{
	// import flash.display.Sprite;
	// import flash.text.TextFormat;
	// import flash.text.TextField;
	// import flash.text.TextFieldAutoSize;
	// import flash.utils.setInterval;

	export class LoadingMessage extends flash.display.Sprite
	{
		private static readonly LOADING_TEXT_FORMAT = new flash.text.TextFormat("Helvetica", 12, 0xffffff);


		private intervalId: number;

		private states: string[];

		private loadingText: flash.text.TextField;

		padding = 3;

		backgroundColor = 8439386;

		private currentState: number;

		constructor()
		{
			super();
			this.loadingText = new flash.text.TextField();
			this.states = ["...", ".", ".."];
			this.loadingText.defaultTextFormat = LoadingMessage.LOADING_TEXT_FORMAT;
			this.loadingText.appendText(Messages.getMsg(Messages.LOADING_MESSAGE) + "...");
			this.loadingText.autoSize = flash.text.TextFieldAutoSize.LEFT;
			this.loadingText.x = 0;
			this.loadingText.y = 0;
			this.currentState = -1;
			this.rollMessage();
			this.addChild(this.loadingText);
			this.drawBackground();
			this.intervalId = setInterval(flash.display.Stage.bind(this.rollMessage, this), 500);
		}

		private rollMessage() 
		{
			this.currentState = (this.currentState + 1) % this.states.length;
			this.loadingText.text = Messages.getMsg(Messages.LOADING_MESSAGE) + this.states[this.currentState];
		}

		private drawBackground() 
		{
			this.graphics.beginFill(0x339933, 1);
			this.graphics.drawRect(0, 0, this.loadingText.width, this.loadingText.height);
			this.graphics.endFill();
		}
	}
}
