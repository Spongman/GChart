namespace com.google.finance
{
	export class SeriesPosition
	{
		position: number;
		constructor(public refDataSeries: DataSeries|null, public pos: number, public dayPos: number | null = null)
		{
		}
	}

	export class ObjectPositions
	{
		exchangeTimezoneOffset: number;
		closePrice: number;
		posInInterval: SeriesPosition[];
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
		private static readonly ABSOLUTE_DATE_CHAR = 'a';
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

		private readonly events: Map<ChartEventPriorities> = {};

		visibleExtendedHours = new IntervalSet();
		readonly objects: Map<StockAssociatedObject[]> = {};
		readonly data = new DataSeries();
		tickerName: string;
		readonly indicators: Map<Indicator> = {};
		hiddenExtendedHours = new IntervalSet();
		readonly afterHoursData = new DataSeries();
		technicalsName: string;
		dataUnavailableOnServer: boolean = false;
		intradayMinutesInterval = Const.INTRADAY_INTERVAL / Const.SEC_PER_MINUTE;
		firstOpenRelativeMinutes = 0;

		constructor(public readonly quoteName: string, private readonly weekdayBitmap = 62, public displayName?: string)
		{
			this.quoteType = Const.getQuoteType(quoteName);
			if (quoteName.indexOf('@') !== -1)
			{
				const _loc4_ = quoteName.split('@');
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

		static getMinuteMetaIndex(minute: number, param2: number[], dataUnits: DataUnit[]): number
		{
			if (isNaN(minute) || !dataUnits || dataUnits.length === 0 || param2.length === 0)
				return -1;

			let _loc4_ = 0;
			let _loc5_ = param2.length - 1;
			// tslint:disable-next-line
			while (true)
			{
				const _loc6_ = Math.round((_loc4_ + _loc5_) / 2);
				if (_loc6_ === 0 && dataUnits[param2[0]].relativeMinutes > minute)
					break;

				if (_loc6_ === param2.length - 1 && dataUnits[param2[_loc6_]].relativeMinutes < minute)
					return param2.length - 1;

				if (dataUnits[param2[_loc6_]].relativeMinutes === minute)
					return _loc6_;

				if (_loc4_ >= _loc5_ - 1)
					return _loc4_;

				if (dataUnits[param2[_loc6_]].relativeMinutes < minute)
					_loc4_ = _loc6_;
				else
					_loc5_ = _loc6_;
			}
			return 0;
		}

		static getTimeIndex(time: number, dataUnits: DataUnit[]): number
		{
			let _loc5_ = 0;
			if (isNaN(time) || !dataUnits || dataUnits.length === 0)
				return -1;

			let _loc3_ = 0;
			let _loc4_ = dataUnits.length - 1;
			// tslint:disable-next-line
			while (true)
			{
				_loc5_ = Math.round((_loc3_ + _loc4_) / 2);
				if (_loc5_ === 0 && dataUnits[0].time > time)
					break;

				if (_loc5_ === dataUnits.length - 1 && dataUnits[_loc5_].time < time)
					return dataUnits.length - 1;

				if (dataUnits[_loc5_].time === time)
					return _loc5_;

				if (_loc3_ >= _loc4_ - 1)
					return _loc3_;

				if (dataUnits[_loc5_].time < time)
					_loc3_ = _loc5_;
				else
					_loc4_ = _loc5_;
			}
			return 0;
		}

		computeStarts(dataSeries: DataSeries)
		{
			let _loc3_ = -1;
			dataSeries.years.length = 0;
			dataSeries.firsts.length = 0;
			dataSeries.fridays.length = 0;
			dataSeries.days.length = 0;
			const units = dataSeries.units;
			let session = notnull(dataSeries.getSessionForMinute(units[0].dayMinute));
			const lastDayOfWeek = Utils.getLastDayOfWeek(this.weekdayBitmap);
			for (let unitIndex = 0; unitIndex < units.length; unitIndex++)
			{
				const unit = units[unitIndex];
				const _loc9_ = unitIndex === units.length - 1 ? null : units[unitIndex + 1];
				if (unit.dayMinute === session.end)
				{
					if (DataSource.unitsInDifferentDays(unit, _loc9_))
					{
						dataSeries.days.push(unitIndex);
						if (unit.exchangeDateInUTC.getUTCMonth() !== _loc3_)
						{
							dataSeries.firsts.push(unitIndex);
							_loc3_ = unit.exchangeDateInUTC.getUTCMonth();
							if (_loc3_ === 0)
								dataSeries.years.push(unitIndex);
						}
						const day = unit.exchangeDateInUTC.getUTCDay();
						let _loc11_ = Number.POSITIVE_INFINITY;
						if (_loc9_)
							_loc11_ = _loc9_.exchangeDateInUTC.getUTCDay();

						if (day === lastDayOfWeek || unit.coveredDays > 1 || unitIndex < units.length - 1 && day > _loc11_)
							dataSeries.fridays.push(unitIndex);
					}
					if (_loc9_)
						session = notnull(dataSeries.getSessionForMinute(_loc9_.dayMinute));
				}
			}
		}

		addStream(param1: string, chartEvent: ChartEvent): AddStreamResults
		{
			const _loc3_ = this.data.points.length !== 0;
			this.clearAllIndicatorsOnAddData(Number(chartEvent.interval));
			this.clearCoalescedChildren();
			if (param1.indexOf(DataSource.EXCHANGE_STR) !== 0)
				return AddStreamResults.ERROR;

			const _loc4_ = param1.split("\n");
			let data = this.data;
			switch (chartEvent.type)
			{
				case ChartEventTypes.GET_AH_DATA:
				case ChartEventTypes.GET_RT_AH_DATA:
					data = this.afterHoursData;
					break;
			}

			const _loc6_ = this.parseHeader(_loc4_, chartEvent);
			if (!_loc6_)
				return AddStreamResults.ERROR;

			this.checkHeaderSanity(_loc6_, data);
			const _loc7_ = Utils.assocArrayLength(_loc6_) + 1;
			this.baseInterval = Number(_loc6_[DataSource.INTERVAL_STR]);
			if (chartEvent.detailType !== ChartDetailTypes.GET_RT_DATA && chartEvent.detailType !== ChartDetailTypes.GET_RT_AH_DATA)
			{
				const _loc15_ = _loc6_[DataSource.COLUMNS_STR].split(',');
				if (_loc15_.indexOf(this.columnNames[ColumnTypes.COL_OPEN_TYPE]) !== -1 && _loc15_.indexOf(this.columnNames[ColumnTypes.COL_HIGH_TYPE]) !== -1 && _loc15_.indexOf(this.columnNames[ColumnTypes.COL_LOW_TYPE]) !== -1)
					this.eventOhlcDone(chartEvent.getEventName());
				else
					this.eventDone(chartEvent.getEventName());
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
				switch (chartEvent.detailType)
				{
					case ChartDetailTypes.GET_10D_DATA:
					case ChartDetailTypes.GET_30D_DATA:
						this.addStreamForPointsInIntervals(this.baseInterval, _loc9_);
						return AddStreamResults.ADDED_DATA;
					case ChartDetailTypes.GET_5D_DATA:
					case ChartDetailTypes.GET_1Y_DATA:
					case ChartDetailTypes.GET_5Y_DATA:
					case ChartDetailTypes.GET_40Y_DATA:
						this.addStreamForPointsInIntervals(this.baseInterval, _loc9_);
						break;
					case ChartDetailTypes.GET_AH_DATA:
						this.addAHStreamForPointsInIntervals(_loc9_);
						break;
					case ChartDetailTypes.GET_RT_DATA:
						_loc11_ = true;
						const points1 = this.data.getPointsInIntervalArray(Const.INTRADAY_INTERVAL);
						this.addStreamForPointsInIntervals(this.baseInterval, this.mergePoints(_loc9_, points1, _loc11_, lastRealPointIndex));
						break;
					case ChartDetailTypes.GET_RT_AH_DATA:
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
					this.hiddenExtendedHours = new IntervalSet();
					this.extractAfterHoursSessions(this.hiddenExtendedHours);
				}
				else
				{
					if (this.visibleExtendedHours.length() > 0)
						this.visibleExtendedHours = new IntervalSet();

					this.extractAfterHoursSessions(this.visibleExtendedHours);
				}
			}
			if (_loc3_)
				return AddStreamResults.ADDED_DATA;

			if (_loc9_.length === 0)
				return AddStreamResults.NOTHING;

			return AddStreamResults.FIRST_DATA;
		}

		preCalculate(dataSeries: DataSeries)
		{
			this.computeStarts(dataSeries);
			this.computeIntradaySessions(dataSeries);
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

		getAllDataSessions(param1: number, param2: number): IntervalSet
		{
			const intervalSet = new IntervalSet();

			for (let sessionIndex = 0; sessionIndex < this.data.dataSessions.length(); sessionIndex++)
				intervalSet.addPair(this.data.dataSessions.getIntervalAt(sessionIndex));

			if (param1 < this.data.marketOpenMinute)
				intervalSet.addInterval(param1, this.data.marketOpenMinute);

			if (param2 > this.data.marketCloseMinute)
				intervalSet.addInterval(this.data.marketCloseMinute, param2);

			return intervalSet;
		}

		countEvents(chartEventPriority: ChartEventPriorities): number
		{
			let count = 0;
			for (const eventName of Object.keys(this.events))
			{
				if (this.events[eventName] === chartEventPriority)
					count++;
			}
			return count;
		}

		private getColumnTypes(param1: string): ColumnTypes[]
		{
			const columnTypes: ColumnTypes[] = [];
			const columnNames = param1.split(',');
			for (let columnNameIndex1 = 0; columnNameIndex1 < columnNames.length; columnNameIndex1++)
			{
				for (let columnNameIndex2 = 0; columnNameIndex2 < this.columnNames.length; columnNameIndex2++)
				{
					if (columnNames[columnNameIndex1] === this.columnNames[columnNameIndex2])
						columnTypes[columnNameIndex1] = <ColumnTypes>(columnNameIndex2 + 1);
				}
			}
			return columnTypes;
		}

		eventOhlcDone(eventIndex: string)
		{
			this.events[eventIndex] = ChartEventPriorities.OHLC_DONE;
		}

		hasEventHappened(chartEvent: ChartEvent): boolean
		{
			const eventName = chartEvent.getEventName();
			return !!this.events[eventName];
		}

		parseStream(param1: string[], param2: Map<string>, dataSeries: DataSeries): DataUnit[]
		{
			let _loc20_ = 0;
			let _loc4_ = 0;
			this.baseInterval = Number(param2[DataSource.INTERVAL_STR]);
			this.baseMinutesInterval = this.baseInterval / Const.SEC_PER_MINUTE;
			if (!param1 || param1.length === 0)
				return [];

			const columnTypes = this.getColumnTypes(param2[DataSource.COLUMNS_STR]);
			const dataUnits: DataUnit[] = [];
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
					const _loc17_ = _loc14_.split('=');
					this.timezoneOffset = Number(_loc17_[1]);
				}
				else
				{
					const _loc15_ = _loc14_.split(Const.DATA_DELIMITER);
					if (!(_loc15_.length !== columnTypes.length || _loc15_[0].charAt(0) === '&'))
					{
						const dataUnit = this.getDataUnitNoValidation(_loc15_, columnTypes, param2);
						dataUnit.duplicate = dataSeries.minuteIsStartOfDataSession(dataUnit.dayMinute);
						if (Const.INDICATOR_ENABLED && !isNaN(dataUnit.open))
						{
							if (dataUnit.open === 0)
								dataUnit.open = dataUnit.close;

							dataUnit.high = Math.max(dataUnit.high, Math.max(dataUnit.open, dataUnit.close));
							const _loc18_ = Math.min(dataUnit.open, dataUnit.close);
							if (dataUnit.low === 0 || dataUnit.low > _loc18_)
								dataUnit.low = _loc18_;
						}
						if (dataUnits.length === 0)
						{
							_loc12_ = notnull(dataSeries.getSessionForMinute(dataUnit.dayMinute));
							_loc13_ = 0;
						}
						if (this.baseInterval < Const.DAILY_INTERVAL && dataUnits.length > 0)
						{
							const _loc19_ = (dataUnit.time - dataUnits[dataUnits.length - 1].time) / Const.MS_PER_MINUTE;
							if (_loc19_ > this.baseMinutesInterval && _loc19_ - (notnull(_loc12_).end - _loc4_) > this.allowedOffset && _loc13_ > 0)
							{
								const session = notnull(dataSeries.getSessionForMinute(dataUnit.dayMinute));
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
								this.addAfterHoursUnitToLastMinute(dataUnit, dataUnits, notnull(_loc12_), dataSeries);
								_loc13_++;
								_loc4_ = notnull(_loc12_).end;
							}
							else if (!isNaN(dataUnit.close))
							{
								const interval = Number(param2[DataSource.INTERVAL_STR]);
								if (dataUnit.volumes[interval] >= 0)
								{
									if (this.quoteType === QuoteTypes.COMPANY && dataUnits.length > 0)
									{
										if (!this.isTradeHaltedInterday(dataUnit, dataUnits[dataUnits.length - 1], this.baseInterval))
										{
										}
									}
									if (!(dataUnits.length > 0 && dataUnit.time === dataUnits[dataUnits.length - 1].time))
									{
										this.regularSanityCheck(dataUnits, dataUnit, _loc10_, notnull(_loc12_), _loc4_, dataSeries);
										_loc13_++;
										dataUnits.push(dataUnit);
										_loc4_ = dataUnit.dayMinute;
									}
								}
							}
						}
					}
				}
			}
			while (_loc7_ < param1.length);

			if (dataUnits.length !== 0 && _loc12_ && Number(param2[DataSource.INTERVAL_STR]) < Const.DAILY_INTERVAL && _loc4_ !== _loc12_.end)
			{
				_loc20_ = (_loc12_.end - _loc4_) / this.baseMinutesInterval;
				this.addFakeDataUnits(dataUnits, dataUnits[dataUnits.length - 1], dataSeries, _loc20_, Directions.FORWARD);
				_loc4_ = _loc12_.end;
			}

			if (dataUnits.length !== 0 && _loc12_ && Number(param2[DataSource.INTERVAL_STR]) < Const.DAILY_INTERVAL && _loc4_ !== dataSeries.marketCloseMinute)
				this.addFakeDataUnitsForSessions(dataUnits, dataUnits[dataUnits.length - 1], dataSeries, dataSeries.getSessionIndex(_loc4_) + 1, dataSeries.dataSessions.length(), Directions.FORWARD);

			return dataUnits;
		}

		sortObjects(objectType: string)
		{
			if (!objectType)
				objectType = "newspin";

			this.objects[objectType].sort(StockAssociatedObject.compare);
		}

		private addFakeDataUnitsForSessions(dataUnits: DataUnit[], dataUnit: DataUnit, dataSeries: DataSeries, param4: number, param5: number, direction: Directions)
		{
			let _loc10_ = 0;
			if (dataSeries !== this.data)
				return;

			for (let _loc7_ = param4; _loc7_ < param5; _loc7_++)
			{
				const interval = dataSeries.dataSessions.getIntervalAt(_loc7_);
				const _loc9_ = Math.floor((interval.end - interval.start) / this.baseMinutesInterval) + 1;
				switch (direction)
				{
					case Directions.BACKWARD:
						_loc10_ = interval.end - dataUnit.dayMinute + this.baseMinutesInterval;
						break;
					case Directions.FORWARD:
						_loc10_ = interval.start - dataUnit.dayMinute - this.baseMinutesInterval;
						break;
				}
				this.addFakeDataUnits(dataUnits, dataUnit, dataSeries, _loc9_, direction, _loc10_);
			}
		}

		getFirstRelativeMinute(detailLevel: Intervals): number
		{
			const interval = Const.getDetailLevelInterval(detailLevel);
			const points = this.data.getPointsInIntervalArray(interval);
			if (!points || points.length === 0)
				return 0;

			return points[0].relativeMinutes;
		}

		hasPendingEvents(): boolean
		{
			for (const eventName of Object.keys(this.events))
			{
				if (this.events[eventName] !== ChartEventPriorities.DONE && this.events[eventName] !== ChartEventPriorities.OHLC_DONE)
					return true;
			}
			return false;
		}

		private regularSanityCheck(dataUnits: DataUnit[], dataUnit: DataUnit, startInterval: StartEndPair|null, endInterval: StartEndPair, end: number, dataSeries: DataSeries)
		{
			let _loc7_ = 0;
			if (this.baseInterval < Const.DAILY_INTERVAL)
			{
				const sessionIndex = dataSeries.getSessionIndex(endInterval.start);
				const _loc9_ = !startInterval ? -1 : dataSeries.getSessionIndex(startInterval.start);
				if (dataUnit.dayMinute === endInterval.start)
				{
					if (startInterval && end !== startInterval.end)
					{
						_loc7_ = Math.floor((startInterval.end - end) / this.baseMinutesInterval);
						this.addFakeDataUnits(dataUnits, dataUnits[dataUnits.length - 1], dataSeries, _loc7_, Directions.FORWARD);
					}
					if (!startInterval)
					{
						this.addFakeDataUnitsForSessions(dataUnits, dataUnit, dataSeries, 0, sessionIndex, Directions.BACKWARD);
					}
					else if (!DataSource.unitsInDifferentDays(dataUnits[dataUnits.length - 1], dataUnit))
					{
						this.addFakeDataUnitsForSessions(dataUnits, dataUnits[dataUnits.length - 1], dataSeries, _loc9_ + 1, sessionIndex, Directions.FORWARD);
					}
					else
					{
						this.addFakeDataUnitsForSessions(dataUnits, dataUnits[dataUnits.length - 1], dataSeries, _loc9_ + 1, dataSeries.dataSessions.length(), Directions.FORWARD);
						this.addFakeDataUnitsForSessions(dataUnits, dataUnit, dataSeries, 0, sessionIndex, Directions.BACKWARD);
					}
				}
				else if (dataUnits.length === 0 || dataUnit.time - dataUnits[dataUnits.length - 1].time !== this.baseMinutesInterval * Const.MS_PER_MINUTE)
				{
					if (dataUnits.length === 0)
					{
						this.addFakeDataUnitsForSessions(dataUnits, dataUnit, dataSeries, 0, sessionIndex, Directions.BACKWARD);
						if (dataSeries === this.data || dataUnit.dayMinute !== endInterval.end)
						{
							_loc7_ = Math.floor((dataUnit.dayMinute - endInterval.start) / this.baseMinutesInterval);
							this.addFakeDataUnits(dataUnits, dataUnit, dataSeries, _loc7_, Directions.BACKWARD);
						}
					}
					else if (dataUnit.time - dataUnits[dataUnits.length - 1].time <= (dataUnit.dayMinute - endInterval.start) * Const.MS_PER_MINUTE)
					{
						_loc7_ = Math.floor((dataUnit.dayMinute - end) / this.baseMinutesInterval) - 1;
						this.addFakeDataUnits(dataUnits, dataUnits[dataUnits.length - 1], dataSeries, _loc7_, Directions.FORWARD);
					}
					else
					{
						_loc7_ = Math.floor((notnull(startInterval).end - end) / this.baseMinutesInterval);
						this.addFakeDataUnits(dataUnits, dataUnits[dataUnits.length - 1], dataSeries, _loc7_, Directions.FORWARD);
						if (!DataSource.unitsInDifferentDays(dataUnits[dataUnits.length - 1], dataUnit) && dataSeries === this.data)
						{
							this.addFakeDataUnitsForSessions(dataUnits, dataUnits[dataUnits.length - 1], dataSeries, _loc9_ + 1, sessionIndex, Directions.FORWARD);
							_loc7_ = Math.floor((dataUnit.dayMinute - endInterval.start) / this.baseMinutesInterval);
							const _loc10_ = endInterval.start - dataUnits[dataUnits.length - 1].dayMinute - this.baseMinutesInterval;
							this.addFakeDataUnits(dataUnits, dataUnits[dataUnits.length - 1], dataSeries, _loc7_, Directions.FORWARD, _loc10_);
						}
						else
						{
							this.addFakeDataUnitsForSessions(dataUnits, dataUnits[dataUnits.length - 1], dataSeries, _loc9_ + 1, dataSeries.dataSessions.length(), Directions.FORWARD);
							this.addFakeDataUnitsForSessions(dataUnits, dataUnit, dataSeries, 0, sessionIndex, Directions.BACKWARD);
							_loc7_ = Math.floor((dataUnit.dayMinute - endInterval.start) / this.baseMinutesInterval);
							this.addFakeDataUnits(dataUnits, dataUnit, dataSeries, _loc7_, Directions.BACKWARD);
						}
					}
				}
			}
			else if ((this.baseInterval === Const.DAILY_INTERVAL || this.baseInterval === Const.WEEKLY_INTERVAL) && dataUnit.dayMinute !== dataSeries.marketCloseMinute)
			{
				let _loc11_ = (dataSeries.marketCloseMinute - dataUnit.dayMinute) * Const.MS_PER_MINUTE;
				_loc11_ -= dataUnit.exchangeDateInUTC.getUTCSeconds() * 1000;
				dataUnit.setDate(dataUnit.time + _loc11_, dataUnit.timezoneOffset);
			}
		}

		getObjectPositionsInInterval(param1: number)
		{
			const objectPositions = new ObjectPositions();
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
						objectPositions.exchangeTimezoneOffset = points[timeIndex].timezoneOffset;
					}
					else
					{
						if (points[timeIndex].time < param1)
							timeIndex = Math.min(timeIndex + 1, points.length - 1);

						seriesPosition[detailLevelInterval] = new SeriesPosition(this.data, timeIndex);
						objectPositions.exchangeTimezoneOffset = points[timeIndex].timezoneOffset;
						objectPositions.closePrice = points[timeIndex].close;
					}
				}
			}
			const points2 = this.afterHoursData.getPointsInIntervalArray(Const.INTRADAY_INTERVAL);
			if (points2 && points2.length > 0 && this.visibleExtendedHours.length())
			{
				let timeIndex = DataSource.getTimeIndex(param1, points2);
				if (timeIndex !== 0 || points2[0].time <= param1)
				{
					if (points2[timeIndex].time < param1)
						timeIndex = Math.min(timeIndex + 1, points2.length - 1);

					if (seriesPosition[Const.INTRADAY_INTERVAL])
					{
						const units = this.data.getPointsInIntervalArray(Const.INTRADAY_INTERVAL);
						const unit = units[seriesPosition[Const.INTRADAY_INTERVAL].position];
						const unitTime = unit.time;
						const pointTime = points2[timeIndex].time;
						if (unitTime >= param1 && pointTime >= param1 && pointTime < unitTime || unitTime < param1 && pointTime > unitTime)
						{
							seriesPosition[Const.INTRADAY_INTERVAL] = new SeriesPosition(this.afterHoursData, timeIndex);
							objectPositions.exchangeTimezoneOffset = points2[timeIndex].timezoneOffset;
							objectPositions.closePrice = points2[timeIndex].close;
						}
					}
					else
					{
						seriesPosition[Const.INTRADAY_INTERVAL] = new SeriesPosition(this.afterHoursData, timeIndex);
						objectPositions.exchangeTimezoneOffset = points2[timeIndex].timezoneOffset;
						objectPositions.closePrice = points2[timeIndex].close;
					}
				}
				else
				{
					objectPositions.exchangeTimezoneOffset = points2[timeIndex].timezoneOffset;
				}
			}
			objectPositions.posInInterval = seriesPosition;
			return objectPositions;
		}

		private parseHeader(param1: string[], chartEvent: ChartEvent)
		{
			const _loc3_: Map<string> = {};
			for (const pair of param1)
			{
				const _loc5_ = pair.split('=');
				if (_loc5_.length <= 1)
					return null;

				if (_loc5_[0] === DataSource.DATA_STR)
					return _loc3_;

				_loc3_[_loc5_[0]] = _loc5_[1];
			}
			return null;
		}

		computeIntradaySessions(dataSeries: DataSeries)
		{
			const _loc2_ = Const.INTRADAY_INTERVAL;
			dataSeries.intradayRegions.length = 0;
			let _loc3_ = 0;
			let _loc4_ = 0;
			for (let unitIndex = 1; unitIndex < dataSeries.units.length; unitIndex++)
			{
				const _loc6_ = dataSeries.units[unitIndex];
				const _loc7_ = dataSeries.units[unitIndex - 1];
				if ((_loc6_.time - _loc7_.time) / 1000 !== _loc2_)
				{
					if (_loc4_ > 0)
						dataSeries.intradayRegions.push(new StartEndPair(_loc3_, unitIndex - 1));

					_loc3_ = unitIndex;
					_loc4_ = 0;
				}
				else
				{
					_loc4_++;
				}
			}
			if (_loc4_ > 0)
				dataSeries.intradayRegions.push(new StartEndPair(_loc3_, dataSeries.points.length - 1));
		}

		private addStreamForPointsInIntervals(viewpointName: number, dataUnits: DataUnit[])
		{
			this.data.setPointsInIntervalArray(viewpointName, dataUnits);
		}

		private makeDataUnitEndOfDay(dataUnit: DataUnit, dataUnits: DataUnit[], startEndPair: StartEndPair, dataSeries: DataSeries)
		{
			const _loc5_ = startEndPair.end - startEndPair.start;
			const _loc6_ = dataUnit.dayMinute - startEndPair.end;
			let _loc7_ = -_loc6_ * 60 * 1000;
			_loc7_ -= dataUnit.exchangeDateInUTC.getUTCSeconds() * 1000;
			dataUnit.setDate(dataUnit.time + _loc7_, dataUnit.timezoneOffset);
			if (this.baseInterval < Const.DAILY_INTERVAL)
				this.addFakeDataUnits(dataUnits, dataUnit, dataSeries, _loc5_ / this.baseMinutesInterval, Directions.BACKWARD);

			dataUnits.push(dataUnit);
		}

		/*
		private alignDataSeries(ds1: DataSeries, ds2: DataSeries)
		{
			if (ds1.units.length === 0 || ds2.units.length === 0)
				return;

			const _loc3_ = ds1.units[0].time;
			const _loc4_ = DataSource.getTimeIndex(_loc3_, ds2.units);
			const _loc5_ = ds2.units[_loc4_].relativeMinutes;
			const _loc6_ = ds1.units[0].relativeMinutes;
			for (let _loc7_ = 0; _loc7_ < ds1.units.length; _loc7_++)
			{
				const _loc8_ = ds1.units[_loc7_].relativeMinutes - _loc6_;
				ds1.units[_loc7_].relativeMinutes = _loc5_ + _loc8_;
			}
		}
		*/

		selectObject(objectType: string, id: number, letter?: string): StockAssociatedObject | null
		{
			let selectedObject: StockAssociatedObject | null = null;
			if (this.objects[objectType] === undefined)
				return null;

			for (const object of this.objects[objectType])
			{
				object.active = false;
				if (objectType === "newspin")
					(<PinPoint>object).forceExpandInGroup = false;

				if (object.id === id && (!letter || (<PinPoint>object).letter === letter))
				{
					object.active = true;
					selectedObject = object;
				}
			}
			return selectedObject;
		}

		private objectInTheFuture(stockAssociatedObject: StockAssociatedObject, dataSeries: DataSeries): boolean
		{
			let unit: DataUnit;
			if (Const.INDICATOR_ENABLED)
			{
				const points = dataSeries.getPointsInIntervalArray(Const.INTRADAY_INTERVAL);
				const _loc7_ = notnull(stockAssociatedObject.posInInterval)[Const.INTRADAY_INTERVAL];
				if (!points || points.length === 0 || !_loc7_ || _loc7_.position !== points.length - 1)
					return false;

				unit = points[points.length - 1];
			}
			else
			{
				const numUnits = dataSeries.units.length;
				if (stockAssociatedObject.pos !== numUnits - 1)
					return false;

				unit = dataSeries.units[numUnits - 1];
			}
			const exchangeDateInUTC = unit.exchangeDateInUTC;
			const date = new Date(stockAssociatedObject.time + unit.timezoneOffset);
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

		private extractAfterHoursSessions(intervalSet: IntervalSet)
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
					intervalSet.addInterval(_loc4_, _loc5_);
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
			for (const objectType of Object.keys(this.objects))
			{
				const _loc2_ = this.objects[objectType];
				for (let objectIndex = _loc2_.length - 1; objectIndex >= 0; objectIndex--)
				{
					const _loc4_ = _loc2_[objectIndex];
					if (Const.INDICATOR_ENABLED)
					{
						const objectPositions = this.getObjectPositionsInInterval(_loc2_[objectIndex].time);
						_loc4_.posInInterval = objectPositions.posInInterval;
						_loc6_ = objectPositions.closePrice;
					}
					else
					{
						const seriesPosition = this.getObjectPositions(_loc2_[objectIndex].time, this.data);
						if (seriesPosition.pos >= 0 && seriesPosition.pos < notnull(seriesPosition.refDataSeries).units.length)
						{
							_loc4_.pos = seriesPosition.pos;
							_loc4_.dayPos = seriesPosition.dayPos;
							_loc4_.refDataSeries = seriesPosition.refDataSeries;
							_loc6_ = notnull(seriesPosition.refDataSeries).units[seriesPosition.pos].close;
						}
					}
					if (objectType === "dividend")
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
			const dataUnits: DataUnit[] = [];
			let count1 = 0;
			let count2 = 0;
			while (count1 < dataUnits1.length || count2 < dataUnits2.length)
			{
				if (count1 === dataUnits1.length)
				{
					while (count2 < dataUnits2.length)
					{
						dataUnits.push(dataUnits2[count2]);
						count2++;
					}
				}
				else if (count2 === dataUnits2.length)
				{
					while (count1 < dataUnits1.length)
					{
						dataUnits.push(dataUnits1[count1]);
						count1++;
					}
				}
				else if (dataUnits1[count1].time < dataUnits2[count2].time)
				{
					dataUnits.push(dataUnits1[count1++]);
				}
				else if (dataUnits1[count1].time === dataUnits2[count2].time)
				{
					let unit: DataUnit;
					if (param3 && dataUnits1[count1].fake || dataUnits2[count2].realtime && param4 <= count1 || dataUnits2[count2].coveredDays < dataUnits1[count1].coveredDays)
						unit = dataUnits2[count2];
					else
						unit = dataUnits1[count1];

					dataUnits.push(unit);
					unit.addVolumeInfo(dataUnits1[count1]);
					unit.addVolumeInfo(dataUnits2[count2]);
					count1++;
					count2++;
				}
				else
				{
					dataUnits.push(dataUnits2[count2++]);
				}
			}
			return dataUnits;
		}

		private extractSessions(param1: string, dataSeries: DataSeries)
		{
			param1 = param1.slice(1, param1.length - 1);
			const sessionParts = param1.split("],[");
			for (const sessionPart of sessionParts)
			{
				const _loc5_ = sessionPart.split(',');
				const _loc6_ = Number(_loc5_[1]);
				const _loc7_ = Number(_loc5_[2]);
				dataSeries.addDataSession(_loc6_, _loc7_, _loc5_[0]);
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

		addObject(object: any)
		{
			if (!object)
				return;

			const objectType = object._type ? object._type : "newspin";
			if (!this.objects[objectType])
				this.objects[objectType] = [];

			let _loc3_;
			if (object._date instanceof Date)
				_loc3_ = object._date.getTime();
			else if (!isNaN(object._date))
				_loc3_ = Number(object._date) * 1000;
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
				const dataSeries = notnull(objectPositions.refDataSeries);
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
			let newObject: StockAssociatedObject;
			switch (objectType)
			{
				case "newspin":
					newObject = new PinPoint(_loc6_, _loc7_, _loc9_, _loc3_, _loc12_, object._id, this.quoteName, object._letter);
					break;
				case "split":
					newObject = new Split(_loc6_, _loc7_, _loc9_, _loc3_, _loc12_, object._id, this.quoteName, object._old_shares, object._new_shares);
					if (this.objectInTheFuture(newObject, this.data))
						return;
					break;
				case "dividend":
					newObject = new Dividend(_loc6_, _loc7_, _loc9_, _loc3_, _loc12_, object._id, this.quoteName, object._amount, object._amount_currency, _loc10_);
					if (this.objectInTheFuture(newObject, this.data))
						return;
					break;
				case "stock_dividend":
					newObject = new StockDividend(_loc6_, _loc7_, _loc9_, _loc3_, _loc12_, object._id, this.quoteName, object._ticker, object._adjustment_factor);
					if (this.objectInTheFuture(newObject, this.data))
						return;
					break;
				default:
					newObject = new StockAssociatedObject(_loc6_, _loc7_, _loc9_, _loc3_, _loc12_, object._id, this.quoteName);
					break;
			}
			newObject.originalObject = object;
			newObject.refDataSeries = _loc8_;
			this.objects[objectType].push(newObject);
		}

		eventDone(param1: string)
		{
			this.events[param1] = ChartEventPriorities.DONE;
		}

		private addAHStreamForPointsInIntervals(dataUnits: DataUnit[])
		{
			this.afterHoursData.setPointsInIntervalArray(Const.INTRADAY_INTERVAL, dataUnits);
		}

		dayIndexHasVisibleExtendedHours(numDays: number): boolean
		{
			if (this.visibleExtendedHours.length() === 0)
				return false;

			const unit = this.data.units[this.data.days[numDays]];
			if (numDays === this.data.days.length - 1)
				return unit.relativeMinutes !== 0;

			const nextUnit = this.data.units[this.data.days[numDays] + 1];
			if (this.data.minuteIsEndOfDataSession(unit.dayMinute) && this.data.minuteIsEndOfDataSession(nextUnit.dayMinute))
				return false;

			return nextUnit.relativeMinutes - unit.relativeMinutes !== 1;
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
			return this.data.units[relativeMinuteIndex];
		}

		private getObjectPositions(param1: number, dataSeries: DataSeries): SeriesPosition
		{
			let _loc3_: number;
			const units = dataSeries.units;
			const days = dataSeries.days;
			let timeIndex = DataSource.getTimeIndex(param1, units);
			if (timeIndex === -1)
				return new SeriesPosition(null, -1, -1);

			if (timeIndex === 0 && param1 < units[0].time)
				return new SeriesPosition(dataSeries, 0, 0);

			const date = new Date(param1);
			if (units[timeIndex].dayMinute === dataSeries.marketCloseMinute)
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
						_loc3_ = days[dataSeries.getNextDayStart(timeIndex + 1)];
					else
						_loc3_ = timeIndex;

					if (timeIndex < units.length - 1 && units[timeIndex + 1].dayMinute === dataSeries.marketCloseMinute)
						timeIndex = _loc3_;
				}
				else if (dateInTimezone1 > dateInTimezone2)
				{
					let _loc15_: number;
					let _loc16_: number;
					if (timeIndex > 0)
					{
						_loc16_ = dataSeries.getPrevDayStart(timeIndex);
						unitDate = new Date(units[_loc16_].time);
						_loc15_ = Utils.getDateInTimezone(unitDate, units[timeIndex].timezoneOffset);
					}
					else
					{
						_loc16_ = timeIndex;
						_loc15_ = dateInTimezone1;
					}

					if (_loc15_ === dateInTimezone2)
						_loc3_ = days[dataSeries.getPrevDayStart(timeIndex)];
					else
						_loc3_ = timeIndex;

					if (timeIndex === 0 || units[timeIndex - 1].dayMinute === dataSeries.marketCloseMinute)
						timeIndex = _loc3_;
				}
				else
				{
					_loc3_ = timeIndex;
				}
			}
			else
			{
				_loc3_ = days[dataSeries.getNextDayStart(timeIndex)];
			}
			const unit = units[timeIndex];
			let nextUnit: DataUnit | null = null;
			if (timeIndex < units.length - 1)
				nextUnit = units[timeIndex + 1];

			let _loc10_ = dataSeries;
			if (!nextUnit && unit.relativeMinutes !== 0 || nextUnit && unit.dayMinute === dataSeries.marketCloseMinute && nextUnit.dayMinute === dataSeries.marketOpenMinute && nextUnit.relativeMinutes - unit.relativeMinutes > 1)
			{
				if (this.afterHoursData.units.length !== 0)
				{
					if (!nextUnit)
					{
						timeIndex = this.afterHoursData.units.length - 1;
						nextUnit = this.afterHoursData.units[timeIndex];
					}
					timeIndex = DataSource.getTimeIndex(param1, this.afterHoursData.units);
					_loc3_ = DataSource.getTimeIndex(nextUnit.time, this.afterHoursData.units);
					_loc10_ = this.afterHoursData;
				}
			}
			return new SeriesPosition(_loc10_, timeIndex, _loc3_);
		}

		objectsToString(): string
		{
			let value = "";
			for (const objectType of Object.keys(this.objects))
				value += ", " + this.objects[objectType].toString();
			return value;
		}

		markEvent(chartEvent: ChartEvent, chartEventPriority: ChartEventPriorities): boolean
		{
			const eventName = chartEvent.getEventName();
			if (chartEvent.period === "5Y")
			{
				const eventName2 = chartEvent.getEventName("40Y");
				if (this.hasEvent(eventName2))
					return false;
			}
			if (this.hasEvent(eventName))
			{
				if (this.events[eventName] < chartEventPriority)
				{
					this.events[eventName] = chartEventPriority;
					return true;
				}
				return false;
			}
			this.events[eventName] = chartEventPriority;
			return true;
		}

		clearAllObjects(objectType: string)
		{
			this.objects[objectType] = [];
		}

		getEndOfDayDataUnitFor(minute: number): DataUnit
		{
			let minuteMetaIndex = DataSource.getMinuteMetaIndex(minute, this.data.days, this.data.units);
			if (minuteMetaIndex === -1)
				return this.data.units[this.data.days[0]];

			let _loc3_ = this.data.days[minuteMetaIndex];
			if (_loc3_ + 1 < this.data.units.length && this.data.minuteIsEndOfDataSession(this.data.units[_loc3_ + 1].dayMinute))
			{
				if (minute === this.data.units[_loc3_].relativeMinutes)
					return this.data.units[_loc3_];

				return this.data.units[_loc3_ + 1];
			}
			if (_loc3_ + 1 < this.data.units.length && minute >= this.data.units[_loc3_ + 1].relativeMinutes)
			{
				minuteMetaIndex++;
				_loc3_ = this.data.days[minuteMetaIndex];
			}
			if (!this.dayIndexHasVisibleExtendedHours(minuteMetaIndex))
			{
				_loc3_ = this.data.days[minuteMetaIndex];
				return this.data.units[_loc3_];
			}
			const _loc4_ = DataSource.getMinuteMetaIndex(minute, this.afterHoursData.days, this.afterHoursData.units);
			let _loc5_ = this.afterHoursData.days[_loc4_];
			if (minute > this.afterHoursData.units[_loc5_].relativeMinutes && _loc4_ + 1 < this.afterHoursData.days.length)
				_loc5_ = this.afterHoursData.days[_loc4_ + 1];

			const _loc6_ = this.afterHoursData.units[_loc5_];
			let _loc7_ = this.data.units[_loc3_];
			if (minute > _loc7_.relativeMinutes && minuteMetaIndex + 1 < this.data.days.length)
			{
				_loc3_ = this.data.days[minuteMetaIndex + 1];
				_loc7_ = this.data.units[_loc3_];
			}
			const closestDataUnit = this.getClosestDataUnitLessThen(minute);
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

		private checkHeaderSanity(param1: Map<string>, dataSeries: DataSeries)
		{
			const _loc3_ = param1[DataSource.MARKET_CLOSE_MINUTE_STR];
			const _loc4_ = param1[DataSource.MARKET_OPEN_MINUTE_STR];
			if (_loc4_)
				dataSeries.marketOpenMinute = Number(_loc4_);

			if (_loc3_)
			{
				dataSeries.marketCloseMinute = Number(_loc3_);
				if (this.quoteName.indexOf("CURRENCY") >= 0)
				{
					const _loc5_ = (dataSeries.marketCloseMinute - dataSeries.marketOpenMinute) % this.intradayMinutesInterval;
					dataSeries.marketCloseMinute -= _loc5_;
				}
			}
			if (Number(_loc3_) - Number(_loc4_) < 30)
			{
				dataSeries.marketCloseMinute = Const.MARKET_CLOSE_MINUTE;
				dataSeries.marketOpenMinute = Const.MARKET_OPEN_MINUTE;
			}

			if (param1[DataSource.DATA_SESSIONS_STR])
				this.extractSessions(param1[DataSource.DATA_SESSIONS_STR], dataSeries);
			else
				dataSeries.addDataSession(dataSeries.marketOpenMinute, dataSeries.marketCloseMinute, Const.REGULAR_MARKET_NAME);

			dataSeries.marketDayLength = dataSeries.allSessionsLength();
		}

		setRelativeMinutesState(state: number)
		{
			this.relativeMinutesState = state;
		}

		private getObjPos(objectType: string, id: number): number
		{
			if (this.objects[objectType] === undefined)
				return -1;

			for (let objectIndex = this.objects[objectType].length - 1; objectIndex >= 0; objectIndex--)
			{
				if (this.objects[objectType][objectIndex].id === id)
					return objectIndex;
			}
			return -1;
		}

		private addFakeDataUnits(dataUnits: DataUnit[], dataUnit: DataUnit, dataSeries: DataSeries, param4: number, direction: Directions, param6 = 0)
		{
			if (param4 === 0)
				return;

			for (let _loc8_ = param4; _loc8_ > 0; _loc8_--)
			{
				const fakeDataUnit = new DataUnit(dataUnit.close, dataUnit.high, dataUnit.low, dataUnit.open);
				fakeDataUnit.volumes[this.baseInterval] = 0;
				fakeDataUnit.intervals[0] = this.baseInterval;
				let time = param6 * Const.MS_PER_MINUTE;
				switch (direction)
				{
					case Directions.BACKWARD:
						time += dataUnit.time - _loc8_ * this.baseInterval * 1000;
						break;
					case Directions.FORWARD:
						time += dataUnit.time + (param4 - _loc8_ + 1) * this.baseInterval * 1000;
						break;
				}
				fakeDataUnit.setDate(time, dataUnit.timezoneOffset);
				fakeDataUnit.fake = true;
				fakeDataUnit.duplicate = dataSeries.minuteIsStartOfDataSession(fakeDataUnit.dayMinute);
				dataUnits.push(fakeDataUnit);
			}
		}

		clearAllIndicatorsOnAddData(param1: number)
		{
			for (const indicatorKey of Object.keys(this.indicators))
			{
				if (this.indicators[indicatorKey].clearAllOnAddData)
					this.indicators[indicatorKey].clear();
				else
					this.indicators[indicatorKey].clear(param1);
			}
		}

		clearCoalescedChildren()
		{
			this.data.clearCoalescedChildren();
		}

		clearAllIndicators()
		{
			for (const indicatorKey of Object.keys(this.indicators))
				this.indicators[indicatorKey].clear();
		}

		isTradeHaltedInterday(dataUnit1: DataUnit, dataUnit2: DataUnit, param3: number): boolean
		{
			if (param3 < Const.DAILY_INTERVAL)
				return false;

			if (dataUnit1.volumes[param3] > 0)
				return false;

			return dataUnit2.close === dataUnit1.close && (isNaN(dataUnit1.open) || dataUnit1.open === dataUnit1.close) && (isNaN(dataUnit1.high) || dataUnit1.high === dataUnit1.close) && (isNaN(dataUnit1.low) || dataUnit1.low === dataUnit1.close);
		}

		removeObject(objectType: string, id: number)
		{
			const objPos = this.getObjPos(objectType, id);
			if (objPos !== -1)
				this.objects[objectType].splice(objPos, 1);
		}

		private addAfterHoursUnitToLastMinute(dataUnit: DataUnit, dataUnits: DataUnit[], startEndPair: StartEndPair | undefined, dataSeries: DataSeries)
		{
			let _loc5_ = 0;
			if (!startEndPair)
				return;

			const sessionIndex = dataSeries.getSessionIndex(startEndPair.start);
			if (dataUnits.length === 0)
			{
				this.addFakeDataUnitsForSessions(dataUnits, dataUnit, dataSeries, 0, sessionIndex, Directions.BACKWARD);
				this.makeDataUnitEndOfDay(dataUnit, dataUnits, startEndPair, dataSeries);
				return;
			}
			let _loc7_ = dataUnits[dataUnits.length - 1];
			const _loc8_ = notnull(dataSeries.getSessionForMinute(_loc7_.dayMinute));
			const _loc9_ = dataSeries.getSessionIndex(_loc7_.dayMinute);
			if (_loc7_ && _loc7_.dayMinute < _loc8_.end)
			{
				_loc5_ = (_loc8_.end - _loc7_.dayMinute) / this.baseMinutesInterval;
				this.addFakeDataUnits(dataUnits, _loc7_, dataSeries, _loc5_, Directions.FORWARD);
				_loc7_ = dataUnits[dataUnits.length - 1];
			}
			const _loc10_ = (dataUnit.time - _loc7_.time) / Const.MS_PER_MINUTE;
			const _loc11_ = startEndPair.end - startEndPair.start;
			const _loc12_ = dataUnit.dayMinute - startEndPair.end;
			if (_loc10_ > _loc12_ + _loc11_)
			{
				if (!DataSource.unitsInDifferentDays(_loc7_, dataUnit))
				{
					this.addFakeDataUnitsForSessions(dataUnits, dataUnits[dataUnits.length - 1], dataSeries, _loc9_ + 1, sessionIndex, Directions.FORWARD);
				}
				else
				{
					this.addFakeDataUnitsForSessions(dataUnits, dataUnits[dataUnits.length - 1], dataSeries, _loc9_ + 1, dataSeries.dataSessions.length(), Directions.FORWARD);
					this.addFakeDataUnitsForSessions(dataUnits, dataUnit, dataSeries, 0, sessionIndex, Directions.BACKWARD);
				}
				this.makeDataUnitEndOfDay(dataUnit, dataUnits, startEndPair, dataSeries);
			}
			else
			{
				_loc7_.close = dataUnit.close;
				if (!isNaN(_loc7_.high) && _loc7_.high < _loc7_.close)
					_loc7_.high = _loc7_.close;

				if (!isNaN(_loc7_.low) && _loc7_.low > _loc7_.close)
					_loc7_.low = _loc7_.close;

				const _loc13_ = dataUnit.intervals[0];
				_loc7_.volumes[_loc13_] += dataUnit.volumes[_loc13_];
			}
		}

		private getDataUnitNoValidation(param1: string[], columnTypes: ColumnTypes[], param3: Map<string>): DataUnit
		{
			const dataUnit = new DataUnit(NaN, NaN, NaN, NaN);
			for (let columnTypeIndex = 0; columnTypeIndex < columnTypes.length; columnTypeIndex++)
			{
				if (columnTypes[columnTypeIndex] === ColumnTypes.COL_DATE_TYPE)
				{
					let time: number;
					if (isNaN(Number(param1[columnTypeIndex])))
					{
						this.lastAbsTime = Number(param1[columnTypeIndex].substr(1));
						time = this.lastAbsTime * 1000;
					}
					else
					{
						const _loc7_ = this.lastAbsTime + Number(param1[columnTypeIndex]) * this.baseInterval;
						time = _loc7_ * 1000;
					}
					dataUnit.setDate(time, this.timezoneOffset);
				}
				else if (columnTypes[columnTypeIndex] === ColumnTypes.COL_CLOSE_TYPE)
				{
					dataUnit.close = Number(param1[columnTypeIndex]);
				}
				else if (columnTypes[columnTypeIndex] === ColumnTypes.COL_OPEN_TYPE)
				{
					dataUnit.open = Number(param1[columnTypeIndex]);
				}
				else if (columnTypes[columnTypeIndex] === ColumnTypes.COL_LOW_TYPE)
				{
					dataUnit.low = Number(param1[columnTypeIndex]);
				}
				else if (columnTypes[columnTypeIndex] === ColumnTypes.COL_HIGH_TYPE)
				{
					dataUnit.high = Number(param1[columnTypeIndex]);
				}
				else if (columnTypes[columnTypeIndex] === ColumnTypes.COL_VOLUME_TYPE)
				{
					// TODO
					dataUnit.volumes[Number(param3[DataSource.INTERVAL_STR])] = Number(param1[columnTypeIndex]);
					dataUnit.intervals.push(this.baseInterval);
				}
				else if (columnTypes[columnTypeIndex] === ColumnTypes.COL_CDAYS_TYPE)
				{
					dataUnit.coveredDays = Number(param1[columnTypeIndex]);
				}
			}
			return dataUnit;
		}
	}
}
