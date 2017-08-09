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

		private static readonly states = ["...", ".", ".."];
		
		private intervalId: number;
		private loadingText = new flash.text.TextField();
		private currentState = -1;

		padding = 3;
		backgroundColor = 8439386;

		constructor()
		{
			super();
			this.loadingText.defaultTextFormat = LoadingMessage.LOADING_TEXT_FORMAT;
			//this.loadingText.appendText(Messages.getMsg(Messages.LOADING_MESSAGE) + LoadingMessage.states[0]);
			this.loadingText.autoSize = flash.text.TextFieldAutoSize.LEFT;
			this.loadingText.x = 0;
			this.loadingText.y = 0;
			this.rollMessage();
			this.addChild(this.loadingText);
			this.drawBackground();
			this.intervalId = setInterval(flash.display.Stage.bind(this.rollMessage, this), 500);
		}

		private rollMessage() 
		{
			this.currentState = (this.currentState + 1) % LoadingMessage.states.length;
			this.loadingText.text = Messages.getMsg(Messages.LOADING_MESSAGE) + LoadingMessage.states[this.currentState];
		}

		private drawBackground() 
		{
			const gr = this.graphics;
			gr.beginFill(0x339933, 1);
			gr.drawRect(0, 0, this.loadingText.width, this.loadingText.height);
			gr.endFill();
		}
	}
}
