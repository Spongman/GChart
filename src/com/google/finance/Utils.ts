import { DataUnit } from './DataUnit';
import { MainManager } from './MainManager';
import { Const } from './Const';
import { Sprite } from '../../../flash/display/Sprite';
import { TextFormat, TextFieldAutoSize, TextField } from '../../../flash/text/TextField';
import { DisplayObjectContainer } from '../../../flash/display/DisplayObjectContainer';
import { Map, Dictionary } from '../../../Global';
import { DisplayObject } from '../../../flash/display/DisplayObject';

	// import flash.text.TextField;
	// import flash.display.Sprite;
	// import flash.text.TextFormat;
	// import flash.text.TextFieldAutoSize;
	// import flash.display.DisplayObjectContainer;
	// import flash.display.DisplayObject;

	//type Class = { new (): any };

	export class Utils {
		private static localTzOffset: number;

		static compareDataUnits(dataUnit1: DataUnit, dataUnit2: DataUnit): number {
			return dataUnit1.exchangeDateInUTC.getTime() - dataUnit2.exchangeDateInUTC.getTime();
		}

		static getLocalTimezoneOffset(): number {
			if (isNaN(Utils.localTzOffset)) {
				Utils.localTzOffset = new Date().getTimezoneOffset();
			}
			return Utils.localTzOffset;
		}

		static getDateInTimezone(date: Date, minutes: number): number {
			return Utils.newDateInTimezone(date, minutes).getUTCDate();
		}

		static adjustExchangeNameOfArray(maps: Array<Map<string>>, key: string) {
			for (const map of maps) {
				if (map && map[key]) {
					if (map[key].indexOf("NASD:") === 0) {
						map[key] = Utils.adjustNasdToNasdaq(map[key]);
					}
				}
			}
		}

		static decodeObjects(param1: string): any[] {
			if (!param1) {
				return [];
			}

			param1 = decodeURIComponent(param1);
			const _loc2_: Array<Map<string>> = [];
			for (const obj of param1.split(MainManager.paramsObj.objectSeparator)) {
				const _loc5_: Map<string> = {};
				for (const field of obj.split(MainManager.paramsObj.fieldSeparator)) {
					const _loc8_ = field.split(":");
					let value: any = _loc8_[1];
					if (!isNaN(value)) {
						value = Number(value);
					} else if (value === "true") {
						value = true;
										} else if (value === "false") {
						value = false;
										} else if (value === "null") {
						value = null;
										}
					_loc5_[_loc8_[0]] = value;
				}
				_loc2_.push(_loc5_);
			}
			return _loc2_;
		}

		static getTickerParts(ticker: string) {
			const _loc2_ = ticker.split(":");
			let _loc3_ = _loc2_.shift()!;	// TODO: check undefined
			let _loc4_ = _loc2_.join(":");
			if (_loc4_ === "") {
				_loc4_ = _loc3_;
				_loc3_ = "";
			}
			return {
				exchange: _loc3_,
				symbol: _loc4_,
			};
		}

		static binarySearch<T, T2, T3>(items: T[], value: T2, comparer: (p1: T, p2: T2) => number, thisObj: T3): number {
			if (!items || items.length === 0) {
				return -1;
			}

			if (comparer.call(thisObj, items[0], value) > 0) {
				return -1;
			}

			if (comparer.call(thisObj, items[items.length - 1], value) <= 0) {
				return items.length - 1;
			}

			let left = 0;
			let right = items.length - 1;
			while (left < right - 1) {
				const mid = Math.round((left + right) / 2);
				const comparison = comparer.call(thisObj, items[mid], value);
				if (comparison < 0) {
					left = mid;
				} else if (comparison > 0) {
					right = mid;
									} else {
					return mid;
									}
			}
			return left;
		}

		static assocArrayLength(map: Dictionary): number {
			let length = 0;
			for (const _ of Object.keys(map)) {
				length++;
			}
			return length;
		}

		static newDateInTimezone(date: Date, minutes: number): Date {
			return new Date(date.getTime() + minutes * 60 * 1000);
		}

		static compareUtcDates(date1: Date, date2: Date): number {
			if (date1.getUTCFullYear() !== date2.getUTCFullYear()) {
				return date1.getUTCFullYear() - date2.getUTCFullYear();
			}

			if (date1.getUTCMonth() !== date2.getUTCMonth()) {
				return date1.getUTCMonth() - date2.getUTCMonth();
			}

			if (date1.getUTCDate() !== date2.getUTCDate()) {
				return date1.getUTCDate() - date2.getUTCDate();
			}

			return 0;
		}

		static logTransform(value: number): number {
			return Math.log(value < Const.LOG_SCALE ? Number((Const.LOG_SCALE - 1) / Const.LOG_SCALE * value + 1) : value) / Const.LOG_SCALE_LOG;
		}

		static getEndOfUTCDayTime(date: Date): number {
			date = new Date(date.getTime());
			date.setUTCHours(23, 59, 0, 0);
			return date.getTime();
		}

		static getSymbolFromTicker(quote: string): string {
			return Utils.getTickerParts(quote).symbol;
		}

		static getLastRealPointIndex(dataUnits: DataUnit[]): number {
			if (!dataUnits || dataUnits.length === 0) {
				return -1;
			}

			let unitIndex = dataUnits.length - 1;
			while (unitIndex >= 0 && dataUnits[unitIndex].fake) {
				unitIndex--;
			}

			return unitIndex;
		}

		static getExchangeFromTicker(param1: string): string {
			return Utils.getTickerParts(param1).exchange;
		}

		static numberToString(value: number, decimals: number, digits: number): string {
			let _loc4_ = Math.pow(10, decimals);
			value = Math.round(value * _loc4_);
			let _loc5_ = value % _loc4_;
			let _loc6_ = Math.floor(value / _loc4_) + ".";
			while (_loc4_ > 1) {
				_loc4_ /= 10;
				_loc6_ += Math.floor(_loc5_ / _loc4_);
				_loc5_ = _loc5_ % _loc4_;
			}
			for (let _loc7_ = 0; _loc7_ < digits - _loc6_.length; _loc7_++) {
				_loc6_ = "0" + _loc6_;
			}
			return _loc6_;
		}

		static utcDateToString(date: Date): string {
			return date.getUTCFullYear() + "." + (date.getUTCMonth() + 1) + "." + date.getUTCDate() + "/" + date.getUTCHours() + ":" + date.getUTCMinutes();
		}

		static createLabel(sprite: Sprite, text: string, textFormat: TextFormat): TextField {
			const textField = new TextField();
			sprite.addChild(textField);
			textField.autoSize = TextFieldAutoSize.LEFT;
			textField.defaultTextFormat = textFormat;
			textField.selectable = false;
			textField.text = text;
			return textField;
		}

		static extendedMin(param1: number, param2: number): number {
			if (!(param1 >= 0 || param1 <= 0)) {
				return param2;
			}

			if (!(param2 >= 0 || param2 <= 0)) {
				return param1;
			}

			return Math.min(param1, param2);
		}

		static findValueInArray<T>(value: T, items: T[]): number {
			if (!items || !value) {
				return -1;
			}

			for (let index = 0; index < items.length; index++) {
				if (value === items[index]) {
					return index;
				}
			}
			return -1;
		}

		static getWeekdaysDifference(date1: Date, date2: Date, param3: number): number {
			let _loc4_ = 0;
			for (let _loc5_ = 0; _loc5_ < Const.DAY_PER_WEEK; _loc5_++) {
				if (Utils.IsWeekday(_loc5_, param3)) {
					_loc4_++;
				}
			}
			const _loc6_ = (date2.getTime() - date1.getTime()) / Const.MS_PER_DAY;
			const _loc7_ = Math.floor(_loc6_ / Const.DAY_PER_WEEK) * _loc4_;
			if (_loc6_ % Const.DAY_PER_WEEK === 0) {
				return _loc7_;
			}

			let _loc8_ = 0;
			let day = date1.getDay();

			for (let _loc10_ = 0; _loc10_ < Const.DAY_PER_WEEK && day !== date2.getDay(); _loc10_++) {
				if (Utils.IsWeekday(day, param3)) {
					_loc8_++;
				}

				day = (day + 1) % Const.DAY_PER_WEEK;
			}
			if (!Utils.IsWeekday(date1.getDay(), param3) && Utils.IsWeekday(date2.getDay(), param3)) {
				_loc8_++;
			}

			return _loc7_ + _loc8_;
		}

		static numberToMinTwoChars(value: number): string {
			if (value < 10) {
				return "0" + value;
			}

			return value.toString();
		}

		static getLogScaledValue(value: number, logScale: string): number {
			if (logScale === Const.LOG_VSCALE || logScale === Const.NEW_LOG_VSCALE) {
				return Utils.logTransform(value);
			}

			return value;
		}

		static removeAllChildren(displayObjectContainer: DisplayObjectContainer) {
			while (displayObjectContainer.numChildren > 0) {
				displayObjectContainer.removeChildAt(displayObjectContainer.numChildren - 1);
			}
		}

		static compareNumbers(param1: number, param2: number): number {
			if (param1 < param2) {
				return -1;
			}

			if (param1 > param2) {
				return 1;
			}

			return 0;
		}

		static checkUndefined<T>(value1: T, value2: T): T {
			if (value1 === undefined) {
				return value2;
			}

			return value1;
		}

		static adjustNasdToNasdaq(ticker: string): string {
			if (ticker.indexOf("NASD:") === 0) {
				return "NASDAQ:" + ticker.substr(5);
			}

			return ticker;
		}

		static extendedMax(param1: number, param2: number): number {
			if (!(param1 >= 0 || param1 <= 0)) {
				return param2;
			}

			if (!(param2 >= 0 || param2 <= 0)) {
				return param1;
			}

			return Math.max(param1, param2);
		}

		static isSubset(superset: Dictionary, subset: Dictionary): boolean {
			for (const key of Object.keys(superset)) {
				if (superset[key] !== subset[key]) {
					return false;
				}
			}
			return true;
		}

		static printObjectMembers(param1: string, param2: any) {
			console.log(param1);
			for (const key of Object.keys(param2)) {
				console.log("  obj." + key + " = " + param2[key]);
			}
		}

		static hourToString(hour: number, minute: number): string {
			let text = "";
			if (minute === 0) {
				if (hour > 12) {
					hour -= 12;
					text = hour + " pm";
				} else if (hour === 12) {
					text = "12 pm";
				} else {
					text = hour + " am";
				}
			} else {
				let _loc4_ = "" + hour;
				let _loc5_ = "" + minute;
				if (hour < 10) {
					_loc4_ = "0" + hour;
				}

				if (minute < 10) {
					_loc5_ = "0" + minute;
				}

				text = _loc4_ + ":" + _loc5_;
			}
			return text;
		}

		static appendObjectMembersAsStrings(param1: string, param2: any): string {
			let _loc3_ = param1 + ":";
			for (const key of Object.keys(param2)) {
				_loc3_ += "  obj." + key + "=" + param2[key];
			}
			return _loc3_;
		}

		static displayObjectToTop(displayObject: DisplayObject, displayObjectContainer: DisplayObjectContainer) {
			let index = 0;
			const child = displayObject;
			const container = displayObjectContainer;
			try {
				index = container.getChildIndex(child);
				container.swapChildrenAt(index, container.numChildren - 1);
				return;
			} catch (ae /*:ArgumentError*/) {
				return;
			}
		}

		static getLastDayOfWeek(param1: number): number {
			for (let day = Const.DAY_PER_WEEK - 1; day >= 0; day--) {
				if (Utils.IsWeekday(day, param1)) {
					return day;
				}
			}
			return Const.DEFAULT_LAST_MARKET_WEEKDAY;
		}

		static cloneObject<T>(obj: T): T {
			const clone: any = {};
			for (const key of Object.keys(obj)) {
				clone[key] = (obj as any)[key];
			} // TODO
			return clone as T;
		}

		static IsWeekday(param1: number, param2: number): boolean {
			if (64 >> param1 & param2) {
				return true;
			}

			return false;
		}

		static hasDifferentDividendCurrency(currency: string, pinArray: any[]): boolean {
			for (const pin of pinArray) {
				if (pin._type === "dividend" && pin._amount_currency) {
					if (currency && currency !== pin._amount_currency) {
						return true;
					}

					currency = pin._amount_currency;
				}
			}
			return false;
		}
	}
