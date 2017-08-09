namespace com.google.finance
{
	export class VolumeCalculator
	{
		private static computeWeekly(param1: DataSeries, param2: DataSeries, param3: number) 
		{
			const _loc4_ = Const.WEEKLY_INTERVAL;
			const _loc5_ = param3 / Const.WEEKLY_INTERVAL;
			for (let _loc6_ = param1.fridays.length - 1; _loc6_ >= 0; _loc6_ = _loc6_ - _loc5_)
			{
				let _loc7_ = Number(_loc6_);
				let _loc8_ = 0;
				param2.fridays.push(param2.points.length);
				while (_loc7_ > _loc6_ - _loc5_ && _loc7_ >= 0)
				{
					_loc8_ = Number(_loc8_ + param1.units[param1.fridays[_loc7_]].volumes[_loc4_]);
					_loc7_--;
				}
				if (_loc7_ < 0)
					_loc7_ = 0;


				const _loc9_ = new indicator.VolumeIndicatorPoint(
					_loc8_,
					(param1.units[param1.fridays[_loc6_]]).relativeMinutes,
					(<indicator.IndicatorPoint>param1.points[param1.fridays[_loc6_]]).point,
					(param1.units[param1.fridays[_loc7_]]).time
				);

				param2.points.push(_loc9_);
			}
		}

		private static computeDaily(param1: DataSeries, param2: DataSeries, param3: number) 
		{
			const _loc4_ = Const.DAILY_INTERVAL;
			const _loc5_ = param3 / Const.DAILY_INTERVAL;
			for (let _loc6_ = param1.days.length - 1; _loc6_ >= 0; _loc6_ = _loc6_ - _loc5_)
			{
				let _loc7_ = Number(_loc6_);
				let _loc8_ = 0;
				param2.days.push(param2.points.length);
				while (_loc7_ > _loc6_ - _loc5_ && _loc7_ >= 0)
				{
					_loc8_ = Number(_loc8_ + Number(param1.units[param1.days[_loc7_]].volumes[_loc4_]));
					_loc7_--;
				}
				if (_loc7_ < 0)
					_loc7_ = 0;


				const _loc9_ = new indicator.VolumeIndicatorPoint(
					_loc8_,
					(param1.units[param1.days[_loc6_]]).relativeMinutes,
					(<indicator.IndicatorPoint>param1.points[param1.days[_loc6_]]).point,
					(param1.units[param1.days[_loc7_]]).time
				);

				param2.points.push(_loc9_);
			}
		}

		static computeInterval(param1: number, param2: Indicator, param3: DataSeries) 
		{
			if (param2.hasInterval(param1))
				return;

			const _loc4_ = new DataSeries();
			if (param1 < Const.INTRADAY_INTERVAL)
				return;

			if (param1 < Const.DAILY_INTERVAL)
				VolumeCalculator.computeIntraday(param3, _loc4_, param1);
			else if (param1 < Const.WEEKLY_INTERVAL)
				VolumeCalculator.computeDaily(param3, _loc4_, param1);
			else
				VolumeCalculator.computeWeekly(param3, _loc4_, param1);

			_loc4_.points.reverse();
			_loc4_.days.reverse();
			_loc4_.fridays.reverse();
			for (let _loc5_ = 0; _loc5_ < _loc4_.days.length; _loc5_++)
			{
				_loc4_.days[_loc5_] = _loc4_.points.length - 1 - _loc4_.days[_loc5_];
				_loc4_.fridays[_loc5_] = _loc4_.points.length - 1 - _loc4_.fridays[_loc5_];
			}
			param2.setDataSeries(param1, _loc4_);
		}

		private static computeIntraday(param1: DataSeries, param2: DataSeries, param3: number) 
		{
			const _loc4_ = Const.INTRADAY_INTERVAL;
			const _loc5_ = param3 / Const.INTRADAY_INTERVAL;
			for (let _loc6_ = param1.intradayRegions.length - 1; _loc6_ >= 0; _loc6_--)
			{
				const _loc7_ = param1.intradayRegions[_loc6_].end;
				const _loc8_ = param1.intradayRegions[_loc6_].start;
				param2.days.push(param2.points.length);
				let _loc9_ = _loc7_;
				while (_loc9_ >= _loc8_)
				{
					let _loc11_ = 0;
					for (let _loc10_ = _loc9_; _loc10_ > _loc9_ - _loc5_ && _loc10_ >= _loc8_; _loc10_--)
					{
						_loc11_ = Number(_loc11_ + param1.units[_loc10_].volumes[_loc4_]);
					}
					const _loc12_ = new indicator.VolumeIndicatorPoint(
						_loc11_,
						param1.units[_loc9_].relativeMinutes,
						(<indicator.IndicatorPoint>param1.points[_loc9_]).point,
						param1.units[_loc9_].time
					);
					param2.points.push(_loc12_);
					_loc9_ = _loc9_ - _loc5_;
				}
			}
		}
	}
}
