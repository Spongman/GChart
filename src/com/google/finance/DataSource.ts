namespace com.google.finance
{
	export class SeriesPosition
	{
		position: number;
		constructor(public refDataSeries: DataSeries|null, public pos: number, public dayPos: number | null = null)
		{
		}
	}

	enum ColumnTypes
	{
		COL_DATE_TYPE = 1,
		COL_CLOSE_TYPE = 2,
		COL_HIGH_TYPE = 3,
		COL_LOW_TYPE = 4,
		COL_OPEN_TYPE = 5,
		COL_VOLUME_TYPE = 6,
		COL_CDAYS_TYPE = 7,
	}

	export class DataSource
	{

		
		private static readonly COLUMNS_STR = "COLUMNS";
		private static readonly INTERVAL_STR = "INTERVAL";
		private static readonly MARKET_CLOSE_MINUTE_STR = "MARKET_CLOSE_MINUTE";
		private static readonly DATA_SESSIONS_STR = "DATA_SESSIONS";
		private static readonly TIMEZONE_OFFSET_STR = "TIMEZONE_OFFSET";
		private static readonly EXCHANGE_STR = "EXCHANGE";
		private static readonly MARKET_OPEN_MINUTE_STR = "MARKET_OPEN_MINUTE";
		private static readonly DATA_STR = "DATA";
		/*
		private static readonly SESSIONS_STR = "SESSIONS";
		private static readonly DATE_FORMAT_STR = "DATE_FORMAT";
		private static readonly ABSOLUTE_DATE_CHAR = "a";
		*/

		static readonly RELATIVE_MINUTES_NOT_READY = 0;
		static readonly DMS_RELATIVE_MINUTES_READY = 2;
		static readonly RELATIVE_MINUTES_READY = 1;

		private columnNames = ["DATE", "CLOSE", "HIGH", "LOW", "OPEN", "VOLUME", "CDAYS"];
		private baseMinutesInterval: number;
		private baseInterval: number;
		private quoteType: QuoteTypes;
		private allowedOffset = 10;
		private relativeMinutesState = DataSource.RELATIVE_MINUTES_NOT_READY;
		private lastAbsTime: number;
		private timezoneOffset: number;

		private readonly events: { [key: string]: ChartEventPriorities } = {};
		
		visibleExtendedHours = new com.google.finance.IntervalSet();
		readonly objects: { [key: string]: StockAssociatedObject[] } = {};
		readonly data = new com.google.finance.DataSeries();
		tickerName: string;
		readonly indicators: { [name: string]: Indicator } = {};
		hiddenExtendedHours = new com.google.finance.IntervalSet();
		readonly afterHoursData = new com.google.finance.DataSeries();
		technicalsName: string;
		dataUnavailableOnServer: boolean = false;
		intradayMinutesInterval = Const.INTRADAY_INTERVAL / Const.SEC_PER_MINUTE;
		firstOpenRelativeMinutes = 0;

		constructor(public readonly quoteName: string, private readonly weekdayBitmap = 62, public displayName?: string)
		{
			this.quoteType = Const.getQuoteType(quoteName);
			if (quoteName.indexOf("@") !== -1)
			{
				const _loc4_ = quoteName.split("@");
				this.tickerName = _loc4_[0];
				this.technicalsName = _loc4_[1];
			}
			else
			{
				this.tickerName = quoteName;
				this.technicalsName = "";
			}
		}

		private static unitsInDifferentDays(dataUnit1: DataUnit, dataUnit2: DataUnit | null): boolean
		{
			if (!dataUnit2 || !dataUnit1)
				return true;

			if (dataUnit1.exchangeDateInUTC.getUTCDay() !== dataUnit2.exchangeDateInUTC.getUTCDay())
				return true;

			if (Math.abs(dataUnit1.time - dataUnit2.time) > Const.MS_PER_DAY)
				return true;

			return false;
		}

		static getMinuteMetaIndex(param1: number, param2: number[], dataUnits: DataUnit[]): number
		{
			let _loc6_ = 0;
			if (isNaN(param1) || !dataUnits || dataUnits.length === 0 || param2.length === 0)
				return -1;

			let _loc4_ = 0;
			let _loc5_ = param2.length - 1;
			while (true)
			{
				_loc6_ = Math.round((_loc4_ + _loc5_) / 2);
				if (_loc6_ === 0 && dataUnits[param2[0]].relativeMinutes > param1)
					break;

				if (_loc6_ === param2.length - 1 && dataUnits[param2[_loc6_]].relativeMinutes < param1)
					return param2.length - 1;

				if (dataUnits[param2[_loc6_]].relativeMinutes === param1)
					return _loc6_;

				if (_loc4_ >= _loc5_ - 1)
					return _loc4_;

				if (dataUnits[param2[_loc6_]].relativeMinutes < param1)
					_loc4_ = _loc6_;
				else
					_loc5_ = _loc6_;
			}
			return 0;
		}

		static getTimeIndex(param1: number, dataUnits: DataUnit[]): number
		{
			let _loc5_ = 0;
			if (isNaN(param1) || !dataUnits || dataUnits.length === 0)
				return -1;

			let _loc3_ = 0;
			let _loc4_ = dataUnits.length - 1;
			while (true)
			{
				_loc5_ = Math.round((_loc3_ + _loc4_) / 2);
				if (_loc5_ === 0 && dataUnits[0].time > param1)
					break;

				if (_loc5_ === dataUnits.length - 1 && dataUnits[_loc5_].time < param1)
					return dataUnits.length - 1;

				if (dataUnits[_loc5_].time === param1)
					return _loc5_;

				if (_loc3_ >= _loc4_ - 1)
					return _loc3_;

				if (dataUnits[_loc5_].time < param1)
					_loc3_ = _loc5_;
				else
					_loc4_ = _loc5_;
			}
			return 0;
		}

		computeStarts(param1: com.google.finance.DataSeries) 
		{
			let _loc3_ = -1;
			param1.years.length = 0;
			param1.firsts.length = 0;
			param1.fridays.length = 0;
			param1.days.length = 0;
			const units = param1.units;
			let session = notnull(param1.getSessionForMinute(units[0].dayMinute));
			const lastDayOfWeek = Utils.getLastDayOfWeek(this.weekdayBitmap);
			for (let unitIndex = 0; unitIndex < units.length; unitIndex++)
			{
				const _loc8_ = units[unitIndex];
				const _loc9_ = unitIndex === units.length - 1 ? null : units[unitIndex + 1];
				if (_loc8_.dayMinute === session.end)
				{
					if (DataSource.unitsInDifferentDays(_loc8_, _loc9_))
					{
						param1.days.push(unitIndex);
						if (_loc8_.exchangeDateInUTC.getUTCMonth() !== _loc3_)
						{
							param1.firsts.push(unitIndex);
							_loc3_ = _loc8_.exchangeDateInUTC.getUTCMonth();
							if (_loc3_ === 0)
								param1.years.push(unitIndex);
						}
						const day = _loc8_.exchangeDateInUTC.getUTCDay();
						let _loc11_ = Number.POSITIVE_INFINITY;
						if (_loc9_)
							_loc11_ = _loc9_.exchangeDateInUTC.getUTCDay();

						if (day === lastDayOfWeek || _loc8_.coveredDays > 1 || unitIndex < units.length - 1 && day > _loc11_)
							param1.fridays.push(unitIndex);
					}
					if (_loc9_)
						session = notnull(param1.getSessionForMinute(_loc9_.dayMinute));
				}
			}
		}

		addStream(param1: string, param2: ChartEvent): AddStreamResults
		{
			const _loc3_ = this.data.points.length !== 0;
			this.clearAllIndicatorsOnAddData(Number(param2.interval));
			this.clearCoalescedChildren();
			if (param1.indexOf(DataSource.EXCHANGE_STR) !== 0)
				return AddStreamResults.ERROR;

			const _loc4_ = param1.split("\n");
			let data = this.data;
			switch (param2.type)
			{
				case ChartEventTypes.GET_AH_DATA:
				case ChartEventTypes.GET_RT_AH_DATA:
					data = this.afterHoursData;
					break;
			}

			const _loc6_ = this.parseHeader(_loc4_, param2);
			if (!_loc6_)
				return AddStreamResults.ERROR;

			this.checkHeaderSanity(_loc6_, data);
			const _loc7_ = Utils.assocArrayLength(_loc6_) + 1;
			this.baseInterval = Number(_loc6_[DataSource.INTERVAL_STR]);
			if (param2.detailType !== ChartEventStyles.GET_RT_DATA && param2.detailType !== ChartEventStyles.GET_RT_AH_DATA)
			{
				const _loc15_ = _loc6_[DataSource.COLUMNS_STR].split(",");
				if (_loc15_.indexOf(this.columnNames[ColumnTypes.COL_OPEN_TYPE]) !== -1 && _loc15_.indexOf(this.columnNames[ColumnTypes.COL_HIGH_TYPE]) !== -1 && _loc15_.indexOf(this.columnNames[ColumnTypes.COL_LOW_TYPE]) !== -1)
					this.eventOhlcDone(param2.getEventName());
				else
					this.eventDone(param2.getEventName());
			}
			const units = data.units;
			const _loc9_ = this.parseStream(_loc4_.slice(_loc7_), _loc6_, data);
			if (!_loc9_)
				return AddStreamResults.ERROR;

			if (_loc9_.length === 0)
			{
				data.setNoPointsInIntervalArray(this.baseInterval);
				return AddStreamResults.ADDED_DATA;
			}

			const lastRealPointIndex = Utils.getLastRealPointIndex(_loc9_);
			let _loc11_ = false;
			if (Const.INDICATOR_ENABLED)
			{
				switch (param2.detailType)
				{
					case ChartEventStyles.GET_10D_DATA:
					case ChartEventStyles.GET_30D_DATA:
						this.addStreamForPointsInIntervals(this.baseInterval, _loc9_);
						return AddStreamResults.ADDED_DATA;
					case ChartEventStyles.GET_5D_DATA:
					case ChartEventStyles.GET_1Y_DATA:
					case ChartEventStyles.GET_5Y_DATA:
					case ChartEventStyles.GET_40Y_DATA:
						this.addStreamForPointsInIntervals(this.baseInterval, _loc9_);
						break;
					case ChartEventStyles.GET_AH_DATA:
						this.addAHStreamForPointsInIntervals(_loc9_);
						break;
					case ChartEventStyles.GET_RT_DATA:
						_loc11_ = true;
						const points1 = this.data.getPointsInIntervalArray(Const.INTRADAY_INTERVAL);
						this.addStreamForPointsInIntervals(this.baseInterval, this.mergePoints(_loc9_, points1, _loc11_, lastRealPointIndex));
						break;
					case ChartEventStyles.GET_RT_AH_DATA:
						_loc11_ = true;
						const points2 = this.afterHoursData.getPointsInIntervalArray(Const.INTRADAY_INTERVAL);
						this.addAHStreamForPointsInIntervals(this.mergePoints(_loc9_, points2, _loc11_, lastRealPointIndex));
						break;
				}
			}
			const _loc12_ = this.mergePoints(_loc9_, units, _loc11_, lastRealPointIndex);
			data.units = _loc12_;
			data.points = <any>_loc12_;
			const time = _loc9_[0].time;
			const _loc14_ = _loc9_[_loc9_.length - 1].time;
			data.addIntervalBounds(this.baseInterval, time, _loc14_);
			this.preCalculate(data);
			if (data === this.afterHoursData)
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
				return AddStreamResults.ADDED_DATA;

			if (_loc9_.length === 0)
				return AddStreamResults.NOTHING;

			return AddStreamResults.FIRST_DATA;
		}

		preCalculate(param1: com.google.finance.DataSeries) 
		{
			this.computeStarts(param1);
			this.computeIntradaySessions(param1);
			this.computeObjectPositions();
		}

		getClosestDataUnitLessThen(param1: number): DataUnit | null
		{
			const afterHoursUnit = this.afterHoursData.units[this.afterHoursData.getRelativeMinuteIndex(param1)];
			const unit = this.data.units[this.data.getRelativeMinuteIndex(param1)];
			if (param1 < afterHoursUnit.relativeMinutes && param1 < unit.relativeMinutes)
				return null;

			if (afterHoursUnit.relativeMinutes > param1)
				return unit;

			if (unit.relativeMinutes > param1)
				return afterHoursUnit;

			if (param1 - unit.relativeMinutes < param1 - afterHoursUnit.relativeMinutes)
				return unit;

			return afterHoursUnit;
		}

		getAllDataSessions(param1: number, param2: number): com.google.finance.IntervalSet
		{
			const intervalSet = new com.google.finance.IntervalSet();

			for (let sessionIndex = 0; sessionIndex < this.data.dataSessions.length(); sessionIndex++)
				intervalSet.addPair(this.data.dataSessions.getIntervalAt(sessionIndex));

			if (param1 < this.data.marketOpenMinute)
				intervalSet.addInterval(param1, this.data.marketOpenMinute);

			if (param2 > this.data.marketCloseMinute)
				intervalSet.addInterval(this.data.marketCloseMinute, param2);

			return intervalSet;
		}

		countEvents(param1: ChartEventPriorities): number
		{
			let _loc2_ = 0;
			for (let _loc3_ in this.events)
			{
				if (this.events[_loc3_] === param1)
					_loc2_++;
			}
			return _loc2_;
		}

		private getColumnTypes(param1: string): ColumnTypes[]
		{
			const _loc2_: ColumnTypes[] = [];
			const columnNames = param1.split(",");
			for (let columnNameIndex1 = 0; columnNameIndex1 < columnNames.length; columnNameIndex1++)
			{
				for (let columnNameIndex2 = 0; columnNameIndex2 < this.columnNames.length; columnNameIndex2++)
				{
					if (columnNames[columnNameIndex1] === this.columnNames[columnNameIndex2])
						_loc2_[columnNameIndex1] = columnNameIndex2 + 1;
				}
			}
			return _loc2_;
		}

		eventOhlcDone(param1: string) 
		{
			this.events[param1] = ChartEventPriorities.OHLC_DONE;
		}

		hasEventHappened(param1: ChartEvent): boolean
		{
			const eventName = param1.getEventName();
			return !!this.events[eventName];
		}

		parseStream(param1: string[], param2: { [key: string]: string }, param3: com.google.finance.DataSeries): DataUnit[]
		{
			let _loc20_ = 0;
			let _loc4_ = 0;
			this.baseInterval = Number(param2[DataSource.INTERVAL_STR]);
			this.baseMinutesInterval = this.baseInterval / Const.SEC_PER_MINUTE;
			if (!param1 || param1.length === 0)
				return [];

			const columnTypes = this.getColumnTypes(param2[DataSource.COLUMNS_STR]);
			const _loc6_: DataUnit[] = [];
			let _loc7_ = 0;
			this.timezoneOffset = 0;
			this.lastAbsTime = 0;
			const _loc8_ = DataSource.TIMEZONE_OFFSET_STR.charCodeAt(0);
			let _loc10_: MarketSessionPair | null = null;
			let _loc12_: MarketSessionPair | null = null;
			let _loc13_ = 0;

			do
			{
				const _loc14_ = param1[_loc7_++];
				if (_loc14_.charCodeAt(0) === _loc8_)
				{
					const _loc17_ = _loc14_.split("=");
					this.timezoneOffset = Number(_loc17_[1]);
				}
				else
				{
					const _loc15_ = _loc14_.split(Const.DATA_DELIMITER);
					if (!(_loc15_.length !== columnTypes.length || _loc15_[0].charAt(0) === "&"))
					{
						const dataUnit = this.getDataUnitNoValidation(_loc15_, columnTypes, param2);
						dataUnit.duplicate = param3.minuteIsStartOfDataSession(dataUnit.dayMinute);
						if (Const.INDICATOR_ENABLED && !isNaN(dataUnit.open))
						{
							if (dataUnit.open === 0)
								dataUnit.open = dataUnit.close;

							dataUnit.high = Math.max(dataUnit.high, Math.max(dataUnit.open, dataUnit.close));
							const _loc18_ = Math.min(dataUnit.open, dataUnit.close);
							if (dataUnit.low === 0 || dataUnit.low > _loc18_)
								dataUnit.low = _loc18_;
						}
						if (_loc6_.length === 0)
						{
							_loc12_ = notnull(param3.getSessionForMinute(dataUnit.dayMinute));
							_loc13_ = 0;
						}
						if (this.baseInterval < Const.DAILY_INTERVAL && _loc6_.length > 0)
						{
							const _loc19_ = (dataUnit.time - _loc6_[_loc6_.length - 1].time) / Const.MS_PER_MINUTE;
							if (_loc19_ > this.baseMinutesInterval && _loc19_ - (notnull(_loc12_).end - _loc4_) > this.allowedOffset && _loc13_ > 0)
							{
								const session = notnull(param3.getSessionForMinute(dataUnit.dayMinute));
								if (dataUnit.dayMinute >= session.start)
								{
									_loc10_ = _loc12_;
									_loc12_ = session;
									_loc13_ = 0;
								}
							}
						}
						if (dataUnit.dayMinute >= notnull(_loc12_).start)
						{
							if (this.quoteType === QuoteTypes.CURRENCY)
							{
								if (this.baseInterval === Const.WEEKLY_INTERVAL)
								{
									if (dataUnit.exchangeDateInUTC.getUTCDay() === 6)
										dataUnit.setDate(dataUnit.time - Const.MS_PER_DAY, dataUnit.timezoneOffset);
									else if (dataUnit.exchangeDateInUTC.getUTCDay() === 0)
										dataUnit.setDate(dataUnit.time - 2 * Const.MS_PER_DAY, dataUnit.timezoneOffset);
								}
								else if (dataUnit.exchangeDateInUTC.getUTCDay() === 0 || dataUnit.exchangeDateInUTC.getUTCDay() === 6)
								{
								}
							}
							if (this.baseInterval < Const.DAILY_INTERVAL && dataUnit.dayMinute > notnull(_loc12_).end)
							{
								this.addAfterHoursUnitToLastMinute(dataUnit, _loc6_, notnull(_loc12_), param3);
								_loc13_++;
								_loc4_ = notnull(_loc12_).end;
							}
							else if (!isNaN(dataUnit.close))
							{
								let interval = Number(param2[DataSource.INTERVAL_STR]);
								if (dataUnit.volumes[interval] >= 0)
								{
									if (this.quoteType === QuoteTypes.COMPANY && _loc6_.length > 0)
									{
										if (!this.isTradeHaltedInterday(dataUnit, _loc6_[_loc6_.length - 1], this.baseInterval))
										{
										}
									}
									if (!(_loc6_.length > 0 && dataUnit.time === _loc6_[_loc6_.length - 1].time))
									{
										this.regularSanityCheck(_loc6_, dataUnit, _loc10_, notnull(_loc12_), _loc4_, param3);
										_loc13_++;
										_loc6_.push(dataUnit);
										_loc4_ = dataUnit.dayMinute;
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
				this.addFakeDataUnits(_loc6_, _loc6_[_loc6_.length - 1], param3, _loc20_, Directions.FORWARD);
				_loc4_ = _loc12_.end;
			}

			if (_loc6_.length !== 0 && _loc12_ && Number(param2[DataSource.INTERVAL_STR]) < Const.DAILY_INTERVAL && _loc4_ !== param3.marketCloseMinute)
				this.addFakeDataUnitsForSessions(_loc6_, _loc6_[_loc6_.length - 1], param3, param3.getSessionIndex(_loc4_) + 1, param3.dataSessions.length(), Directions.FORWARD);

			return _loc6_;
		}

		sortObjects(param1: string) 
		{
			if (!param1)
				param1 = "newspin";

			this.objects[param1].sort(StockAssociatedObject.compare);
		}

		private addFakeDataUnitsForSessions(dataUnits: DataUnit[], dataUnit: DataUnit, param3: com.google.finance.DataSeries, param4: number, param5: number, param6: number) 
		{
			let _loc9_ = 0;
			let _loc10_ = 0;
			if (param3 !== this.data)
				return;

			for (let _loc7_ = param4; _loc7_ < param5; _loc7_++)
			{
				const interval = param3.dataSessions.getIntervalAt(_loc7_);
				_loc9_ = Math.floor((interval.end - interval.start) / this.baseMinutesInterval) + 1;
				switch (param6)
				{
					case Directions.BACKWARD:
						_loc10_ = interval.end - dataUnit.dayMinute + this.baseMinutesInterval;
						break;
					case Directions.FORWARD:
						_loc10_ = interval.start - dataUnit.dayMinute - this.baseMinutesInterval;
						break;
				}
				this.addFakeDataUnits(dataUnits, dataUnit, param3, _loc9_, param6, _loc10_);
			}
		}

		getFirstRelativeMinute(param1: number): number
		{
			const detailLevelInterval = Const.getDetailLevelInterval(param1);
			const points = this.data.getPointsInIntervalArray(detailLevelInterval);
			if (!points || points.length === 0)
				return 0;

			return points[0].relativeMinutes;
		}

		hasPendingEvents(): boolean
		{
			for (let _loc1_ in this.events)
			{
				if (this.events[_loc1_] !== ChartEventPriorities.DONE && this.events[_loc1_] !== ChartEventPriorities.OHLC_DONE)
					return true;
			}
			return false;
		}

		private regularSanityCheck(dataUnits: DataUnit[], dataUnit: DataUnit, param3: StartEndPair|null, param4: StartEndPair, param5: number, param6: com.google.finance.DataSeries) 
		{
			let _loc7_ = 0;
			if (this.baseInterval < Const.DAILY_INTERVAL)
			{
				const sessionIndex = param6.getSessionIndex(param4.start);
				const _loc9_ = !param3 ? -1 : param6.getSessionIndex(param3.start);
				if (dataUnit.dayMinute === param4.start)
				{
					if (param3 && param5 !== param3.end)
					{
						_loc7_ = Math.floor((param3.end - param5) / this.baseMinutesInterval);
						this.addFakeDataUnits(dataUnits, dataUnits[dataUnits.length - 1], param6, _loc7_, Directions.FORWARD);
					}
					if (!param3)
					{
						this.addFakeDataUnitsForSessions(dataUnits, dataUnit, param6, 0, sessionIndex, Directions.BACKWARD);
					}
					else if (!DataSource.unitsInDifferentDays(dataUnits[dataUnits.length - 1], dataUnit))
					{
						this.addFakeDataUnitsForSessions(dataUnits, dataUnits[dataUnits.length - 1], param6, _loc9_ + 1, sessionIndex, Directions.FORWARD);
					}
					else
					{
						this.addFakeDataUnitsForSessions(dataUnits, dataUnits[dataUnits.length - 1], param6, _loc9_ + 1, param6.dataSessions.length(), Directions.FORWARD);
						this.addFakeDataUnitsForSessions(dataUnits, dataUnit, param6, 0, sessionIndex, Directions.BACKWARD);
					}
				}
				else if (dataUnits.length === 0 || dataUnit.time - dataUnits[dataUnits.length - 1].time !== this.baseMinutesInterval * Const.MS_PER_MINUTE)
				{
					if (dataUnits.length === 0)
					{
						this.addFakeDataUnitsForSessions(dataUnits, dataUnit, param6, 0, sessionIndex, Directions.BACKWARD);
						if (param6 === this.data || dataUnit.dayMinute !== param4.end)
						{
							_loc7_ = Math.floor((dataUnit.dayMinute - param4.start) / this.baseMinutesInterval);
							this.addFakeDataUnits(dataUnits, dataUnit, param6, _loc7_, Directions.BACKWARD);
						}
					}
					else if (dataUnit.time - dataUnits[dataUnits.length - 1].time <= (dataUnit.dayMinute - param4.start) * Const.MS_PER_MINUTE)
					{
						_loc7_ = Math.floor((dataUnit.dayMinute - param5) / this.baseMinutesInterval) - 1;
						this.addFakeDataUnits(dataUnits, dataUnits[dataUnits.length - 1], param6, _loc7_, Directions.FORWARD);
					}
					else
					{
						_loc7_ = Math.floor((notnull(param3).end - param5) / this.baseMinutesInterval);
						this.addFakeDataUnits(dataUnits, dataUnits[dataUnits.length - 1], param6, _loc7_, Directions.FORWARD);
						if (!DataSource.unitsInDifferentDays(dataUnits[dataUnits.length - 1], dataUnit) && param6 === this.data)
						{
							this.addFakeDataUnitsForSessions(dataUnits, dataUnits[dataUnits.length - 1], param6, _loc9_ + 1, sessionIndex, Directions.FORWARD);
							_loc7_ = Math.floor((dataUnit.dayMinute - param4.start) / this.baseMinutesInterval);
							const _loc10_ = param4.start - dataUnits[dataUnits.length - 1].dayMinute - this.baseMinutesInterval;
							this.addFakeDataUnits(dataUnits, dataUnits[dataUnits.length - 1], param6, _loc7_, Directions.FORWARD, _loc10_);
						}
						else
						{
							this.addFakeDataUnitsForSessions(dataUnits, dataUnits[dataUnits.length - 1], param6, _loc9_ + 1, param6.dataSessions.length(), Directions.FORWARD);
							this.addFakeDataUnitsForSessions(dataUnits, dataUnit, param6, 0, sessionIndex, Directions.BACKWARD);
							_loc7_ = Math.floor((dataUnit.dayMinute - param4.start) / this.baseMinutesInterval);
							this.addFakeDataUnits(dataUnits, dataUnit, param6, _loc7_, Directions.BACKWARD);
						}
					}
				}
			}
			else if ((this.baseInterval === Const.DAILY_INTERVAL || this.baseInterval === Const.WEEKLY_INTERVAL) && dataUnit.dayMinute !== param6.marketCloseMinute)
			{
				let _loc11_ = (param6.marketCloseMinute - dataUnit.dayMinute) * Const.MS_PER_MINUTE;
				_loc11_ = _loc11_ - dataUnit.exchangeDateInUTC.getUTCSeconds() * 1000;
				dataUnit.setDate(dataUnit.time + _loc11_, dataUnit.timezoneOffset);
			}
		}

		getObjectPositionsInInterval(param1: number)
		{
			const objectPosition = <{
				exchangeTimezoneOffset: number,
				closePrice: number,
				posInInterval: SeriesPosition[],
			}>{};
			const seriesPosition: SeriesPosition[] = [];
			for (let detailLevelIndex = Const.DETAIL_LEVELS.length - 1; detailLevelIndex >= 0; detailLevelIndex--)				
			{
				const detailLevelInterval = Const.getDetailLevelInterval(Const.DETAIL_LEVELS[detailLevelIndex]);
				const points = this.data.getPointsInIntervalArray(detailLevelInterval);
				if (points && points.length > 0)
				{
					let timeIndex = DataSource.getTimeIndex(param1, points);
					if (timeIndex === 0 && points[0].time > param1)
					{
						objectPosition.exchangeTimezoneOffset = points[timeIndex].timezoneOffset;
					}
					else
					{
						if (points[timeIndex].time < param1)
							timeIndex = Math.min(timeIndex + 1, points.length - 1);

						seriesPosition[detailLevelInterval] = new SeriesPosition(this.data, timeIndex);
						objectPosition.exchangeTimezoneOffset = points[timeIndex].timezoneOffset;
						objectPosition.closePrice = points[timeIndex].close;
					}
				}
			}
			const points = this.afterHoursData.getPointsInIntervalArray(Const.INTRADAY_INTERVAL);
			if (points && points.length > 0 && this.visibleExtendedHours.length())
			{
				let timeIndex = DataSource.getTimeIndex(param1, points);
				if (timeIndex !== 0 || points[0].time <= param1)
				{
					if (points[timeIndex].time < param1)
						timeIndex = Math.min(timeIndex + 1, points.length - 1);

					if (seriesPosition[Const.INTRADAY_INTERVAL])
					{
						const units = this.data.getPointsInIntervalArray(Const.INTRADAY_INTERVAL);
						const unit = units[seriesPosition[Const.INTRADAY_INTERVAL].position];
						const unitTime = unit.time;
						const pointTime = points[timeIndex].time;
						if (unitTime >= param1 && pointTime >= param1 && pointTime < unitTime || unitTime < param1 && pointTime > unitTime)
						{
							seriesPosition[Const.INTRADAY_INTERVAL] = new SeriesPosition(this.afterHoursData, timeIndex);
							objectPosition.exchangeTimezoneOffset = points[timeIndex].timezoneOffset;
							objectPosition.closePrice = points[timeIndex].close;
						}
					}
					else
					{
						seriesPosition[Const.INTRADAY_INTERVAL] = new SeriesPosition(this.afterHoursData, timeIndex);
						objectPosition.exchangeTimezoneOffset = points[timeIndex].timezoneOffset;
						objectPosition.closePrice = points[timeIndex].close;
					}
				}
				else
				{
					objectPosition.exchangeTimezoneOffset = points[timeIndex].timezoneOffset;
				}
			}
			objectPosition.posInInterval = seriesPosition;
			return objectPosition;
		}

		private parseHeader(param1: string[], param2: ChartEvent)
		{
			const _loc3_: { [key: string]: string } = {};
			for (let keyIndex = 0; keyIndex < param1.length; keyIndex++)
			{
				const _loc5_ = param1[keyIndex].split("=");
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
			const _loc2_ = Const.INTRADAY_INTERVAL;
			param1.intradayRegions.length = 0;
			let _loc3_ = 0;
			let _loc4_ = 0;
			for (let _loc5_ = 1; _loc5_ < param1.units.length; _loc5_++)				
			{
				const _loc6_ = param1.units[_loc5_];
				const _loc7_ = param1.units[_loc5_ - 1];
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
			}
			if (_loc4_ > 0)
				param1.intradayRegions.push(new StartEndPair(_loc3_, param1.points.length - 1));
		}

		private addStreamForPointsInIntervals(param1: number, dataUnits: DataUnit[]) 
		{
			this.data.setPointsInIntervalArray(param1, dataUnits);
		}

		private makeDataUnitEndOfDay(dataUnit: DataUnit, dataUnits: DataUnit[], param3: StartEndPair, param4: com.google.finance.DataSeries) 
		{
			let _loc8_ = 0;
			const _loc5_ = param3.end - param3.start;
			const _loc6_ = dataUnit.dayMinute - param3.end;
			let _loc7_ = -_loc6_ * 60 * 1000;
			_loc7_ = _loc7_ - dataUnit.exchangeDateInUTC.getUTCSeconds() * 1000;
			dataUnit.setDate(dataUnit.time + _loc7_, dataUnit.timezoneOffset);
			if (this.baseInterval < Const.DAILY_INTERVAL)
			{
				_loc8_ = _loc5_ / this.baseMinutesInterval;
				this.addFakeDataUnits(dataUnits, dataUnit, param4, _loc8_, Directions.BACKWARD);
			}
			dataUnits.push(dataUnit);
		}

		/*
		private alignDataSeries(param1: com.google.finance.DataSeries, param2: com.google.finance.DataSeries) 
		{
			if (param1.units.length === 0 || param2.units.length === 0)
				return;

			const _loc3_ = param1.units[0].time;
			const _loc4_ = DataSource.getTimeIndex(_loc3_, param2.units);
			const _loc5_ = param2.units[_loc4_].relativeMinutes;
			const _loc6_ = param1.units[0].relativeMinutes;
			for (let _loc7_ = 0; _loc7_ < param1.units.length; _loc7_++)
			{
				const _loc8_ = param1.units[_loc7_].relativeMinutes - _loc6_;
				param1.units[_loc7_].relativeMinutes = _loc5_ + _loc8_;
			}
		}
		*/

		selectObject(param1: string, param2: number, param3?: string): StockAssociatedObject | null
		{
			let _loc4_: StockAssociatedObject | null = null;
			if (this.objects[param1] === undefined)
				return null;

			for (let objectIndex = 0; objectIndex < this.objects[param1].length; objectIndex++)
			{
				this.objects[param1][objectIndex].active = false;
				if (param1 === "newspin")
					(<PinPoint>this.objects[param1][objectIndex]).forceExpandInGroup = false;

				if (this.objects[param1][objectIndex].id === param2 && (!param3 || (<PinPoint>this.objects[param1][objectIndex]).letter === param3))
				{
					this.objects[param1][objectIndex].active = true;
					_loc4_ = this.objects[param1][objectIndex];
				}
			}
			return _loc4_;
		}

		private objectInTheFuture(param1: StockAssociatedObject, param2: com.google.finance.DataSeries): boolean
		{
			let _loc3_: DataUnit;
			if (Const.INDICATOR_ENABLED)
			{
				const points = param2.getPointsInIntervalArray(Const.INTRADAY_INTERVAL);
				const _loc7_ = notnull(param1.posInInterval)[Const.INTRADAY_INTERVAL];
				if (!points || points.length === 0 || !_loc7_ || _loc7_.position !== points.length - 1)
					return false;

				_loc3_ = points[points.length - 1];
			}
			else
			{
				const numUnits = param2.units.length;
				if (param1.pos !== numUnits - 1)
					return false;

				_loc3_ = param2.units[numUnits - 1];
			}
			const exchangeDateInUTC = _loc3_.exchangeDateInUTC;
			const date = new Date(param1.time + _loc3_.timezoneOffset);
			if (date.getUTCFullYear() < exchangeDateInUTC.getUTCFullYear())
				return false;

			if (date.getUTCFullYear() > exchangeDateInUTC.getUTCFullYear())
				return true;

			if (date.getUTCMonth() < exchangeDateInUTC.getUTCMonth())
				return false;

			if (date.getUTCMonth() < exchangeDateInUTC.getUTCMonth())
				return true;

			if (date.getUTCDate() < exchangeDateInUTC.getUTCDate())
				return false;

			if (date.getUTCDate() > exchangeDateInUTC.getUTCDate())
				return true;

			return false;
		}

		private extractAfterHoursSessions(param1: com.google.finance.IntervalSet) 
		{
			if (this.afterHoursData.units.length === 0)
				return;

			let _loc2_ = this.afterHoursData.units[0];
			let session = notnull(this.afterHoursData.getSessionForMinute(_loc2_.dayMinute));
			let _loc4_ = 0;
			let _loc5_ = 0;
			for (let unitIndex = 0; unitIndex < this.afterHoursData.units.length; unitIndex++)
			{
				_loc2_ = this.afterHoursData.units[unitIndex];
				if (_loc2_.dayMinute === session.start)
				{
					_loc4_ = unitIndex;
				}
				else if (_loc2_.dayMinute === session.end)
				{
					_loc5_ = unitIndex;
					param1.addInterval(_loc4_, _loc5_);
					if (unitIndex < this.afterHoursData.units.length - 1)
					{
						_loc2_ = this.afterHoursData.units[unitIndex + 1];
						session = notnull(this.afterHoursData.getSessionForMinute(_loc2_.dayMinute));
					}
				}
			}
		}

		computeObjectPositions() 
		{
			let _loc6_ = NaN;
			for (let _loc1_ in this.objects)
			{
				const _loc2_ = this.objects[_loc1_];
				for (let _loc3_ = _loc2_.length - 1; _loc3_ >= 0; _loc3_--)
				{
					const _loc4_ = _loc2_[_loc3_];
					if (Const.INDICATOR_ENABLED)
					{
						const objectPositions = this.getObjectPositionsInInterval(_loc2_[_loc3_].time);
						_loc4_.posInInterval = objectPositions.posInInterval;
						_loc6_ = objectPositions.closePrice;
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
						const _loc7_ = <Dividend>_loc4_;
						_loc7_.yield = _loc7_.amount / _loc6_;
					}
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

		mergePoints(dataUnits1: DataUnit[], dataUnits2: DataUnit[], param3: boolean, param4: number): DataUnit[]
		{
			let _loc8_: DataUnit;
			const _loc5_: DataUnit[] = [];
			let _loc6_ = 0;
			let _loc7_ = 0;
			while (_loc6_ < dataUnits1.length || _loc7_ < dataUnits2.length)
			{
				if (_loc6_ === dataUnits1.length)
				{
					while (_loc7_ < dataUnits2.length)
					{
						_loc5_.push(dataUnits2[_loc7_]);
						_loc7_++;
					}
				}
				else if (_loc7_ === dataUnits2.length)
				{
					while (_loc6_ < dataUnits1.length)
					{
						_loc5_.push(dataUnits1[_loc6_]);
						_loc6_++;
					}
				}
				else if (dataUnits1[_loc6_].time < dataUnits2[_loc7_].time)
				{
					_loc5_.push(dataUnits1[_loc6_++]);
				}
				else if (dataUnits1[_loc6_].time === dataUnits2[_loc7_].time)
				{
					if (param3 && dataUnits1[_loc6_].fake || dataUnits2[_loc7_].realtime && param4 <= _loc6_ || dataUnits2[_loc7_].coveredDays < dataUnits1[_loc6_].coveredDays)
						_loc8_ = dataUnits2[_loc7_];
					else
						_loc8_ = dataUnits1[_loc6_];

					_loc5_.push(_loc8_);
					_loc8_.addVolumeInfo(dataUnits1[_loc6_]);
					_loc8_.addVolumeInfo(dataUnits2[_loc7_]);
					_loc6_++;
					_loc7_++;
				}
				else
				{
					_loc5_.push(dataUnits2[_loc7_++]);
				}
			}
			return _loc5_;
		}

		private extractSessions(param1: string, param2: com.google.finance.DataSeries) 
		{
			param1 = param1.slice(1, param1.length - 1);
			const _loc3_ = param1.split("],[");
			for (let _loc4_ = 0; _loc4_ < _loc3_.length; _loc4_++)
			{
				const _loc5_ = _loc3_[_loc4_].split(",");
				const _loc6_ = Number(_loc5_[1]);
				const _loc7_ = Number(_loc5_[2]);
				param2.addDataSession(_loc6_, _loc7_, _loc5_[0]);
			}
		}

		getClosestDataUnitAfterMinute(param1: number): DataUnit | null
		{
			const _loc2_ = this.afterHoursData.getRelativeMinuteIndex(param1);
			const _loc3_ = this.afterHoursData.units[_loc2_ + 1];
			const _loc4_ = this.data.getRelativeMinuteIndex(param1);
			const _loc5_ = this.data.units[_loc4_ + 1];
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

			const _loc2_ = param1._type ? param1._type : "newspin";
			if (!this.objects[_loc2_])
				this.objects[_loc2_] = [];

			let _loc3_ = 0;
			if (param1._date instanceof Date)
				_loc3_ = param1._date.getTime();
			else if (!isNaN(param1._date))
				_loc3_ = Number(param1._date) * 1000;
			else
				return;

			let _loc6_ = NaN;
			let _loc7_ = NaN;

			let _loc8_: DataSeries | null;
			let _loc9_: SeriesPosition[] | null;
			let _loc10_: number;
			let _loc11_: number;

			if (Const.INDICATOR_ENABLED)
			{
				const objectPositions = this.getObjectPositionsInInterval(_loc3_);
				if (isNaN(objectPositions.exchangeTimezoneOffset))
					return;

				_loc11_ = objectPositions.exchangeTimezoneOffset;
				_loc10_ = objectPositions.closePrice;
				_loc9_ = objectPositions.posInInterval;
				_loc8_ = null;
			}
			else
			{
				const objectPositions = this.getObjectPositions(_loc3_, this.data);
				let dataSeries = notnull(objectPositions.refDataSeries);
				if (objectPositions.pos < 0 || objectPositions.pos >= dataSeries.units.length)
					return;

				_loc11_ = dataSeries.units[objectPositions.pos].timezoneOffset;
				_loc10_ = dataSeries.units[objectPositions.pos].close;
				_loc6_ = objectPositions.pos;
				_loc7_ = notnull(objectPositions.dayPos);
				_loc8_ = objectPositions.refDataSeries;
				_loc9_ = null;
			}
			const _loc12_ = Utils.newDateInTimezone(new Date(_loc3_), _loc11_);
			let obj: StockAssociatedObject;
			switch (_loc2_)
			{
				case "newspin":
					obj = new PinPoint(_loc6_, _loc7_, _loc9_, _loc3_, _loc12_, param1._id, this.quoteName, param1._letter);
					break;
				case "split":
					obj = new Split(_loc6_, _loc7_, _loc9_, _loc3_, _loc12_, param1._id, this.quoteName, param1._old_shares, param1._new_shares);
					if (this.objectInTheFuture(obj, this.data))
						return;
					break;
				case "dividend":
					obj = new Dividend(_loc6_, _loc7_, _loc9_, _loc3_, _loc12_, param1._id, this.quoteName, param1._amount, param1._amount_currency, _loc10_);
					if (this.objectInTheFuture(obj, this.data))
						return;
					break;
				case "stock_dividend":
					obj = new StockDividend(_loc6_, _loc7_, _loc9_, _loc3_, _loc12_, param1._id, this.quoteName, param1._ticker, param1._adjustment_factor);
					if (this.objectInTheFuture(obj, this.data))
						return;
					break;
				default:
					obj = new StockAssociatedObject(_loc6_, _loc7_, _loc9_, _loc3_, _loc12_, param1._id, this.quoteName);
					break;
			}
			obj.originalObject = param1;
			obj.refDataSeries = _loc8_;
			this.objects[_loc2_].push(obj);
		}

		eventDone(param1: string) 
		{
			this.events[param1] = ChartEventPriorities.DONE;
		}

		private addAHStreamForPointsInIntervals(dataUnits: DataUnit[]) 
		{
			this.afterHoursData.setPointsInIntervalArray(Const.INTRADAY_INTERVAL, dataUnits);
		}

		dayIndexHasVisibleExtendedHours(param1: number): boolean
		{
			if (this.visibleExtendedHours.length() === 0)
				return false;

			const _loc2_ = this.data.units[this.data.days[param1]];
			if (param1 === this.data.days.length - 1)
				return _loc2_.relativeMinutes !== 0;

			const _loc3_ = this.data.units[this.data.days[param1] + 1];
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
			if (this.visibleExtendedHours.length() > 0)
				return notnull(this.getClosestDataUnitLessThen(param1));

			const relativeMinuteIndex = this.data.getRelativeMinuteIndex(param1);
			const _loc3_ = this.data.units[relativeMinuteIndex];
			return _loc3_;
		}

		private getObjectPositions(param1: number, param2: com.google.finance.DataSeries): SeriesPosition
		{
			let _loc3_: number;
			const units = param2.units;
			const days = param2.days;
			let timeIndex = DataSource.getTimeIndex(param1, units);
			if (timeIndex === -1)
				return new SeriesPosition(null, -1, -1);

			if (timeIndex === 0 && param1 < units[0].time)
				return new SeriesPosition(param2, 0, 0);

			const date = new Date(param1);
			if (units[timeIndex].dayMinute === param2.marketCloseMinute)
			{
				let unitDate = new Date(units[timeIndex].time);
				const dateInTimezone1 = Utils.getDateInTimezone(unitDate, units[timeIndex].timezoneOffset);
				const dateInTimezone2 = Utils.getDateInTimezone(date, units[timeIndex].timezoneOffset);
				if (dateInTimezone1 < dateInTimezone2)
				{
					let _loc14_: number;
					if (timeIndex < units.length - 1)
					{
						unitDate = new Date(units[timeIndex + 1].time);
						_loc14_ = Utils.getDateInTimezone(unitDate, units[timeIndex].timezoneOffset);
					}
					else
					{
						_loc14_ = dateInTimezone1;
					}

					if (_loc14_ === dateInTimezone2)
						_loc3_ = days[param2.getNextDayStart(timeIndex + 1)];
					else
						_loc3_ = timeIndex;

					if (timeIndex < units.length - 1 && units[timeIndex + 1].dayMinute === param2.marketCloseMinute)
						timeIndex = _loc3_;
				}
				else if (dateInTimezone1 > dateInTimezone2)
				{
					let _loc15_: number;
					let _loc16_: number;
					if (timeIndex > 0)
					{
						_loc16_ = param2.getPrevDayStart(timeIndex);
						unitDate = new Date(units[_loc16_].time);
						_loc15_ = Utils.getDateInTimezone(unitDate, units[timeIndex].timezoneOffset);
					}
					else
					{
						_loc16_ = timeIndex;
						_loc15_ = dateInTimezone1;
					}

					if (_loc15_ === dateInTimezone2)
						_loc3_ = days[param2.getPrevDayStart(timeIndex)];
					else
						_loc3_ = timeIndex;

					if (timeIndex === 0 || units[timeIndex - 1].dayMinute === param2.marketCloseMinute)
						timeIndex = _loc3_;
				}
				else
				{
					_loc3_ = timeIndex;
				}
			}
			else
			{
				_loc3_ = days[param2.getNextDayStart(timeIndex)];
			}
			const _loc8_ = units[timeIndex];
			let _loc9_: DataUnit | null = null;
			if (timeIndex < units.length - 1)
				_loc9_ = units[timeIndex + 1];

			let _loc10_ = param2;
			if (!_loc9_ && _loc8_.relativeMinutes !== 0 || _loc9_ && _loc8_.dayMinute === param2.marketCloseMinute && _loc9_.dayMinute === param2.marketOpenMinute && _loc9_.relativeMinutes - _loc8_.relativeMinutes > 1)
			{
				if (this.afterHoursData.units.length !== 0)
				{
					if (!_loc9_)
					{
						timeIndex = this.afterHoursData.units.length - 1;
						_loc9_ = this.afterHoursData.units[timeIndex];
					}
					timeIndex = DataSource.getTimeIndex(param1, this.afterHoursData.units);
					_loc3_ = DataSource.getTimeIndex(_loc9_.time, this.afterHoursData.units);
					_loc10_ = this.afterHoursData;
				}
			}
			return new SeriesPosition(_loc10_, timeIndex, _loc3_);
		}

		objectsToString(): string
		{
			let _loc1_ = "";
			for (let _loc2_ in this.objects)
				_loc1_ = _loc1_ + (", " + this.objects[_loc2_].toString());
			return _loc1_;
		}

		markEvent(param1: ChartEvent, param2: ChartEventPriorities): boolean
		{
			const eventName = param1.getEventName();
			if (param1.period === "5Y")
			{
				const eventName2 = param1.getEventName("40Y");
				if (this.hasEvent(eventName2))
					return false;
			}
			if (this.hasEvent(eventName))
			{
				if (this.events[eventName] < param2)
				{
					this.events[eventName] = param2;
					return true;
				}
				return false;
			}
			this.events[eventName] = param2;
			return true;
		}

		clearAllObjects(param1: string) 
		{
			this.objects[param1] = [];
		}

		getEndOfDayDataUnitFor(param1: number): DataUnit
		{
			let minuteMetaIndex = DataSource.getMinuteMetaIndex(param1, this.data.days, this.data.units);
			if (minuteMetaIndex === -1)
				return this.data.units[this.data.days[0]];

			let _loc3_ = this.data.days[minuteMetaIndex];
			if (_loc3_ + 1 < this.data.units.length && this.data.minuteIsEndOfDataSession(this.data.units[_loc3_ + 1].dayMinute))
			{
				if (param1 === this.data.units[_loc3_].relativeMinutes)
					return this.data.units[_loc3_];

				return this.data.units[_loc3_ + 1];
			}
			if (_loc3_ + 1 < this.data.units.length && param1 >= this.data.units[_loc3_ + 1].relativeMinutes)
			{
				minuteMetaIndex++;
				_loc3_ = this.data.days[minuteMetaIndex];
			}
			if (!this.dayIndexHasVisibleExtendedHours(minuteMetaIndex))
			{
				_loc3_ = this.data.days[minuteMetaIndex];
				return this.data.units[_loc3_];
			}
			const _loc4_ = DataSource.getMinuteMetaIndex(param1, this.afterHoursData.days, this.afterHoursData.units);
			let _loc5_ = this.afterHoursData.days[_loc4_];
			if (param1 > this.afterHoursData.units[_loc5_].relativeMinutes && _loc4_ + 1 < this.afterHoursData.days.length)
				_loc5_ = this.afterHoursData.days[_loc4_ + 1];

			const _loc6_ = this.afterHoursData.units[_loc5_];
			let _loc7_ = this.data.units[_loc3_];
			if (param1 > _loc7_.relativeMinutes && minuteMetaIndex + 1 < this.data.days.length)
			{
				_loc3_ = this.data.days[minuteMetaIndex + 1];
				_loc7_ = this.data.units[_loc3_];
			}
			const closestDataUnit = this.getClosestDataUnitLessThen(param1);
			if (!closestDataUnit)
				return _loc7_;

			if (Utils.compareUtcDates(closestDataUnit.exchangeDateInUTC, _loc7_.exchangeDateInUTC) === 0 && Utils.compareUtcDates(closestDataUnit.exchangeDateInUTC, _loc6_.exchangeDateInUTC) === 0)
			{
				if (_loc6_.time > _loc7_.time)
					return _loc6_;

				return _loc7_;
			}
			if (Utils.compareUtcDates(closestDataUnit.exchangeDateInUTC, _loc6_.exchangeDateInUTC) === 0)
				return _loc6_;

			if (Utils.compareUtcDates(closestDataUnit.exchangeDateInUTC, _loc7_.exchangeDateInUTC) === 0)
				return _loc7_;

			return _loc7_;
		}

		private checkHeaderSanity(param1: { [key: string]: string }, param2: com.google.finance.DataSeries) 
		{
			const _loc3_ = param1[DataSource.MARKET_CLOSE_MINUTE_STR];
			const _loc4_ = param1[DataSource.MARKET_OPEN_MINUTE_STR];
			if (_loc4_)
				param2.marketOpenMinute = Number(_loc4_);

			if (_loc3_)
			{
				param2.marketCloseMinute = Number(_loc3_);
				if (this.quoteName.indexOf("CURRENCY") >= 0)
				{
					const _loc5_ = (param2.marketCloseMinute - param2.marketOpenMinute) % this.intradayMinutesInterval;
					param2.marketCloseMinute -= _loc5_;
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

			for (let _loc3_ = this.objects[param1].length - 1; _loc3_ >= 0; _loc3_--)				
			{
				if (this.objects[param1][_loc3_].id === param2)
					return _loc3_;
			}
			return -1;
		}

		private addFakeDataUnits(dataUnits: DataUnit[], dataUnit: DataUnit, param3: com.google.finance.DataSeries, param4: number, param5: number, param6 = 0) 
		{
			if (param4 === 0)
				return;

			for (let _loc8_ = param4; _loc8_ > 0; _loc8_--)
			{
				const fakeDataUnit = new DataUnit(dataUnit.close, dataUnit.high, dataUnit.low, dataUnit.open);
				fakeDataUnit.volumes[this.baseInterval] = 0;
				fakeDataUnit.intervals[0] = this.baseInterval;
				let _loc9_ = param6 * Const.MS_PER_MINUTE;
				switch (param5)
				{
					case Directions.BACKWARD:
						_loc9_ = _loc9_ + (dataUnit.time - _loc8_ * this.baseInterval * 1000);
						break;
					case Directions.FORWARD:
						_loc9_ = _loc9_ + (dataUnit.time + (param4 - _loc8_ + 1) * this.baseInterval * 1000);
						break;
				}
				fakeDataUnit.setDate(_loc9_, dataUnit.timezoneOffset);
				fakeDataUnit.fake = true;
				fakeDataUnit.duplicate = param3.minuteIsStartOfDataSession(fakeDataUnit.dayMinute);
				dataUnits.push(fakeDataUnit);
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
			const objPos = this.getObjPos(param1, param2);
			if (objPos !== -1)
				this.objects[param1].splice(objPos, 1);
		}

		private addAfterHoursUnitToLastMinute(dataUnit: DataUnit, dataUnits: DataUnit[], param3: StartEndPair | undefined, param4: com.google.finance.DataSeries) 
		{
			let _loc5_ = 0;
			if (!param3)
				return;

			const sessionIndex = param4.getSessionIndex(param3.start);
			if (dataUnits.length === 0)
			{
				this.addFakeDataUnitsForSessions(dataUnits, dataUnit, param4, 0, sessionIndex, Directions.BACKWARD);
				this.makeDataUnitEndOfDay(dataUnit, dataUnits, param3, param4);
				return;
			}
			let _loc7_ = dataUnits[dataUnits.length - 1];
			const _loc8_ = notnull(param4.getSessionForMinute(_loc7_.dayMinute));
			const _loc9_ = param4.getSessionIndex(_loc7_.dayMinute);
			if (_loc7_ && _loc7_.dayMinute < _loc8_.end)
			{
				_loc5_ = (_loc8_.end - _loc7_.dayMinute) / this.baseMinutesInterval;
				this.addFakeDataUnits(dataUnits, _loc7_, param4, _loc5_, Directions.FORWARD);
				_loc7_ = dataUnits[dataUnits.length - 1];
			}
			const _loc10_ = (dataUnit.time - _loc7_.time) / Const.MS_PER_MINUTE;
			const _loc11_ = param3.end - param3.start;
			const _loc12_ = dataUnit.dayMinute - param3.end;
			if (_loc10_ > _loc12_ + _loc11_)
			{
				if (!DataSource.unitsInDifferentDays(_loc7_, dataUnit))
				{
					this.addFakeDataUnitsForSessions(dataUnits, dataUnits[dataUnits.length - 1], param4, _loc9_ + 1, sessionIndex, Directions.FORWARD);
				}
				else
				{
					this.addFakeDataUnitsForSessions(dataUnits, dataUnits[dataUnits.length - 1], param4, _loc9_ + 1, param4.dataSessions.length(), Directions.FORWARD);
					this.addFakeDataUnitsForSessions(dataUnits, dataUnit, param4, 0, sessionIndex, Directions.BACKWARD);
				}
				this.makeDataUnitEndOfDay(dataUnit, dataUnits, param3, param4);
			}
			else
			{
				_loc7_.close = dataUnit.close;
				if (!isNaN(_loc7_.high) && _loc7_.high < _loc7_.close)
					_loc7_.high = _loc7_.close;

				if (!isNaN(_loc7_.low) && _loc7_.low > _loc7_.close)
					_loc7_.low = _loc7_.close;

				const _loc13_ = dataUnit.intervals[0];
				_loc7_.volumes[_loc13_] = _loc7_.volumes[_loc13_] + dataUnit.volumes[_loc13_];
			}
		}

		private getDataUnitNoValidation(param1: string[], param2: ColumnTypes[], param3: { [key: string]: string }): DataUnit
		{
			const dataUnit = new DataUnit(NaN, NaN, NaN, NaN);
			for (let columnTypeIndex = 0; columnTypeIndex < param2.length; columnTypeIndex++)
			{
				if (param2[columnTypeIndex] === ColumnTypes.COL_DATE_TYPE)
				{
					let _loc6_: number;
					if (isNaN(Number(param1[columnTypeIndex])))
					{
						this.lastAbsTime = Number(param1[columnTypeIndex].substr(1));
						_loc6_ = this.lastAbsTime * 1000;
					}
					else
					{
						const _loc7_ = this.lastAbsTime + Number(param1[columnTypeIndex]) * this.baseInterval;
						_loc6_ = _loc7_ * 1000;
					}
					dataUnit.setDate(_loc6_, this.timezoneOffset);
				}
				else if (param2[columnTypeIndex] === ColumnTypes.COL_CLOSE_TYPE)
				{
					dataUnit.close = Number(param1[columnTypeIndex]);
				}
				else if (param2[columnTypeIndex] === ColumnTypes.COL_OPEN_TYPE)
				{
					dataUnit.open = Number(param1[columnTypeIndex]);
				}
				else if (param2[columnTypeIndex] === ColumnTypes.COL_LOW_TYPE)
				{
					dataUnit.low = Number(param1[columnTypeIndex]);
				}
				else if (param2[columnTypeIndex] === ColumnTypes.COL_HIGH_TYPE)
				{
					dataUnit.high = Number(param1[columnTypeIndex]);
				}
				else if (param2[columnTypeIndex] === ColumnTypes.COL_VOLUME_TYPE)
				{
					// TODO
					dataUnit.volumes[Number(param3[DataSource.INTERVAL_STR])] = Number(param1[columnTypeIndex]);
					dataUnit.intervals.push(this.baseInterval);
				}
				else if (param2[columnTypeIndex] === ColumnTypes.COL_CDAYS_TYPE)
				{
					dataUnit.coveredDays = Number(param1[columnTypeIndex]);
				}
			}
			return dataUnit;
		}
	}
}
