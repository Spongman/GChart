namespace com.google.finance
{
	export class SeriesPosition
	{
		position: number;
		constructor(public refDataSeries: DataSeries|null, public pos: number, public dayPos: number | null = null)
		{
		}
	}

	export class DataSource
	{
		private static readonly COL_CLOSE_TYPE = 2;
		static readonly RELATIVE_MINUTES_NOT_READY = 0;
		static readonly DMS_RELATIVE_MINUTES_READY = 2;
		private static readonly COL_DATE_TYPE = 1;
		private static readonly COL_VOLUME_TYPE = 6;
		static readonly RELATIVE_MINUTES_READY = 1;
		private static readonly COL_HIGH_TYPE = 3;
		private static readonly COL_OPEN_TYPE = 5;
		private static readonly COLUMNS_STR = "COLUMNS";
		private static readonly INTERVAL_STR = "INTERVAL";
		private static readonly MARKET_CLOSE_MINUTE_STR = "MARKET_CLOSE_MINUTE";
		private static readonly COL_CDAYS_TYPE = 7;
		private static readonly DATA_SESSIONS_STR = "DATA_SESSIONS";
		private static readonly TIMEZONE_OFFSET_STR = "TIMEZONE_OFFSET";
		private static readonly SESSIONS_STR = "SESSIONS";
		private static readonly COL_LOW_TYPE = 4;
		private static readonly EXCHANGE_STR = "EXCHANGE";
		private static readonly MARKET_OPEN_MINUTE_STR = "MARKET_OPEN_MINUTE";
		private static readonly DATE_FORMAT_STR = "DATE_FORMAT";
		private static readonly DATA_STR = "DATA";
		private static readonly ABSOLUTE_DATE_CHAR = "a";


		visibleExtendedHours: com.google.finance.IntervalSet;

		private columnNames: string[];

		objects: { [key: string]: StockAssociatedObject[] };

		events: { [key: string]: ChartEventTypes };

		quoteName: string;

		data: com.google.finance.DataSeries;

		private baseMinutesInterval: number;

		tickerName: string;

		private baseInterval: number;

		indicators: { [name: string]: Indicator };

		hiddenExtendedHours: com.google.finance.IntervalSet;

		private quoteType: number;

		private allowedOffset = 10;

		afterHoursData: com.google.finance.DataSeries;

		private relativeMinutesState: number;

		technicalsName: string;

		dataUnavailableOnServer: boolean;

		private lastAbsTime: number;

		displayName?: string;

		private timezoneOffset: number;

		intradayMinutesInterval: number;

		private weekdayBitmap: number;

		firstOpenRelativeMinutes = 0;

		constructor(param1: string, param2 = 62, param3?: string)
		{
			this.columnNames = ["DATE", "CLOSE", "HIGH", "LOW", "OPEN", "VOLUME", "CDAYS"];
			this.relativeMinutesState = DataSource.RELATIVE_MINUTES_NOT_READY;
			this.quoteName = param1;
			this.quoteType = Const.getQuoteType(param1);
			this.events = {};
			this.objects = {};
			this.indicators = {};
			if (param1.indexOf("@") !== -1)
			{
				let _loc4_ = param1.split("@");
				this.tickerName = _loc4_[0];
				this.technicalsName = _loc4_[1];
			}
			else
			{
				this.tickerName = param1;
				this.technicalsName = "";
			}
			this.weekdayBitmap = param2;
			this.displayName = param3;
			this.data = new com.google.finance.DataSeries();
			this.afterHoursData = new com.google.finance.DataSeries();
			this.dataUnavailableOnServer = false;
			this.visibleExtendedHours = new com.google.finance.IntervalSet();
			this.hiddenExtendedHours = new com.google.finance.IntervalSet();
			this.intradayMinutesInterval = Const.INTRADAY_INTERVAL / Const.SEC_PER_MINUTE;
		}

		private static unitsInDifferentDays(param1: DataUnit, param2: DataUnit | null): boolean
		{
			if (!param2 || !param1)
				return true;

			if (param1.exchangeDateInUTC.getUTCDay() !== param2.exchangeDateInUTC.getUTCDay())
				return true;

			if (Math.abs(param1.time - param2.time) > Const.MS_PER_DAY)
				return true;

			return false;
		}

		static getMinuteMetaIndex(param1: number, param2: number[], param3: DataUnit[]): number
		{
			let _loc6_ = 0;
			if (isNaN(param1) || !param3 || param3.length === 0 || param2.length === 0)
				return -1;

			let _loc4_ = 0;
			let _loc5_ = param2.length - 1;
			while (true)
			{
				_loc6_ = Math.round((_loc4_ + _loc5_) / 2);
				if (_loc6_ === 0 && param3[param2[0]].relativeMinutes > param1)
					break;

				if (_loc6_ === param2.length - 1 && param3[param2[_loc6_]].relativeMinutes < param1)
					return param2.length - 1;

				if (param3[param2[_loc6_]].relativeMinutes === param1)
					return _loc6_;

				if (_loc4_ >= _loc5_ - 1)
					return _loc4_;

				if (param3[param2[_loc6_]].relativeMinutes < param1)
					_loc4_ = _loc6_;
				else
					_loc5_ = _loc6_;
			}
			return 0;
		}

		static getTimeIndex(param1: number, param2: DataUnit[]): number
		{
			let _loc5_ = 0;
			if (isNaN(param1) || !param2 || param2.length === 0)
				return -1;

			let _loc3_ = 0;
			let _loc4_ = param2.length - 1;
			while (true)
			{
				_loc5_ = Math.round((_loc3_ + _loc4_) / 2);
				if (_loc5_ === 0 && param2[0].time > param1)
					break;

				if (_loc5_ === param2.length - 1 && param2[_loc5_].time < param1)
					return param2.length - 1;

				if (param2[_loc5_].time === param1)
					return _loc5_;

				if (_loc3_ >= _loc4_ - 1)
					return _loc3_;

				if (param2[_loc5_].time < param1)
					_loc3_ = _loc5_;
				else
					_loc4_ = _loc5_;
			}
			return 0;
		}

		computeStarts(param1: com.google.finance.DataSeries) 
		{
			let _loc3_ = -1;
			param1.years = [];
			param1.firsts = [];
			param1.fridays = [];
			param1.days = [];
			let _loc4_ = param1.units;
			let _loc5_ = notnull(param1.getSessionForMinute(_loc4_[0].dayMinute));
			let _loc6_ = Utils.getLastDayOfWeek(this.weekdayBitmap);
			for (let _loc7_ = 0; _loc7_ < _loc4_.length; _loc7_++)
			{
				let _loc8_ = _loc4_[_loc7_];
				let _loc9_ = _loc7_ === _loc4_.length - 1 ? null : _loc4_[_loc7_ + 1];
				if (_loc8_.dayMinute === _loc5_.end)
				{
					if (DataSource.unitsInDifferentDays(_loc8_, _loc9_))
					{
						param1.days.push(_loc7_);
						if (_loc8_.exchangeDateInUTC.getUTCMonth() !== _loc3_)
						{
							param1.firsts.push(_loc7_);
							_loc3_ = _loc8_.exchangeDateInUTC.getUTCMonth();
							if (_loc3_ === 0)
								param1.years.push(_loc7_);
						}
						let _loc10_ = _loc8_.exchangeDateInUTC.getUTCDay();
						let _loc11_ = Number.POSITIVE_INFINITY;
						if (_loc9_)
							_loc11_ = _loc9_.exchangeDateInUTC.getUTCDay();

						if (_loc10_ === _loc6_ || _loc8_.coveredDays > 1 || _loc7_ < _loc4_.length - 1 && _loc10_ > _loc11_)
							param1.fridays.push(_loc7_);
					}
					if (_loc9_)
					{
						_loc5_ = notnull(param1.getSessionForMinute(_loc9_.dayMinute));
					}
				}
			}
		}

		addStream(param1: string, param2: ChartEvent): number
		{
			let _loc3_ = this.data.points.length !== 0;
			this.clearAllIndicatorsOnAddData(Number(param2.interval));
			this.clearCoalescedChildren();
			if (param1.indexOf(DataSource.EXCHANGE_STR) !== 0)
				return Const.ERROR;

			let _loc4_ = param1.split("\n");
			let _loc5_ = this.data;
			switch (param2.type)
			{
				case ChartEventTypes.GET_AH_DATA:
				case ChartEventTypes.GET_RT_AH_DATA:
					_loc5_ = this.afterHoursData;
					break;
			}

			let _loc6_ = this.parseHeader(_loc4_, param2);
			if (!_loc6_)
				return Const.ERROR;

			this.checkHeaderSanity(_loc6_, _loc5_);
			let _loc7_ = Utils.assocArrayLength(_loc6_) + 1;
			this.baseInterval = Number(_loc6_[DataSource.INTERVAL_STR]);
			if (param2.detailType !== Const.GET_RT_DATA && param2.detailType !== Const.GET_RT_AH_DATA)
			{
				let _loc15_ = _loc6_[DataSource.COLUMNS_STR].split(",");
				if (_loc15_.indexOf(this.columnNames[DataSource.COL_OPEN_TYPE]) !== -1 && _loc15_.indexOf(this.columnNames[DataSource.COL_HIGH_TYPE]) !== -1 && _loc15_.indexOf(this.columnNames[DataSource.COL_LOW_TYPE]) !== -1)
					this.eventOhlcDone(param2.getEventName());
				else
					this.eventDone(param2.getEventName());
			}
			let _loc8_ = _loc5_.units;
			let _loc9_ = this.parseStream(_loc4_.slice(_loc7_), _loc6_, _loc5_);
			if (!_loc9_)
				return Const.ERROR;

			if (_loc9_.length === 0)
			{
				_loc5_.setNoPointsInIntervalArray(this.baseInterval);
				return Const.ADDED_DATA;
			}

			let _loc10_ = Utils.getLastRealPointIndex(_loc9_);
			let _loc11_ = false;
			if (Const.INDICATOR_ENABLED)
			{
				switch (param2.detailType)
				{
					case Const.GET_10D_DATA:
					case Const.GET_30D_DATA:
						this.addStreamForPointsInIntervals(this.baseInterval, _loc9_);
						return Const.ADDED_DATA;
					case Const.GET_5D_DATA:
					case Const.GET_1Y_DATA:
					case Const.GET_5Y_DATA:
					case Const.GET_40Y_DATA:
						this.addStreamForPointsInIntervals(this.baseInterval, _loc9_);
						break;
					case Const.GET_AH_DATA:
						this.addAHStreamForPointsInIntervals(_loc9_);
						break;
					case Const.GET_RT_DATA:
						_loc11_ = true;
						let _loc16_ = this.data.getPointsInIntervalArray(Const.INTRADAY_INTERVAL);
						this.addStreamForPointsInIntervals(this.baseInterval, this.mergePoints(_loc9_, _loc16_, _loc11_, _loc10_));
						break;
					case Const.GET_RT_AH_DATA:
						_loc11_ = true;
						let _loc17_ = this.afterHoursData.getPointsInIntervalArray(Const.INTRADAY_INTERVAL);
						this.addAHStreamForPointsInIntervals(this.mergePoints(_loc9_, _loc17_, _loc11_, _loc10_));
						break;
				}
			}
			let _loc12_ = this.mergePoints(_loc9_, _loc8_, _loc11_, _loc10_);
			_loc5_.units = _loc12_;
			_loc5_.points = <any>_loc12_;
			let _loc13_ = _loc9_[0].time;
			let _loc14_ = _loc9_[_loc9_.length - 1].time;
			_loc5_.addIntervalBounds(this.baseInterval, _loc13_, _loc14_);
			this.preCalculate(_loc5_);
			if (_loc5_ === this.afterHoursData)
			{
				if (this.hiddenExtendedHours.length() > 0)
				{
					this.hiddenExtendedHours = new com.google.finance.IntervalSet();
					this.extractAfterHoursSessions(this.hiddenExtendedHours);
				}
				else
				{
					if (this.visibleExtendedHours.length() > 0)
						this.visibleExtendedHours = new com.google.finance.IntervalSet();

					this.extractAfterHoursSessions(this.visibleExtendedHours);
				}
			}
			if (_loc3_)
				return Const.ADDED_DATA;

			if (_loc9_.length === 0)
				return Const.NOTHING;

			return Const.FIRST_DATA;
		}

		preCalculate(param1: com.google.finance.DataSeries) 
		{
			this.computeStarts(param1);
			this.computeIntradaySessions(param1);
			this.computeObjectPositions();
		}

		getClosestDataUnitLessThen(param1: number): DataUnit | null
		{
			let _loc2_ = this.afterHoursData.getRelativeMinuteIndex(param1);
			let _loc3_ = this.afterHoursData.units[_loc2_];
			let _loc4_ = this.data.getRelativeMinuteIndex(param1);
			let _loc5_ = this.data.units[_loc4_];
			if (param1 < _loc3_.relativeMinutes && param1 < _loc5_.relativeMinutes)
				return null;

			if (_loc3_.relativeMinutes > param1)
				return _loc5_;

			if (_loc5_.relativeMinutes > param1)
				return _loc3_;

			if (param1 - _loc5_.relativeMinutes < param1 - _loc3_.relativeMinutes)
				return _loc5_;

			return _loc3_;
		}

		getAllDataSessions(param1: number, param2: number): com.google.finance.IntervalSet
		{
			let _loc3_ = new com.google.finance.IntervalSet();

			for (let _loc4_ = 0; _loc4_ < this.data.dataSessions.length(); _loc4_++)
			{
				_loc3_.addPair(this.data.dataSessions.method_1(_loc4_));
			}

			if (param1 < this.data.marketOpenMinute)
				_loc3_.addInterval(param1, this.data.marketOpenMinute);

			if (param2 > this.data.marketCloseMinute)
				_loc3_.addInterval(this.data.marketCloseMinute, param2);

			return _loc3_;
		}

		countEvents(param1: number): number
		{
			let _loc2_ = 0;
			for (let _loc3_ in this.events)
			{
				if (this.events[_loc3_] === param1)
					_loc2_++;
			}
			return _loc2_;
		}

		private getColumnTypes(param1: string): number[]
		{
			let _loc5_ = 0;
			let _loc2_: number[] = [];
			let _loc3_ = param1.split(",");
			for (let _loc4_ = 0; _loc4_ < _loc3_.length; _loc4_++)
			{
				_loc5_ = 0;
				while (_loc5_ < this.columnNames.length)
				{
					if (_loc3_[_loc4_] === this.columnNames[_loc5_])
						_loc2_[_loc4_] = _loc5_ + 1;

					_loc5_++;
				}
			}
			return _loc2_;
		}

		eventOhlcDone(param1: string) 
		{
			this.events[param1] = ChartEventTypes.OHLC_DONE;
		}

		hasEventHappened(param1: ChartEvent): boolean
		{
			let _loc2_ = param1.getEventName();
			return !!this.events[_loc2_];
		}

		parseStream(param1: string[], param2: { [key: string]: string }, param3: com.google.finance.DataSeries): DataUnit[]
		{
			let _loc20_ = 0;
			let _loc4_ = 0;
			this.baseInterval = Number(param2[DataSource.INTERVAL_STR]);
			this.baseMinutesInterval = this.baseInterval / Const.SEC_PER_MINUTE;
			if (!param1 || param1.length === 0)
				return [];

			let _loc5_ = this.getColumnTypes(param2[DataSource.COLUMNS_STR]);
			let _loc6_: DataUnit[] = [];
			let _loc7_ = 0;
			this.timezoneOffset = 0;
			this.lastAbsTime = 0;
			let _loc8_ = DataSource.TIMEZONE_OFFSET_STR.charCodeAt(0);
			let _loc10_: MarketSessionPair | null = null;
			let _loc12_: MarketSessionPair | null = null;
			let _loc13_ = 0;

			do
			{
				let _loc14_ = param1[_loc7_++];
				if (_loc14_.charCodeAt(0) === _loc8_)
				{
					let _loc17_ = _loc14_.split("=");
					this.timezoneOffset = Number(_loc17_[1]);
				}
				else
				{
					let _loc15_ = _loc14_.split(Const.DATA_DELIMITER);
					if (!(_loc15_.length !== _loc5_.length || _loc15_[0].charAt(0) === "&"))
					{
						let _loc16_ = this.getDataUnitNoValidation(_loc15_, _loc5_, param2);
						_loc16_.duplicate = param3.minuteIsStartOfDataSession(_loc16_.dayMinute);
						if (Const.INDICATOR_ENABLED && !isNaN(_loc16_.open))
						{
							if (_loc16_.open === 0)
								_loc16_.open = _loc16_.close;

							_loc16_.high = Math.max(_loc16_.high, Math.max(_loc16_.open, _loc16_.close));
							let _loc18_ = Math.min(_loc16_.open, _loc16_.close);
							if (_loc16_.low === 0 || _loc16_.low > _loc18_)
								_loc16_.low = _loc18_;
						}
						if (_loc6_.length === 0)
						{
							_loc12_ = notnull(param3.getSessionForMinute(_loc16_.dayMinute));
							_loc13_ = 0;
						}
						if (this.baseInterval < Const.DAILY_INTERVAL && _loc6_.length > 0)
						{
							let _loc19_ = (_loc16_.time - _loc6_[_loc6_.length - 1].time) / Const.MS_PER_MINUTE;
							if (_loc19_ > this.baseMinutesInterval && _loc19_ - (notnull(_loc12_).end - _loc4_) > this.allowedOffset && _loc13_ > 0)
							{
								let _loc11_ = notnull(param3.getSessionForMinute(_loc16_.dayMinute));
								if (_loc16_.dayMinute >= _loc11_.start)
								{
									_loc10_ = _loc12_;
									_loc12_ = _loc11_;
									_loc13_ = 0;
								}
							}
						}
						if (_loc16_.dayMinute >= notnull(_loc12_).start)
						{
							if (this.quoteType === Const.CURRENCY)
							{
								if (this.baseInterval === Const.WEEKLY_INTERVAL)
								{
									if (_loc16_.exchangeDateInUTC.getUTCDay() === 6)
										_loc16_.setDate(_loc16_.time - Const.MS_PER_DAY, _loc16_.timezoneOffset);
									else if (_loc16_.exchangeDateInUTC.getUTCDay() === 0)
										_loc16_.setDate(_loc16_.time - 2 * Const.MS_PER_DAY, _loc16_.timezoneOffset);
								}
								else if (_loc16_.exchangeDateInUTC.getUTCDay() === 0 || _loc16_.exchangeDateInUTC.getUTCDay() === 6)
								{
								}
							}
							if (this.baseInterval < Const.DAILY_INTERVAL && _loc16_.dayMinute > notnull(_loc12_).end)
							{
								this.addAfterHoursUnitToLastMinute(_loc16_, _loc6_, notnull(_loc12_), param3);
								_loc13_++;
								_loc4_ = notnull(_loc12_).end;
							}
							else if (!isNaN(_loc16_.close))
							{
								let interval = Number(param2[DataSource.INTERVAL_STR]);
								if (_loc16_.volumes[interval] >= 0)
								{
									if (this.quoteType === Const.COMPANY && _loc6_.length > 0)
									{
										if (!this.isTradeHaltedInterday(_loc16_, _loc6_[_loc6_.length - 1], this.baseInterval))
										{
										}
									}
									if (!(_loc6_.length > 0 && _loc16_.time === _loc6_[_loc6_.length - 1].time))
									{
										this.regularSanityCheck(_loc6_, _loc16_, _loc10_, notnull(_loc12_), _loc4_, param3);
										_loc13_++;
										_loc6_.push(_loc16_);
										_loc4_ = _loc16_.dayMinute;
									}
								}
							}
						}
					}
				}
			}
			while (_loc7_ < param1.length);

			if (_loc6_.length !== 0 && _loc12_ && Number(param2[DataSource.INTERVAL_STR]) < Const.DAILY_INTERVAL && _loc4_ !== _loc12_.end)
			{
				_loc20_ = (_loc12_.end - _loc4_) / this.baseMinutesInterval;
				this.addFakeDataUnits(_loc6_, _loc6_[_loc6_.length - 1], param3, _loc20_, Const.FORWARD);
				_loc4_ = _loc12_.end;
			}

			if (_loc6_.length !== 0 && _loc12_ && Number(param2[DataSource.INTERVAL_STR]) < Const.DAILY_INTERVAL && _loc4_ !== param3.marketCloseMinute)
				this.addFakeDataUnitsForSessions(_loc6_, _loc6_[_loc6_.length - 1], param3, param3.getSessionIndex(_loc4_) + 1, param3.dataSessions.length(), Const.FORWARD);

			return _loc6_;
		}

		sortObjects(param1: string) 
		{
			if (!param1)
				param1 = "newspin";

			this.objects[param1].sort(StockAssociatedObject.compare);
		}

		private addFakeDataUnitsForSessions(param1: DataUnit[], param2: DataUnit, param3: com.google.finance.DataSeries, param4: number, param5: number, param6: number) 
		{
			let _loc9_ = 0;
			let _loc10_ = 0;
			if (param3 !== this.data)
				return;

			let _loc7_ = param4;
			while (_loc7_ < param5)
			{
				let _loc8_ = param3.dataSessions.method_1(_loc7_);
				_loc9_ = Math.floor((_loc8_.end - _loc8_.start) / this.baseMinutesInterval) + 1;
				switch (param6)
				{
					case Const.BACKWARD:
						_loc10_ = _loc8_.end - param2.dayMinute + this.baseMinutesInterval;
						break;
					case Const.FORWARD:
						_loc10_ = _loc8_.start - param2.dayMinute - this.baseMinutesInterval;
						break;
				}
				this.addFakeDataUnits(param1, param2, param3, _loc9_, param6, _loc10_);
				_loc7_++;
			}
		}

		getFirstRelativeMinute(param1: number): number
		{
			let _loc2_ = Const.getDetailLevelInterval(param1);
			let _loc3_ = this.data.getPointsInIntervalArray(_loc2_);
			if (!_loc3_ || _loc3_.length === 0)
				return 0;

			return _loc3_[0].relativeMinutes;
		}

		hasPendingEvents(): boolean
		{
			for (let _loc1_ in this.events)
			{
				if (this.events[_loc1_] !== ChartEventTypes.DONE && this.events[_loc1_] !== ChartEventTypes.OHLC_DONE)
					return true;
			}
			return false;
		}

		private regularSanityCheck(param1: DataUnit[], param2: DataUnit, param3: StartEndPair|null, param4: StartEndPair, param5: number, param6: com.google.finance.DataSeries) 
		{
			let _loc7_ = 0;
			if (this.baseInterval < Const.DAILY_INTERVAL)
			{
				let _loc8_ = param6.getSessionIndex(param4.start);
				let _loc9_ = !param3 ? -1 : param6.getSessionIndex(param3.start);
				if (param2.dayMinute === param4.start)
				{
					if (param3 && param5 !== param3.end)
					{
						_loc7_ = Math.floor((param3.end - param5) / this.baseMinutesInterval);
						this.addFakeDataUnits(param1, param1[param1.length - 1], param6, _loc7_, Const.FORWARD);
					}
					if (!param3)
					{
						this.addFakeDataUnitsForSessions(param1, param2, param6, 0, _loc8_, Const.BACKWARD);
					}
					else if (!DataSource.unitsInDifferentDays(param1[param1.length - 1], param2))
					{
						this.addFakeDataUnitsForSessions(param1, param1[param1.length - 1], param6, _loc9_ + 1, _loc8_, Const.FORWARD);
					}
					else
					{
						this.addFakeDataUnitsForSessions(param1, param1[param1.length - 1], param6, _loc9_ + 1, param6.dataSessions.length(), Const.FORWARD);
						this.addFakeDataUnitsForSessions(param1, param2, param6, 0, _loc8_, Const.BACKWARD);
					}
				}
				else if (param1.length === 0 || param2.time - param1[param1.length - 1].time !== this.baseMinutesInterval * Const.MS_PER_MINUTE)
				{
					if (param1.length === 0)
					{
						this.addFakeDataUnitsForSessions(param1, param2, param6, 0, _loc8_, Const.BACKWARD);
						if (param6 === this.data || param2.dayMinute !== param4.end)
						{
							_loc7_ = Math.floor((param2.dayMinute - param4.start) / this.baseMinutesInterval);
							this.addFakeDataUnits(param1, param2, param6, _loc7_, Const.BACKWARD);
						}
					}
					else if (param2.time - param1[param1.length - 1].time <= (param2.dayMinute - param4.start) * Const.MS_PER_MINUTE)
					{
						_loc7_ = Math.floor((param2.dayMinute - param5) / this.baseMinutesInterval) - 1;
						this.addFakeDataUnits(param1, param1[param1.length - 1], param6, _loc7_, Const.FORWARD);
					}
					else
					{
						_loc7_ = Math.floor((notnull(param3).end - param5) / this.baseMinutesInterval);
						this.addFakeDataUnits(param1, param1[param1.length - 1], param6, _loc7_, Const.FORWARD);
						if (!DataSource.unitsInDifferentDays(param1[param1.length - 1], param2) && param6 === this.data)
						{
							this.addFakeDataUnitsForSessions(param1, param1[param1.length - 1], param6, _loc9_ + 1, _loc8_, Const.FORWARD);
							_loc7_ = Math.floor((param2.dayMinute - param4.start) / this.baseMinutesInterval);
							let _loc10_ = param4.start - param1[param1.length - 1].dayMinute - this.baseMinutesInterval;
							this.addFakeDataUnits(param1, param1[param1.length - 1], param6, _loc7_, Const.FORWARD, _loc10_);
						}
						else
						{
							this.addFakeDataUnitsForSessions(param1, param1[param1.length - 1], param6, _loc9_ + 1, param6.dataSessions.length(), Const.FORWARD);
							this.addFakeDataUnitsForSessions(param1, param2, param6, 0, _loc8_, Const.BACKWARD);
							_loc7_ = Math.floor((param2.dayMinute - param4.start) / this.baseMinutesInterval);
							this.addFakeDataUnits(param1, param2, param6, _loc7_, Const.BACKWARD);
						}
					}
				}
			}
			else if ((this.baseInterval === Const.DAILY_INTERVAL || this.baseInterval === Const.WEEKLY_INTERVAL) && param2.dayMinute !== param6.marketCloseMinute)
			{
				let _loc11_ = (param6.marketCloseMinute - param2.dayMinute) * Const.MS_PER_MINUTE;
				_loc11_ = _loc11_ - param2.exchangeDateInUTC.getUTCSeconds() * 1000;
				param2.setDate(param2.time + _loc11_, param2.timezoneOffset);
			}
		}

		getObjectPositionsInInterval(param1: number)
		{
			let _loc4_ = 0;
			let _loc7_ = 0;
			let _loc10_ = NaN;
			let _loc11_ = NaN;
			let _loc2_ = <{
				exchangeTimezoneOffset: number,
				closePrice: number,
				posInInterval: SeriesPosition[],
			}>{};
			let _loc3_: SeriesPosition[] = [];
			let _loc5_ = Const.DETAIL_LEVELS.length - 1;
			while (_loc5_ >= 0)
			{
				_loc7_ = Const.getDetailLevelInterval(Const.DETAIL_LEVELS[_loc5_]);
				let _loc8_ = this.data.getPointsInIntervalArray(_loc7_);
				if (_loc8_ && _loc8_.length > 0)
				{
					_loc4_ = DataSource.getTimeIndex(param1, _loc8_);
					if (_loc4_ === 0 && _loc8_[0].time > param1)
					{
						_loc2_.exchangeTimezoneOffset = _loc8_[_loc4_].timezoneOffset;
					}
					else
					{
						if (_loc8_[_loc4_].time < param1)
							_loc4_ = Math.min(_loc4_ + 1, _loc8_.length - 1);

						_loc3_[_loc7_] = new SeriesPosition(this.data, _loc4_);
						_loc2_.exchangeTimezoneOffset = _loc8_[_loc4_].timezoneOffset;
						_loc2_.closePrice = _loc8_[_loc4_].close;
					}
				}
				_loc5_--;
			}
			let _loc6_ = this.afterHoursData.getPointsInIntervalArray(Const.INTRADAY_INTERVAL);
			if (_loc6_ && _loc6_.length > 0 && this.visibleExtendedHours.length())
			{
				_loc4_ = DataSource.getTimeIndex(param1, _loc6_);
				if (_loc4_ !== 0 || _loc6_[0].time <= param1)
				{
					if (_loc6_[_loc4_].time < param1)
						_loc4_ = Math.min(_loc4_ + 1, _loc6_.length - 1);

					if (_loc3_[Const.INTRADAY_INTERVAL])
					{
						let _loc8_ = this.data.getPointsInIntervalArray(Const.INTRADAY_INTERVAL);
						let _loc9_ = _loc8_[_loc3_[Const.INTRADAY_INTERVAL].position];
						_loc10_ = _loc9_.time;
						_loc11_ = _loc6_[_loc4_].time;
						if (_loc10_ >= param1 && _loc11_ >= param1 && _loc11_ < _loc10_ || _loc10_ < param1 && _loc11_ > _loc10_)
						{
							_loc3_[Const.INTRADAY_INTERVAL] = new SeriesPosition(this.afterHoursData, _loc4_);
							_loc2_.exchangeTimezoneOffset = _loc6_[_loc4_].timezoneOffset;
							_loc2_.closePrice = _loc6_[_loc4_].close;
						}
					}
					else
					{
						_loc3_[Const.INTRADAY_INTERVAL] = new SeriesPosition(this.afterHoursData, _loc4_);
						_loc2_.exchangeTimezoneOffset = _loc6_[_loc4_].timezoneOffset;
						_loc2_.closePrice = _loc6_[_loc4_].close;
					}
				}
				else
				{
					_loc2_.exchangeTimezoneOffset = _loc6_[_loc4_].timezoneOffset;
				}
			}
			_loc2_.posInInterval = _loc3_;
			return _loc2_;
		}

		private parseHeader(param1: string[], param2: ChartEvent)
		{
			let _loc3_: { [key: string]: string } = {};
			for (let _loc4_ = 0; _loc4_ < param1.length; _loc4_++)
			{
				let _loc5_ = param1[_loc4_].split("=");
				if (_loc5_.length <= 1)
					return null;

				if (_loc5_[0] === DataSource.DATA_STR)
					return _loc3_;

				_loc3_[_loc5_[0]] = _loc5_[1];
			}
			return null;
		}

		computeIntradaySessions(param1: com.google.finance.DataSeries) 
		{
			let _loc2_ = Const.INTRADAY_INTERVAL;
			param1.intradayRegions = [];
			let _loc3_ = 0;
			let _loc4_ = 0;
			let _loc5_ = 1;
			while (_loc5_ < param1.units.length)
			{
				let _loc6_ = param1.units[_loc5_];
				let _loc7_ = param1.units[_loc5_ - 1];
				if ((_loc6_.time - _loc7_.time) / 1000 !== _loc2_)
				{
					if (_loc4_ > 0)
						param1.intradayRegions.push(new StartEndPair(_loc3_, _loc5_ - 1));

					_loc3_ = _loc5_;
					_loc4_ = 0;
				}
				else
				{
					_loc4_++;
				}
				_loc5_++;
			}
			if (_loc4_ > 0)
				param1.intradayRegions.push(new StartEndPair(_loc3_, param1.points.length - 1));
		}

		private addStreamForPointsInIntervals(param1: number, param2: DataUnit[]) 
		{
			this.data.setPointsInIntervalArray(param1, param2);
		}

		private makeDataUnitEndOfDay(param1: DataUnit, param2: DataUnit[], param3: StartEndPair, param4: com.google.finance.DataSeries) 
		{
			let _loc8_ = 0;
			let _loc5_ = param3.end - param3.start;
			let _loc6_ = param1.dayMinute - param3.end;
			let _loc7_ = -_loc6_ * 60 * 1000;
			_loc7_ = _loc7_ - param1.exchangeDateInUTC.getUTCSeconds() * 1000;
			param1.setDate(param1.time + _loc7_, param1.timezoneOffset);
			if (this.baseInterval < Const.DAILY_INTERVAL)
			{
				_loc8_ = _loc5_ / this.baseMinutesInterval;
				this.addFakeDataUnits(param2, param1, param4, _loc8_, Const.BACKWARD);
			}
			param2.push(param1);
		}

		private alignDataSeries(param1: com.google.finance.DataSeries, param2: com.google.finance.DataSeries) 
		{
			let _loc8_ = NaN;
			if (param1.units.length === 0 || param2.units.length === 0)
				return;

			let _loc3_ = param1.units[0].time;
			let _loc4_ = DataSource.getTimeIndex(_loc3_, param2.units);
			let _loc5_ = param2.units[_loc4_].relativeMinutes;
			let _loc6_ = param1.units[0].relativeMinutes;
			for (let _loc7_ = 0; _loc7_ < param1.units.length; _loc7_++)
			{
				_loc8_ = param1.units[_loc7_].relativeMinutes - _loc6_;
				param1.units[_loc7_].relativeMinutes = _loc5_ + _loc8_;
			}
		}

		selectObject(param1: string, param2: number, param3?: string): StockAssociatedObject | null
		{
			let _loc4_: StockAssociatedObject | null = null;
			if (this.objects[param1] === undefined)
				return null;

			for (let _loc5_ = 0; _loc5_ < this.objects[param1].length; _loc5_++)
			{
				this.objects[param1][_loc5_].active = false;
				if (param1 === "newspin")
					(<PinPoint>this.objects[param1][_loc5_]).forceExpandInGroup = false;

				if (this.objects[param1][_loc5_].id === param2 && (!param3 || (<PinPoint>this.objects[param1][_loc5_]).letter === param3))
				{
					this.objects[param1][_loc5_].active = true;
					_loc4_ = this.objects[param1][_loc5_];
				}
			}
			return _loc4_;
		}

		private objectInTheFuture(param1: StockAssociatedObject, param2: com.google.finance.DataSeries): boolean
		{
			let _loc3_: DataUnit;
			let _loc8_ = NaN;
			if (Const.INDICATOR_ENABLED)
			{
				let _loc6_ = param2.getPointsInIntervalArray(Const.INTRADAY_INTERVAL);
				let _loc7_ = notnull(param1.posInInterval)[Const.INTRADAY_INTERVAL];
				if (!_loc6_ || _loc6_.length === 0 || !_loc7_ || _loc7_.position !== _loc6_.length - 1)
					return false;

				_loc3_ = _loc6_[_loc6_.length - 1];
			}
			else
			{
				_loc8_ = param2.units.length;
				if (param1.pos !== _loc8_ - 1)
					return false;

				_loc3_ = param2.units[_loc8_ - 1];
			}
			let _loc4_ = _loc3_.exchangeDateInUTC;
			let _loc5_ = new Date(param1.time + _loc3_.timezoneOffset);
			if (_loc5_.getUTCFullYear() < _loc4_.getUTCFullYear())
				return false;

			if (_loc5_.getUTCFullYear() > _loc4_.getUTCFullYear())
				return true;

			if (_loc5_.getUTCMonth() < _loc4_.getUTCMonth())
				return false;

			if (_loc5_.getUTCMonth() < _loc4_.getUTCMonth())
				return true;

			if (_loc5_.getUTCDate() < _loc4_.getUTCDate())
				return false;

			if (_loc5_.getUTCDate() > _loc4_.getUTCDate())
				return true;

			return false;
		}

		private extractAfterHoursSessions(param1: com.google.finance.IntervalSet) 
		{
			if (this.afterHoursData.units.length === 0)
				return;

			let _loc2_ = this.afterHoursData.units[0];
			let _loc3_ = notnull(this.afterHoursData.getSessionForMinute(_loc2_.dayMinute));
			let _loc4_ = 0;
			let _loc5_ = 0;
			for (let _loc6_ = 0; _loc6_ < this.afterHoursData.units.length; _loc6_++)
			{
				_loc2_ = this.afterHoursData.units[_loc6_];
				if (_loc2_.dayMinute === _loc3_.start)
				{
					_loc4_ = _loc6_;
				}
				else if (_loc2_.dayMinute === _loc3_.end)
				{
					_loc5_ = _loc6_;
					param1.addInterval(_loc4_, _loc5_);
					if (_loc6_ < this.afterHoursData.units.length - 1)
					{
						_loc2_ = this.afterHoursData.units[_loc6_ + 1];
						_loc3_ = notnull(this.afterHoursData.getSessionForMinute(_loc2_.dayMinute));
					}
				}
			}
		}

		computeObjectPositions() 
		{
			let _loc6_ = NaN;
			for (let _loc1_ in this.objects)
			{
				let _loc2_ = this.objects[_loc1_];
				let _loc3_ = _loc2_.length - 1;
				while (_loc3_ >= 0)
				{
					let _loc4_ = _loc2_[_loc3_];
					if (Const.INDICATOR_ENABLED)
					{
						let _loc5_ = this.getObjectPositionsInInterval(_loc2_[_loc3_].time);
						_loc4_.posInInterval = _loc5_.posInInterval;
						_loc6_ = _loc5_.closePrice;
					}
					else
					{
						let seriesPosition = this.getObjectPositions(_loc2_[_loc3_].time, this.data);
						if (seriesPosition.pos >= 0 && seriesPosition.pos < notnull(seriesPosition.refDataSeries).units.length)
						{
							_loc4_.pos = seriesPosition.pos;
							_loc4_.dayPos = seriesPosition.dayPos;
							_loc4_.refDataSeries = seriesPosition.refDataSeries;
							_loc6_ = notnull(seriesPosition.refDataSeries).units[seriesPosition.pos].close;
						}
					}
					if (_loc1_ === "dividend")
					{
						let _loc7_ = <Dividend>_loc4_;
						_loc7_.yield = _loc7_.amount / _loc6_;
					}
					_loc3_--;
				}
				_loc2_.sort(StockAssociatedObject.compare);
			}
		}

		getRelativeMinutesState(): number
		{
			return this.relativeMinutesState;
		}

		hasEvent(param1: string): boolean
		{
			return !!this.events[param1];
		}

		mergePoints(param1: DataUnit[], param2: DataUnit[], param3: boolean, param4: number): DataUnit[]
		{
			let _loc8_: DataUnit;
			let _loc5_: DataUnit[] = [];
			let _loc6_ = 0;
			let _loc7_ = 0;
			while (_loc6_ < param1.length || _loc7_ < param2.length)
			{
				if (_loc6_ === param1.length)
				{
					while (_loc7_ < param2.length)
					{
						_loc5_.push(param2[_loc7_]);
						_loc7_++;
					}
				}
				else if (_loc7_ === param2.length)
				{
					while (_loc6_ < param1.length)
					{
						_loc5_.push(param1[_loc6_]);
						_loc6_++;
					}
				}
				else if (param1[_loc6_].time < param2[_loc7_].time)
				{
					_loc5_.push(param1[_loc6_++]);
				}
				else if (param1[_loc6_].time === param2[_loc7_].time)
				{
					if (param3 && param1[_loc6_].fake || param2[_loc7_].realtime && param4 <= _loc6_ || param2[_loc7_].coveredDays < param1[_loc6_].coveredDays)
						_loc8_ = param2[_loc7_];
					else
						_loc8_ = param1[_loc6_];

					_loc5_.push(_loc8_);
					_loc8_.addVolumeInfo(param1[_loc6_]);
					_loc8_.addVolumeInfo(param2[_loc7_]);
					_loc6_++;
					_loc7_++;
				}
				else
				{
					_loc5_.push(param2[_loc7_++]);
				}
			}
			return _loc5_;
		}

		private extractSessions(param1: string, param2: com.google.finance.DataSeries) 
		{
			param1 = param1.slice(1, param1.length - 1);
			let _loc3_ = param1.split("],[");
			for (let _loc4_ = 0; _loc4_ < _loc3_.length; _loc4_++)
			{
				let _loc5_ = _loc3_[_loc4_].split(",");
				let _loc6_ = Number(_loc5_[1]);
				let _loc7_ = Number(_loc5_[2]);
				param2.addDataSession(_loc6_, _loc7_, _loc5_[0]);
			}
		}

		getClosestDataUnitAfterMinute(param1: number): DataUnit | null
		{
			let _loc2_ = this.afterHoursData.getRelativeMinuteIndex(param1);
			let _loc3_ = this.afterHoursData.units[_loc2_ + 1];
			let _loc4_ = this.data.getRelativeMinuteIndex(param1);
			let _loc5_ = this.data.units[_loc4_ + 1];
			if (!_loc3_ && !_loc5_)
				return null;

			if (!_loc3_)
				return _loc5_;

			if (!_loc5_)
				return _loc3_;

			if (param1 > _loc5_.relativeMinutes && param1 > _loc3_.relativeMinutes)
				return null;

			if (this.visibleExtendedHours.length() === 0 || isNaN(_loc3_.relativeMinutes) || _loc3_.relativeMinutes < param1)
				return _loc5_;

			if (_loc5_.relativeMinutes < param1)
				return _loc3_;

			if (_loc5_.relativeMinutes - param1 < _loc3_.relativeMinutes - param1)
				return _loc5_;

			return _loc3_;
		}

		addObject(param1: any) 
		{
			if (!param1)
				return;

			let _loc2_ = param1._type ? param1._type : "newspin";
			if (!this.objects[_loc2_])
				this.objects[_loc2_] = [];

			let _loc3_ = 0;
			if (param1._date instanceof Date)
				_loc3_ = param1._date.getTime();
			else if (!isNaN(param1._date))
				_loc3_ = Number(param1._date) * 1000;
			else
				return;

			let _loc4_: StockAssociatedObject;
			let _loc6_ = NaN;
			let _loc7_ = NaN;

			let _loc8_: DataSeries | null;
			let _loc9_: SeriesPosition[] | null;
			let _loc10_ = NaN;
			let _loc11_ = NaN;

			if (Const.INDICATOR_ENABLED)
			{
				let _loc52_ = this.getObjectPositionsInInterval(_loc3_);
				if (isNaN(_loc52_.exchangeTimezoneOffset))
					return;

				_loc11_ = _loc52_.exchangeTimezoneOffset;
				_loc10_ = _loc52_.closePrice;
				_loc9_ = _loc52_.posInInterval;
				_loc8_ = null;
			}
			else
			{
				let _loc5_ = this.getObjectPositions(_loc3_, this.data);
				let dataSeries = notnull(_loc5_.refDataSeries);
				if (_loc5_.pos < 0 || _loc5_.pos >= dataSeries.units.length)
					return;

				_loc11_ = dataSeries.units[_loc5_.pos].timezoneOffset;
				_loc10_ = dataSeries.units[_loc5_.pos].close;
				_loc6_ = _loc5_.pos;
				_loc7_ = notnull(_loc5_.dayPos);
				_loc8_ = _loc5_.refDataSeries;
				_loc9_ = null;
			}
			let _loc12_ = Utils.newDateInTimezone(new Date(_loc3_), _loc11_);
			switch (_loc2_)
			{
				case "newspin":
					_loc4_ = new PinPoint(_loc6_, _loc7_, _loc9_, _loc3_, _loc12_, param1._id, this.quoteName, param1._letter);
					break;
				case "split":
					_loc4_ = new Split(_loc6_, _loc7_, _loc9_, _loc3_, _loc12_, param1._id, this.quoteName, param1._old_shares, param1._new_shares);
					if (this.objectInTheFuture(_loc4_, this.data))
						return;
					break;
				case "dividend":
					_loc4_ = new Dividend(_loc6_, _loc7_, _loc9_, _loc3_, _loc12_, param1._id, this.quoteName, param1._amount, param1._amount_currency, _loc10_);
					if (this.objectInTheFuture(_loc4_, this.data))
						return;
					break;
				case "stock_dividend":
					_loc4_ = new StockDividend(_loc6_, _loc7_, _loc9_, _loc3_, _loc12_, param1._id, this.quoteName, param1._ticker, param1._adjustment_factor);
					if (this.objectInTheFuture(_loc4_, this.data))
						return;
					break;
				default:
					_loc4_ = new StockAssociatedObject(_loc6_, _loc7_, _loc9_, _loc3_, _loc12_, param1._id, this.quoteName);
					break;
			}
			_loc4_.originalObject = param1;
			_loc4_.refDataSeries = _loc8_;
			this.objects[_loc2_].push(_loc4_);
		}

		eventDone(param1: string) 
		{
			this.events[param1] = ChartEventTypes.DONE;
		}

		private addAHStreamForPointsInIntervals(param1: DataUnit[]) 
		{
			this.afterHoursData.setPointsInIntervalArray(Const.INTRADAY_INTERVAL, param1);
		}

		dayIndexHasVisibleExtendedHours(param1: number): boolean
		{
			if (this.visibleExtendedHours.length() === 0)
				return false;

			let _loc2_ = this.data.units[this.data.days[param1]];
			if (param1 === this.data.days.length - 1)
				return _loc2_.relativeMinutes !== 0;

			let _loc3_ = this.data.units[this.data.days[param1] + 1];
			if (this.data.minuteIsEndOfDataSession(_loc2_.dayMinute) && this.data.minuteIsEndOfDataSession(_loc3_.dayMinute))
				return false;

			return _loc3_.relativeMinutes - _loc2_.relativeMinutes !== 1;
		}

		isEmpty(): boolean
		{
			return this.data.points.length === 0;
		}

		getVisibleDataUnitForMinute(param1: number): DataUnit
		{
			let _loc2_ = NaN;
			if (this.visibleExtendedHours.length() > 0)
				return notnull(this.getClosestDataUnitLessThen(param1));

			_loc2_ = this.data.getRelativeMinuteIndex(param1);
			let _loc3_ = this.data.units[_loc2_];
			return _loc3_;
		}

		private getObjectPositions(param1: number, param2: com.google.finance.DataSeries): SeriesPosition
		{
			let _loc3_ = NaN;
			let _loc14_ = NaN;
			let _loc15_ = NaN;
			let _loc16_ = NaN;
			let _loc4_ = param2.units;
			let _loc5_ = param2.days;
			let _loc6_ = DataSource.getTimeIndex(param1, _loc4_);
			if (_loc6_ === -1)
				return new SeriesPosition(null, -1, -1);

			if (_loc6_ === 0 && param1 < _loc4_[0].time)
				return new SeriesPosition(param2, 0, 0);

			let _loc7_ = new Date(param1);
			if (_loc4_[_loc6_].dayMinute === param2.marketCloseMinute)
			{
				let _loc13_ = new Date(_loc4_[_loc6_].time);
				let _loc11_ = Utils.getDateInTimezone(_loc13_, _loc4_[_loc6_].timezoneOffset);
				let _loc12_ = Utils.getDateInTimezone(_loc7_, _loc4_[_loc6_].timezoneOffset);
				if (_loc11_ < _loc12_)
				{
					if (_loc6_ < _loc4_.length - 1)
					{
						_loc13_ = new Date(_loc4_[_loc6_ + 1].time);
						_loc14_ = Utils.getDateInTimezone(_loc13_, _loc4_[_loc6_].timezoneOffset);
					}
					else
					{
						_loc14_ = _loc11_;
					}

					if (_loc14_ === _loc12_)
						_loc3_ = _loc5_[param2.getNextDayStart(_loc6_ + 1)];
					else
						_loc3_ = _loc6_;

					if (_loc6_ < _loc4_.length - 1 && _loc4_[_loc6_ + 1].dayMinute === param2.marketCloseMinute)
						_loc6_ = _loc3_;
				}
				else if (_loc11_ > _loc12_)
				{
					if (_loc6_ > 0)
					{
						_loc16_ = param2.getPrevDayStart(_loc6_);
						_loc13_ = new Date(_loc4_[_loc16_].time);
						_loc15_ = Utils.getDateInTimezone(_loc13_, _loc4_[_loc6_].timezoneOffset);
					}
					else
					{
						_loc16_ = _loc6_;
						_loc15_ = _loc11_;
					}

					if (_loc15_ === _loc12_)
						_loc3_ = _loc5_[param2.getPrevDayStart(_loc6_)];
					else
						_loc3_ = _loc6_;

					if (_loc6_ === 0 || _loc4_[_loc6_ - 1].dayMinute === param2.marketCloseMinute)
						_loc6_ = _loc3_;
				}
				else
				{
					_loc3_ = _loc6_;
				}
			}
			else
			{
				_loc3_ = _loc5_[param2.getNextDayStart(_loc6_)];
			}
			let _loc8_ = _loc4_[_loc6_];
			let _loc9_: DataUnit | null = null;
			if (_loc6_ < _loc4_.length - 1)
				_loc9_ = _loc4_[_loc6_ + 1];

			let _loc10_ = param2;
			if (!_loc9_ && _loc8_.relativeMinutes !== 0 || _loc9_ && _loc8_.dayMinute === param2.marketCloseMinute && _loc9_.dayMinute === param2.marketOpenMinute && _loc9_.relativeMinutes - _loc8_.relativeMinutes > 1)
			{
				if (this.afterHoursData.units.length !== 0)
				{
					if (!_loc9_)
					{
						_loc6_ = this.afterHoursData.units.length - 1;
						_loc9_ = this.afterHoursData.units[_loc6_];
					}
					_loc6_ = DataSource.getTimeIndex(param1, this.afterHoursData.units);
					_loc3_ = DataSource.getTimeIndex(_loc9_.time, this.afterHoursData.units);
					_loc10_ = this.afterHoursData;
				}
			}
			return new SeriesPosition(_loc10_, _loc6_, _loc3_);
		}

		objectsToString(): string
		{
			let _loc1_ = "";
			for (let _loc2_ in this.objects)
				_loc1_ = _loc1_ + (", " + this.objects[_loc2_].toString());
			return _loc1_;
		}

		markEvent(param1: ChartEvent, param2: ChartEventTypes): boolean
		{
			let _loc3_ = param1.getEventName();
			if (param1.period === "5Y")
			{
				let _loc4_ = param1.getEventName("40Y");
				if (this.hasEvent(_loc4_))
					return false;
			}
			if (this.hasEvent(_loc3_))
			{
				if (this.events[_loc3_] < param2)
				{
					this.events[_loc3_] = param2;
					return true;
				}
				return false;
			}
			this.events[_loc3_] = param2;
			return true;
		}

		clearAllObjects(param1: string) 
		{
			this.objects[param1] = [];
		}

		getEndOfDayDataUnitFor(param1: number): DataUnit
		{
			let _loc2_ = DataSource.getMinuteMetaIndex(param1, this.data.days, this.data.units);
			if (_loc2_ === -1)
				return this.data.units[this.data.days[0]];

			let _loc3_ = this.data.days[_loc2_];
			if (_loc3_ + 1 < this.data.units.length && this.data.minuteIsEndOfDataSession(this.data.units[_loc3_ + 1].dayMinute))
			{
				if (param1 === this.data.units[_loc3_].relativeMinutes)
					return this.data.units[_loc3_];

				return this.data.units[_loc3_ + 1];
			}
			if (_loc3_ + 1 < this.data.units.length && param1 >= this.data.units[_loc3_ + 1].relativeMinutes)
			{
				_loc2_++;
				_loc3_ = this.data.days[_loc2_];
			}
			if (!this.dayIndexHasVisibleExtendedHours(_loc2_))
			{
				_loc3_ = this.data.days[_loc2_];
				return this.data.units[_loc3_];
			}
			let _loc4_ = DataSource.getMinuteMetaIndex(param1, this.afterHoursData.days, this.afterHoursData.units);
			let _loc5_ = this.afterHoursData.days[_loc4_];
			if (param1 > this.afterHoursData.units[_loc5_].relativeMinutes && _loc4_ + 1 < this.afterHoursData.days.length)
				_loc5_ = this.afterHoursData.days[_loc4_ + 1];

			let _loc6_ = this.afterHoursData.units[_loc5_];
			let _loc7_ = this.data.units[_loc3_];
			if (param1 > _loc7_.relativeMinutes && _loc2_ + 1 < this.data.days.length)
			{
				_loc3_ = this.data.days[_loc2_ + 1];
				_loc7_ = this.data.units[_loc3_];
			}
			let _loc8_ = this.getClosestDataUnitLessThen(param1);
			if (!_loc8_)
				return _loc7_;

			if (Utils.compareUtcDates(_loc8_.exchangeDateInUTC, _loc7_.exchangeDateInUTC) === 0 && Utils.compareUtcDates(_loc8_.exchangeDateInUTC, _loc6_.exchangeDateInUTC) === 0)
			{
				if (_loc6_.time > _loc7_.time)
					return _loc6_;

				return _loc7_;
			}
			if (Utils.compareUtcDates(_loc8_.exchangeDateInUTC, _loc6_.exchangeDateInUTC) === 0)
				return _loc6_;

			if (Utils.compareUtcDates(_loc8_.exchangeDateInUTC, _loc7_.exchangeDateInUTC) === 0)
				return _loc7_;

			return _loc7_;
		}

		private checkHeaderSanity(param1: { [key: string]: string }, param2: com.google.finance.DataSeries) 
		{
			let _loc5_ = NaN;
			let _loc3_ = param1[DataSource.MARKET_CLOSE_MINUTE_STR];
			let _loc4_ = param1[DataSource.MARKET_OPEN_MINUTE_STR];
			if (_loc4_)
				param2.marketOpenMinute = Number(_loc4_);

			if (_loc3_)
			{
				param2.marketCloseMinute = Number(_loc3_);
				if (this.quoteName.indexOf("CURRENCY") >= 0)
				{
					_loc5_ = (param2.marketCloseMinute - param2.marketOpenMinute) % this.intradayMinutesInterval;
					param2.marketCloseMinute = param2.marketCloseMinute - _loc5_;
				}
			}
			if (Number(_loc3_) - Number(_loc4_) < 30)
			{
				param2.marketCloseMinute = Const.MARKET_CLOSE_MINUTE;
				param2.marketOpenMinute = Const.MARKET_OPEN_MINUTE;
			}

			if (param1[DataSource.DATA_SESSIONS_STR])
				this.extractSessions(param1[DataSource.DATA_SESSIONS_STR], param2);
			else
				param2.addDataSession(param2.marketOpenMinute, param2.marketCloseMinute, Const.REGULAR_MARKET_NAME);

			param2.marketDayLength = param2.allSessionsLength();
		}

		setRelativeMinutesState(param1: number) 
		{
			this.relativeMinutesState = param1;
		}

		private getObjPos(param1: string, param2: number): number
		{
			if (this.objects[param1] === undefined)
				return -1;

			let _loc3_ = this.objects[param1].length - 1;
			while (_loc3_ >= 0)
			{
				if (this.objects[param1][_loc3_].id === param2)
					return _loc3_;

				_loc3_--;
			}
			return -1;
		}

		private addFakeDataUnits(param1: DataUnit[], param2: DataUnit, param3: com.google.finance.DataSeries, param4: number, param5: number, param6 = 0) 
		{
			let _loc9_ = NaN;
			if (param4 === 0)
				return;

			let _loc8_ = param4;
			while (_loc8_ > 0)
			{
				let _loc7_ = new DataUnit(param2.close, param2.high, param2.low, param2.open);
				_loc7_.volumes[this.baseInterval] = 0;
				_loc7_.intervals[0] = this.baseInterval;
				_loc9_ = param6 * Const.MS_PER_MINUTE;
				switch (param5)
				{
					case Const.BACKWARD:
						_loc9_ = _loc9_ + (param2.time - _loc8_ * this.baseInterval * 1000);
						break;
					case Const.FORWARD:
						_loc9_ = _loc9_ + (param2.time + (param4 - _loc8_ + 1) * this.baseInterval * 1000);
						break;
				}
				_loc7_.setDate(_loc9_, param2.timezoneOffset);
				_loc7_.fake = true;
				_loc7_.duplicate = param3.minuteIsStartOfDataSession(_loc7_.dayMinute);
				param1.push(_loc7_);
				_loc8_--;
			}
		}

		clearAllIndicatorsOnAddData(param1: number) 
		{
			for (let _loc2_ in this.indicators)
			{
				if (this.indicators[_loc2_].clearAllOnAddData)
					this.indicators[_loc2_].clear();
				else
					this.indicators[_loc2_].clear(param1);
			}
		}

		clearCoalescedChildren() 
		{
			this.data.clearCoalescedChildren();
		}

		clearAllIndicators() 
		{
			for (let _loc1_ in this.indicators)
				this.indicators[_loc1_].clear();
		}

		isTradeHaltedInterday(param1: DataUnit, param2: DataUnit, param3: number): boolean
		{
			if (param3 < Const.DAILY_INTERVAL)
				return false;

			if (param1.volumes[param3] > 0)
				return false;

			return param2.close === param1.close && (isNaN(param1.open) || param1.open === param1.close) && (isNaN(param1.high) || param1.high === param1.close) && (isNaN(param1.low) || param1.low === param1.close);
		}

		removeObject(param1: string, param2: number) 
		{
			let _loc3_ = this.getObjPos(param1, param2);
			if (_loc3_ !== -1)
				this.objects[param1].splice(_loc3_, 1);
		}

		private addAfterHoursUnitToLastMinute(param1: DataUnit, param2: DataUnit[], param3: StartEndPair | undefined, param4: com.google.finance.DataSeries) 
		{
			let _loc5_ = 0;
			if (!param3)
				return;

			let _loc6_ = param4.getSessionIndex(param3.start);
			if (param2.length === 0)
			{
				this.addFakeDataUnitsForSessions(param2, param1, param4, 0, _loc6_, Const.BACKWARD);
				this.makeDataUnitEndOfDay(param1, param2, param3, param4);
				return;
			}
			let _loc7_ = param2[param2.length - 1];
			let _loc8_ = notnull(param4.getSessionForMinute(_loc7_.dayMinute));
			let _loc9_ = param4.getSessionIndex(_loc7_.dayMinute);
			if (_loc7_ && _loc7_.dayMinute < _loc8_.end)
			{
				_loc5_ = (_loc8_.end - _loc7_.dayMinute) / this.baseMinutesInterval;
				this.addFakeDataUnits(param2, _loc7_, param4, _loc5_, Const.FORWARD);
				_loc7_ = param2[param2.length - 1];
			}
			let _loc10_ = (param1.time - _loc7_.time) / Const.MS_PER_MINUTE;
			let _loc11_ = param3.end - param3.start;
			let _loc12_ = param1.dayMinute - param3.end;
			if (_loc10_ > _loc12_ + _loc11_)
			{
				if (!DataSource.unitsInDifferentDays(_loc7_, param1))
				{
					this.addFakeDataUnitsForSessions(param2, param2[param2.length - 1], param4, _loc9_ + 1, _loc6_, Const.FORWARD);
				}
				else
				{
					this.addFakeDataUnitsForSessions(param2, param2[param2.length - 1], param4, _loc9_ + 1, param4.dataSessions.length(), Const.FORWARD);
					this.addFakeDataUnitsForSessions(param2, param1, param4, 0, _loc6_, Const.BACKWARD);
				}
				this.makeDataUnitEndOfDay(param1, param2, param3, param4);
			}
			else
			{
				_loc7_.close = param1.close;
				if (!isNaN(_loc7_.high) && _loc7_.high < _loc7_.close)
					_loc7_.high = _loc7_.close;

				if (!isNaN(_loc7_.low) && _loc7_.low > _loc7_.close)
					_loc7_.low = _loc7_.close;

				let _loc13_ = param1.intervals[0];
				_loc7_.volumes[_loc13_] = _loc7_.volumes[_loc13_] + param1.volumes[_loc13_];
			}
		}

		private getDataUnitNoValidation(param1: string[], param2: number[], param3: { [key: string]: string }): DataUnit
		{
			let _loc6_ = NaN;
			let _loc7_ = NaN;
			let _loc4_ = new DataUnit(NaN, NaN, NaN, NaN);
			for (let _loc5_ = 0; _loc5_ < param2.length; _loc5_++)
			{
				if (param2[_loc5_] === DataSource.COL_DATE_TYPE)
				{
					if (isNaN(Number(param1[_loc5_])))
					{
						this.lastAbsTime = Number(param1[_loc5_].substr(1));
						_loc6_ = this.lastAbsTime * 1000;
					}
					else
					{
						_loc7_ = this.lastAbsTime + Number(param1[_loc5_]) * this.baseInterval;
						_loc6_ = _loc7_ * 1000;
					}
					_loc4_.setDate(_loc6_, this.timezoneOffset);
				}
				else if (param2[_loc5_] === DataSource.COL_CLOSE_TYPE)
				{
					_loc4_.close = Number(param1[_loc5_]);
				}
				else if (param2[_loc5_] === DataSource.COL_OPEN_TYPE)
				{
					_loc4_.open = Number(param1[_loc5_]);
				}
				else if (param2[_loc5_] === DataSource.COL_LOW_TYPE)
				{
					_loc4_.low = Number(param1[_loc5_]);
				}
				else if (param2[_loc5_] === DataSource.COL_HIGH_TYPE)
				{
					_loc4_.high = Number(param1[_loc5_]);
				}
				else if (param2[_loc5_] === DataSource.COL_VOLUME_TYPE)
				{
					// TODO
					_loc4_.volumes[Number(param3[DataSource.INTERVAL_STR])] = Number(param1[_loc5_]);
					_loc4_.intervals.push(this.baseInterval);
				}
				else if (param2[_loc5_] === DataSource.COL_CDAYS_TYPE)
				{
					_loc4_.coveredDays = Number(param1[_loc5_]);
				}
			}
			return _loc4_;
		}
	}
}
