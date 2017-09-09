namespace com.google.finance
{
	export class IntervalSet
	{
		private intervals: StartEndPair[] = [];

		getIntervalForValue(value: number): StartEndPair | null
		{
			let index = this.intervals.length - 1;
			while (index >= 0 && this.intervals[index].start > value)
				index--;

			if (index === -1 || this.intervals[index].end < value)
				return null;	// error?

			return this.intervals[index];
		}

		addInterval(start: number, end: number)
		{
			this.addPair(new StartEndPair(start, end));
		}

		getClosestEarlierIntervalForValue(value: number): StartEndPair | null
		{
			if (this.intervals.length === 0)
				return null;	// throw?

			let latestInterval: StartEndPair | null = null;
			for (const interval of this.intervals)
			{
				if (interval.start <= value && value <= interval.end)
					return interval;

				if (interval.end < value)
				{
					if (!latestInterval || latestInterval.end < interval.end)
						latestInterval = interval;
				}
			}
			if (latestInterval)
				return latestInterval;

			return this.getEarliestInterval();
		}

		toString(): string
		{
			return this.intervals.join(',');
		}

		length(): number
		{
			return this.intervals.length;
		}

		getEarliestInterval(): StartEndPair | null
		{
			if (this.intervals.length === 0)
				return null;	// throw?

			return this.intervals[0];
		}

		containsValue(value: number): boolean
		{
			return !!this.getIntervalForValue(value);
		}

		allIntervalsLength(): number
		{
			let _loc1_ = 0;
			for (const interval of this.intervals)
				_loc1_ = Number(_loc1_ + (interval.end - interval.start));
			return _loc1_;
		}

		getIntervalAt(index: number): StartEndPair
		{
			return this.intervals[index];
		}

		addPair(pair: StartEndPair)
		{
			if (pair.start > pair.end)
				return;

			let intervalIndex: number = 0;
			while (intervalIndex < this.intervals.length)
			{
				if (pair.end < this.intervals[intervalIndex].start)
				{
					this.intervals.splice(intervalIndex, 0, pair);
					return;
				}

				if (pair.start <= this.intervals[intervalIndex].end)
				{
					pair.start = Math.min(pair.start, this.intervals[intervalIndex].start);
					pair.end = Math.max(pair.end, this.intervals[intervalIndex].end);
					this.intervals.splice(intervalIndex, 1);
				}
				else
				{
					intervalIndex++;
				}
			}
			if (intervalIndex === this.intervals.length)
				this.intervals.push(pair);
		}

		equals(param1: any): boolean
		{
			if (!(param1 instanceof IntervalSet))
				return false;

			if (param1.intervals.length !== this.intervals.length)
				return false;

			for (let pairIndex = 0; pairIndex < this.intervals.length; pairIndex++)
			{
				if (!this.intervals[pairIndex].equals(param1.intervals[pairIndex]))
					return false;
			}
			return true;
		}
	}
}
