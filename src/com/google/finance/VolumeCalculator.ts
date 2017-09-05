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
				let volume = 0;
				output.fridays.push(output.points.length);
				while (_loc7_ > _loc6_ - weeks && _loc7_ >= 0)
				{
					volume = Number(volume + input.units[input.fridays[_loc7_]].volumes[Const.WEEKLY_INTERVAL]);
					_loc7_--;
				}
				if (_loc7_ < 0)
					_loc7_ = 0;

				const point = new indicator.VolumeIndicatorPoint(
					volume,
					(input.units[input.fridays[_loc6_]]).relativeMinutes,
					(<indicator.IndicatorPoint>input.points[input.fridays[_loc6_]]).point,
					(input.units[input.fridays[_loc7_]]).time
				);

				output.points.push(point);
			}
		}

		private static computeDaily(input: DataSeries, output: DataSeries, param3: number)
		{
			const dailyInterval = Const.DAILY_INTERVAL;
			const _loc5_ = param3 / Const.DAILY_INTERVAL;
			for (let _loc6_ = input.days.length - 1; _loc6_ >= 0; _loc6_ -= _loc5_)
			{
				let _loc7_ = Number(_loc6_);
				let volume = 0;
				output.days.push(output.points.length);
				while (_loc7_ > _loc6_ - _loc5_ && _loc7_ >= 0)
				{
					volume = Number(volume + Number(input.units[input.days[_loc7_]].volumes[dailyInterval]));
					_loc7_--;
				}
				if (_loc7_ < 0)
					_loc7_ = 0;

				const point = new indicator.VolumeIndicatorPoint(
					volume,
					(input.units[input.days[_loc6_]]).relativeMinutes,
					(<indicator.IndicatorPoint>input.points[input.days[_loc6_]]).point,
					(input.units[input.days[_loc7_]]).time
				);

				output.points.push(point);
			}
		}

		static computeInterval(interval: number, indicator: Indicator, intput: DataSeries)
		{
			if (indicator.hasInterval(interval))
				return;

			const output = new DataSeries();
			if (interval < Const.INTRADAY_INTERVAL)
				return;

			if (interval < Const.DAILY_INTERVAL)
				VolumeCalculator.computeIntraday(intput, output, interval);
			else if (interval < Const.WEEKLY_INTERVAL)
				VolumeCalculator.computeDaily(intput, output, interval);
			else
				VolumeCalculator.computeWeekly(intput, output, interval);

			output.points.reverse();
			output.days.reverse();
			output.fridays.reverse();
			for (let _loc5_ = 0; _loc5_ < output.days.length; _loc5_++)
			{
				output.days[_loc5_] = output.points.length - 1 - output.days[_loc5_];
				output.fridays[_loc5_] = output.points.length - 1 - output.fridays[_loc5_];
			}
			indicator.setDataSeries(interval, output);
		}

		private static computeIntraday(input: DataSeries, output: DataSeries, param3: number)
		{
			const intradayInterval = Const.INTRADAY_INTERVAL;
			const _loc5_ = param3 / Const.INTRADAY_INTERVAL;
			for (let regionIndex = input.intradayRegions.length - 1; regionIndex >= 0; regionIndex--)
			{
				const end = input.intradayRegions[regionIndex].end;
				const start = input.intradayRegions[regionIndex].start;
				output.days.push(output.points.length);
				let _loc9_ = end;
				while (_loc9_ >= start)
				{
					let volume = 0;
					for (let _loc10_ = _loc9_; _loc10_ > _loc9_ - _loc5_ && _loc10_ >= start; _loc10_--)
						volume = Number(volume + input.units[_loc10_].volumes[intradayInterval]);

					const point = new indicator.VolumeIndicatorPoint(
						volume,
						input.units[_loc9_].relativeMinutes,
						(<indicator.IndicatorPoint>input.points[_loc9_]).point,
						input.units[_loc9_].time
					);
					output.points.push(point);
					_loc9_ -= _loc5_;
				}
			}
		}
	}
}
