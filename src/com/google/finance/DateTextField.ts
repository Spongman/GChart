/// <reference path="../../../flash/text/TextField.ts" />

namespace com.google.finance
{
	// import flash.text.TextField;
	// import flash.text.TextFieldType;
	// import com.google.i18n.locale.DateTimeLocale;

	export class DateTextField extends flash.text.TextField
	{
		private static datePattern = /^ *(\d{4})( *[./-] *\d{1,2})?( *[./-] *\d{1,2})? *$/;
		private static PARSEABLE_FORMAT = "yyyy-MM-dd";
		private static LOCALIZED_FORMAT = "MMM dd, yyyy";

		date: Date;
		parsedDate: Date | null;

		static newDateInUtc(param1: number, param2: number, param3: number): Date
		{
			const date = new Date();
			date.setUTCFullYear(param1);
			date.setUTCMonth(param2 - 1, param3);
			date.setUTCHours(0, 0, 0, 0);
			return date;
		}

		static stringToNumberOrOne(param1: string): number
		{
			if (!param1)
				return 1;

			return Number(param1.replace("/", "").replace("-", "").replace(".", ""));
		}

		setHighlighted(param1: boolean) 
		{
			if (param1)
			{
				this.background = true;
				this.borderColor = Const.DATE_HIGHLIGHTED_BORDER_COLOR;
			}
			else
			{
				this.background = false;
				this.borderColor = Const.DATE_DEFAULT_BORDER_COLOR;
				this.setSelection(0, 0);
				this.type = flash.text.TextFieldType.DYNAMIC;
			}
		}

		displayDateInParseableFormat() 
		{
			this.text = com.google.i18n.locale.DateTimeLocale.formatDateTime(DateTextField.PARSEABLE_FORMAT, this.date, true);
		}

		displayDateInLocalizedFormat() 
		{
			if (Const.isZhLocale(com.google.i18n.locale.DateTimeLocale.getLocale()))
				this.text = com.google.i18n.locale.DateTimeLocale.standardFormatDateTime(com.google.i18n.locale.DateTimeFormats.LONG_DATE_FORMAT, this.date, true);
			else
				this.text = com.google.i18n.locale.DateTimeLocale.formatDateTime(DateTextField.LOCALIZED_FORMAT, this.date, true);
		}

		parseUtcDate(): boolean
		{
			this.parsedDate = null;
			const _loc1_ = this.text.match(DateTextField.datePattern);
			if (!_loc1_)
				return false;

			const _loc2_ = DateTextField.stringToNumberOrOne(_loc1_[1]);
			if (_loc2_ < 1900)
				return false;

			const _loc3_ = DateTextField.stringToNumberOrOne(_loc1_[2]);
			if (_loc3_ < 1 || _loc3_ > 12)
				return false;

			const _loc4_ = DateTextField.stringToNumberOrOne(_loc1_[3]);
			if (_loc4_ < 1 || _loc4_ > 31)
				return false;

			this.parsedDate = DateTextField.newDateInUtc(_loc2_, _loc3_, _loc4_);
			return true;
		}
	}
}
