/// <reference path="../../../flash/display/Sprite.ts" />

namespace com.google.finance
{
	// import flash.display.Sprite;
	// import flash.text.TextField;

	export class Console extends flash.display.Sprite
	{
		private mainManager: MainManager;
		private readonly loading = new com.google.finance.LoadingMessage();
		private pendingLoadings = 0;
		private t: flash.text.TextField;

		constructor(param1: MainManager)
		{
			super();
			this.mainManager = param1;
			this.loading.visible = false;
			this.addChild(this.loading);
			if (MainManager.paramsObj.debug === "true")
			{
				this.t = new flash.text.TextField();
				this.t.width = 800;
				this.t.height = 400;
				this.addChild(this.t);
			}
		}

		println(param1: string) 
		{
			if (MainManager.paramsObj.debug === "true")
				this.t.appendText(param1 + "\n");
		}

		dataLoading() 
		{
			this.pendingLoadings++;
			this.positionLoadingMessage();
			this.loading.visible = true;
		}

		positionLoadingMessage() 
		{
			const _loc1_ = this.mainManager.displayManager.getMainViewPoint();
			if (_loc1_)
			{
				this.loading.x = this.stage.stageWidth - this.loading.width - Const.BORDER_WIDTH;
				this.loading.y = _loc1_.miny + 1;
			}
		}

		dataLoaded() 
		{
			this.pendingLoadings--;
			if (this.pendingLoadings <= 0)
				this.loading.visible = false;
		}
	}
}
