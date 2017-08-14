namespace com.google.finance
{
	export class VolumeCalculator
	{
		private static computeWeekly(dataSeries1: DataSeries, dataSeries2: DataSeries, param3: number) 
		{
			const _loc4_ = Const.WEEKLY_INTERVAL;
			const _loc5_ = param3 / Const.WEEKLY_INTERVAL;
			for (let _loc6_ = dataSeries1.fridays.length - 1; _loc6_ >= 0; _loc6_ = _loc6_ - _loc5_)
			{
				let _loc7_ = Number(_loc6_);
				let _loc8_ = 0;
				dataSeries2.fridays.push(dataSeries2.points.length);
				while (_loc7_ > _loc6_ - _loc5_ && _loc7_ >= 0)
				{
					_loc8_ = Number(_loc8_ + dataSeries1.units[dataSeries1.fridays[_loc7_]].volumes[_loc4_]);
					_loc7_--;
				}
				if (_loc7_ < 0)
					_loc7_ = 0;

				const _loc9_ = new indicator.VolumeIndicatorPoint(
					_loc8_,
					(dataSeries1.units[dataSeries1.fridays[_loc6_]]).relativeMinutes,
					(<indicator.IndicatorPoint>dataSeries1.points[dataSeries1.fridays[_loc6_]]).point,
					(dataSeries1.units[dataSeries1.fridays[_loc7_]]).time
				);

				dataSeries2.points.push(_loc9_);
			}
		}

		private static computeDaily(dataSeries1: DataSeries, dataSeries2: DataSeries, param3: number) 
		{
			const _loc4_ = Const.DAILY_INTERVAL;
			const _loc5_ = param3 / Const.DAILY_INTERVAL;
			for (let _loc6_ = dataSeries1.days.length - 1; _loc6_ >= 0; _loc6_ = _loc6_ - _loc5_)
			{
				let _loc7_ = Number(_loc6_);
				let _loc8_ = 0;
				dataSeries2.days.push(dataSeries2.points.length);
				while (_loc7_ > _loc6_ - _loc5_ && _loc7_ >= 0)
				{
					_loc8_ = Number(_loc8_ + Number(dataSeries1.units[dataSeries1.days[_loc7_]].volumes[_loc4_]));
					_loc7_--;
				}
				if (_loc7_ < 0)
					_loc7_ = 0;

				const _loc9_ = new indicator.VolumeIndicatorPoint(
					_loc8_,
					(dataSeries1.units[dataSeries1.days[_loc6_]]).relativeMinutes,
					(<indicator.IndicatorPoint>dataSeries1.points[dataSeries1.days[_loc6_]]).point,
					(dataSeries1.units[dataSeries1.days[_loc7_]]).time
				);

				dataSeries2.points.push(_loc9_);
			}
		}

		static computeInterval(param1: number, indicator: Indicator, dataSeries: DataSeries) 
		{
			if (indicator.hasInterval(param1))
				return;

			const _loc4_ = new DataSeries();
			if (param1 < Const.INTRADAY_INTERVAL)
				return;

			if (param1 < Const.DAILY_INTERVAL)
				VolumeCalculator.computeIntraday(dataSeries, _loc4_, param1);
			else if (param1 < Const.WEEKLY_INTERVAL)
				VolumeCalculator.computeDaily(dataSeries, _loc4_, param1);
			else
				VolumeCalculator.computeWeekly(dataSeries, _loc4_, param1);

			_loc4_.points.reverse();
			_loc4_.days.reverse();
			_loc4_.fridays.reverse();
			for (let _loc5_ = 0; _loc5_ < _loc4_.days.length; _loc5_++)
			{
				_loc4_.days[_loc5_] = _loc4_.points.length - 1 - _loc4_.days[_loc5_];
				_loc4_.fridays[_loc5_] = _loc4_.points.length - 1 - _loc4_.fridays[_loc5_];
			}
			indicator.setDataSeries(param1, _loc4_);
		}

		private static computeIntraday(dataSeries1: DataSeries, dataSeries2: DataSeries, param3: number) 
		{
			const _loc4_ = Const.INTRADAY_INTERVAL;
			const _loc5_ = param3 / Const.INTRADAY_INTERVAL;
			for (let _loc6_ = dataSeries1.intradayRegions.length - 1; _loc6_ >= 0; _loc6_--)
			{
				const end = dataSeries1.intradayRegions[_loc6_].end;
				const start = dataSeries1.intradayRegions[_loc6_].start;
				dataSeries2.days.push(dataSeries2.points.length);
				let _loc9_ = end;
				while (_loc9_ >= start)
				{
					let _loc11_ = 0;
					for (let _loc10_ = _loc9_; _loc10_ > _loc9_ - _loc5_ && _loc10_ >= start; _loc10_--)
					{
						_loc11_ = Number(_loc11_ + dataSeries1.units[_loc10_].volumes[_loc4_]);
					}
					const _loc12_ = new indicator.VolumeIndicatorPoint(
						_loc11_,
						dataSeries1.units[_loc9_].relativeMinutes,
						(<indicator.IndicatorPoint>dataSeries1.points[_loc9_]).point,
						dataSeries1.units[_loc9_].time
					);
					dataSeries2.points.push(_loc12_);
					_loc9_ -= _loc5_;
				}
			}
		}
	}
}
