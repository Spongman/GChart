namespace com.google.finance
{
	export class DataSeries
	{
		private readonly noPointsInIntervals: { [key: number]: boolean } = {};
		private readonly pointsInIntervals: { [key: number]: DataUnit[] } = [];
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
			const _loc2_ = 1 + Utils.binarySearch(this.days, param1, this.compareIndexWithTime, this);
			if (_loc2_ >= this.days.length)
				return null;

			const unit = this.units[this.days[_loc2_]];
			if ((unit.time - param1) / Const.MS_PER_MINUTE < unit.dayMinute)
				return unit;

			return null;
		}

		getRelativeMinuteIndex(param1: number, dataUnits?: DataUnit[]): number
		{
			const units = !dataUnits ? this.units : dataUnits;
			const index = Utils.binarySearch(units, param1, DataSeries.compareUnitAndRelativeMinute, this);
			return index === -1 ? 0 : index;
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
			let _loc2_ = this.coalescedChildren[interval];
			if (!_loc2_)
			{
				if (interval < Const.DAILY_INTERVAL)
					_loc2_ = this.createCoalescedIntradayDataSeries(interval);
				else if (interval < Const.WEEKLY_INTERVAL)
					_loc2_ = this.createCoalescedDailyDataSeries(interval);
				else
					_loc2_ = this.createCoalescedWeeklyDataSeries(interval);

				_loc2_.interval = interval;
				this.coalescedChildren[interval] = _loc2_;
			}
			return _loc2_;
		}

		setNoPointsInIntervalArray(param1: number)
		{
			this.noPointsInIntervals[param1] = true;
		}

		getPointsInIntervals()
		{
			return this.pointsInIntervals;
		}

		hasPointsInIntervalArray(param1: number): boolean
		{
			const points = this.pointsInIntervals[param1];
			return points && points.length > 0;
		}

		compareRefPointAndRelativeMinute(indicatorPoint: indicator.IndicatorPoint, param2: number): number
		{
			return DataSeries.compareUnitAndRelativeMinute(indicatorPoint.point, param2);
		}

		getReferencePointIndex(param1: number): number
		{
			const index = Utils.binarySearch(this.points, param1, this.compareRefPointAndRelativeMinute, this);
			return index === -1 ? 0 : index;
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

		minuteIsEndOfDataSession(end: number): boolean
		{
			if (isNaN(end))
				return false;

			const closestEarlierInterval = this.dataSessions.getClosestEarlierIntervalForValue(end);
			return notnull(closestEarlierInterval).end === end;
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

		compareUnitAndTimestamp(dataUnit: DataUnit, param2: number): number
		{
			if (dataUnit.time < param2)
				return -1;

			if (dataUnit.time > param2)
				return 1;

			return 0;
		}

		addDataSession(param1: number, param2: number, param3: string)
		{
			this.dataSessions.addPair(new MarketSessionPair(param1, param2, param3));
		}

		relativeMinuteMetaIndex(param1: number, param2: number[]): number
		{
			const index = Utils.binarySearch(param2, param1, this.compareIndexAndRelativeMinute, this);
			return index === -1 ? 0 : index;
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

		intervalDataContainsTime(param1: number, param2: number, param3 = NaN): boolean
		{
			let key = this.intervalHashKey(param2);
			if (this.intervalBounds[key])
			{
				const bounds = this.intervalBounds[key];
				if (bounds.containsValue(param1))
					return true;
			}
			key = this.intervalHashKey(param3);
			if (!isNaN(param3) && this.intervalBounds[key])
			{
				const bounds = this.intervalBounds[key];
				if (bounds.containsValue(param1))
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
			const _loc1_: string[] = [];

			for (const day of this.days)
				_loc1_.push(this.units[day].toString());

			return _loc1_.join("\n");
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

		compareIndexWithTime(index: number, time: number): number
		{
			if (this.units[index].time < time)
				return -1;

			if (this.units[index].time > time)
				return 1;

			return 0;
		}

		private createCoalescedWeeklyDataSeries(param1: number): DataSeries
		{
			const dataSeries = new DataSeries();
			dataSeries.copyMarketTimesFrom(this);

			for (const friday of this.fridays)
			{
				const _loc4_ = friday;
				const dataUnit = new DataUnit(
					this.units[_loc4_].close,
					this.units[_loc4_].high,
					this.units[_loc4_].low,
					this.units[_loc4_].open
				);
				dataUnit.exchangeDateInUTC = this.units[_loc4_].exchangeDateInUTC;
				dataUnit.dayMinute = this.units[_loc4_].dayMinute;
				dataUnit.time = this.units[_loc4_].time;
				dataUnit.relativeMinutes = this.units[_loc4_].relativeMinutes;
				dataUnit.coveredDays = this.units[_loc4_].coveredDays;
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
			let _loc1_: number;
			for (_loc1_ = 0; _loc1_ < this.units.length && this.units[_loc1_].coveredDays > 1; _loc1_++)
			{
				//const _loc2_ = this.units[_loc1_];
			}
			return _loc1_;
		}

		hasNoPointsInIntervalArray(param1: number): boolean
		{
			return this.noPointsInIntervals[param1];
		}

		getTimestampIndex(timestamp: number, dataUnits: DataUnit[]): number
		{
			const units = !dataUnits ? this.units : dataUnits;
			const index = Utils.binarySearch(units, timestamp, this.compareUnitAndTimestamp, this);
			return index === -1 ? 0 : index;
		}

		addIntervalBounds(param1: number, param2: number, param3: number)
		{
			const key = this.intervalHashKey(param1);
			if (!this.intervalBounds[key])
				this.intervalBounds[key] = new IntervalSet();
			const bounds = this.intervalBounds[key];
			bounds.addInterval(param2, param3);
		}

		private getDataSession(name: string): MarketSessionPair | null
		{
			const numSessions = this.dataSessions.length();
			for (let sessionIndex = 0; sessionIndex < numSessions; sessionIndex++)
			{
				const pair = <MarketSessionPair>this.dataSessions.getIntervalAt(sessionIndex);
				if (pair.name === name)
					return pair;
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

		getPointsInIntervalArray(param1: number): DataUnit[]
		{
			return this.pointsInIntervals[param1];
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

		private intervalHashKey(param1: number): number
		{
			return param1;
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

		minuteIsStartOfDataSession(start: number): boolean
		{
			if (isNaN(start))
				return false;

			const closestEarlierInterval = notnull(this.dataSessions.getClosestEarlierIntervalForValue(start));
			return closestEarlierInterval.start === start;
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
			const index = Utils.binarySearch(this.days, param1, Utils.compareNumbers, this);
			return this.days[index] === param1 ? index - 1 : index;
		}

		private createCoalescedDailyDataSeries(param1: number): DataSeries
		{
			const dataSeries = new DataSeries();
			dataSeries.copyMarketTimesFrom(this);
			const firstDailyDayIndex = this.getFirstDailyDayIndex();
			for (let _loc4_ = firstDailyDayIndex; _loc4_ < this.days.length; _loc4_++)
			{
				const day = this.days[_loc4_];
				const originalUnit = this.units[day];
				const dataUnit = new DataUnit(
					originalUnit.close,
					originalUnit.high,
					originalUnit.low,
					originalUnit.open
				);

				dataUnit.exchangeDateInUTC = originalUnit.exchangeDateInUTC;
				dataUnit.dayMinute = originalUnit.dayMinute;
				dataUnit.time = originalUnit.time;
				dataUnit.relativeMinutes = originalUnit.relativeMinutes;
				dataUnit.coveredDays = originalUnit.coveredDays;
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
