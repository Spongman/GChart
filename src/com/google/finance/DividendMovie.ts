/// <reference path="SplitMovie.ts" />

namespace com.google.finance
{
	// import flash.text.TextFieldAutoSize;
	// import com.google.i18n.locale.DateTimeLocale;

	export class DividendMovie extends SplitMovie
	{
		private static DividendArrowClass = DividendMovie_DividendArrowClass;
		private static DividendArrowOnOverClass = DividendMovie_DividendArrowOnOverClass;
		private static DividendArrowSidewaysClass = DividendMovie_DividendArrowSidewaysClass;
		private static DividendArrowSidewaysOverClass = DividendMovie_DividendArrowSidewaysOverClass;

		private associatedDividend: com.google.finance.Dividend;
		
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
			this.arrow = new DividendMovie.DividendArrowClass();
			this.arrowOnOver = new DividendMovie.DividendArrowOnOverClass();
			this.arrowSideways = new DividendMovie.DividendArrowSidewaysClass();
			this.arrowSidewaysOver = new DividendMovie.DividendArrowSidewaysOverClass();
		}

		getDetailedText(): string
		{
			if (MainManager.paramsObj.companyCurrency && this.associatedDividend.currency && MainManager.paramsObj.differentDividendCurrency)
				return Messages.getMsg(Messages.DIVIDEND_TEXT_NO_PERCENT, this.getShortText(true));

			const _loc1_ = Math.floor(this.associatedDividend.yield * 10000) / 100;
			const _loc2_ = _loc1_ + "%";
			return Messages.getMsg(Messages.DIVIDEND_TEXT, this.getShortText(true), _loc2_);
		}

		setObject(param1: Dividend) 
		{
			this.associatedDividend = param1;
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
			const _loc1_ = this.associatedDividend.exchangeDateInUTC;
			if (Const.isZhLocale(com.google.i18n.locale.DateTimeLocale.getLocale()))
				return com.google.i18n.locale.DateTimeLocale.standardFormatDateTime(com.google.i18n.locale.DateTimeLocale.LONG_DATE_FORMAT, _loc1_, true);

			return com.google.i18n.locale.DateTimeLocale.standardFormatDateTime(com.google.i18n.locale.DateTimeLocale.MEDIUM_DATE_FORMAT, _loc1_, true);
		}

		getShortText(param1 = false): string
		{
			let _loc3_ = false;
			const _loc2_ = this.associatedDividend.amount;
			if (Const.DISPLAY_DIVIDENDS_UNITS === "false")
			{
				_loc3_ = !MainManager.paramsObj.companyCurrency || !this.associatedDividend.currency || MainManager.paramsObj.differentDividendCurrency;
				const _loc4_ = this.associatedDividend.currency && _loc3_ ? this.associatedDividend.currency : "";
				if (!param1)
				{
					for (let _loc5_ = 100; _loc5_ < 10000; _loc5_ = _loc5_ * 10)
					{
						const _loc6_ = Math.round(_loc2_ * _loc5_) / _loc5_;
						if (_loc6_ !== 0)
							return _loc4_ + _loc6_;

					}
					return _loc4_ + "0";
				}
				return _loc4_ + _loc2_.toString();
			}
			if (_loc2_ < 1)
			{
				let _loc7_ = _loc2_ * 100;
				if (!param1)
				{
					if (Math.round(_loc7_) === 0)
						_loc7_ = Math.round(_loc7_ * 10) / 10;
					else
						_loc7_ = Math.round(_loc7_);
				}
				return _loc7_ + String.fromCharCode(162);
			}
			let _loc8_ = _loc2_;
			if (!param1)
				_loc8_ = Math.round(_loc8_ * 100) / 100;

			return "$" + _loc8_;
		}
	}
}
