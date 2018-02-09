import { TextFieldAutoSize } from "../../../flash/text/TextField";
import { DateTimeFormats, DateTimeLocale } from "../i18n/locale/DateTimeLocale";
import { Message, Messages } from "./Messages";
import { Const } from "./Const";
import { SplitMovie } from "./SplitMovie";
import { StockDividend } from "./StockDividend";
import { StockDividendMovie_DividendArrowClass } from "./StockDividendMovie_DividendArrowClass";
import { StockDividendMovie_DividendArrowOnOverClass } from "./StockDividendMovie_DividendArrowOnOverClass";
import { StockDividendMovie_DividendArrowSidewaysClass } from "./StockDividendMovie_DividendArrowSidewaysClass";
import { StockDividendMovie_DividendArrowSidewaysOverClass } from "./StockDividendMovie_DividendArrowSidewaysOverClass";

// import flash.text.TextFieldAutoSize;
// import com.google.i18n.locale.DateTimeLocale;

export class StockDividendMovie extends SplitMovie {
	private static readonly DividendArrowSidewaysClass = StockDividendMovie_DividendArrowSidewaysClass;
	private static readonly DividendArrowOnOverClass = StockDividendMovie_DividendArrowOnOverClass;
	private static readonly DividendArrowClass = StockDividendMovie_DividendArrowClass;
	private static readonly DividendArrowSidewaysOverClass = StockDividendMovie_DividendArrowSidewaysOverClass;

	private associatedStockDividend: StockDividend;

	protected getTextColor(): number {
		return 0x66dd;
	}

	protected initArrows() {
		this.arrow = new StockDividendMovie.DividendArrowClass();
		this.arrowOnOver = new StockDividendMovie.DividendArrowOnOverClass();
		this.arrowSideways = new StockDividendMovie.DividendArrowSidewaysClass();
		this.arrowSidewaysOver = new StockDividendMovie.DividendArrowSidewaysOverClass();
	}

	getDetailedText(): string {
		let msg: string;
		if (this.associatedStockDividend.ticker) {
			msg = Message.getMsg(Messages.STOCK_DIVIDEND_TEXT_WITH_TICKER, this.associatedStockDividend.ticker);
		} else {
			msg = Message.getMsg(Messages.STOCK_DIVIDEND_TEXT);
		}

		return msg.concat("\n", Message.getMsg(Messages.ADJUSTMENT_FACTOR_TEXT, this.associatedStockDividend.adjustmentFactor));
	}

	setObject(stockDividend: StockDividend) {
		this.associatedStockDividend = stockDividend;
		this.showText();
	}

	protected positionSidewaysArrow() {
		this.currentVisibleButton.x = -1;
		this.text.autoSize = TextFieldAutoSize.RIGHT;
		this.text.x = 0;
	}

	getDateText(): string {
		const exchangeDateInUTC = this.associatedStockDividend.exchangeDateInUTC;
		if (Const.isZhLocale(DateTimeLocale.getLocale())) {
			return DateTimeLocale.standardFormatDateTime(DateTimeFormats.LONG_DATE_FORMAT, exchangeDateInUTC, true);
		}

		return DateTimeLocale.standardFormatDateTime(DateTimeFormats.MEDIUM_DATE_FORMAT, exchangeDateInUTC, true);
	}

	getShortText(param1 = false): string {
		return "";
	}
}
