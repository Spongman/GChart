namespace com.google.finance
{
	export class EventFactory
	{
		private static buildEvent(chartEventType: ChartEventTypes, quote: string, period: string, interval: number, columns: string, chartEventStyle: ChartEventStyles = <ChartEventStyles>-1): ChartEvent
		{
			const chartEvent = new ChartEvent(chartEventType);
			chartEvent.detailType = (chartEventStyle !== <ChartEventStyles>-1) ? chartEventStyle : null;
			chartEvent.quote = quote;
			chartEvent.period = period;
			chartEvent.interval = "" + interval;
			chartEvent.columns = columns;
			return chartEvent;
		}

		static getEvent(chartEventStyle: ChartEventStyles, param2: string, priorities: ChartEventPriorities): ChartEvent
		{
			let _loc4_: ChartEvent;
			if (Const.INDICATOR_ENABLED)
			{
				const _loc5_ = MainManager.paramsObj && MainManager.paramsObj.delayedMinutes >= 0 ? MainManager.paramsObj.delayedMinutes : 0;
				switch (chartEventStyle)
				{
					default:
					case ChartEventStyles.GET_1Y_DATA:
						_loc4_ = EventFactory.buildEvent(ChartEventTypes.GET_DATA, param2, "1Y", Const.DAILY_INTERVAL, "d,c,v,o,h,l", chartEventStyle);
						break;
					case ChartEventStyles.GET_5Y_DATA:
						_loc4_ = EventFactory.buildEvent(ChartEventTypes.GET_DATA, param2, "5Y", Const.WEEKLY_INTERVAL, "d,c,v,k,o,h,l", chartEventStyle);
						break;
					case ChartEventStyles.GET_2Y_DATA:
						_loc4_ = EventFactory.buildEvent(ChartEventTypes.GET_DATA, param2, "2Y", Const.DAILY_INTERVAL, "d,c,v", chartEventStyle);
						break;
					case ChartEventStyles.GET_5D_DATA:
						_loc4_ = EventFactory.buildEvent(ChartEventTypes.GET_DATA, param2, "5d", Const.INTRADAY_INTERVAL, "d,c,v,o,h,l", chartEventStyle);
						break;
					case ChartEventStyles.GET_AH_DATA:
						_loc4_ = EventFactory.buildEvent(ChartEventTypes.GET_AH_DATA, param2, "5d", Const.INTRADAY_INTERVAL, "d,c,v,o,h,l", chartEventStyle);
						break;
					case ChartEventStyles.MUTF_5D_DATA:
						_loc4_ = EventFactory.buildEvent(ChartEventTypes.GET_MUTF_DATA, param2, "5d", Const.DAILY_INTERVAL, "d,c,v", chartEventStyle);
						break;
					case ChartEventStyles.GET_40Y_DATA:
						_loc4_ = EventFactory.buildEvent(ChartEventTypes.GET_DATA, param2, "40Y", Const.WEEKLY_INTERVAL, "d,c,v,k,o,h,l", chartEventStyle);
						break;
					case ChartEventStyles.GET_10D_DATA:
						_loc4_ = EventFactory.buildEvent(ChartEventTypes.GET_DATA, param2, "10d", Const.FIVE_MINUTE_INTERVAL, "d,c,v,o,h,l", chartEventStyle);
						break;
					case ChartEventStyles.GET_30D_DATA:
						_loc4_ = EventFactory.buildEvent(ChartEventTypes.GET_DATA, param2, "30d", Const.HALF_HOUR_INTERVAL, "d,c,v,o,h,l", chartEventStyle);
						break;
					case ChartEventStyles.GET_RT_DATA:
						_loc4_ = EventFactory.buildEvent(ChartEventTypes.GET_RT_DATA, param2, "" + (_loc5_ + 10) + 'm', Const.INTRADAY_INTERVAL, "d,c,v,o,h,l", chartEventStyle);
						break;
					case ChartEventStyles.GET_RT_AH_DATA:
						_loc4_ = EventFactory.buildEvent(ChartEventTypes.GET_RT_AH_DATA, param2, "" + (_loc5_ + 10) + 'm', Const.INTRADAY_INTERVAL, "d,c,v,o,h,l", chartEventStyle);
						break;
				}
			}
			else
			{
				switch (chartEventStyle)
				{
					default:
					case ChartEventStyles.GET_1Y_DATA:
						_loc4_ = EventFactory.buildEvent(ChartEventTypes.GET_DATA, param2, "1Y", Const.DAILY_INTERVAL, "d,c,v");
						break;
					case ChartEventStyles.GET_5Y_DATA:
						_loc4_ = EventFactory.buildEvent(ChartEventTypes.GET_DATA, param2, "5Y", Const.WEEKLY_INTERVAL, "d,c,v,k");
						break;
					case ChartEventStyles.GET_2Y_DATA:
						_loc4_ = EventFactory.buildEvent(ChartEventTypes.GET_DATA, param2, "2Y", Const.DAILY_INTERVAL, "d,c,v");
						break;
					case ChartEventStyles.GET_5D_DATA:
						_loc4_ = EventFactory.buildEvent(ChartEventTypes.GET_DATA, param2, "5d", Const.INTRADAY_INTERVAL, "d,c,v");
						break;
					case ChartEventStyles.GET_AH_DATA:
						_loc4_ = EventFactory.buildEvent(ChartEventTypes.GET_AH_DATA, param2, "5d", Const.INTRADAY_INTERVAL, "d,c,v");
						break;
					case ChartEventStyles.MUTF_5D_DATA:
						_loc4_ = EventFactory.buildEvent(ChartEventTypes.GET_MUTF_DATA, param2, "5d", Const.DAILY_INTERVAL, "d,c,v");
						break;
					case ChartEventStyles.GET_40Y_DATA:
						_loc4_ = EventFactory.buildEvent(ChartEventTypes.GET_DATA, param2, "40Y", Const.WEEKLY_INTERVAL, "d,c,v,k");
						break;
				}
			}
			_loc4_.priority = priorities;
			return _loc4_;
		}
	}
}
