import { Sprite } from "../../../flash/display/Sprite";
import { LoadingMessage } from './LoadingMessage';
import { TextField } from '../../../flash/text/TextField';
import { MainManager } from './MainManager';
import { Const } from './Const';

	// import flash.display.Sprite;
	// import flash.text.TextField;

export class Console extends Sprite {
		private readonly loading = new LoadingMessage();
		private pendingLoadings = 0;
		private t: TextField;

		constructor(private readonly mainManager: MainManager) {
			super();
			this.loading.visible = false;
			this.addChild(this.loading);
			if (Boolean(MainManager.paramsObj.debug)) {
				this.t = new TextField();
				this.t.width = 800;
				this.t.height = 400;
				this.addChild(this.t);
			}
		}

		println(text: string) {
			if (Boolean(MainManager.paramsObj.debug)) {
				this.t.appendText(text + "\n");
			}
		}

		dataLoading() {
			this.pendingLoadings++;
			this.positionLoadingMessage();
			this.loading.visible = true;
		}

		positionLoadingMessage() {
			const mainViewPoint = this.mainManager.displayManager.getMainViewPoint();
			if (mainViewPoint) {
				this.loading.x = this.stage.stageWidth - this.loading.width - Const.BORDER_WIDTH;
				this.loading.y = mainViewPoint.miny + 1;
			}
		}

		dataLoaded() {
			this.pendingLoadings--;
			if (this.pendingLoadings <= 0) {
				this.loading.visible = false;
			}
		}
	}
