import { Sprite } from "../../../flash/display/Sprite";
import { TextField, TextFieldAutoSize, TextFormat } from "../../../flash/text/TextField";

	// import flash.display.Sprite;
	// import flash.text.TextFormat;
	// import flash.text.TextField;
	// import flash.text.TextFieldAutoSize;

export class InfoDotInfo {
		displayName: string;

		quote: string;
		value: string;

		quoteColor: number;
		valueColor: number;
	}

export class InfoDot extends Sprite {
		private static readonly TEXT_SPACING = 5;
		private static readonly tickerFormat = new TextFormat("Helvetica", 12, 0, true, false, false);
		private static readonly valueFormat = new TextFormat("Helvetica", 10, 0x999999, false, false, false);

		private readonly tickerText = new TextField();
		private readonly valueText = new TextField();

		constructor() {
			super();
			this.tickerText.autoSize = TextFieldAutoSize.LEFT;
			this.tickerText.selectable = false;
			this.valueText.autoSize = TextFieldAutoSize.LEFT;
			this.valueText.selectable = false;
			this.addChild(this.tickerText);
			this.addChild(this.valueText);
		}

		setInfo(infoDotInfo: InfoDotInfo) {
			const quoteColor = infoDotInfo.quoteColor;
			const gr = this.graphics;
			gr.clear();
			gr.lineStyle(10, quoteColor, 1);
			gr.moveTo(0, 9);
			gr.lineTo(0.5, 9);
			// gr.endStroke();
			InfoDot.tickerFormat.color = quoteColor;
			this.tickerText.defaultTextFormat = InfoDot.tickerFormat;
			this.tickerText.x = this.tickerText.x + InfoDot.TEXT_SPACING;
			if (infoDotInfo.displayName) {
				this.tickerText.text = infoDotInfo.displayName;
			} else {
				this.tickerText.text = infoDotInfo.quote;
			}

			InfoDot.valueFormat.color = infoDotInfo.valueColor;
			this.valueText.defaultTextFormat = InfoDot.valueFormat;
			this.valueText.text = infoDotInfo.value;
			this.valueText.y = this.tickerText.height - this.valueText.height;
			this.valueText.x = this.tickerText.width + this.tickerText.x - InfoDot.TEXT_SPACING;
		}
	}
