namespace com.google.finance
{
	export class EventFactory
	{
		private static buildEvent(param1: number, param2: string, param3: string, param4: number, param5: string, param6: number = -1): ChartEvent
		{
			let _loc7_ = new ChartEvent(param1);
			if (param6 !== -1)
				_loc7_.detailType = param6;
			else
				_loc7_.detailType = null;

			_loc7_.quote = param2;
			_loc7_.period = param3;
			_loc7_.interval = "" + param4;
			_loc7_.columns = param5;
			return _loc7_;
		}

		static getEvent(param1: number, param2: string, param3: number): ChartEvent
		{
			let _loc4_: ChartEvent;
			if (Const.INDICATOR_ENABLED)
			{
				let _loc5_ = MainManager.paramsObj && MainManager.paramsObj.delayedMinutes >= 0 ? MainManager.paramsObj.delayedMinutes : 0;
				switch (param1)
				{
					default:
					case Const.GET_1Y_DATA:
						_loc4_ = EventFactory.buildEvent(ChartEventTypes.GET_DATA, param2, "1Y", Const.DAILY_INTERVAL, "d,c,v,o,h,l", param1);
						break;
					case Const.GET_5Y_DATA:
						_loc4_ = EventFactory.buildEvent(ChartEventTypes.GET_DATA, param2, "5Y", Const.WEEKLY_INTERVAL, "d,c,v,k,o,h,l", param1);
						break;
					case Const.GET_2Y_DATA:
						_loc4_ = EventFactory.buildEvent(ChartEventTypes.GET_DATA, param2, "2Y", Const.DAILY_INTERVAL, "d,c,v", param1);
						break;
					case Const.GET_5D_DATA:
						_loc4_ = EventFactory.buildEvent(ChartEventTypes.GET_DATA, param2, "5d", Const.INTRADAY_INTERVAL, "d,c,v,o,h,l", param1);
						break;
					case Const.GET_AH_DATA:
						_loc4_ = EventFactory.buildEvent(ChartEventTypes.GET_AH_DATA, param2, "5d", Const.INTRADAY_INTERVAL, "d,c,v,o,h,l", param1);
						break;
					case Const.MUTF_5D_DATA:
						_loc4_ = EventFactory.buildEvent(ChartEventTypes.GET_MUTF_DATA, param2, "5d", Const.DAILY_INTERVAL, "d,c,v", param1);
						break;
					case Const.GET_40Y_DATA:
						_loc4_ = EventFactory.buildEvent(ChartEventTypes.GET_DATA, param2, "40Y", Const.WEEKLY_INTERVAL, "d,c,v,k,o,h,l", param1);
						break;
					case Const.GET_10D_DATA:
						_loc4_ = EventFactory.buildEvent(ChartEventTypes.GET_DATA, param2, "10d", Const.FIVE_MINUTE_INTERVAL, "d,c,v,o,h,l", param1);
						break;
					case Const.GET_30D_DATA:
						_loc4_ = EventFactory.buildEvent(ChartEventTypes.GET_DATA, param2, "30d", Const.HALF_HOUR_INTERVAL, "d,c,v,o,h,l", param1);
						break;
					case Const.GET_RT_DATA:
						_loc4_ = EventFactory.buildEvent(ChartEventTypes.GET_RT_DATA, param2, "" + (_loc5_ + 10) + "m", Const.INTRADAY_INTERVAL, "d,c,v,o,h,l", param1);
						break;
					case Const.GET_RT_AH_DATA:
						_loc4_ = EventFactory.buildEvent(ChartEventTypes.GET_RT_AH_DATA, param2, "" + (_loc5_ + 10) + "m", Const.INTRADAY_INTERVAL, "d,c,v,o,h,l", param1);
						break;
				}
			}
			else
			{
				switch (param1)
				{
					default:
					case Const.GET_1Y_DATA:
						_loc4_ = EventFactory.buildEvent(ChartEventTypes.GET_DATA, param2, "1Y", Const.DAILY_INTERVAL, "d,c,v");
						break;
					case Const.GET_5Y_DATA:
						_loc4_ = EventFactory.buildEvent(ChartEventTypes.GET_DATA, param2, "5Y", Const.WEEKLY_INTERVAL, "d,c,v,k");
						break;
					case Const.GET_2Y_DATA:
						_loc4_ = EventFactory.buildEvent(ChartEventTypes.GET_DATA, param2, "2Y", Const.DAILY_INTERVAL, "d,c,v");
						break;
					case Const.GET_5D_DATA:
						_loc4_ = EventFactory.buildEvent(ChartEventTypes.GET_DATA, param2, "5d", Const.INTRADAY_INTERVAL, "d,c,v");
						break;
					case Const.GET_AH_DATA:
						_loc4_ = EventFactory.buildEvent(ChartEventTypes.GET_AH_DATA, param2, "5d", Const.INTRADAY_INTERVAL, "d,c,v");
						break;
					case Const.MUTF_5D_DATA:
						_loc4_ = EventFactory.buildEvent(ChartEventTypes.GET_MUTF_DATA, param2, "5d", Const.DAILY_INTERVAL, "d,c,v");
						break;
					case Const.GET_40Y_DATA:
						_loc4_ = EventFactory.buildEvent(ChartEventTypes.GET_DATA, param2, "40Y", Const.WEEKLY_INTERVAL, "d,c,v,k");
						break;
				}
			}
			_loc4_.priority = param3;
			return _loc4_;
		}
	}
}
