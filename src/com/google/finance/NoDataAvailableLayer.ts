import { Messages } from "Messages";
import { TextField, TextFormat, TextFieldAutoSize } from '../../../flash/text/TextField';
import { AbstractLayer } from "./AbstractLayer";
import { Message } from "./Messages";
import { Context, ViewPoint } from "./ViewPoint";

	// import flash.text.TextFormat;
	// import flash.text.TextField;
	// import flash.text.TextFieldAutoSize;

export class NoDataAvailableLayer extends AbstractLayer<ViewPoint> {
		private text: TextField;

		renderLayer(context: Context) {
			if (!this.text) {
				this.text = new TextField();
				this.text.defaultTextFormat = new TextFormat("Arial", 12, 0, false, false, false);
				this.text.autoSize = TextFieldAutoSize.CENTER;
				this.text.selectable = false;
				this.text.text = Message.getMsg(Messages.NO_DATA_AVAILABLE);
			}
			if (this.contains(this.text)) {
				this.removeChild(this.text);
			}

			this.text.x = (this.viewPoint.maxx - this.viewPoint.minx) / 2 - this.text.width / 2;
			this.text.y = (this.viewPoint.maxy - this.viewPoint.miny) / 2;
			this.addChild(this.text);
		}
	}
