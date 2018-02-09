import { Dictionary } from "../../../../Global";
import { DateTimeConstants } from "./DateTimeConstants";
import { DateTimeFormats, DateTimeLocale } from "./DateTimeLocale";

enum PatternPartTypes {
		QUOTED_STRING = 0,
		FIELD = 1,
		LITERAL = 2,
	}

class PatternPart {
		constructor(public text: string, public type: PatternPartTypes) { }
	}

export class DateTimeFormat {
		private tokensHash: { [key: string]: boolean } = {};
		private symbols: Dictionary = DateTimeLocale.getResource(DateTimeLocale.getLocale());
		private TOKENS = "GyMkSEahKHcLQdmsvzZ";
		private patternParts: PatternPart[] = [];

		constructor(private isUtc = false) {
			for (let tokenIndex = 0; tokenIndex < this.TOKENS.length; tokenIndex++) {
				this.tokensHash[this.TOKENS.substr(tokenIndex, 1)] = true;
			}
		}

		applyPattern(pattern: string) {
			let _loc2_ = 0;
			const length = pattern.length;
			while (_loc2_ < pattern.length) {
				let _loc5_ = _loc2_;
				while (_loc5_ < length && !this.tokensHash[pattern.substr(_loc5_, 1)]) {
					_loc5_++;
				}

				if (_loc5_ !== _loc2_) {
					const literal = pattern.substring(_loc2_, _loc5_);
					this.patternParts.push(new PatternPart(literal, PatternPartTypes.LITERAL));
				}
				_loc2_ = _loc5_;
				while (_loc5_ < length && this.tokensHash[pattern.substr(_loc5_, 1)] && pattern.charAt(_loc5_) === pattern.charAt(_loc2_)) {
					_loc5_++;
				}

				if (_loc5_ !== _loc2_) {
					const field = pattern.substring(_loc2_, _loc5_);
					this.patternParts.push(new PatternPart(field, PatternPartTypes.FIELD));
				}
				_loc2_ = _loc5_;
			}
		}

		private formatField(field: string, date: Date): string {
			const fieldLength = field.length;
			switch (field.charAt(0)) {
				case "G":
					return this.formatEra(fieldLength, date);
				case "y":
					return this.formatYear(fieldLength, date);
				case "M":
					return this.formatMonth(fieldLength, date);
				case "k":
					return this.format24Hours(fieldLength, date);
				case "S":
					return this.formatFractionalSeconds(fieldLength, date);
				case "E":
					return this.formatDayOfWeek(fieldLength, date);
				case "a":
					return this.formatAmPm(fieldLength, date);
				case "h":
					return this.format1To12Hours(fieldLength, date);
				case "K":
					return this.format0To11Hours(fieldLength, date);
				case "H":
					return this.format0To23Hours(fieldLength, date);
				case "c":
					return this.formatStandaloneDay(fieldLength, date);
				case "L":
					return this.formatStandaloneMonth(fieldLength, date);
				case "Q":
					return this.formatQuarter(fieldLength, date);
				case "d":
					return this.formatDate(fieldLength, date);
				case "m":
					return this.formatMinutes(fieldLength, date);
				case "s":
					return this.formatSeconds(fieldLength, date);
				case "v":
					return this.formatGMT(fieldLength, date);
				case "z":
					return this.formatGMT(fieldLength, date);
				case "Z":
					return this.formatTimeZoneRFC(fieldLength, date);
				default:
					return "";
			}
		}

		private formatStandaloneMonth(fieldLength: number, date: Date): string {
			const month = this.isUtc ? date.getUTCMonth() : date.getMonth();
			switch (fieldLength) {
				case 5:
					return (this.symbols as any).STANDALONENARROWMONTHS[month];
				case 4:
					return (this.symbols as any).STANDALONEMONTHS[month];
				case 3:
					return (this.symbols as any).STANDALONESHORTMONTHS[month];
				default:
					return this.padNumber(month + 1, fieldLength);
			}
		}

		applyStandardPattern(dateTimeFormat: DateTimeFormats) {
			let pattern: string;
			if (dateTimeFormat < DateTimeFormats.FULL_TIME_FORMAT) {
				pattern = (this.symbols as any).DATEFORMATS[dateTimeFormat];
			} else if (dateTimeFormat < DateTimeFormats.FULL_DATETIME_FORMAT) {
				pattern = (this.symbols as any).TIMEFORMATS[dateTimeFormat as number - 4];
								} else if (dateTimeFormat <= DateTimeFormats.SHORT_DATETIME_FORMAT) {
				pattern = (this.symbols as any).DATEFORMATS[dateTimeFormat as number - 8] + " " + (this.symbols as any).TIMEFORMATS[dateTimeFormat as number - 8];
								} else {
				this.applyStandardPattern(DateTimeFormats.MEDIUM_DATETIME_FORMAT);
				return;
			}
			this.applyPattern(pattern);
		}

		private formatMonth(fieldLength: number, date: Date): string {
			const month = this.isUtc ? date.getUTCMonth() : date.getMonth();
			switch (fieldLength) {
				case 5:
					return (this.symbols as any).NARROWMONTHS[month];
				case 4:
					return (this.symbols as any).MONTHS[month];
				case 3:
					return (this.symbols as any).SHORTMONTHS[month];
				default:
					return this.padNumber(month + 1, fieldLength);
			}
		}

		private formatDate(fieldLength: number, date: Date): string {
			const day = this.isUtc ? date.getUTCDate() : date.getDate();
			return this.padNumber(day, fieldLength);
		}

		private formatSeconds(fieldLength: number, date: Date): string {
			return this.padNumber(date.getSeconds(), fieldLength);
		}

		private formatYear(fieldLength: number, date: Date): string {
			const year = this.isUtc ? date.getUTCFullYear() : date.getFullYear();
			return fieldLength === 2 ? this.padNumber(year % 100, 2) : String(year);
		}

		private format24Hours(fieldLength: number, date: Date): string {
			const hour = this.isUtc ? date.getUTCHours() : date.getHours();
			return this.padNumber(hour, fieldLength);
		}

		private formatGMT(fieldLength: number, date: Date): string {
			let timezoneOffset = date.getTimezoneOffset();
			const parts: string[] = [];
			if (timezoneOffset > 0) {
				parts.push("GMT-");
			} else {
				timezoneOffset = -timezoneOffset;
				parts.push("GMT+");
			}
			parts.push(this.padNumber(timezoneOffset / 60, 2));
			parts.push(":");
			parts.push(this.padNumber(timezoneOffset % 60, 2));
			return parts.join("");
		}

		private format1To12Hours(fieldLength: number, date: Date): string {
			const hour = this.isUtc ? date.getUTCHours() : date.getHours();
			return this.padNumber(((hour + 11) % 12) + 1, fieldLength);
		}

		private formatEra(fieldLength: number, date: Date): string {
			const year = this.isUtc ? date.getUTCFullYear() > 0 ? 1 : 0 : date.getFullYear() > 0 ? 1 : 0;
			return fieldLength >= 4 ? (this.symbols as any).ERANAMES[year] : (this.symbols as any).ERAS[year];
		}

		private formatTimeZoneRFC(fieldLength: number, date: Date): string {
			if (fieldLength < 4) {
				let timezoneOffset = date.getTimezoneOffset();
				let sign = "-";
				if (timezoneOffset < 0) {
					timezoneOffset = -timezoneOffset;
					sign = "+";
				}
				timezoneOffset = timezoneOffset / 3 * 5 + timezoneOffset % 60;
				return sign + this.padNumber(timezoneOffset, 4);
			}
			return this.formatGMT(fieldLength, date);
		}

		private format0To23Hours(fieldLength: number, date: Date): string {
			const hour = this.isUtc ? date.getUTCHours() : date.getHours();
			return this.padNumber(hour, fieldLength);
		}

		private formatFractionalSeconds(fieldLength: number, date: Date): string {
			const seconds = date.getTime() % 1000 / 1000;
			return String(seconds);
		}

		private formatAmPm(fieldLength: number, date: Date): string {
			const hour = this.isUtc ? date.getUTCHours() : date.getHours();
			return (this.symbols as any).AMPMS[hour >= 12 && hour < 24 ? 1 : 0];	// TODO
		}

		private formatMinutes(fieldLength: number, date: Date): string {
			const minute = this.isUtc ? date.getUTCMinutes() : date.getMinutes();
			return this.padNumber(minute, fieldLength);
		}

		private format0To11Hours(fieldLength: number, date: Date): string {
			const hour = this.isUtc ? date.getUTCHours() : date.getHours();
			return this.padNumber(hour % 12, fieldLength);
		}

		private formatStandaloneDay(fieldLength: number, date: Date): string {
			const day = this.isUtc ? date.getUTCDay() : date.getDay();
			switch (fieldLength) {
				case 5:
					return (this.symbols as any).STANDALONENARROWWEEKDAYS[day];
				case 4:
					return (this.symbols as any).STANDALONEWEEKDAYS[day];
				case 3:
					return (this.symbols as any).STANDALONESHORTWEEKDAYS[day];
				default:
					return this.padNumber(day, 1);
			}
		}

		private formatQuarter(fieldLength: number, date: Date): string {
			const month = this.isUtc ? date.getUTCMonth() : date.getMonth();
			const quarter = Math.floor(month / 3);
			return fieldLength < 4 ? (this.symbols as any).SHORTQUARTERS[quarter] : (this.symbols as any).QUARTERS[quarter];
		}

		format(date: Date): string {
			const parts: string[] = [];
			for (const part of this.patternParts) {
				const partText = part.text;
				if (PatternPartTypes.FIELD === part.type) {
					parts.push(this.formatField(partText, date));
				} else {
					parts.push(partText);
				}
			}
			return parts.join("");
		}

		private padNumber(value: number, param2: number): string {
			const _loc3_ = Math.floor(value);
			const _loc4_ = String(_loc3_);
			let padding = "";

			for (let _loc6_ = 0; _loc6_ < Math.max(0, param2 - _loc4_.length); _loc6_++) {
				padding += "0";
			}

			return padding + _loc3_;
		}

		private formatDayOfWeek(fieldLength: number, date: Date): string {
			const day = this.isUtc ? date.getUTCDay() : date.getDay();
			return fieldLength >= 4 ? (this.symbols as any).WEEKDAYS[day] : (this.symbols as any).SHORTWEEKDAYS[day];
		}
	}
