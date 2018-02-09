import { TextField, TextFieldType } from "../../../flash/text/TextField";
import { DateTimeFormats, DateTimeLocale } from "../i18n/locale/DateTimeLocale";
import { Const } from "./Const";

	// import flash.text.TextField;
	// import flash.text.TextFieldType;
	// import com.google.i18n.locale.DateTimeLocale;

export class DateTextField extends TextField {
		private static datePattern = /^ *(\d{4})( *[./-] *\d{1,2})?( *[./-] *\d{1,2})? *$/;
		private static PARSEABLE_FORMAT = "yyyy-MM-dd";
		private static LOCALIZED_FORMAT = "MMM dd, yyyy";

		date: Date;
		parsedDate: Date | null;

		static newDateInUtc(year: number, month: number, day: number): Date {
			const date = new Date();
			date.setUTCFullYear(year);
			date.setUTCMonth(month - 1, day);
			date.setUTCHours(0, 0, 0, 0);
			return date;
		}

		static stringToNumberOrOne(text: string): number {
			if (!text) {
				return 1;
			}

			return Number(text.replace("/", "").replace("-", "").replace(".", ""));
		}

		setHighlighted(highlighted: boolean) {
			if (highlighted) {
				this.background = true;
				this.borderColor = Const.DATE_HIGHLIGHTED_BORDER_COLOR;
			} else {
				this.background = false;
				this.borderColor = Const.DATE_DEFAULT_BORDER_COLOR;
				this.setSelection(0, 0);
				this.type = TextFieldType.DYNAMIC;
			}
		}

		displayDateInParseableFormat() {
			this.text = DateTimeLocale.formatDateTime(DateTextField.PARSEABLE_FORMAT, this.date, true);
		}

		displayDateInLocalizedFormat() {
			if (Const.isZhLocale(DateTimeLocale.getLocale())) {
				this.text = DateTimeLocale.standardFormatDateTime(DateTimeFormats.LONG_DATE_FORMAT, this.date, true);
			} else {
				this.text = DateTimeLocale.formatDateTime(DateTextField.LOCALIZED_FORMAT, this.date, true);
			}
		}

		parseUtcDate(): boolean {
			this.parsedDate = null;
			const _loc1_ = this.text.match(DateTextField.datePattern);
			if (!_loc1_) {
				return false;
			}

			const _loc2_ = DateTextField.stringToNumberOrOne(_loc1_[1]);
			if (_loc2_ < 1900) {
				return false;
			}

			const _loc3_ = DateTextField.stringToNumberOrOne(_loc1_[2]);
			if (_loc3_ < 1 || _loc3_ > 12) {
				return false;
			}

			const _loc4_ = DateTextField.stringToNumberOrOne(_loc1_[3]);
			if (_loc4_ < 1 || _loc4_ > 31) {
				return false;
			}

			this.parsedDate = DateTextField.newDateInUtc(_loc2_, _loc3_, _loc4_);
			return true;
		}
	}
