namespace com.google.finance
{
	export class DataSeries
	{
		private readonly noPointsInIntervals: { [key: number]: boolean } = {};
		private readonly pointsInIntervals: { [param: number]: DataUnit[] } = {};
		private currentSessionIndex: number = 0;

		readonly intradayRegions: StartEndPair[] = [];
		coalescedChildren: { [key: number]: DataSeries } = {};
		readonly firsts: number[] = [];
		interval = -1;
		marketDayLength: number;
		marketCloseMinute: number;
		readonly years: number[] = [];
		readonly days: number[] = [];
		marketOpenMinute: number;
		readonly intervalBounds: { [key: number]: IntervalSet } = {};
		points: indicator.IndicatorPoint[] = [];
		units: DataUnit[];
		dataSessions = new IntervalSet();
		readonly fridays: number[] = [];

		constructor()
		{
			this.units = <any>this.points;
		}

		static compareUnitAndRelativeMinute(dataUnit: DataUnit, param2: number): number
		{
			if (dataUnit.relativeMinutes < param2)
				return -1;

			if (dataUnit.relativeMinutes > param2)
				return 1;

			return 0;
		}

		getDayContainingTime(param1: number): DataUnit | null
		{
			const index = 1 + Utils.binarySearch(this.days, param1, this.compareIndexWithTime, this);
			if (index >= this.days.length)
				return null;

			const unit = this.units[this.days[index]];
			if ((unit.time - param1) / Const.MS_PER_MINUTE < unit.dayMinute)
				return unit;

			return null;
		}

		getRelativeMinuteIndex(param1: number, dataUnits?: DataUnit[]): number
		{
			const _loc4_ = Utils.binarySearch(dataUnits || this.units, param1, DataSeries.compareUnitAndRelativeMinute, this);
			return _loc4_ === -1 ? 0 : _loc4_;
		}

		printFridays()
		{
			for (const friday of this.fridays)
			{
				if (this.units[friday])
					console.log(this.units[friday]);
				else
					console.log(this.points[friday].point + ' ' + (<indicator.VolumeIndicatorPoint>this.points[friday]).volume);
			}
		}

		getCoalescedDataSeries(interval: number): DataSeries
		{
			let dataSeries = this.coalescedChildren[interval];
			if (!dataSeries)
			{
				if (interval < Const.DAILY_INTERVAL)
					dataSeries = this.createCoalescedIntradayDataSeries(interval);
				else if (interval < Const.WEEKLY_INTERVAL)
					dataSeries = this.createCoalescedDailyDataSeries(interval);
				else
					dataSeries = this.createCoalescedWeeklyDataSeries(interval);

				dataSeries.interval = interval;
				this.coalescedChildren[interval] = dataSeries;
			}
			return dataSeries;
		}

		setNoPointsInIntervalArray(param1: number)
		{
			this.noPointsInIntervals[param1] = true;
		}

		getPointsInIntervals(): { [param: number]: DataUnit[] }
		{
			return this.pointsInIntervals;
		}

		hasPointsInIntervalArray(param1: number): boolean
		{
			const unit = this.pointsInIntervals[param1];
			return unit && unit.length > 0;
		}

		compareRefPointAndRelativeMinute(indicatorPoint: com.google.finance.indicator.IndicatorPoint, param2: number): number
		{
			return DataSeries.compareUnitAndRelativeMinute(indicatorPoint.point, param2);
		}

		getReferencePointIndex(param1: number): number
		{
			const _loc2_ = Utils.binarySearch(this.points, param1, this.compareRefPointAndRelativeMinute, this);
			return _loc2_ === -1 ? 0 : _loc2_;
		}

		getLastWeeklyWeekIndex(): number
		{
			let _loc1_ = this.fridays.length - 1;
			while (_loc1_ > 0 && this.fridays[_loc1_] !== this.fridays[_loc1_ - 1] + 1 || _loc1_ === 0 && this.fridays[_loc1_] > 0)
				_loc1_--;

			return _loc1_;
		}

		getFirstRelativeMinute(): number
		{
			if (this.units.length > 0)
				return this.units[0].relativeMinutes;

			return 0;
		}

		getNextWeekEnd(param1: number): number
		{
			let _loc2_ = this.fridays.length - 1;
			while (this.fridays[_loc2_] > param1 && _loc2_ >= 0)
				_loc2_--;

			if (_loc2_ >= this.fridays.length - 1)
				return this.fridays.length - 1;

			return _loc2_ + 1;
		}

		minuteIsEndOfDataSession(param1: number): boolean
		{
			if (isNaN(param1))
				return false;

			const closestEarlierInterval = this.dataSessions.getClosestEarlierIntervalForValue(param1);
			return notnull(closestEarlierInterval).end === param1;
		}

		getIntradaySessionsString(param1: string): string
		{
			param1 += ": ";

			for (const intradayRegion of this.intradayRegions)
			{
				param1 += '[' + intradayRegion.start + ", " + intradayRegion.end + "] ";
				param1 += this.units[intradayRegion.end].dayMinute + "\n";
			}
			return param1;
		}

		getLastDailyDayIndex(): number
		{
			let _loc1_ = this.days.length - 1;
			while (_loc1_ > 0 && this.days[_loc1_] !== this.days[_loc1_ - 1] + 1 || _loc1_ === 0 && this.days[_loc1_] > 0)
				_loc1_--;

			return _loc1_;
		}

		getFirstReferencePoint(): DataUnit | null
		{
			if (this.units.length > 0)
				return this.points[0].point;

			return null;
		}

		compareUnitAndTimestamp(dataUnit: DataUnit, time: number): number
		{
			if (dataUnit.time < time)
				return -1;

			if (dataUnit.time > time)
				return 1;

			return 0;
		}

		addDataSession(param1: number, param2: number, param3: string)
		{
			this.dataSessions.addPair(new MarketSessionPair(param1, param2, param3));
		}

		relativeMinuteMetaIndex(param1: number, param2: number[]): number
		{
			const _loc3_ = Utils.binarySearch(param2, param1, this.compareIndexAndRelativeMinute, this);
			return _loc3_ === -1 ? 0 : _loc3_;
		}

		getNextDayStart(param1: number): number
		{
			if (this.days.length === 1)
				return 0;

			if (param1 > this.days[this.days.length - 1])
				return this.days.length - 1;

			return this.getPrevDayStart(param1) + 1;
		}

		getLastReferencePoint(): DataUnit | null
		{
			if (this.units.length > 0)
				return this.points[this.units.length - 1].point;
			return null;
		}

		intervalDataContainsTime(time: number, interval1: number, interval2 = NaN): boolean
		{
			const set1 = this.intervalBounds[this.intervalHashKey(interval1)];
			if (set1 && set1.containsValue(time))
				return true;

			if (!isNaN(interval2))
			{
				const set2 = this.intervalBounds[this.intervalHashKey(interval2)];
				if (set2 && set2.containsValue(time))
					return true;
			}

			return false;
		}

		getSessionForMinute(param1: number): MarketSessionPair | null
		{
			if (isNaN(param1))
				return null;	// throw?

			return <MarketSessionPair>this.dataSessions.getClosestEarlierIntervalForValue(param1);
		}

		getDaysString(): string
		{
			const daysString: string[] = [];

			for (const day of this.days)
				daysString.push(this.units[day].toString());

			return daysString.join("\n");
		}

		private createCoalescedIntradayDataSeries(param1: number): DataSeries
		{
			const dataSeries = new DataSeries();
			dataSeries.copyMarketTimesFrom(this);
			let _loc4_ = 0;
			const _loc5_ = param1 / Const.INTRADAY_INTERVAL;
			//const _loc6_ = param1 % Const.INTRADAY_INTERVAL;
			for (let dayIndex = this.getLastDailyDayIndex(); dayIndex < this.days.length - 1; dayIndex++)
			{
				const _loc7_ = (dayIndex === this.days.length - 1) ? this.units.length - 1 : this.days[dayIndex + 1];
				let _loc8_ = this.days[dayIndex] + 1;
				while (_loc8_ <= _loc7_)
				{
					const dataUnit = new DataUnit(
						NaN,
						Number.MIN_VALUE,
						Number.MAX_VALUE,
						this.units[_loc8_].open
					);
					dataUnit.fake = true;

					for (let index = 0; index < _loc5_; index++)
					{
						dataUnit.high = Math.max(dataUnit.high, this.units[_loc8_].high);
						dataUnit.low = Math.min(dataUnit.low, this.units[_loc8_].low);
						dataUnit.close = this.units[_loc8_].close;
						if (!this.units[_loc8_].fake)
							dataUnit.fake = false;

						_loc8_++;
					}
					dataUnit.exchangeDateInUTC = this.units[_loc8_ - 1].exchangeDateInUTC;
					dataUnit.dayMinute = this.units[_loc8_ - 1].dayMinute;
					dataUnit.time = this.units[_loc8_ - 1].time;
					dataUnit.relativeMinutes = this.units[_loc8_ - 1].relativeMinutes;
					dataUnit.coveredDays = 0;
					if (_loc8_ >= _loc7_)
					{
						dataSeries.days.push(dataSeries.points.length);
						_loc4_++;
					}
					dataSeries.units.push(dataUnit);
				}
			}
			return dataSeries;
		}

		getLastRelativeMinute(): number
		{
			if (this.units.length > 0)
				return this.units[this.units.length - 1].relativeMinutes;

			return 0;
		}

		compareIndexWithTime(param1: number, param2: number): number
		{
			if (this.units[param1].time < param2)
				return -1;

			if (this.units[param1].time > param2)
				return 1;

			return 0;
		}

		private createCoalescedWeeklyDataSeries(param1: number): DataSeries
		{
			const dataSeries = new DataSeries();
			dataSeries.copyMarketTimesFrom(this);

			for (const friday of this.fridays)
			{
				const dataUnit = new DataUnit(
					this.units[friday].close,
					this.units[friday].high,
					this.units[friday].low,
					this.units[friday].open
				);
				dataUnit.exchangeDateInUTC = this.units[friday].exchangeDateInUTC;
				dataUnit.dayMinute = this.units[friday].dayMinute;
				dataUnit.time = this.units[friday].time;
				dataUnit.relativeMinutes = this.units[friday].relativeMinutes;
				dataUnit.coveredDays = this.units[friday].coveredDays;
				dataSeries.fridays.push(dataSeries.points.length);
				dataSeries.units.push(dataUnit);
			}
			return dataSeries;
		}

		compareIndexAndRelativeMinute(param1: number, param2: number): number
		{
			return DataSeries.compareUnitAndRelativeMinute(this.units[param1], param2);
		}

		getSessionIndex(param1: number): number
		{
			if (isNaN(param1))
				return -1;

			const numSessions = this.dataSessions.length();
			for (let sessionIndex = 0; sessionIndex < numSessions; sessionIndex++)
			{
				const interval = this.dataSessions.getIntervalAt(sessionIndex);
				if (param1 >= interval.start && param1 <= interval.end)
					return sessionIndex;
			}
			return -1;
		}

		getFirstDailyIndex(): number
		{
			let index: number;
			for (index = 0; index < this.units.length && this.units[index].coveredDays > 1; index++)
			{
				//const _loc2_ = this.units[_loc1_];
			}
			return index;
		}

		hasNoPointsInIntervalArray(param1: number): boolean
		{
			return this.noPointsInIntervals[param1];
		}

		getTimestampIndex(time: number, dataUnits: DataUnit[]): number
		{
			const index = Utils.binarySearch(dataUnits || this.units, time, this.compareUnitAndTimestamp, this);
			return index === -1 ? 0 : index;
		}

		addIntervalBounds(interval: number, start: number, end: number)
		{
			const key = this.intervalHashKey(interval);
			let set = this.intervalBounds[key];
			if (!this.intervalBounds[key])
				set = this.intervalBounds[key] = new com.google.finance.IntervalSet();
			set.addInterval(start, end);
		}

		private getDataSession(param1: string): MarketSessionPair | null
		{
			const numSessions = this.dataSessions.length();
			for (let sessionIndex = 0; sessionIndex < numSessions; sessionIndex++)
			{
				const interval = <MarketSessionPair>this.dataSessions.getIntervalAt(sessionIndex);
				if (interval.name === param1)
					return interval;
			}
			return null;
		}

		getSessionDisplayNameForMinute(param1: number): string
		{
			const sessionForMinute = this.getSessionForMinute(param1);
			if (sessionForMinute)
			{
				switch (sessionForMinute.name)
				{
					case Const.AFTER_HOURS_NAME:
						return Const.AFTER_HOURS_DISPLAY_NAME;
					case Const.PRE_MARKET_NAME:
						return Const.PRE_MARKET_DISPLAY_NAME;
					case Const.REGULAR_MARKET_NAME:
						return Const.REGULAR_MARKET_DISPLAY_NAME;
				}
			}
			return "";
		}

		setPointsInIntervalArray(param1: number, dataUnits: DataUnit[])
		{
			this.pointsInIntervals[param1] = dataUnits;
		}

		allSessionsLength(): number
		{
			return this.dataSessions.allIntervalsLength();
		}

		getPointsInIntervalArray(interval: number): DataUnit[]
		{
			return this.pointsInIntervals[interval];
		}

		getSessionLength(param1: string): number
		{
			const dataSession = this.getDataSession(param1);
			if (dataSession)
				return dataSession.end - dataSession.start;

			return 0;
		}

		intervalDataPreceedsTime(param1: number, param2: number): boolean
		{
			const key = this.intervalHashKey(param2);
			if (this.intervalBounds[key])
			{
				const bounds = this.intervalBounds[key];
				const earliestInterval = bounds.getEarliestInterval();
				if (earliestInterval && param1 > earliestInterval.start)
					return true;
			}
			return false;
		}

		private intervalHashKey(value: number): number
		{
			return value;
		}

		clearCoalescedChildren()
		{
			this.coalescedChildren = {};
		}

		printPoints(param1: string)
		{
			for (const unit of this.units)
			{
				if (param1)
				{
					const o: any = unit;
					console.log(unit.relativeMinutes + ' ' + o[param1]);
				}
				else if (unit instanceof DataUnit)
				{
					console.log(unit);
				}
				else
				{
					console.log(Utils.appendObjectMembersAsStrings("", unit));
				}
			}
		}

		minuteIsStartOfDataSession(param1: number): boolean
		{
			if (isNaN(param1))
				return false;

			const closestEarlierInterval = notnull(this.dataSessions.getClosestEarlierIntervalForValue(param1));
			return closestEarlierInterval.start === param1;
		}

		getFirstDailyDayIndex(): number
		{
			let _loc1_ = 0;
			const firstDailyIndex = this.getFirstDailyIndex();
			while (_loc1_ < this.days.length && this.days[_loc1_] < firstDailyIndex)
			{
				//const _loc3_ = this.units[this.days[_loc1_]];
				_loc1_++;
			}
			return _loc1_;
		}

		getPrevDayStart(param1: number): number
		{
			const _loc2_ = Utils.binarySearch(this.days, param1, Utils.compareNumbers, this);
			return this.days[_loc2_] === param1 ? _loc2_ - 1 : _loc2_;
		}

		private createCoalescedDailyDataSeries(param1: number): DataSeries
		{
			const dataSeries = new DataSeries();
			dataSeries.copyMarketTimesFrom(this);
			const firstDailyDayIndex = this.getFirstDailyDayIndex();
			for (let _loc4_ = firstDailyDayIndex; _loc4_ < this.days.length; _loc4_++)
			{
				const day = this.days[_loc4_];
				const dataUnit = new DataUnit(
					this.units[day].close,
					this.units[day].high,
					this.units[day].low,
					this.units[day].open
				);

				dataUnit.exchangeDateInUTC = this.units[day].exchangeDateInUTC;
				dataUnit.dayMinute = this.units[day].dayMinute;
				dataUnit.time = this.units[day].time;
				dataUnit.relativeMinutes = this.units[day].relativeMinutes;
				dataUnit.coveredDays = this.units[day].coveredDays;
				dataSeries.days.push(dataSeries.points.length);
				dataSeries.units.push(dataUnit);
			}
			return dataSeries;
		}

		copyMarketTimesFrom(dataSeries: DataSeries)
		{
			this.dataSessions = dataSeries.dataSessions;
			this.currentSessionIndex = 0;
			this.marketOpenMinute = dataSeries.marketOpenMinute;
			this.marketCloseMinute = dataSeries.marketCloseMinute;
			this.marketDayLength = dataSeries.marketDayLength;
		}
	}
}
