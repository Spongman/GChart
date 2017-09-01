/// <reference path="StockDividendMovie_DividendArrowSidewaysClass.ts" />
/// <reference path="StockDividendMovie_DividendArrowOnOverClass.ts" />
/// <reference path="StockDividendMovie_DividendArrowClass.ts" />
/// <reference path="StockDividendMovie_DividendArrowSidewaysOverClass.ts" />

namespace com.google.finance
{
	// import flash.text.TextFieldAutoSize;
	// import com.google.i18n.locale.DateTimeLocale;

	export class StockDividendMovie extends SplitMovie
	{
		private static readonly DividendArrowSidewaysClass = StockDividendMovie_DividendArrowSidewaysClass;
		private static readonly DividendArrowOnOverClass = StockDividendMovie_DividendArrowOnOverClass;
		private static readonly DividendArrowClass = StockDividendMovie_DividendArrowClass;
		private static readonly DividendArrowSidewaysOverClass = StockDividendMovie_DividendArrowSidewaysOverClass;

		private associatedStockDividend: StockDividend;

		protected getTextColor(): number
		{
			return 0x66dd;
		}

		protected initArrows()
		{
			this.arrow = new StockDividendMovie.DividendArrowClass();
			this.arrowOnOver = new StockDividendMovie.DividendArrowOnOverClass();
			this.arrowSideways = new StockDividendMovie.DividendArrowSidewaysClass();
			this.arrowSidewaysOver = new StockDividendMovie.DividendArrowSidewaysOverClass();
		}

		getDetailedText(): string
		{
			let msg: string;
			if (this.associatedStockDividend.ticker)
				msg = Messages.getMsg(Messages.STOCK_DIVIDEND_TEXT_WITH_TICKER, this.associatedStockDividend.ticker);
			else
				msg = Messages.getMsg(Messages.STOCK_DIVIDEND_TEXT);

			return msg.concat("\n", Messages.getMsg(Messages.ADJUSTMENT_FACTOR_TEXT, this.associatedStockDividend.adjustmentFactor));
		}

		setObject(stockDividend: StockDividend)
		{
			this.associatedStockDividend = stockDividend;
			this.showText();
		}

		protected positionSidewaysArrow()
		{
			this.currentVisibleButton.x = -1;
			this.text.autoSize = flash.text.TextFieldAutoSize.RIGHT;
			this.text.x = 0;
		}

		getDateText(): string
		{
			const exchangeDateInUTC = this.associatedStockDividend.exchangeDateInUTC;
			if (Const.isZhLocale(i18n.locale.DateTimeLocale.getLocale()))
				return i18n.locale.DateTimeLocale.standardFormatDateTime(i18n.locale.DateTimeFormats.LONG_DATE_FORMAT, exchangeDateInUTC, true);

			return i18n.locale.DateTimeLocale.standardFormatDateTime(i18n.locale.DateTimeFormats.MEDIUM_DATE_FORMAT, exchangeDateInUTC, true);
		}

		getShortText(param1 = false): string
		{
			return "";
		}
	}
}
