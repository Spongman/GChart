namespace com.google.finance
{
	// import flash.text.TextFieldAutoSize;
	// import com.google.i18n.locale.DateTimeLocale;

	export class StockDividendMovie extends SplitMovie
	{
		private readonly DividendArrowSidewaysClass = StockDividendMovie_DividendArrowSidewaysClass;

		private readonly DividendArrowOnOverClass = StockDividendMovie_DividendArrowOnOverClass;

		private readonly DividendArrowClass = StockDividendMovie_DividendArrowClass;

		private readonly DividendArrowSidewaysOverClass = StockDividendMovie_DividendArrowSidewaysOverClass;

		private associatedStockDividend: com.google.finance.StockDividend;


		constructor()
		{
			super();
		}

		protected getTextColor(): number
		{
			return 0x66dd;
		}

		protected initArrows() 
		{
			this.arrow = new this.DividendArrowClass();
			this.arrowOnOver = new this.DividendArrowOnOverClass();
			this.arrowSideways = new this.DividendArrowSidewaysClass();
			this.arrowSidewaysOver = new this.DividendArrowSidewaysOverClass();
		}

		getDetailedText(): string
		{
			let _loc1_:string;
			if (this.associatedStockDividend.ticker)
				_loc1_ = Messages.getMsg(Messages.STOCK_DIVIDEND_TEXT_WITH_TICKER, this.associatedStockDividend.ticker);
			else
				_loc1_ = Messages.getMsg(Messages.STOCK_DIVIDEND_TEXT);

			let _loc2_ = _loc1_.concat("\n", Messages.getMsg(Messages.ADJUSTMENT_FACTOR_TEXT, this.associatedStockDividend.adjustmentFactor));
			return _loc2_;
		}

		setObject(param1: StockDividend) 
		{
			this.associatedStockDividend = param1;
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
			let _loc1_ = this.associatedStockDividend.exchangeDateInUTC;
			if (Const.isZhLocale(com.google.i18n.locale.DateTimeLocale.getLocale()))
				return com.google.i18n.locale.DateTimeLocale.standardFormatDateTime(com.google.i18n.locale.DateTimeLocale.LONG_DATE_FORMAT, _loc1_, true);

			return com.google.i18n.locale.DateTimeLocale.standardFormatDateTime(com.google.i18n.locale.DateTimeLocale.MEDIUM_DATE_FORMAT, _loc1_, true);
		}

		getShortText(param1 = false): string
		{
			return "";
		}
	}
}
