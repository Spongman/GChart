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
		private static readonly FULL_YEAR_TEXT_MAX_WIDTH = 40;
		private static readonly DISPLAY_HOURS_MIN_DAY_WIDTH = 180;

		static readonly DAY_START_TEXT_MAX_WIDTH = 65;

		topMargin = 0;
		tickPosition = TickPositions.TOP;

		getDayPixel(viewPoint: ViewPoint, dataSeries: DataSeries, param3: number): number
		{
			return (!!viewPoint.getDisplayManager().isDifferentMarketSessionComparison() ? 1 : (dataSeries.marketDayLength + param3)) * viewPoint.minutePix;
		}

		private getHourTextFromUtcDate(date: Date): string
		{
			//const _loc2_ = param1.getUTCHours();
			const minutes = date.getUTCMinutes();
			let pattern = "HH:mm";
			if (minutes === 0 && !Const.isZhLocale(com.google.i18n.locale.DateTimeLocale.getLocale()))
				pattern = "h a";

			return com.google.i18n.locale.DateTimeLocale.formatDateTime(pattern, date, true).toLowerCase();
		}

		private adjustVisibleDaysWithAfterHours(dayVisibilities: DayVisibility[])
		{
			const afterHoursData = this.dataSource.afterHoursData;
			const visibleExtendedHours = this.dataSource.visibleExtendedHours;

			for (let intervalIndex = 0; intervalIndex < visibleExtendedHours.length(); intervalIndex++)
			{
				const interval = visibleExtendedHours.getIntervalAt(intervalIndex);
				const end = interval.end;
				const start = interval.start;
				const startTime = afterHoursData.units[start].time;
				const totalMinutes = afterHoursData.units[end].dayMinute - afterHoursData.units[start].dayMinute;
				const index = Utils.binarySearch(dayVisibilities, startTime, this.compareVisibleDayPairWithTime, this);
				if (index !== -1)
				{
					if (index < dayVisibilities.length && dayVisibilities[index].dataUnit.time === startTime)
					{
						dayVisibilities[index].coveredMinutes += totalMinutes;
						dayVisibilities[index].dataUnit = afterHoursData.units[end];
					}
					else if (index + 1 < dayVisibilities.length)
					{
						dayVisibilities[index + 1].startMinute = dayVisibilities[index + 1].startMinute - totalMinutes;
						dayVisibilities[index + 1].coveredMinutes = dayVisibilities[index + 1].coveredMinutes + totalMinutes;
					}
				}
			}
		}

		private drawVerticalLines(context: Context)
		{
			const data = this.dataSource.data;
			const viewPoint = this.viewPoint;
			if (!data || this.dataSource.isEmpty())
				return;

			this.graphics.clear();
			const relativeMinuteIndex = data.getRelativeMinuteIndex(viewPoint.getLastMinute());
			const dayPixel = this.getDayPixel(viewPoint, data, 0);
			const _loc7_ = !!Const.INDICATOR_ENABLED ? viewPoint.getDetailLevelForTechnicalStyle() : viewPoint.getDetailLevel();
			if (!viewPoint.getDisplayManager().isDifferentMarketSessionComparison() && dayPixel > Const.MIN_DAY_WIDTH_FOR_INTRADAY && _loc7_ <= Intervals.DAILY)
			{
				const visibleDays = this.getVisibleDaysArray(context);
				this.drawDayStarts(this, this.textCanvas, visibleDays, _loc7_);
			}
			else if (dayPixel > 15)
			{
				this.drawWeekStarts(this, this.textCanvas, 1, relativeMinuteIndex);
			}
			else if (dayPixel > 2)
			{
				this.drawMonthStarts(this, this.textCanvas, 1, relativeMinuteIndex);
			}
			else
			{
				this.drawYearStarts(this, this.textCanvas, 1, relativeMinuteIndex);
			}
		}

		private getMinutesSkip(): number
		{
			const _loc1_ = this.viewPoint.count * ViewPoint.MIN_DISTANCE_BETWEEN_V_LINES / (this.viewPoint.maxx - this.viewPoint.minx);
			let _loc2_ = DateLinesLayer.HOUR_INTERVALS.length - 1;
			while (DateLinesLayer.HOUR_INTERVALS[_loc2_] >= _loc1_ && _loc2_ > 0)
				_loc2_--;

			return DateLinesLayer.HOUR_INTERVALS[_loc2_];
		}

		private drawWeekStarts(displayObject: flash.display.DisplayObject, sprite: flash.display.Sprite, param3: number, param4: number)
		{
			const data = this.dataSource.data;
			const viewPoint = this.viewPoint;
			let _loc8_ = data.days.length - 1;
			while (_loc8_ > 0 && data.days[_loc8_] > param4)
				_loc8_ -= param3;

			_loc8_ += param3;
			if (_loc8_ > data.days.length - 1)
				_loc8_ = data.days.length - 1;

			let _loc9_ = data.fridays.length - 1;
			while (_loc9_ >= 0 && data.fridays[_loc9_] > data.days[_loc8_])
				_loc9_ -= param3;

			const dayPixel = this.getDayPixel(viewPoint, data, 2);
			let xPos = viewPoint.getXPos(data.units[data.days[_loc8_]]);
			const _loc12_ = viewPoint.maxy - ViewPoint.TEXT_VERTICAL_OFFSET - ViewPoint.TEXT_FIELD_HEIGHT;
			let _loc13_ = Number.MAX_VALUE;
			do
			{
				if (data.days[_loc8_] === data.fridays[_loc9_])
				{
					xPos = viewPoint.getXPos(data.units[data.days[_loc8_]]);
					const _loc14_ = viewPoint.miny + this.topMargin;
					const _loc15_ = viewPoint.maxy - viewPoint.bottomTextHeight;
					AbstractLayer.drawVerticalLine(displayObject, xPos, Const.DAY_LINE_COLOR, Const.DAY_LINE_ALPHA, _loc14_, _loc15_, ViewPoint.TICK_SIZE_BIG, this.tickPosition);
					if (viewPoint.bottomTextHeight > 0 && _loc8_ >= 0)
					{
						const exchangeDateInUTC = data.units[data.days[_loc8_]].exchangeDateInUTC;
						const weekStartDateFormat = this.getWeekStartDateFormat();
						const _loc18_ = com.google.i18n.locale.DateTimeLocale.formatDateTime(weekStartDateFormat, exchangeDateInUTC, true);
						const _loc19_ = ViewPoint.TEXT_FIELD_WIDTH;
						const _loc5_ = xPos - _loc19_ / 2;
						const _loc20_ = ViewPoint.TEXT_FIELD_HEIGHT;
						const _loc21_ = ViewPoint.addTextField(sprite, _loc18_, _loc5_, _loc12_, _loc19_, _loc20_, "center", viewPoint.hourTextFormat);
						if (_loc13_ - _loc8_ >= DateLinesLayer.WEEK_TEXT_MIN_DAYS)
							_loc13_ = _loc8_;
						else
							sprite.removeChild(_loc21_);
					}
				}
				else
				{
					const _loc14_ = viewPoint.miny + this.topMargin;
					const _loc15_ = viewPoint.maxy - viewPoint.bottomTextHeight;
					AbstractLayer.drawVerticalLine(displayObject, xPos, Const.DAY_LINE_COLOR, 0, _loc14_, _loc15_, ViewPoint.TICK_SIZE_SMALL, this.tickPosition);
				}
				_loc8_ -= param3;
				if (data.fridays[_loc9_] > data.days[_loc8_])
					_loc9_--;

				xPos -= dayPixel;
			}
			while (xPos >= viewPoint.minx && _loc8_ > 0);
		}

		private drawYearStarts(displayObject: flash.display.DisplayObject, sprite: flash.display.Sprite, param3: number, param4: number)
		{
			const data = this.dataSource.data;
			if (data.years.length === 0)
				return;

			const viewPoint = this.viewPoint;
			let _loc7_ = data.years.length - 1;
			const dayPixel = this.getDayPixel(viewPoint, data, 1);
			let xPos = viewPoint.getXPos(data.units[data.years[_loc7_]]);
			let _loc10_ = xPos + 250 * dayPixel;
			const _loc12_ = viewPoint.maxy - ViewPoint.TEXT_VERTICAL_OFFSET - ViewPoint.TEXT_FIELD_HEIGHT;
			do
			{
				xPos = viewPoint.getXPos(data.units[data.years[_loc7_]]);
				const _loc13_ = viewPoint.miny + this.topMargin;
				const _loc14_ = viewPoint.maxy - viewPoint.bottomTextHeight;
				AbstractLayer.drawVerticalLine(displayObject, xPos - dayPixel, Const.DAY_LINE_COLOR, Const.DAY_LINE_ALPHA, _loc13_, _loc14_, ViewPoint.TICK_SIZE_BIG, this.tickPosition);
				if (viewPoint.bottomTextHeight > 0 && _loc7_ >= 0)
				{
					const exchangeDateInUTC = data.units[data.years[_loc7_]].exchangeDateInUTC;
					let fullYear = exchangeDateInUTC.getUTCFullYear().toString();
					if (_loc10_ - xPos < DateLinesLayer.FULL_YEAR_TEXT_MAX_WIDTH)
						fullYear = "\'" + fullYear.substr(2, 2);

					const _loc17_ = _loc10_ - xPos;
					const _loc11_ = xPos;
					const _loc18_ = ViewPoint.TEXT_FIELD_HEIGHT;
					ViewPoint.addTextField(sprite, fullYear, _loc11_, _loc12_, _loc17_, _loc18_, "center", viewPoint.dateTextFormat);
				}
				_loc7_ -= param3;
				_loc10_ = xPos;
			}
			while (xPos > viewPoint.minx && _loc7_ >= 0);
		}

		private drawMonthStarts(displayObject: flash.display.DisplayObject, sprite: flash.display.Sprite, param3: number, param4: number)
		{
			const data = this.dataSource.data;
			if (data.firsts.length === 0)
				return;

			const viewPoint = this.viewPoint;
			let _loc7_ = data.firsts.length - 1;
			while (data.firsts[_loc7_] > param4)
				_loc7_ -= param3;

			const dayPixel = this.getDayPixel(viewPoint, data, 0);
			let xPos = viewPoint.getXPos(data.units[data.firsts[_loc7_]]);
			let _loc10_ = xPos + 20 * dayPixel;
			let _loc11_ = _loc10_;
			const _loc13_ = viewPoint.maxy - ViewPoint.TEXT_VERTICAL_OFFSET - ViewPoint.TEXT_FIELD_HEIGHT;
			const _loc14_ = dayPixel * 20 < 70;
			do
			{
				xPos = viewPoint.getXPos(data.units[data.firsts[_loc7_]]);
				const _loc15_ = viewPoint.miny + this.topMargin;
				const _loc16_ = viewPoint.maxy - viewPoint.bottomTextHeight;
				AbstractLayer.drawVerticalLine(displayObject, xPos - dayPixel, Const.DAY_LINE_COLOR, Const.DAY_LINE_ALPHA, _loc15_, _loc16_, ViewPoint.TICK_SIZE_BIG, this.tickPosition);
				if (viewPoint.bottomTextHeight > 0 && _loc7_ >= 0)
				{
					const exchangeDateInUTC = data.units[data.firsts[_loc7_]].exchangeDateInUTC;
					const monthStartDateFormat = this.getMonthStartDateFormat(dayPixel * 20);
					const _loc19_ = com.google.i18n.locale.DateTimeLocale.formatDateTime(monthStartDateFormat, exchangeDateInUTC, true);
					const _loc20_ = _loc10_ - xPos;
					let _loc12_ = xPos;
					const _loc21_ = ViewPoint.TEXT_FIELD_HEIGHT;
					if (_loc11_ - xPos > DateLinesLayer.MONTH_TEXT_MIN_PIXELS)
					{
						if (_loc14_)
						{
							const month = exchangeDateInUTC.getUTCMonth();
							if (month % 3 === 0)
							{
								_loc12_ -= _loc20_ / 2;
								ViewPoint.addTextField(sprite, _loc19_, _loc12_, _loc13_, _loc20_, _loc21_, "center", viewPoint.dateTextFormat);
								_loc11_ = xPos;
							}
						}
						else
						{
							ViewPoint.addTextField(sprite, _loc19_, _loc12_, _loc13_, _loc20_, _loc21_, "center", viewPoint.dateTextFormat);
							_loc11_ = xPos;
						}
					}
				}
				_loc7_ -= param3;
				_loc10_ = xPos;
			}
			while (xPos > viewPoint.minx && _loc7_ >= 0);
		}

		renderLayer(context: Context)
		{
			this.drawVerticalLines(context);
		}

		compareVisibleDayPairWithTime(dayVisibility: DayVisibility, param2: number): number
		{
			if (dayVisibility.dataUnit.time < param2)
				return -1;

			if (dayVisibility.dataUnit.time > param2)
				return 1;

			return 0;
		}

		private getMonthStartDateFormat(param1: number): string
		{
			let format = "";
			if (param1 > 90)
			{
				if (Const.isZhLocale(com.google.i18n.locale.DateTimeLocale.getLocale()))
					format = "yyyy年MMMMM";
				else
					format = "MMM yyyy";
			}
			else if (Const.isZhLocale(com.google.i18n.locale.DateTimeLocale.getLocale()))
				format = "yy年MMMMM";
			else
				format = "MMM\'yy";

			return format;
		}

		private drawHoursForDay(displayObject: flash.display.DisplayObject, sprite: flash.display.Sprite, dayVisibility: DayVisibility, param4: number)
		{
			const dataUnit = dayVisibility.dataUnit;
			const startMinute = dayVisibility.startMinute;
			let coveredMinutes = dayVisibility.coveredMinutes;
			const minutesSkip = this.getMinutesSkip();
			const intervalLength = this.viewPoint.getIntervalLength(minutesSkip);
			let xPos = this.viewPoint.getXPos(dataUnit) - intervalLength;
			const _loc11_ = this.viewPoint.miny + this.topMargin;
			const _loc12_ = this.viewPoint.maxy - this.viewPoint.bottomTextHeight;
			const _loc13_ = this.viewPoint.maxy - ViewPoint.TEXT_VERTICAL_OFFSET - ViewPoint.TEXT_FIELD_HEIGHT;
			const _loc14_ = intervalLength;
			const _loc15_ = ViewPoint.TEXT_FIELD_HEIGHT;
			const allDataSessions = this.dataSource.getAllDataSessions(startMinute, dataUnit.dayMinute);
			let _loc17_ = allDataSessions.length() - 1;
			let interval = allDataSessions.getIntervalAt(_loc17_);
			let dayMinute = dataUnit.dayMinute;
			const date = new Date(dataUnit.exchangeDateInUTC.getTime());
			while (dayMinute > startMinute)
			{
				const _loc21_ = dayMinute;
				let _loc22_ = Number(minutesSkip);
				while (_loc22_ > 0)
				{
					const _loc25_ = dayMinute - interval.start;
					if (_loc25_ >= _loc22_)
					{
						dayMinute -= _loc22_;
						_loc22_ = 0;
					}
					else
					{
						_loc22_ = Number(_loc22_ - _loc25_);
						_loc17_--;
						if (_loc17_ < 0)
							return;

						interval = allDataSessions.getIntervalAt(_loc17_);
						dayMinute = interval.end;
					}
				}
				date.setTime(date.getTime() - (_loc21_ - dayMinute) * Const.MS_PER_MINUTE);
				if (dayMinute <= startMinute)
					return;

				coveredMinutes -= minutesSkip;
				const intervalLength2 = this.viewPoint.getIntervalLength(coveredMinutes);
				if (intervalLength2 < DateLinesLayer.DAY_START_TEXT_MAX_WIDTH)
					return;

				AbstractLayer.drawVerticalLine(displayObject, xPos, Const.HOUR_LINE_COLOR, Const.HOUR_LINE_ALPHA, _loc11_, _loc12_, ViewPoint.TICK_SIZE_SMALL, this.tickPosition);
				const hourTextFromUtcDate = this.getHourTextFromUtcDate(date);
				ViewPoint.addTextField(sprite, hourTextFromUtcDate, xPos, _loc13_, _loc14_, _loc15_, "left", this.viewPoint.hourTextFormat);
				xPos -= intervalLength;
			}
		}

		private drawDayStarts(displayObject: flash.display.DisplayObject, sprite: flash.display.Sprite, dayVisibilities: DayVisibility[], detailLevel: Intervals)
		{
			//const _loc5_ = this.viewPoint.miny + this.topMargin;
			//const _loc6_ = this.viewPoint.maxy - this.viewPoint.bottomTextHeight;
			const _loc7_ = this.viewPoint.maxy - ViewPoint.TEXT_VERTICAL_OFFSET - ViewPoint.TEXT_FIELD_HEIGHT;
			for (let dayVisibilityIndex = 0; dayVisibilityIndex < dayVisibilities.length; dayVisibilityIndex++)
			{
				const x = this.viewPoint.getXPos(dayVisibilities[dayVisibilityIndex].dataUnit);
				//AbstractLayer.drawVerticalLine(param1, _loc9_, Const.DAY_LINE_COLOR, Const.DAY_LINE_ALPHA, _loc5_, _loc6_, ViewPoint.TICK_SIZE_BIG, this.tickPosition, param4 !== Intervals.DAILY);
				if (this.viewPoint.bottomTextHeight > 0)
				{
					const intervalLength = this.viewPoint.getIntervalLength(dayVisibilities[dayVisibilityIndex].coveredMinutes);
					const dayText = this.getDayText(dayVisibilities, dayVisibilityIndex, intervalLength);
					let _loc12_ = "center";
					if (intervalLength >= DateLinesLayer.DISPLAY_HOURS_MIN_DAY_WIDTH && detailLevel < Intervals.DAILY)
					{
						_loc12_ = "left";
						this.drawHoursForDay(displayObject, sprite, dayVisibilities[dayVisibilityIndex], intervalLength);
					}
					let _loc13_: number;
					let _loc14_: number;
					if (detailLevel < Intervals.DAILY)
					{
						_loc13_ = x - intervalLength + ViewPoint.TEXT_HORIZONTAL_OFFSET;
						_loc14_ = intervalLength - ViewPoint.TEXT_HORIZONTAL_OFFSET;
					}
					else
					{
						_loc13_ = x - ViewPoint.TEXT_FIELD_WIDTH / 2;
						_loc14_ = ViewPoint.TEXT_FIELD_WIDTH;
					}
					ViewPoint.addTextField(sprite, dayText, _loc13_, _loc7_, _loc14_, ViewPoint.TEXT_FIELD_HEIGHT, _loc12_, this.viewPoint.hourTextFormat);
				}
			}
		}

		private getVisibleDaysArray(context: Context): DayVisibility[]
		{
			const dayVisibilities: DayVisibility[] = [];
			const data = this.dataSource.data;
			//const _loc4_ = this.dataSource.afterHoursData;
			let _loc5_ = 1 + DataSource.getMinuteMetaIndex(context.lastMinute, data.days, data.units);
			_loc5_ = Math.min(_loc5_, data.days.length - 1);
			const minuteMetaIndex = DataSource.getMinuteMetaIndex(context.lastMinute - context.count, data.days, data.units);
			for (let _loc7_ = minuteMetaIndex; _loc7_ <= _loc5_; _loc7_++)
			{
				const dataUnit = data.units[data.days[_loc7_]];
				const marketOpenMinute = data.marketOpenMinute;
				const marketDayLength = data.marketDayLength;
				if (dataUnit)
				{
					const dayVisibility = new DayVisibility();
					dayVisibility.dataUnit = dataUnit;
					dayVisibility.startMinute = marketOpenMinute;
					dayVisibility.coveredMinutes = marketDayLength;

					dayVisibilities.push(dayVisibility);
				}
			}
			this.adjustVisibleDaysWithAfterHours(dayVisibilities);
			return dayVisibilities;
		}

		private getDayText(dayVisibilities: DayVisibility[], dayIndex: number, param3: number): string
		{
			const exchangeDateInUTC = dayVisibilities[dayIndex].dataUnit.exchangeDateInUTC;
			let _loc5_ = 'd';
			if (param3 > 50 || dayIndex === 2 || dayIndex === dayVisibilities.length - 2)
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
			return com.google.i18n.locale.DateTimeLocale.formatDateTime(_loc5_, exchangeDateInUTC, true);
		}

		private getWeekStartDateFormat(): string
		{
			if (Const.isZhLocale(com.google.i18n.locale.DateTimeLocale.getLocale()))
				return "M月d日";

			return "MMM d";
		}
	}
}
