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

		static compareUnitAndRelativeMinute(param1: DataUnit, param2: number): number
		{
			if (param1.relativeMinutes < param2)
				return -1;

			if (param1.relativeMinutes > param2)
				return 1;

			return 0;
		}

		getDayContainingTime(param1: number): DataUnit | null
		{
			const _loc2_ = 1 + Utils.binarySearch(this.days, param1, this.compareIndexWithTime, this);
			if (_loc2_ >= this.days.length)
				return null;

			const _loc3_ = this.units[this.days[_loc2_]];
			if ((_loc3_.time - param1) / Const.MS_PER_MINUTE < _loc3_.dayMinute)
				return _loc3_;

			return null;
		}

		getRelativeMinuteIndex(param1: number, param2?: DataUnit[]): number
		{
			const _loc3_ = !param2 ? this.units : param2;
			const _loc4_ = Utils.binarySearch(_loc3_, param1, DataSeries.compareUnitAndRelativeMinute, this);
			return _loc4_ === -1 ? 0 : _loc4_;
		}

		printFridays() 
		{
			for (let _loc1_ = 0; _loc1_ < this.fridays.length; _loc1_++)
			{
				if (this.units[this.fridays[_loc1_]])
					console.log(this.units[this.fridays[_loc1_]]);
				else
					console.log(this.points[this.fridays[_loc1_]].point + " " + (<indicator.VolumeIndicatorPoint>this.points[this.fridays[_loc1_]]).volume);
			}
		}

		getCoalescedDataSeries(param1: number): DataSeries
		{
			let _loc2_ = this.coalescedChildren[param1];
			if (!_loc2_)
			{
				if (param1 < Const.DAILY_INTERVAL)
					_loc2_ = this.createCoalescedIntradayDataSeries(param1);
				else if (param1 < Const.WEEKLY_INTERVAL)
					_loc2_ = this.createCoalescedDailyDataSeries(param1);
				else
					_loc2_ = this.createCoalescedWeeklyDataSeries(param1);

				_loc2_.interval = param1;
				this.coalescedChildren[param1] = _loc2_;
			}
			return _loc2_;
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
			const _loc2_ = this.pointsInIntervals[param1];
			return _loc2_ && _loc2_.length > 0;
		}

		compareRefPointAndRelativeMinute(param1: com.google.finance.indicator.IndicatorPoint, param2: number): number
		{
			return DataSeries.compareUnitAndRelativeMinute(param1.point, param2);
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

			const _loc2_ = this.dataSessions.getClosestEarlierIntervalForValue(param1);
			return notnull(_loc2_).end === param1;
		}

		getIntradaySessionsString(param1: string): string
		{
			param1 = param1 + ": ";

			for (let _loc2_ = 0; _loc2_ < this.intradayRegions.length; _loc2_++)
			{
				param1 = param1 + ("[" + this.intradayRegions[_loc2_].start + ", " + this.intradayRegions[_loc2_].end + "] ");
				param1 = param1 + (this.units[this.intradayRegions[_loc2_].end].dayMinute + "\n");
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

		compareUnitAndTimestamp(param1: DataUnit, param2: number): number
		{
			if (param1.time < param2)
				return -1;

			if (param1.time > param2)
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

		intervalDataContainsTime(param1: number, param2: number, param3 = NaN): boolean
		{
			let _loc5_ = this.intervalHashKey(param2);
			if (this.intervalBounds[_loc5_])
			{
				const _loc4_ = this.intervalBounds[_loc5_];
				if (_loc4_.containsValue(param1))
					return true;
			}
			_loc5_ = this.intervalHashKey(param3);
			if (!isNaN(param3) && this.intervalBounds[_loc5_])
			{
				const _loc4_ = this.intervalBounds[_loc5_];
				if (_loc4_.containsValue(param1))
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

			for (let _loc2_ = 0; _loc2_ < this.days.length; _loc2_++)
			{
				_loc1_.push(this.units[this.days[_loc2_]].toString());
			}
			return _loc1_.join("\n");
		}

		private createCoalescedIntradayDataSeries(param1: number): DataSeries
		{
			let _loc8_ = 0;
			const _loc2_ = new DataSeries();
			_loc2_.copyMarketTimesFrom(this);
			let _loc4_ = 0;
			const _loc5_ = param1 / Const.INTRADAY_INTERVAL;
			//const _loc6_ = param1 % Const.INTRADAY_INTERVAL;
			for (let _loc3_ = this.getLastDailyDayIndex(); _loc3_ < this.days.length - 1; _loc3_++)			
			{
				let _loc7_ = 0;
				if (_loc3_ === this.days.length - 1)
					_loc7_ = this.units.length - 1;
				else
					_loc7_ = this.days[_loc3_ + 1];

				_loc8_ = this.days[_loc3_] + 1;
				while (_loc8_ <= _loc7_)
				{
					const _loc9_ = new DataUnit(
						NaN,
						Number.MIN_VALUE,
						Number.MAX_VALUE,
						this.units[_loc8_].open
					);
					_loc9_.fake = true;

					for (let _loc10_ = 0; _loc10_ < _loc5_; _loc10_++)
					{
						_loc9_.high = Math.max(_loc9_.high, this.units[_loc8_].high);
						_loc9_.low = Math.min(_loc9_.low, this.units[_loc8_].low);
						_loc9_.close = this.units[_loc8_].close;
						if (!this.units[_loc8_].fake)
							_loc9_.fake = false;

						_loc8_++;
					}
					_loc9_.exchangeDateInUTC = this.units[_loc8_ - 1].exchangeDateInUTC;
					_loc9_.dayMinute = this.units[_loc8_ - 1].dayMinute;
					_loc9_.time = this.units[_loc8_ - 1].time;
					_loc9_.relativeMinutes = this.units[_loc8_ - 1].relativeMinutes;
					_loc9_.coveredDays = 0;
					if (_loc8_ >= _loc7_)
					{
						_loc2_.days.push(_loc2_.points.length);
						_loc4_++;
					}
					_loc2_.units.push(_loc9_);
				}
			}
			return _loc2_;
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
			let _loc4_ = 0;
			const _loc2_ = new DataSeries();
			_loc2_.copyMarketTimesFrom(this);

			for (let _loc3_ = 0; _loc3_ < this.fridays.length; _loc3_++)
			{
				_loc4_ = this.fridays[_loc3_];
				const _loc5_ = new DataUnit(
					this.units[_loc4_].close,
					this.units[_loc4_].high,
					this.units[_loc4_].low,
					this.units[_loc4_].open
				);
				_loc5_.exchangeDateInUTC = this.units[_loc4_].exchangeDateInUTC;
				_loc5_.dayMinute = this.units[_loc4_].dayMinute;
				_loc5_.time = this.units[_loc4_].time;
				_loc5_.relativeMinutes = this.units[_loc4_].relativeMinutes;
				_loc5_.coveredDays = this.units[_loc4_].coveredDays;
				_loc2_.fridays.push(_loc2_.points.length);
				_loc2_.units.push(_loc5_);
			}
			return _loc2_;
		}

		compareIndexAndRelativeMinute(param1: number, param2: number): number
		{
			return DataSeries.compareUnitAndRelativeMinute(this.units[param1], param2);
		}

		getSessionIndex(param1: number): number
		{
			if (isNaN(param1))
				return -1;

			const _loc2_ = this.dataSessions.length();

			for (let _loc3_ = 0; _loc3_ < _loc2_; _loc3_++)
			{
				const _loc4_ = this.dataSessions.getIntervalAt(_loc3_);
				if (param1 >= _loc4_.start && param1 <= _loc4_.end)
					return _loc3_;
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

		getTimestampIndex(param1: number, param2: DataUnit[]): number
		{
			const _loc3_ = !param2 ? this.units : param2;
			const _loc4_ = Utils.binarySearch(_loc3_, param1, this.compareUnitAndTimestamp, this);
			return _loc4_ === -1 ? 0 : _loc4_;
		}

		addIntervalBounds(param1: number, param2: number, param3: number) 
		{
			const _loc4_ = this.intervalHashKey(param1);
			if (!this.intervalBounds[_loc4_])
				this.intervalBounds[_loc4_] = new com.google.finance.IntervalSet();
			const _loc5_ = this.intervalBounds[_loc4_];
			_loc5_.addInterval(param2, param3);
		}

		private getDataSession(param1: string): MarketSessionPair | null
		{
			const _loc2_ = this.dataSessions.length();
			for (let _loc3_ = 0; _loc3_ < _loc2_; _loc3_++)
			{
				const _loc4_ = <MarketSessionPair>this.dataSessions.getIntervalAt(_loc3_);
				if (_loc4_.name === param1)
					return _loc4_;
			}
			return null;
		}

		getSessionDisplayNameForMinute(param1: number): string
		{
			const _loc2_ = this.getSessionForMinute(param1);
			if (_loc2_)
			{
				switch (_loc2_.name)
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

		setPointsInIntervalArray(param1: number, param2: DataUnit[]) 
		{
			this.pointsInIntervals[param1] = param2;
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
			const _loc2_ = this.getDataSession(param1);
			if (_loc2_)
				return _loc2_.end - _loc2_.start;

			return 0;
		}

		intervalDataPreceedsTime(param1: number, param2: number): boolean
		{
			const _loc3_ = this.intervalHashKey(param2);
			if (this.intervalBounds[_loc3_])
			{
				const _loc4_ = this.intervalBounds[_loc3_];
				const _loc5_ = _loc4_.getEarliestInterval();
				if (_loc5_ && param1 > _loc5_.start)
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
			for (let _loc2_ = 0; _loc2_ < this.units.length; _loc2_++)
			{
				if (param1)
				{
					let o:any = this.units[_loc2_]
					console.log(this.units[_loc2_].relativeMinutes + " " + o[param1]);
				}
				else if (this.units[_loc2_] instanceof DataUnit)
				{
					console.log(this.units[_loc2_]);
				}
				else
				{
					console.log(Utils.appendObjectMembersAsStrings("", this.units[_loc2_]));
				}
			}
		}

		minuteIsStartOfDataSession(param1: number): boolean
		{
			if (isNaN(param1))
				return false;

			const _loc2_ = notnull(this.dataSessions.getClosestEarlierIntervalForValue(param1));
			return _loc2_.start === param1;
		}

		getFirstDailyDayIndex(): number
		{
			let _loc1_ = 0;
			const _loc2_ = this.getFirstDailyIndex();
			while (_loc1_ < this.days.length && this.days[_loc1_] < _loc2_)
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
			let _loc5_ = 0;
			const _loc2_ = new DataSeries();
			_loc2_.copyMarketTimesFrom(this);
			const _loc3_ = this.getFirstDailyDayIndex();
			for (let _loc4_ = _loc3_; _loc4_ < this.days.length; _loc4_++)				
			{
				_loc5_ = this.days[_loc4_];
				const _loc6_ = new DataUnit(
					this.units[_loc5_].close,
					this.units[_loc5_].high,
					this.units[_loc5_].low,
					this.units[_loc5_].open
				);

				_loc6_.exchangeDateInUTC = this.units[_loc5_].exchangeDateInUTC;
				_loc6_.dayMinute = this.units[_loc5_].dayMinute;
				_loc6_.time = this.units[_loc5_].time;
				_loc6_.relativeMinutes = this.units[_loc5_].relativeMinutes;
				_loc6_.coveredDays = this.units[_loc5_].coveredDays;
				_loc2_.days.push(_loc2_.points.length);
				_loc2_.units.push(_loc6_);
			}
			return _loc2_;
		}

		copyMarketTimesFrom(param1: DataSeries) 
		{
			this.dataSessions = param1.dataSessions;
			this.currentSessionIndex = 0;
			this.marketOpenMinute = param1.marketOpenMinute;
			this.marketCloseMinute = param1.marketCloseMinute;
			this.marketDayLength = param1.marketDayLength;
		}
	}
}
