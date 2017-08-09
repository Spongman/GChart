/// <reference path="DateTimeConstants.ts"/>

namespace com.google.i18n.locale
{
	export class DateTimeFormat
	{
		static readonly QUOTED_STRING = 0;
		static readonly FIELD = 1;
		static readonly LITERAL = 2;

		private tokensHash: { [key: string]: boolean } = {};
		private isUtc: boolean;
		private symbols: { [key: string]: any } = DateTimeLocale.getResource(DateTimeLocale.getLocale());
		private TOKENS = "GyMkSEahKHcLQdmsvzZ";
		private patternParts: { text: string, type: number }[] = [];

		constructor(isUtc = false)
		{
			this.isUtc = !!isUtc ? Boolean(isUtc) : false;
			for (let _loc2_ = 0; _loc2_ < this.TOKENS.length; _loc2_++)
				this.tokensHash[this.TOKENS.substr(_loc2_, 1)] = true;
		}

		applyPattern(param1: string) 
		{
			let _loc5_ = 0;
			let _loc2_ = 0;
			const _loc3_ = param1.length;
			while (_loc2_ < param1.length)
			{
				_loc5_ = _loc2_;
				while (_loc5_ < _loc3_ && !this.tokensHash[param1.substr(_loc5_, 1)])
					_loc5_++;

				if (_loc5_ !== _loc2_)
				{
					const _loc4_ = param1.substring(_loc2_, _loc5_);
					this.patternParts.push({
						"text": _loc4_,
						"type": DateTimeFormat.LITERAL
					});
				}
				_loc2_ = _loc5_;
				while (_loc5_ < _loc3_ && this.tokensHash[param1.substr(_loc5_, 1)] && param1.charAt(_loc5_) === param1.charAt(_loc2_))
					_loc5_++;

				if (_loc5_ !== _loc2_)
				{
					const _loc4_ = param1.substring(_loc2_, _loc5_);
					this.patternParts.push({
						"text": _loc4_,
						"type": DateTimeFormat.FIELD
					});
				}
				_loc2_ = _loc5_;
			}
		}

		private formatField(param1: string, param2: Date): string
		{
			const _loc3_ = param1.length;
			switch (param1.charAt(0))
			{
				case "G":
					return this.formatEra(_loc3_, param2);
				case "y":
					return this.formatYear(_loc3_, param2);
				case "M":
					return this.formatMonth(_loc3_, param2);
				case "k":
					return this.format24Hours(_loc3_, param2);
				case "S":
					return this.formatFractionalSeconds(_loc3_, param2);
				case "E":
					return this.formatDayOfWeek(_loc3_, param2);
				case "a":
					return this.formatAmPm(_loc3_, param2);
				case "h":
					return this.format1To12Hours(_loc3_, param2);
				case "K":
					return this.format0To11Hours(_loc3_, param2);
				case "H":
					return this.format0To23Hours(_loc3_, param2);
				case "c":
					return this.formatStandaloneDay(_loc3_, param2);
				case "L":
					return this.formatStandaloneMonth(_loc3_, param2);
				case "Q":
					return this.formatQuarter(_loc3_, param2);
				case "d":
					return this.formatDate(_loc3_, param2);
				case "m":
					return this.formatMinutes(_loc3_, param2);
				case "s":
					return this.formatSeconds(_loc3_, param2);
				case "v":
					return this.formatGMT(_loc3_, param2);
				case "z":
					return this.formatGMT(_loc3_, param2);
				case "Z":
					return this.formatTimeZoneRFC(_loc3_, param2);
				default:
					return "";
			}
		}

		private formatStandaloneMonth(param1: number, param2: Date): string
		{
			const _loc3_ = !!this.isUtc ? param2.getUTCMonth() : param2.getMonth();
			switch (param1)
			{
				case 5:
					return (<any>this.symbols).STANDALONENARROWMONTHS[_loc3_];
				case 4:
					return (<any>this.symbols).STANDALONEMONTHS[_loc3_];
				case 3:
					return (<any>this.symbols).STANDALONESHORTMONTHS[_loc3_];
				default:
					return this.padNumber(_loc3_ + 1, param1);
			}
		}

		applyStandardPattern(param1: number) 
		{
			let _loc2_: string;
			if (param1 < 4)
				_loc2_ = (<any>this.symbols).DATEFORMATS[param1];
			else if (param1 < 8)
				_loc2_ = (<any>this.symbols).TIMEFORMATS[param1 - 4];
			else if (param1 < 12)
				_loc2_ = (<any>this.symbols).DATEFORMATS[param1 - 8] + " " + (<any>this.symbols).TIMEFORMATS[param1 - 8];
			else
			{
				this.applyStandardPattern(DateTimeLocale.MEDIUM_DATETIME_FORMAT);
				return;
			}
			this.applyPattern(_loc2_);
		}

		private formatMonth(param1: number, param2: Date): string
		{
			const _loc3_ = !!this.isUtc ? param2.getUTCMonth() : param2.getMonth();
			switch (param1)
			{
				case 5:
					return (<any>this.symbols).NARROWMONTHS[_loc3_];
				case 4:
					return (<any>this.symbols).MONTHS[_loc3_];
				case 3:
					return (<any>this.symbols).SHORTMONTHS[_loc3_];
				default:
					return this.padNumber(_loc3_ + 1, param1);
			}
		}

		private formatDate(param1: number, param2: Date): string
		{
			const _loc3_ = !!this.isUtc ? param2.getUTCDate() : param2.getDate();
			return this.padNumber(_loc3_, param1);
		}

		private formatSeconds(param1: number, param2: Date): string
		{
			return this.padNumber(param2.getSeconds(), param1);
		}

		private formatYear(param1: number, param2: Date): string
		{
			const _loc3_ = !!this.isUtc ? param2.getUTCFullYear() : param2.getFullYear();
			return param1 === 2 ? this.padNumber(_loc3_ % 100, 2) : String(_loc3_);
		}

		private format24Hours(param1: number, param2: Date): string
		{
			const _loc3_ = !!this.isUtc ? param2.getUTCHours() : param2.getHours();
			return this.padNumber(_loc3_, param1);
		}

		private formatGMT(param1: number, param2: Date): string
		{
			let _loc3_ = param2.getTimezoneOffset();
			const _loc4_: string[] = [];
			if (_loc3_ > 0)
			{
				_loc4_.push("GMT-");
			}
			else
			{
				_loc3_ = -_loc3_;
				_loc4_.push("GMT+");
			}
			_loc4_.push(this.padNumber(_loc3_ / 60, 2));
			_loc4_.push(":");
			_loc4_.push(this.padNumber(_loc3_ % 60, 2));
			return _loc4_.join("");
		}

		private format1To12Hours(param1: number, param2: Date): string
		{
			const _loc3_ = !!this.isUtc ? param2.getUTCHours() : param2.getHours();
			return this.padNumber(((_loc3_ + 11) % 12) + 1, param1);
		}

		private formatEra(param1: number, param2: Date): string
		{
			const _loc3_ = !!this.isUtc ? param2.getUTCFullYear() > 0 ? 1 : 0 : param2.getFullYear() > 0 ? 1 : 0;
			return param1 >= 4 ? (<any>this.symbols).ERANAMES[_loc3_] : (<any>this.symbols).ERAS[_loc3_];
		}

		private formatTimeZoneRFC(param1: number, param2: Date): string
		{
			if (param1 < 4)
			{
				let _loc3_ = param2.getTimezoneOffset();
				let _loc4_ = "-";
				if (_loc3_ < 0)
				{
					_loc3_ = -_loc3_;
					_loc4_ = "+";
				}
				_loc3_ = _loc3_ / 3 * 5 + _loc3_ % 60;
				return _loc4_ + this.padNumber(_loc3_, 4);
			}
			return this.formatGMT(param1, param2);
		}

		private format0To23Hours(param1: number, param2: Date): string
		{
			const _loc3_ = !!this.isUtc ? param2.getUTCHours() : param2.getHours();
			return this.padNumber(_loc3_, param1);
		}

		private formatFractionalSeconds(param1: number, param2: Date): string
		{
			const _loc3_ = param2.getTime() % 1000 / 1000;
			return String(_loc3_);
		}

		private formatAmPm(param1: number, param2: Date): string
		{
			const _loc3_ = !!this.isUtc ? param2.getUTCHours() : param2.getHours();
			return (<any>this.symbols).AMPMS[_loc3_ >= 12 && _loc3_ < 24 ? 1 : 0];	// TODO
		}

		private formatMinutes(param1: number, param2: Date): string
		{
			const _loc3_ = !!this.isUtc ? param2.getUTCMinutes() : param2.getMinutes();
			return this.padNumber(_loc3_, param1);
		}

		private format0To11Hours(param1: number, param2: Date): string
		{
			const _loc3_ = !!this.isUtc ? param2.getUTCHours() : param2.getHours();
			return this.padNumber(_loc3_ % 12, param1);
		}

		private formatStandaloneDay(param1: number, param2: Date): string
		{
			const _loc3_ = !!this.isUtc ? param2.getUTCDay() : param2.getDay();
			switch (param1)
			{
				case 5:
					return (<any>this.symbols).STANDALONENARROWWEEKDAYS[_loc3_];
				case 4:
					return (<any>this.symbols).STANDALONEWEEKDAYS[_loc3_];
				case 3:
					return (<any>this.symbols).STANDALONESHORTWEEKDAYS[_loc3_];
				default:
					return this.padNumber(_loc3_, 1);
			}
		}

		private formatQuarter(param1: number, param2: Date): string
		{
			const _loc3_ = !!this.isUtc ? param2.getUTCMonth() : param2.getMonth();
			const _loc4_ = Math.floor(_loc3_ / 3);
			return param1 < 4 ? (<any>this.symbols).SHORTQUARTERS[_loc4_] : (<any>this.symbols).QUARTERS[_loc4_];
		}

		format(param1: Date): string
		{
			const _loc2_: string[] = [];
			for (let _loc3_ = 0; _loc3_ < this.patternParts.length; _loc3_++)
			{
				const _loc4_ = this.patternParts[_loc3_].text;
				if (DateTimeFormat.FIELD === this.patternParts[_loc3_].type)
					_loc2_.push(this.formatField(_loc4_, param1));
				else
					_loc2_.push(_loc4_);
			}
			return _loc2_.join("");
		}

		private padNumber(param1: number, param2: number): string
		{
			const _loc3_ = Math.floor(param1);
			const _loc4_ = String(_loc3_);
			let _loc5_ = "";
			
			for (let _loc6_ = 0; _loc6_ < Math.max(0, param2 - _loc4_.length); _loc6_++)
				_loc5_ = _loc5_ + "0";

			return _loc5_ + _loc3_;
		}

		private formatDayOfWeek(param1: number, param2: Date): string
		{
			const _loc3_ = !!this.isUtc ? param2.getUTCDay() : param2.getDay();
			return param1 >= 4 ? (<any>this.symbols).WEEKDAYS[_loc3_] : (<any>this.symbols).SHORTWEEKDAYS[_loc3_];
		}
	}
}
