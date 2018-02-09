import { Dictionary } from "../../../../Global";

export class DateTimeConstants {
		private static DateTimeConstants_en = {
			ERAS: ["BC", "AD"],
			ERANAMES: ["Before Christ", "Anno Domini"],
			NARROWMONTHS: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
			MONTHS: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
			SHORTMONTHS: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
			WEEKDAYS: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
			SHORTWEEKDAYS: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
			NARROWWEEKDAYS: ["S", "M", "T", "W", "T", "F", "S"],
			SHORTQUARTERS: ["Q1", "Q2", "Q3", "Q4"],
			QUARTERS: ["1st quarter", "2nd quarter", "3rd quarter", "4th quarter"],
			AMPMS: ["AM", "PM"],
			DATEFORMATS: ["EEEE, MMMM d, y", "MMMM d, y", "MMM d, y", "M/d/yy"],
			TIMEFORMATS: ["h:mm:ss a zzzz", "h:mm:ss a z", "h:mm:ss a", "h:mm a"],
			FIRSTDAYOFWEEK: 6,
			WEEKENDRANGE: [5, 6],
			FIRSTWEEKCUTOFFDAY: 2,
		};

		static register(registerResource: (resource: Dictionary, locale: string) => void): boolean {
			registerResource(DateTimeConstants.DateTimeConstants_en, "en");
			return true;
		}

		private static _staticConstructor = (() => {
			const consts: Dictionary = DateTimeConstants.DateTimeConstants_en;
			consts["STANDALONENARROWMONTHS"] = DateTimeConstants.DateTimeConstants_en.NARROWMONTHS;
			consts["STANDALONEMONTHS"] = DateTimeConstants.DateTimeConstants_en.MONTHS;
			consts["STANDALONESHORTMONTHS"] = DateTimeConstants.DateTimeConstants_en.SHORTMONTHS;
			consts["STANDALONEWEEKDAYS"] = DateTimeConstants.DateTimeConstants_en.WEEKDAYS;
			consts["STANDALONESHORTWEEKDAYS"] = DateTimeConstants.DateTimeConstants_en.SHORTWEEKDAYS;
			consts["STANDALONENARROWWEEKDAYS"] = DateTimeConstants.DateTimeConstants_en.NARROWWEEKDAYS;
			return true;
		})();
	}
