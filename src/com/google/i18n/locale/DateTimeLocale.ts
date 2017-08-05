namespace com.google.i18n.locale
{
	export class DateTimeLocale
	{
		private static activeLocale: string;

		static readonly SHORT_DATE_FORMAT = 3;

		static readonly SHORT_TIME_FORMAT = 7;

		static readonly FULL_DATETIME_FORMAT = 8;

		static readonly SHORT_DATETIME_FORMAT = 11;

		static readonly constantsRepository: { [key: string]: { [key: string]: any } } = {};

		static readonly MEDIUM_DATE_FORMAT = 2;

		static readonly MEDIUM_TIME_FORMAT = 6;

		static readonly LONG_DATE_FORMAT = 1;

		static readonly LONG_TIME_FORMAT = 5;

		static readonly DATE_TIME_CONSTANTS = "DateTimeConstants";

		static readonly MEDIUM_DATETIME_FORMAT = 10;

		static readonly FULL_DATE_FORMAT = 0;

		static readonly FULL_TIME_FORMAT = 4;

		static readonly LONG_DATETIME_FORMAT = 9;


		static getStandardDateTimeFormatter(param1: number, param2 = false): DateTimeFormat
		{
			let _loc3_ = new DateTimeFormat(param2);
			_loc3_.applyStandardPattern(param1);
			return _loc3_;
		}

		static getResource(param1: string) 
		{
			let _loc2_ = !!param1 ? param1 : DateTimeLocale.getLocale();
			return DateTimeLocale.constantsRepository[_loc2_];
		}

		static getDateTimeFormatter(param1: string, param2 = false): DateTimeFormat
		{
			let _loc3_ = new DateTimeFormat(param2);
			_loc3_.applyPattern(param1);
			return _loc3_;
		}

		static standardFormatDateTime(param1: number, param2: Date, param3 = false): string
		{
			let _loc4_ = new DateTimeFormat(param3);
			_loc4_.applyStandardPattern(param1);
			return _loc4_.format(param2);
		}

		static getLocale(): string
		{
			if (!DateTimeLocale.activeLocale)
				DateTimeLocale.activeLocale = "en";

			return DateTimeLocale.activeLocale;
		}

		static formatDateTime(param1: string, param2: Date, param3 = false): string
		{
			let _loc4_ = new DateTimeFormat(param3);
			_loc4_.applyPattern(param1);
			return _loc4_.format(param2);
		}

		static registerResource(param1: { [key: string]: any }, param2: string) 
		{
			DateTimeLocale.constantsRepository[param2] = param1;
			if (!DateTimeLocale.activeLocale)
				DateTimeLocale.activeLocale = param2;
		}

		static setLocale(param1: string) 
		{
			DateTimeLocale.activeLocale = param1;
		}

		//private static readonly registerLocale = DateTimeConstants.register(DateTimeLocale.registerResource);
	}

	DateTimeConstants.register(DateTimeLocale.registerResource);
}
