namespace com.google.finance
{
	export enum ChartEventTypes
	{
		GENERIC = 0,
		GET_DATA = 1,
		GET_AH_DATA = 2,
		GET_MUTF_DATA = 3,
		GET_RT_DATA = 4,
		GET_RT_AH_DATA = 5,
	}

	export enum ChartEventPriorities
	{
		EXPECTED = 0,
		REQUIRED = 1,
		OPTIONAL = 2,
		DONE = 3,
		OHLC_REQUIRED = 4,
		OHLC_DONE = 5,
		POLLING = 6,
	}	


	export class ChartEvent
	{
		quote: string;
		interval: string;
		period: string;
		priority: ChartEventPriorities;
		startTime: string;
		detailType: number|null;
		columns: string;
		callbacks?: EventCallback[];

		constructor(public readonly type = ChartEventTypes.GENERIC)
		{
		}

		getEventName(period?: string): string
		{
			let _loc2_ = "";
			if (this.quote)
				_loc2_ = _loc2_ + ("" + this.quote);

			if (this.type)
				_loc2_ = _loc2_ + ("-t:" + this.type);

			if (this.interval)
				_loc2_ = _loc2_ + ("-i:" + this.interval);

			if (period)
				_loc2_ = _loc2_ + ("-p:" + period);
			else if (this.period)
				_loc2_ = _loc2_ + ("-p:" + this.period);

			if (this.startTime)
				_loc2_ = _loc2_ + ("-st:" + this.startTime);

			return _loc2_;
		}
	}
}
