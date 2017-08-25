namespace com.google.finance
{
	export class VolumeCalculator
	{
		private static computeWeekly(input: DataSeries, output: DataSeries, duration: number)
		{
			const weeks = duration / Const.WEEKLY_INTERVAL;
			for (let _loc6_ = input.fridays.length - 1; _loc6_ >= 0; _loc6_ -= weeks)
			{
				let _loc7_ = Number(_loc6_);
				let _loc8_ = 0;
				output.fridays.push(output.points.length);
				while (_loc7_ > _loc6_ - weeks && _loc7_ >= 0)
				{
					_loc8_ = Number(_loc8_ + input.units[input.fridays[_loc7_]].volumes[Const.WEEKLY_INTERVAL]);
					_loc7_--;
				}
				if (_loc7_ < 0)
					_loc7_ = 0;

				const _loc9_ = new indicator.VolumeIndicatorPoint(
					_loc8_,
					(input.units[input.fridays[_loc6_]]).relativeMinutes,
					(<indicator.IndicatorPoint>input.points[input.fridays[_loc6_]]).point,
					(input.units[input.fridays[_loc7_]]).time
				);

				output.points.push(_loc9_);
			}
		}

		private static computeDaily(input: DataSeries, output: DataSeries, param3: number)
		{
			const _loc4_ = Const.DAILY_INTERVAL;
			const _loc5_ = param3 / Const.DAILY_INTERVAL;
			for (let _loc6_ = input.days.length - 1; _loc6_ >= 0; _loc6_ -= _loc5_)
			{
				let _loc7_ = Number(_loc6_);
				let _loc8_ = 0;
				output.days.push(output.points.length);
				while (_loc7_ > _loc6_ - _loc5_ && _loc7_ >= 0)
				{
					_loc8_ = Number(_loc8_ + Number(input.units[input.days[_loc7_]].volumes[_loc4_]));
					_loc7_--;
				}
				if (_loc7_ < 0)
					_loc7_ = 0;

				const _loc9_ = new indicator.VolumeIndicatorPoint(
					_loc8_,
					(input.units[input.days[_loc6_]]).relativeMinutes,
					(<indicator.IndicatorPoint>input.points[input.days[_loc6_]]).point,
					(input.units[input.days[_loc7_]]).time
				);

				output.points.push(_loc9_);
			}
		}

		static computeInterval(param1: number, indicator: Indicator, intput: DataSeries)
		{
			if (indicator.hasInterval(param1))
				return;

			const output = new DataSeries();
			if (param1 < Const.INTRADAY_INTERVAL)
				return;

			if (param1 < Const.DAILY_INTERVAL)
				VolumeCalculator.computeIntraday(intput, output, param1);
			else if (param1 < Const.WEEKLY_INTERVAL)
				VolumeCalculator.computeDaily(intput, output, param1);
			else
				VolumeCalculator.computeWeekly(intput, output, param1);

			output.points.reverse();
			output.days.reverse();
			output.fridays.reverse();
			for (let _loc5_ = 0; _loc5_ < output.days.length; _loc5_++)
			{
				output.days[_loc5_] = output.points.length - 1 - output.days[_loc5_];
				output.fridays[_loc5_] = output.points.length - 1 - output.fridays[_loc5_];
			}
			indicator.setDataSeries(param1, output);
		}

		private static computeIntraday(input: DataSeries, output: DataSeries, param3: number)
		{
			const _loc4_ = Const.INTRADAY_INTERVAL;
			const _loc5_ = param3 / Const.INTRADAY_INTERVAL;
			for (let regionIndex = input.intradayRegions.length - 1; regionIndex >= 0; regionIndex--)
			{
				const end = input.intradayRegions[regionIndex].end;
				const start = input.intradayRegions[regionIndex].start;
				output.days.push(output.points.length);
				let _loc9_ = end;
				while (_loc9_ >= start)
				{
					let _loc11_ = 0;
					for (let _loc10_ = _loc9_; _loc10_ > _loc9_ - _loc5_ && _loc10_ >= start; _loc10_--)
						_loc11_ = Number(_loc11_ + input.units[_loc10_].volumes[_loc4_]);

					const _loc12_ = new indicator.VolumeIndicatorPoint(
						_loc11_,
						input.units[_loc9_].relativeMinutes,
						(<indicator.IndicatorPoint>input.points[_loc9_]).point,
						input.units[_loc9_].time
					);
					output.points.push(_loc12_);
					_loc9_ -= _loc5_;
				}
			}
		}
	}
}
