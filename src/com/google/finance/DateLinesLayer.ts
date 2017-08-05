namespace com.google.finance
{
	// import com.google.i18n.locale.DateTimeLocale;
	// import flash.display.Sprite;

	export class DayVisibility
	{
		dataUnit: DataUnit;
		startMinute: number;
		coveredMinutes: number;
	}

	export class DateLinesLayer extends AbstractLayer<ViewPoint>
	{
		private static readonly HOUR_INTERVALS = [60, 2 * 60, 4 * 60];


		private static readonly WEEK_TEXT_MIN_DAYS = 3;

		private static readonly MONTH_TEXT_MIN_PIXELS = 55;

		static readonly DAY_START_TEXT_MAX_WIDTH = 65;

		topMargin = 0;

		tickPosition: number;

		private static readonly FULL_YEAR_TEXT_MAX_WIDTH = 40;

		private static readonly DISPLAY_HOURS_MIN_DAY_WIDTH = 180;

		constructor(param1: ViewPoint, param2: DataSource)
		{
			super(param1, param2);
			this.tickPosition = Const.TOP;
		}

		getDayPixel(param1: ViewPoint, param2: DataSeries, param3: number): number
		{
			return (!!param1.getDisplayManager().isDifferentMarketSessionComparison() ? 1 : (param2.marketDayLength + param3)) * param1.minutePix;
		}

		private getHourTextFromUtcDate(param1: Date): string
		{
			let _loc2_ = param1.getUTCHours();
			let _loc3_ = param1.getUTCMinutes();
			let _loc4_ = "HH:mm";
			if (_loc3_ === 0 && !Const.isZhLocale(com.google.i18n.locale.DateTimeLocale.getLocale()))
				_loc4_ = "h a";

			return com.google.i18n.locale.DateTimeLocale.formatDateTime(_loc4_, param1, true).toLowerCase();
		}

		private adjustVisibleDaysWithAfterHours(param1: DayVisibility[]) 
		{
			let _loc6_ = NaN;
			let _loc7_ = NaN;
			let _loc8_ = NaN;
			let _loc9_ = NaN;
			let _loc10_ = NaN;
			let _loc2_ = this.dataSource.afterHoursData;
			let _loc3_ = this.dataSource.visibleExtendedHours;

			for (let _loc4_ = 0; _loc4_ < _loc3_.length(); _loc4_++)
			{
				let _loc5_ = _loc3_.method_1(_loc4_);
				_loc6_ = _loc5_.end;
				_loc7_ = _loc5_.start;
				_loc8_ = _loc2_.units[_loc7_].time;
				_loc9_ = _loc2_.units[_loc6_].dayMinute - _loc2_.units[_loc7_].dayMinute;
				_loc10_ = Utils.binarySearch(param1, _loc8_, this.compareVisibleDayPairWithTime, this);
				if (_loc10_ !== -1)
				{
					if (_loc10_ < param1.length && param1[_loc10_].dataUnit.time === _loc8_)
					{
						param1[_loc10_].coveredMinutes = param1[_loc10_].coveredMinutes + _loc9_;
						param1[_loc10_].dataUnit = _loc2_.units[_loc6_];
					}
					else if (_loc10_ + 1 < param1.length)
					{
						param1[_loc10_ + 1].startMinute = param1[_loc10_ + 1].startMinute - _loc9_;
						param1[_loc10_ + 1].coveredMinutes = param1[_loc10_ + 1].coveredMinutes + _loc9_;
					}
				}
			}
		}

		private drawVerticalLines(context: Context) 
		{
			let _loc2_ = this.dataSource.data;
			let _loc3_ = this.viewPoint;
			let _loc4_ = this;
			if (!_loc2_ || this.dataSource.isEmpty())
				return;

			this.graphics.clear();
			let _loc5_ = _loc2_.getRelativeMinuteIndex(_loc3_.getLastMinute());
			let _loc6_ = this.getDayPixel(_loc3_, _loc2_, 0);
			let _loc7_ = !!Const.INDICATOR_ENABLED ? _loc3_.getDetailLevelForTechnicalStyle() : _loc3_.getDetailLevel();
			if (!_loc3_.getDisplayManager().isDifferentMarketSessionComparison() && _loc6_ > Const.MIN_DAY_WIDTH_FOR_INTRADAY && _loc7_ <= Const.DAILY)
			{
				let _loc8_ = this.getVisibleDaysArray(context);
				this.drawDayStarts(_loc4_, this.textCanvas, _loc8_, _loc7_);
			}
			else if (_loc6_ > 15)
			{
				this.drawWeekStarts(_loc4_, this.textCanvas, 1, _loc5_);
			}
			else if (_loc6_ > 2)
			{
				this.drawMonthStarts(_loc4_, this.textCanvas, 1, _loc5_);
			}
			else
			{
				this.drawYearStarts(_loc4_, this.textCanvas, 1, _loc5_);
			}
		}

		private getMinutesSkip(): number
		{
			let _loc1_ = this.viewPoint.count * ViewPoint.MIN_DISTANCE_BETWEEN_V_LINES / (this.viewPoint.maxx - this.viewPoint.minx);
			let _loc2_ = DateLinesLayer.HOUR_INTERVALS.length - 1;
			while (DateLinesLayer.HOUR_INTERVALS[_loc2_] >= _loc1_ && _loc2_ > 0)
				_loc2_--;

			return DateLinesLayer.HOUR_INTERVALS[_loc2_];
		}

		private drawWeekStarts(param1: flash.display.DisplayObject, param2: flash.display.Sprite, param3: number, param4: number) 
		{
			let _loc6_ = this.dataSource.data;
			let _loc7_ = this.viewPoint;
			let _loc8_ = _loc6_.days.length - 1;
			while (_loc8_ > 0 && _loc6_.days[_loc8_] > param4)
				_loc8_ = _loc8_ - param3;

			_loc8_ = _loc8_ + param3;
			if (_loc8_ > _loc6_.days.length - 1)
				_loc8_ = _loc6_.days.length - 1;

			let _loc9_ = _loc6_.fridays.length - 1;
			while (_loc9_ >= 0 && _loc6_.fridays[_loc9_] > _loc6_.days[_loc8_])
				_loc9_ = _loc9_ - param3;

			let _loc10_ = this.getDayPixel(_loc7_, _loc6_, 2);
			let _loc11_ = _loc7_.getXPos(_loc6_.units[_loc6_.days[_loc8_]]);
			let _loc12_ = _loc7_.maxy - ViewPoint.TEXT_VERTICAL_OFFSET - ViewPoint.TEXT_FIELD_HEIGHT;
			let _loc13_ = Number.MAX_VALUE;
			do
			{
				if (_loc6_.days[_loc8_] === _loc6_.fridays[_loc9_])
				{
					_loc11_ = _loc7_.getXPos(_loc6_.units[_loc6_.days[_loc8_]]);
					let _loc14_ = _loc7_.miny + this.topMargin;
					let _loc15_ = _loc7_.maxy - _loc7_.bottomTextHeight;
					AbstractLayer.drawVerticalLine(param1, _loc11_, Const.DAY_LINE_COLOR, Const.DAY_LINE_ALPHA, _loc14_, _loc15_, ViewPoint.TICK_SIZE_BIG, this.tickPosition);
					if (_loc7_.bottomTextHeight > 0 && _loc8_ >= 0)
					{
						let _loc16_ = _loc6_.units[_loc6_.days[_loc8_]].exchangeDateInUTC;
						let _loc17_ = this.getWeekStartDateFormat();
						let _loc18_ = com.google.i18n.locale.DateTimeLocale.formatDateTime(_loc17_, _loc16_, true);
						let _loc19_ = ViewPoint.TEXT_FIELD_WIDTH;
						let _loc5_ = _loc11_ - _loc19_ / 2;
						let _loc20_ = ViewPoint.TEXT_FIELD_HEIGHT;
						let _loc21_ = ViewPoint.addTextField(param2, _loc18_, _loc5_, _loc12_, _loc19_, _loc20_, "center", _loc7_.hourTextFormat);
						if (_loc13_ - _loc8_ >= DateLinesLayer.WEEK_TEXT_MIN_DAYS)
							_loc13_ = _loc8_;
						else
							param2.removeChild(_loc21_);
					}
				}
				else
				{
					let _loc14_ = _loc7_.miny + this.topMargin;
					let _loc15_ = _loc7_.maxy - _loc7_.bottomTextHeight;
					AbstractLayer.drawVerticalLine(param1, _loc11_, Const.DAY_LINE_COLOR, 0, _loc14_, _loc15_, ViewPoint.TICK_SIZE_SMALL, this.tickPosition);
				}
				_loc8_ = _loc8_ - param3;
				if (_loc6_.fridays[_loc9_] > _loc6_.days[_loc8_])
					_loc9_--;

				_loc11_ = _loc11_ - _loc10_;
			}
			while (_loc11_ >= _loc7_.minx && _loc8_ > 0);
		}

		private drawYearStarts(param1: flash.display.DisplayObject, param2: flash.display.Sprite, param3: number, param4: number) 
		{
			let _loc11_ = NaN;
			let _loc5_ = this.dataSource.data;
			if (_loc5_.years.length === 0)
				return;

			let _loc6_ = this.viewPoint;
			let _loc7_ = _loc5_.years.length - 1;
			let _loc8_ = this.getDayPixel(_loc6_, _loc5_, 1);
			let _loc9_ = _loc6_.getXPos(_loc5_.units[_loc5_.years[_loc7_]]);
			let _loc10_ = _loc9_ + 250 * _loc8_;
			let _loc12_ = _loc6_.maxy - ViewPoint.TEXT_VERTICAL_OFFSET - ViewPoint.TEXT_FIELD_HEIGHT;
			do
			{
				_loc9_ = _loc6_.getXPos(_loc5_.units[_loc5_.years[_loc7_]]);
				let _loc13_ = _loc6_.miny + this.topMargin;
				let _loc14_ = _loc6_.maxy - _loc6_.bottomTextHeight;
				AbstractLayer.drawVerticalLine(param1, _loc9_ - _loc8_, Const.DAY_LINE_COLOR, Const.DAY_LINE_ALPHA, _loc13_, _loc14_, ViewPoint.TICK_SIZE_BIG, this.tickPosition);
				if (_loc6_.bottomTextHeight > 0 && _loc7_ >= 0)
				{
					let _loc15_ = _loc5_.units[_loc5_.years[_loc7_]].exchangeDateInUTC;
					let _loc16_ = _loc15_.getUTCFullYear().toString();
					if (_loc10_ - _loc9_ < DateLinesLayer.FULL_YEAR_TEXT_MAX_WIDTH)
						_loc16_ = "\'" + _loc16_.substr(2, 2);

					let _loc17_ = _loc10_ - _loc9_;
					_loc11_ = _loc9_;
					let _loc18_ = ViewPoint.TEXT_FIELD_HEIGHT;
					ViewPoint.addTextField(param2, _loc16_, _loc11_, _loc12_, _loc17_, _loc18_, "center", _loc6_.dateTextFormat);
				}
				_loc7_ = _loc7_ - param3;
				_loc10_ = _loc9_;
			}
			while (_loc9_ > _loc6_.minx && _loc7_ >= 0);
		}

		private drawMonthStarts(param1: flash.display.DisplayObject, param2: flash.display.Sprite, param3: number, param4: number) 
		{
			let _loc12_ = NaN;
			let _loc5_ = this.dataSource.data;
			if (_loc5_.firsts.length === 0)
				return;

			let _loc6_ = this.viewPoint;
			let _loc7_ = _loc5_.firsts.length - 1;
			while (_loc5_.firsts[_loc7_] > param4)
				_loc7_ = _loc7_ - param3;

			let _loc8_ = this.getDayPixel(_loc6_, _loc5_, 0);
			let _loc9_ = _loc6_.getXPos(_loc5_.units[_loc5_.firsts[_loc7_]]);
			let _loc10_ = _loc9_ + 20 * _loc8_;
			let _loc11_ = _loc10_;
			let _loc13_ = _loc6_.maxy - ViewPoint.TEXT_VERTICAL_OFFSET - ViewPoint.TEXT_FIELD_HEIGHT;
			let _loc14_ = _loc8_ * 20 < 70;
			do
			{
				_loc9_ = _loc6_.getXPos(_loc5_.units[_loc5_.firsts[_loc7_]]);
				let _loc15_ = _loc6_.miny + this.topMargin;
				let _loc16_ = _loc6_.maxy - _loc6_.bottomTextHeight;
				AbstractLayer.drawVerticalLine(param1, _loc9_ - _loc8_, Const.DAY_LINE_COLOR, Const.DAY_LINE_ALPHA, _loc15_, _loc16_, ViewPoint.TICK_SIZE_BIG, this.tickPosition);
				if (_loc6_.bottomTextHeight > 0 && _loc7_ >= 0)
				{
					let _loc17_ = _loc5_.units[_loc5_.firsts[_loc7_]].exchangeDateInUTC;
					let _loc18_ = this.getMonthStartDateFormat(_loc8_ * 20);
					let _loc19_ = com.google.i18n.locale.DateTimeLocale.formatDateTime(_loc18_, _loc17_, true);
					let _loc20_ = _loc10_ - _loc9_;
					_loc12_ = _loc9_;
					let _loc21_ = ViewPoint.TEXT_FIELD_HEIGHT;
					if (_loc11_ - _loc9_ > DateLinesLayer.MONTH_TEXT_MIN_PIXELS)
					{
						if (_loc14_)
						{
							let _loc22_ = _loc17_.getUTCMonth();
							if (_loc22_ % 3 === 0)
							{
								_loc12_ = _loc12_ - _loc20_ / 2;
								ViewPoint.addTextField(param2, _loc19_, _loc12_, _loc13_, _loc20_, _loc21_, "center", _loc6_.dateTextFormat);
								_loc11_ = _loc9_;
							}
						}
						else
						{
							ViewPoint.addTextField(param2, _loc19_, _loc12_, _loc13_, _loc20_, _loc21_, "center", _loc6_.dateTextFormat);
							_loc11_ = _loc9_;
						}
					}
				}
				_loc7_ = _loc7_ - param3;
				_loc10_ = _loc9_;
			}
			while (_loc9_ > _loc6_.minx && _loc7_ >= 0);
		}

		renderLayer(context: Context) 
		{
			this.drawVerticalLines(context);
		}

		compareVisibleDayPairWithTime(param1: DayVisibility, param2: number): number
		{
			if (param1.dataUnit.time < param2)
				return -1;

			if (param1.dataUnit.time > param2)
				return 1;

			return 0;
		}

		private getMonthStartDateFormat(param1: number): string
		{
			let _loc2_ = "";
			if (param1 > 90)
			{
				if (Const.isZhLocale(com.google.i18n.locale.DateTimeLocale.getLocale()))
					_loc2_ = "yyyy年MMMMM";
				else
					_loc2_ = "MMM yyyy";
			}
			else if (Const.isZhLocale(com.google.i18n.locale.DateTimeLocale.getLocale()))
				_loc2_ = "yy年MMMMM";
			else
				_loc2_ = "MMM\'yy";

			return _loc2_;
		}

		private drawHoursForDay(param1: flash.display.DisplayObject, param2: flash.display.Sprite, param3: DayVisibility, param4: number) 
		{
			let _loc21_ = NaN;
			let _loc22_ = NaN;
			let _loc23_ = NaN;
			let _loc25_ = NaN;
			let _loc5_ = param3.dataUnit;
			let _loc6_ = param3.startMinute;
			let _loc7_ = param3.coveredMinutes;
			let _loc8_ = this.getMinutesSkip();
			let _loc9_ = this.viewPoint.getIntervalLength(_loc8_);
			let _loc10_ = this.viewPoint.getXPos(_loc5_) - _loc9_;
			let _loc11_ = this.viewPoint.miny + this.topMargin;
			let _loc12_ = this.viewPoint.maxy - this.viewPoint.bottomTextHeight;
			let _loc13_ = this.viewPoint.maxy - ViewPoint.TEXT_VERTICAL_OFFSET - ViewPoint.TEXT_FIELD_HEIGHT;
			let _loc14_ = _loc9_;
			let _loc15_ = ViewPoint.TEXT_FIELD_HEIGHT;
			let _loc16_ = this.dataSource.getAllDataSessions(_loc6_, _loc5_.dayMinute);
			let _loc17_ = _loc16_.length() - 1;
			let _loc18_ = _loc16_.method_1(_loc17_);
			let _loc19_ = _loc5_.dayMinute;
			let _loc20_ = new Date(_loc5_.exchangeDateInUTC.getTime());
			while (_loc19_ > _loc6_)
			{
				_loc21_ = _loc19_;
				_loc22_ = Number(_loc8_);
				while (_loc22_ > 0)
				{
					_loc25_ = _loc19_ - _loc18_.start;
					if (_loc25_ >= _loc22_)
					{
						_loc19_ = _loc19_ - _loc22_;
						_loc22_ = 0;
					}
					else
					{
						_loc22_ = Number(_loc22_ - _loc25_);
						_loc17_--;
						if (_loc17_ < 0)
							return;

						_loc18_ = _loc16_.method_1(_loc17_);
						_loc19_ = _loc18_.end;
					}
				}
				_loc20_.setTime(_loc20_.getTime() - (_loc21_ - _loc19_) * Const.MS_PER_MINUTE);
				if (_loc19_ <= _loc6_)
					return;

				_loc7_ = _loc7_ - _loc8_;
				_loc23_ = this.viewPoint.getIntervalLength(_loc7_);
				if (_loc23_ < DateLinesLayer.DAY_START_TEXT_MAX_WIDTH)
					return;

				AbstractLayer.drawVerticalLine(param1, _loc10_, Const.HOUR_LINE_COLOR, Const.HOUR_LINE_ALPHA, _loc11_, _loc12_, ViewPoint.TICK_SIZE_SMALL, this.tickPosition);
				let _loc24_ = this.getHourTextFromUtcDate(_loc20_);
				ViewPoint.addTextField(param2, _loc24_, _loc10_, _loc13_, _loc14_, _loc15_, "left", this.viewPoint.hourTextFormat);
				_loc10_ = _loc10_ - _loc9_;
			}
		}

		private drawDayStarts(param1: flash.display.DisplayObject, param2: flash.display.Sprite, param3: DayVisibility[], param4: number) 
		{
			let _loc9_ = NaN;
			let _loc10_ = NaN;
			let _loc13_ = NaN;
			let _loc14_ = NaN;
			let _loc5_ = this.viewPoint.miny + this.topMargin;
			let _loc6_ = this.viewPoint.maxy - this.viewPoint.bottomTextHeight;
			let _loc7_ = this.viewPoint.maxy - ViewPoint.TEXT_VERTICAL_OFFSET - ViewPoint.TEXT_FIELD_HEIGHT;
			for (let _loc8_ = 0; _loc8_ < param3.length; _loc8_++)
			{
				_loc9_ = this.viewPoint.getXPos(param3[_loc8_].dataUnit);
				AbstractLayer.drawVerticalLine(param1, _loc9_, Const.DAY_LINE_COLOR, Const.DAY_LINE_ALPHA, _loc5_, _loc6_, ViewPoint.TICK_SIZE_BIG, this.tickPosition, param4 !== Const.DAILY);
				if (this.viewPoint.bottomTextHeight > 0)
				{
					_loc10_ = this.viewPoint.getIntervalLength(param3[_loc8_].coveredMinutes);
					let _loc11_ = this.getDayText(param3, _loc8_, _loc10_);
					let _loc12_ = "center";
					if (_loc10_ >= DateLinesLayer.DISPLAY_HOURS_MIN_DAY_WIDTH && param4 < Const.DAILY)
					{
						_loc12_ = "left";
						this.drawHoursForDay(param1, param2, param3[_loc8_], _loc10_);
					}
					if (param4 < Const.DAILY)
					{
						_loc13_ = _loc9_ - _loc10_ + ViewPoint.TEXT_HORIZONTAL_OFFSET;
						_loc14_ = _loc10_ - ViewPoint.TEXT_HORIZONTAL_OFFSET;
					}
					else
					{
						_loc13_ = _loc9_ - ViewPoint.TEXT_FIELD_WIDTH / 2;
						_loc14_ = ViewPoint.TEXT_FIELD_WIDTH;
					}
					ViewPoint.addTextField(param2, _loc11_, _loc13_, _loc7_, _loc14_, ViewPoint.TEXT_FIELD_HEIGHT, _loc12_, this.viewPoint.hourTextFormat);
				}
			}
		}

		private getVisibleDaysArray(context: Context): DayVisibility[]
		{
			let _loc9_ = NaN;
			let _loc10_ = NaN;
			let _loc2_: DayVisibility[] = [];
			let _loc3_ = this.dataSource.data;
			let _loc4_ = this.dataSource.afterHoursData;
			let _loc5_ = 1 + DataSource.getMinuteMetaIndex(context.lastMinute, _loc3_.days, _loc3_.units);
			_loc5_ = Math.min(_loc5_, _loc3_.days.length - 1);
			let _loc6_ = DataSource.getMinuteMetaIndex(context.lastMinute - context.count, _loc3_.days, _loc3_.units);
			let _loc7_ = _loc6_;
			while (_loc7_ <= _loc5_)
			{
				let _loc8_ = _loc3_.units[_loc3_.days[_loc7_]];
				_loc9_ = _loc3_.marketOpenMinute;
				_loc10_ = _loc3_.marketDayLength;
				if (_loc8_)
				{
					let _loc11_ = new DayVisibility();
					_loc11_.dataUnit = _loc8_;
					_loc11_.startMinute = _loc9_;
					_loc11_.coveredMinutes = _loc10_;

					_loc2_.push(_loc11_);
				}
				_loc7_++;
			}
			this.adjustVisibleDaysWithAfterHours(_loc2_);
			return _loc2_;
		}

		private getDayText(param1: DayVisibility[], param2: number, param3: number): string
		{
			let _loc4_ = param1[param2].dataUnit.exchangeDateInUTC;
			let _loc5_ = "d";
			if (param3 > 50 || param2 === 2 || param2 === param1.length - 2)
			{
				_loc5_ = "MMM " + _loc5_;
				if (Const.isZhLocale(com.google.i18n.locale.DateTimeLocale.getLocale()))
					_loc5_ = "M月d日";
			}
			if (param3 > 75)
			{
				_loc5_ = "E " + _loc5_;
				if (Const.isZhLocale(com.google.i18n.locale.DateTimeLocale.getLocale()))
					_loc5_ = "M月d日 E";
			}
			return com.google.i18n.locale.DateTimeLocale.formatDateTime(_loc5_, _loc4_, true);
		}

		private getWeekStartDateFormat(): string
		{
			if (Const.isZhLocale(com.google.i18n.locale.DateTimeLocale.getLocale()))
				return "M月d日";

			return "MMM d";
		}
	}
}
