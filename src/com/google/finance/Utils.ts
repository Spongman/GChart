namespace com.google.finance
{
	// import flash.text.TextField;
	// import flash.display.Sprite;
	// import flash.text.TextFormat;
	// import flash.text.TextFieldAutoSize;
	// import flash.display.DisplayObjectContainer;
	// import flash.display.DisplayObject;

	type Class = { new (): any };

	export class Utils
	{
		private static localTzOffset: number;


		static compareDataUnits(param1: DataUnit, param2: DataUnit): number
		{
			return param1.exchangeDateInUTC.getTime() - param2.exchangeDateInUTC.getTime();
		}

		static getLocalTimezoneOffset(): number
		{
			if (isNaN(Utils.localTzOffset))
			{
				let _loc1_ = new Date();
				Utils.localTzOffset = _loc1_.getTimezoneOffset();
			}
			return Utils.localTzOffset;
		}

		static getDateInTimezone(param1: Date, param2: number): number
		{
			let _loc3_ = Utils.newDateInTimezone(param1, param2);
			return _loc3_.getUTCDate();
		}

		static adjustExchangeNameOfArray(param1: { [key: string]: string }[], param2: string) 
		{
			for (let _loc3_ = 0; _loc3_ < param1.length; _loc3_++)
			{
				if (param1[_loc3_])
				{
					if (param1[_loc3_][param2])
					{
						if (param1[_loc3_][param2].indexOf("NASD:") === 0)
							param1[_loc3_][param2] = Utils.adjustNasdToNasdaq(param1[_loc3_][param2]);
					}
				}
			}
		}

		static decodeObjects(param1: string): any[]
		{
			if (!param1)
				return [];

			param1 = decodeURIComponent(param1);
			let _loc2_: { [key: string]: string }[] = [];
			let _loc3_ = param1.split(MainManager.paramsObj.objectSeparator);
			for (let _loc4_ = 0; _loc4_ < _loc3_.length; _loc4_++)
			{
				let _loc5_: { [key: string]: string } = {};
				let _loc6_ = _loc3_[_loc4_].split(MainManager.paramsObj.fieldSeparator);
				for (let _loc7_ = 0; _loc7_ < _loc6_.length; _loc7_++)
				{
					let _loc8_ = _loc6_[_loc7_].split(":");
					var value: any = _loc8_[1];
					if (!isNaN(value))
						value = Number(value);
					else if (value === "true")
						value = true;
					else if (value === "false")
						value = false;
					else if (value === "null")
						value = null;
					_loc5_[_loc8_[0]] = value;
				}
				_loc2_.push(_loc5_);
			}
			return _loc2_;
		}

		static getTickerParts(param1: string) 
		{
			let _loc2_ = param1.split(":");
			let _loc3_ = String(_loc2_.shift());
			let _loc4_ = _loc2_.join(":");
			if (_loc4_ === "")
			{
				_loc4_ = _loc3_;
				_loc3_ = "";
			}
			return {
				"exchange": _loc3_,
				"symbol": _loc4_
			};
		}

		static binarySearch<T, T2, T3>(param1: T[], param2: T2, param3: { (p1: T, p2: T2, p3?: T3): number }, param4: T3): number
		{
			let _loc7_ = NaN;
			let _loc8_ = NaN;
			if (!param1 || param1.length === 0)
				return -1;

			if (param3.call(param4, param1[0], param2) > 0)
				return -1;

			if (param3.call(param4, param1[param1.length - 1], param2) <= 0)
				return param1.length - 1;

			let _loc5_ = 0;
			let _loc6_ = param1.length - 1;
			while (_loc5_ < _loc6_ - 1)
			{
				_loc7_ = Math.round((_loc5_ + _loc6_) / 2);
				_loc8_ = param3.call(param4, param1[_loc7_], param2);
				if (_loc8_ < 0)
					_loc5_ = Number(_loc7_);
				else if (_loc8_ > 0)
					_loc6_ = _loc7_;
				else
					return _loc7_;
			}
			return _loc5_;
		}

		static assocArrayLength(param1: { [key: string]: any }): number
		{
			let _loc2_ = 0;
			for (let _loc3_ in param1)
			{
				_loc2_++;
			}
			return _loc2_;
		}

		static newDateInTimezone(param1: Date, param2: number): Date
		{
			let _loc3_ = new Date(param1.getTime() + param2 * 60 * 1000);
			return _loc3_;
		}

		static compareUtcDates(param1: Date, param2: Date): number
		{
			if (param1.getUTCFullYear() !== param2.getUTCFullYear())
				return param1.getUTCFullYear() - param2.getUTCFullYear();

			if (param1.getUTCMonth() !== param2.getUTCMonth())
				return param1.getUTCMonth() - param2.getUTCMonth();

			if (param1.getUTCDate() !== param2.getUTCDate())
				return param1.getUTCDate() - param2.getUTCDate();

			return 0;
		}

		static logTransform(param1: number): number
		{
			return Math.log(param1 < Const.LOG_SCALE ? Number((Const.LOG_SCALE - 1) / Const.LOG_SCALE * param1 + 1) : param1) / Const.LOG_SCALE_LOG;
		}

		static getEndOfUTCDayTime(param1: Date): number
		{
			let _loc2_ = new Date(param1.getTime());
			_loc2_.setUTCHours(23, 59, 0, 0);
			return _loc2_.getTime();
		}

		static getSymbolFromTicker(param1: string): string
		{
			return Utils.getTickerParts(param1).symbol;
		}

		static getLastRealPointIndex(param1: DataUnit[]): number
		{
			if (!param1 || param1.length === 0)
				return -1;

			let _loc2_ = param1.length - 1;
			while (_loc2_ >= 0 && param1[_loc2_].fake)
				_loc2_--;

			return _loc2_;
		}

		static getExchangeFromTicker(param1: string): string
		{
			return Utils.getTickerParts(param1).exchange;
		}

		static numberToString(param1: number, param2: number, param3: number): string
		{
			let _loc4_ = Math.pow(10, param2);
			param1 = Math.round(param1 * Math.pow(10, param2));
			let _loc5_ = param1 % _loc4_;
			let _loc6_ = Math.floor(param1 / _loc4_) + ".";
			while (_loc4_ > 1)
			{
				_loc4_ = _loc4_ / 10;
				_loc6_ = _loc6_ + Math.floor(_loc5_ / _loc4_);
				_loc5_ = _loc5_ % _loc4_;
			}
			for (let _loc7_ = 0; _loc7_ < param3 - _loc6_.length; _loc7_++)
			{
				_loc6_ = "0" + _loc6_;
			}
			return _loc6_;
		}

		static utcDateToString(param1: Date): string
		{
			return param1.getUTCFullYear() + "." + (param1.getUTCMonth() + 1) + "." + param1.getUTCDate() + "/" + param1.getUTCHours() + ":" + param1.getUTCMinutes();
		}

		static createLabel(param1: flash.display.Sprite, param2: string, param3: flash.text.TextFormat): flash.text.TextField
		{
			let _loc4_ = new flash.text.TextField();
			param1.addChild(_loc4_);
			_loc4_.autoSize = flash.text.TextFieldAutoSize.LEFT;
			_loc4_.defaultTextFormat = param3;
			_loc4_.selectable = false;
			_loc4_.text = param2;
			return _loc4_;
		}

		static extendedMin(param1: number, param2: number): number
		{
			if (!(param1 >= 0 || param1 <= 0))
				return param2;

			if (!(param2 >= 0 || param2 <= 0))
				return param1;

			return Math.min(param1, param2);
		}

		static findValueInArray<T>(param1: T, param2: T[]): number
		{
			if (!param2 || !param1)
				return -1;

			for (let _loc3_ = 0; _loc3_ < param2.length; _loc3_++)
			{
				if (param1 === param2[_loc3_])
					return _loc3_;
			}
			return -1;
		}

		static getWeekdaysDifference(param1: Date, param2: Date, param3: number): number
		{
			let _loc4_ = 0;
			for (let _loc5_ = 0; _loc5_ < Const.DAY_PER_WEEK; _loc5_++)
			{
				if (Utils.IsWeekday(_loc5_, param3))
					_loc4_++;
			}
			let _loc6_ = (param2.getTime() - param1.getTime()) / Const.MS_PER_DAY;
			let _loc7_ = Math.floor(_loc6_ / Const.DAY_PER_WEEK) * _loc4_;
			if (_loc6_ % Const.DAY_PER_WEEK === 0)
				return _loc7_;

			let _loc8_ = 0;
			let _loc9_ = param1.getDay();

			for (let _loc10_ = 0; _loc10_ < Const.DAY_PER_WEEK && _loc9_ !== param2.getDay(); _loc10_++)
			{
				if (Utils.IsWeekday(_loc9_, param3))
					_loc8_++;

				_loc9_ = (_loc9_ + 1) % Const.DAY_PER_WEEK;
			}
			if (!Utils.IsWeekday(param1.getDay(), param3) && Utils.IsWeekday(param2.getDay(), param3))
				_loc8_++;

			return _loc7_ + _loc8_;
		}

		static numberToMinTwoChars(param1: number): string
		{
			if (param1 < 10)
				return "0" + param1;

			return param1.toString();
		}

		static getLogScaledValue(param1: number, param2: string): number
		{
			if (param2 === Const.LOG_VSCALE || param2 === Const.NEW_LOG_VSCALE)
				return Utils.logTransform(param1);

			return param1;
		}

		static removeAllChildren(param1: flash.display.DisplayObjectContainer) 
		{
			while (param1.numChildren > 0)
				param1.removeChildAt(0);
		}

		static compareNumbers(param1: number, param2: number): number
		{
			if (param1 < param2)
				return -1;

			if (param1 > param2)
				return 1;

			return 0;
		}

		static checkUndefined(param1: any, param2: any) 
		{
			if (param1 === undefined)
				return param2;

			return param1;
		}

		static adjustNasdToNasdaq(param1: string): string
		{
			if (param1.indexOf("NASD:") === 0)
				return "NASDAQ:" + param1.substr(5);

			return param1;
		}

		static extendedMax(param1: number, param2: number): number
		{
			if (!(param1 >= 0 || param1 <= 0))
				return param2;

			if (!(param2 >= 0 || param2 <= 0))
				return param1;

			return Math.max(param1, param2);
		}

		static isSubset(param1: { [key: string]: any }, param2: { [key: string]: any }): boolean
		{
			for (let _loc3_ in param1)
			{
				if (param1[_loc3_] !== param2[_loc3_])
					return false;
			}
			return true;
		}

		static printObjectMembers(param1: string, param2: any) 
		{
			console.log(param1);
			for (let _loc3_ in param2)
			{
				console.log("  obj." + _loc3_ + " = " + param2[_loc3_]);
			}
		}

		static hourToString(param1: number, param2: number): string
		{
			let _loc3_ = "";
			if (param2 === 0)
			{
				if (param1 > 12)
				{
					param1 = param1 - 12;
					_loc3_ = param1 + " pm";
				}
				else if (param1 === 12)
				{
					_loc3_ = "12 pm";
				}
				else
				{
					_loc3_ = param1 + " am";
				}
			}
			else
			{
				let _loc4_ = "" + param1;
				let _loc5_ = "" + param2;
				if (param1 < 10)
					_loc4_ = "0" + param1;

				if (param2 < 10)
					_loc5_ = "0" + param2;

				_loc3_ = _loc4_ + ":" + _loc5_;
			}
			return _loc3_;
		}

		static appendObjectMembersAsStrings(param1: string, param2: any): string
		{
			let _loc3_ = param1 + ":";
			for (let _loc4_ in param2)
			{
				_loc3_ = _loc3_ + ("  obj." + _loc4_ + "=" + param2[_loc4_]);
			}
			return _loc3_;
		}

		static displayObjectToTop(param1: flash.display.DisplayObject, param2: flash.display.DisplayObjectContainer) 
		{
			let index = 0;
			let child = param1;
			let container = param2;
			try
			{
				index = container.getChildIndex(child);
				container.swapChildrenAt(index, container.numChildren - 1);
				return;
			}
			catch (ae /*:ArgumentError*/)
			{
				return;
			}
		}

		static getLastDayOfWeek(param1: number): number
		{
			let _loc2_ = Const.DAY_PER_WEEK - 1;
			while (_loc2_ >= 0)
			{
				if (Utils.IsWeekday(_loc2_, param1))
					return _loc2_;

				_loc2_--;
			}
			return Const.DEFAULT_LAST_MARKET_WEEKDAY;
		}

		static cloneObject<T>(param1: T): T
		{
			let _loc2_ = <T>{};
			for (let _loc3_ in param1)
			{
				(<any>_loc2_)[_loc3_] = (<any>param1)[_loc3_]; // TODO
			}
			return _loc2_;
		}

		static IsWeekday(param1: number, param2: number): boolean
		{
			if (64 >> param1 & param2)
				return true;

			return false;
		}

		static hasDifferentDividendCurrency(param1: string, param2: any[]): boolean
		{
			for (let _loc3_ = 0; _loc3_ < param2.length; _loc3_++)
			{
				let _loc4_ = param2[_loc3_];
				if (_loc4_._type === "dividend" && _loc4_._amount_currency)
				{
					if (param1 && param1 !== _loc4_._amount_currency)
						return true;

					param1 = _loc4_._amount_currency;
				}
			}
			return false;
		}
	}
}
