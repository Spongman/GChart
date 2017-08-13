namespace com.google.i18n.locale
{
	export enum DateTimeFormats
	{
		FULL_DATE_FORMAT = 0,
		LONG_DATE_FORMAT = 1,
		MEDIUM_DATE_FORMAT = 2,
		SHORT_DATE_FORMAT = 3,
		FULL_TIME_FORMAT = 4,
		LONG_TIME_FORMAT = 5,
		MEDIUM_TIME_FORMAT = 6,
		SHORT_TIME_FORMAT = 7,
		FULL_DATETIME_FORMAT = 8,
		LONG_DATETIME_FORMAT = 9,
		MEDIUM_DATETIME_FORMAT = 10,
		SHORT_DATETIME_FORMAT = 11,
	}

	export class DateTimeLocale
	{

		static readonly DATE_TIME_CONSTANTS = "DateTimeConstants";

		static readonly constantsRepository: { [key: string]: { [key: string]: any } } = {};

		private static activeLocale: string;
		

		static getStandardDateTimeFormatter(pattern: DateTimeFormats, isUtc = false): DateTimeFormat
		{
			const format = new DateTimeFormat(isUtc);
			format.applyStandardPattern(pattern);
			return format;
		}

		static getResource(locale: string) 
		{
			return DateTimeLocale.constantsRepository[locale || DateTimeLocale.getLocale()];
		}

		static getDateTimeFormatter(pattern: string, isUtc = false): DateTimeFormat
		{
			const format = new DateTimeFormat(isUtc);
			format.applyPattern(pattern);
			return format;
		}

		static standardFormatDateTime(pattern: number, date: Date, isUtc = false): string
		{
			const format = new DateTimeFormat(isUtc);
			format.applyStandardPattern(pattern);
			return format.format(date);
		}

		static getLocale(): string
		{
			if (!DateTimeLocale.activeLocale)
				DateTimeLocale.activeLocale = "en";

			return DateTimeLocale.activeLocale;
		}

		static formatDateTime(pattern: string, date: Date, isUtc = false): string
		{
			const format = new DateTimeFormat(isUtc);
			format.applyPattern(pattern);
			return format.format(date);
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
