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
		detailType: ChartDetailTypes|null;
		columns: string;
		callbacks?: EventCallback[];

		constructor(public readonly type = ChartEventTypes.GENERIC)
		{
		}

		getEventName(period?: string): string
		{
			let eventName = "";
			if (this.quote)
				eventName = eventName + ("" + this.quote);

			if (this.type)
				eventName = eventName + ("-t:" + this.type);

			if (this.interval)
				eventName = eventName + ("-i:" + this.interval);

			if (period)
				eventName = eventName + ("-p:" + period);
			else if (this.period)
				eventName = eventName + ("-p:" + this.period);

			if (this.startTime)
				eventName = eventName + ("-st:" + this.startTime);

			return eventName;
		}
	}
}
