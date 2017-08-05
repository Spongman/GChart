/// <reference path="SplitMovie.ts" />

namespace com.google.finance
{
	// import flash.text.TextFieldAutoSize;
	// import com.google.i18n.locale.DateTimeLocale;

	export class DividendMovie extends SplitMovie
	{
		private DividendArrowSidewaysClass: typeof flash.display.Bitmap;

		private DividendArrowClass: typeof flash.display.Bitmap;

		private DividendArrowOnOverClass: typeof flash.display.Bitmap;

		private DividendArrowSidewaysOverClass: typeof flash.display.Bitmap;

		private associatedDividend: com.google.finance.Dividend;

		constructor()
		{
			super();
			this.DividendArrowClass = DividendMovie_DividendArrowClass;
			this.DividendArrowOnOverClass = DividendMovie_DividendArrowOnOverClass;
			this.DividendArrowSidewaysClass = DividendMovie_DividendArrowSidewaysClass;
			this.DividendArrowSidewaysOverClass = DividendMovie_DividendArrowSidewaysOverClass;
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
			if (MainManager.paramsObj.companyCurrency && this.associatedDividend.currency && MainManager.paramsObj.differentDividendCurrency)
				return Messages.getMsg(Messages.DIVIDEND_TEXT_NO_PERCENT, this.getShortText(true));

			let _loc1_ = Math.floor(this.associatedDividend.yield * 10000) / 100;
			let _loc2_ = _loc1_ + "%";
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
			let _loc1_ = this.associatedDividend.exchangeDateInUTC;
			if (Const.isZhLocale(com.google.i18n.locale.DateTimeLocale.getLocale()))
				return com.google.i18n.locale.DateTimeLocale.standardFormatDateTime(com.google.i18n.locale.DateTimeLocale.LONG_DATE_FORMAT, _loc1_, true);

			return com.google.i18n.locale.DateTimeLocale.standardFormatDateTime(com.google.i18n.locale.DateTimeLocale.MEDIUM_DATE_FORMAT, _loc1_, true);
		}

		getShortText(param1 = false): string
		{
			let _loc3_ = false;
			let _loc5_ = 0;
			let _loc6_ = NaN;
			let _loc7_ = NaN;
			let _loc8_ = NaN;
			let _loc2_ = this.associatedDividend.amount;
			if (Const.DISPLAY_DIVIDENDS_UNITS === "false")
			{
				_loc3_ = !MainManager.paramsObj.companyCurrency || !this.associatedDividend.currency || MainManager.paramsObj.differentDividendCurrency;
				let _loc4_ = this.associatedDividend.currency && _loc3_ ? this.associatedDividend.currency : "";
				if (!param1)
				{
					_loc5_ = 100;
					while (_loc5_ < 10000)
					{
						_loc6_ = Math.round(_loc2_ * _loc5_) / _loc5_;
						if (_loc6_ !== 0)
							return _loc4_ + _loc6_;

						_loc5_ = _loc5_ * 10;
					}
					return _loc4_ + "0";
				}
				return _loc4_ + _loc2_.toString();
			}
			if (_loc2_ < 1)
			{
				_loc7_ = _loc2_ * 100;
				if (!param1)
				{
					if (Math.round(_loc7_) === 0)
						_loc7_ = Math.round(_loc7_ * 10) / 10;
					else
						_loc7_ = Math.round(_loc7_);
				}
				return _loc7_ + String.fromCharCode(162);
			}
			_loc8_ = _loc2_;
			if (!param1)
				_loc8_ = Math.round(_loc8_ * 100) / 100;

			return "$" + _loc8_;
		}
	}
}
