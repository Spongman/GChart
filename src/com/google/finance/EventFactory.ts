namespace com.google.finance
{
	export class EventFactory
	{
		private static buildEvent(chartEventType: ChartEventTypes, quote: string, period: string, interval: number, columns: string, detailType: ChartDetailTypes | null = null): ChartEvent
		{
			const chartEvent = new ChartEvent(chartEventType);
			chartEvent.detailType = detailType;
			chartEvent.quote = quote;
			chartEvent.period = period;
			chartEvent.interval = "" + interval;
			chartEvent.columns = columns;
			return chartEvent;
		}

		static getEvent(detailType: ChartDetailTypes, quote: string, priorities: ChartEventPriorities): ChartEvent
		{
			let event: ChartEvent;
			if (Const.INDICATOR_ENABLED)
			{
				const delayedMinutes: number = MainManager.paramsObj && MainManager.paramsObj.delayedMinutes >= 0 ? MainManager.paramsObj.delayedMinutes : 0;
				switch (detailType)
				{
					default:
					case ChartDetailTypes.GET_1Y_DATA:
						event = EventFactory.buildEvent(ChartEventTypes.GET_DATA, quote, "1Y", Const.DAILY_INTERVAL, "d,c,v,o,h,l", detailType);
						break;
					case ChartDetailTypes.GET_5Y_DATA:
						event = EventFactory.buildEvent(ChartEventTypes.GET_DATA, quote, "5Y", Const.WEEKLY_INTERVAL, "d,c,v,k,o,h,l", detailType);
						break;
					case ChartDetailTypes.GET_2Y_DATA:
						event = EventFactory.buildEvent(ChartEventTypes.GET_DATA, quote, "2Y", Const.DAILY_INTERVAL, "d,c,v", detailType);
						break;
					case ChartDetailTypes.GET_5D_DATA:
						event = EventFactory.buildEvent(ChartEventTypes.GET_DATA, quote, "5d", Const.INTRADAY_INTERVAL, "d,c,v,o,h,l", detailType);
						break;
					case ChartDetailTypes.GET_AH_DATA:
						event = EventFactory.buildEvent(ChartEventTypes.GET_AH_DATA, quote, "5d", Const.INTRADAY_INTERVAL, "d,c,v,o,h,l", detailType);
						break;
					case ChartDetailTypes.MUTF_5D_DATA:
						event = EventFactory.buildEvent(ChartEventTypes.GET_MUTF_DATA, quote, "5d", Const.DAILY_INTERVAL, "d,c,v", detailType);
						break;
					case ChartDetailTypes.GET_40Y_DATA:
						event = EventFactory.buildEvent(ChartEventTypes.GET_DATA, quote, "40Y", Const.WEEKLY_INTERVAL, "d,c,v,k,o,h,l", detailType);
						break;
					case ChartDetailTypes.GET_10D_DATA:
						event = EventFactory.buildEvent(ChartEventTypes.GET_DATA, quote, "10d", Const.FIVE_MINUTE_INTERVAL, "d,c,v,o,h,l", detailType);
						break;
					case ChartDetailTypes.GET_30D_DATA:
						event = EventFactory.buildEvent(ChartEventTypes.GET_DATA, quote, "30d", Const.HALF_HOUR_INTERVAL, "d,c,v,o,h,l", detailType);
						break;
					case ChartDetailTypes.GET_RT_DATA:
						event = EventFactory.buildEvent(ChartEventTypes.GET_RT_DATA, quote, "" + (delayedMinutes + 10) + 'm', Const.INTRADAY_INTERVAL, "d,c,v,o,h,l", detailType);
						break;
					case ChartDetailTypes.GET_RT_AH_DATA:
						event = EventFactory.buildEvent(ChartEventTypes.GET_RT_AH_DATA, quote, "" + (delayedMinutes + 10) + 'm', Const.INTRADAY_INTERVAL, "d,c,v,o,h,l", detailType);
						break;
				}
			}
			else
			{
				switch (detailType)
				{
					default:
					case ChartDetailTypes.GET_1Y_DATA:
						event = EventFactory.buildEvent(ChartEventTypes.GET_DATA, quote, "1Y", Const.DAILY_INTERVAL, "d,c,v");
						break;
					case ChartDetailTypes.GET_5Y_DATA:
						event = EventFactory.buildEvent(ChartEventTypes.GET_DATA, quote, "5Y", Const.WEEKLY_INTERVAL, "d,c,v,k");
						break;
					case ChartDetailTypes.GET_2Y_DATA:
						event = EventFactory.buildEvent(ChartEventTypes.GET_DATA, quote, "2Y", Const.DAILY_INTERVAL, "d,c,v");
						break;
					case ChartDetailTypes.GET_5D_DATA:
						event = EventFactory.buildEvent(ChartEventTypes.GET_DATA, quote, "5d", Const.INTRADAY_INTERVAL, "d,c,v");
						break;
					case ChartDetailTypes.GET_AH_DATA:
						event = EventFactory.buildEvent(ChartEventTypes.GET_AH_DATA, quote, "5d", Const.INTRADAY_INTERVAL, "d,c,v");
						break;
					case ChartDetailTypes.MUTF_5D_DATA:
						event = EventFactory.buildEvent(ChartEventTypes.GET_MUTF_DATA, quote, "5d", Const.DAILY_INTERVAL, "d,c,v");
						break;
					case ChartDetailTypes.GET_40Y_DATA:
						event = EventFactory.buildEvent(ChartEventTypes.GET_DATA, quote, "40Y", Const.WEEKLY_INTERVAL, "d,c,v,k");
						break;
				}
			}
			event.priority = priorities;
			return event;
		}
	}
}
