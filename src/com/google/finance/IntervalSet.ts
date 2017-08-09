namespace com.google.finance
{
	export class IntervalSet
	{
		private intervals: StartEndPair[] = [];

		getIntervalForValue(param1: number): StartEndPair | null
		{
			let _loc2_ = this.intervals.length - 1;
			while (_loc2_ >= 0 && this.intervals[_loc2_].start > param1)
				_loc2_--;

			if (_loc2_ === -1 || this.intervals[_loc2_].end < param1)
				return null;	// error?

			return this.intervals[_loc2_];
		}

		addInterval(param1: number, param2: number) 
		{
			this.addPair(new StartEndPair(param1, param2));
		}

		getClosestEarlierIntervalForValue(param1: number): StartEndPair | null
		{
			if (this.intervals.length === 0)
				return null;	// throw?

			let _loc2_: StartEndPair | null = null;
			for (let _loc3_ = 0; _loc3_ < this.intervals.length; _loc3_++)
			{
				const _loc4_ = this.intervals[_loc3_];
				if (_loc4_.start <= param1 && param1 <= _loc4_.end)
					return _loc4_;

				if (_loc4_.end < param1)
				{
					if (!_loc2_ || _loc2_.end < _loc4_.end)
						_loc2_ = _loc4_;
				}
			}
			if (_loc2_)
				return _loc2_;

			return this.getEarliestInterval();
		}

		toString(): string
		{
			return this.intervals.join(",");
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

		containsValue(param1: number): boolean
		{
			const _loc2_ = this.getIntervalForValue(param1);
			return !!_loc2_;
		}

		allIntervalsLength(): number
		{
			let _loc1_ = 0;
			for (let _loc2_ = 0; _loc2_ < this.intervals.length; _loc2_++)
			{
				const _loc3_ = this.intervals[_loc2_];
				_loc1_ = Number(_loc1_ + (_loc3_.end - _loc3_.start));
			}
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

			let _loc2_: number = 0;
			while (_loc2_ < this.intervals.length)
			{
				if (pair.end < this.intervals[_loc2_].start)
				{
					this.intervals.splice(_loc2_, 0, pair);
					return;
				}
				if (pair.start <= this.intervals[_loc2_].end)
				{
					pair.start = Math.min(pair.start, this.intervals[_loc2_].start);
					pair.end = Math.max(pair.end, this.intervals[_loc2_].end);
					this.intervals.splice(_loc2_, 1);
				}
				else
				{
					_loc2_++;
				}
			}
			if (_loc2_ === this.intervals.length)
				this.intervals.push(pair);
		}

		equals(param1: any): boolean
		{
			if (!(param1 instanceof IntervalSet))
				return false;

			if (param1.intervals.length !== this.intervals.length)
				return false;

			for (let _loc2_ = 0; _loc2_ < this.intervals.length; _loc2_++)
			{
				if (!this.intervals[_loc2_].equals(param1.intervals[_loc2_]))
					return false;
			}
			return true;
		}
	}
}
