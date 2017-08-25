/// <reference path="../../../flash/display/Sprite.ts" />

namespace com.google.finance
{
	// import flash.display.Sprite;
	// import flash.text.TextFieldAutoSize;
	// import flash.text.TextField;
	// import flash.text.TextFormat;
	// import flash.events.MouseEvent;
	// import flash.events.Event;

	export class ToolTipMovie extends flash.display.Sprite
	{
		private content: flash.text.TextField;

		constructor()
		{
			super();
			this.content = new flash.text.TextField();
			this.content.defaultTextFormat = new flash.text.TextFormat("Arial", 11);
			this.content.selectable = false;
			this.content.addEventListener(MouseEvents.MOUSE_OVER, (event: Event) =>
			{
				MainManager.mouseCursor.setCursor(MouseCursors.CLASSIC);
				MainManager.mouseCursor.lockOnDisplayObject(this.content);
			});
			this.content.addEventListener(MouseEvents.MOUSE_OUT, (event: Event) =>
			{
				MainManager.mouseCursor.unlock();
			});
		}

		private renderBackground()
		{
			this.graphics.lineStyle(1, 0x666666, 1);
			this.graphics.beginFill(0xffffff, 1);
			this.graphics.drawRect(this.content.x - 1, this.content.y - 1, this.content.width + 2, this.content.height + 2);
			this.graphics.endFill();
		}

		private renderContent(param1: number, param2: number, param3: string)
		{
			this.content.wordWrap = false;
			this.content.autoSize = flash.text.TextFieldAutoSize.LEFT;
			this.content.htmlText = param3;
			this.addChild(this.content);
			this.content.x = param1 - this.content.width;
			this.content.y = param2;
		}

		renderMovie(param1: number, param2: number, param3: string)
		{
			this.renderContent(param1, param2, param3);
			this.renderBackground();
		}

		clearMovie()
		{
			if (this.contains(this.content))
				this.removeChild(this.content);

			this.graphics.clear();
		}
	}
}
