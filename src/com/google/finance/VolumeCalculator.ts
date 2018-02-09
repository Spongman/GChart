import { Const } from "./Const";
import { DataSeries } from "./DataSeries";
import { Indicator } from "./Indicator";
import { IndicatorPoint, VolumeIndicatorPoint } from "./indicator/IndicatorPoint";

export class VolumeCalculator {
		private static computeWeekly(input: DataSeries, output: DataSeries, duration: number) {
			const weeks = duration / Const.WEEKLY_INTERVAL;
			for (let dayIndex = input.fridays.length - 1; dayIndex >= 0; dayIndex -= weeks) {
				let dayIndex2 = Number(dayIndex);
				let volume = 0;
				output.fridays.push(output.points.length);
				while (dayIndex2 > dayIndex - weeks && dayIndex2 >= 0) {
					volume = Number(volume + input.units[input.fridays[dayIndex2]].volumes[Const.WEEKLY_INTERVAL]);
					dayIndex2--;
				}
				if (dayIndex2 < 0) {
					dayIndex2 = 0;
				}

				output.points.push(new VolumeIndicatorPoint(
					volume,
					(input.units[input.fridays[dayIndex]]).relativeMinutes,
					(input.points[input.fridays[dayIndex]] as IndicatorPoint).point,
					(input.units[input.fridays[dayIndex2]]).time,
				));
			}
		}

		private static computeDaily(input: DataSeries, output: DataSeries, param3: number) {
			const dailyInterval = Const.DAILY_INTERVAL;
			const _loc5_ = param3 / Const.DAILY_INTERVAL;
			for (let dayIndex = input.days.length - 1; dayIndex >= 0; dayIndex -= _loc5_) {
				let dayIndex2 = Number(dayIndex);
				let volume = 0;
				output.days.push(output.points.length);
				while (dayIndex2 > dayIndex - _loc5_ && dayIndex2 >= 0) {
					volume = Number(volume + Number(input.units[input.days[dayIndex2]].volumes[dailyInterval]));
					dayIndex2--;
				}
				if (dayIndex2 < 0) {
					dayIndex2 = 0;
				}

				output.points.push(new VolumeIndicatorPoint(
					volume,
					(input.units[input.days[dayIndex]]).relativeMinutes,
					(input.points[input.days[dayIndex]] as IndicatorPoint).point,
					(input.units[input.days[dayIndex2]]).time,
				));
			}
		}

		static computeInterval(interval: number, indicator: Indicator, intput: DataSeries) {
			if (indicator.hasInterval(interval)) {
				return;
			}

			const output = new DataSeries();
			if (interval < Const.INTRADAY_INTERVAL) {
				return;
			}

			if (interval < Const.DAILY_INTERVAL) {
				VolumeCalculator.computeIntraday(intput, output, interval);
			} else if (interval < Const.WEEKLY_INTERVAL) {
				VolumeCalculator.computeDaily(intput, output, interval);
								} else {
				VolumeCalculator.computeWeekly(intput, output, interval);
								}

			output.points.reverse();
			output.days.reverse();
			output.fridays.reverse();
			for (let dayIndex = 0; dayIndex < output.days.length; dayIndex++) {
				output.days[dayIndex] = output.points.length - 1 - output.days[dayIndex];
				output.fridays[dayIndex] = output.points.length - 1 - output.fridays[dayIndex];
			}
			indicator.setDataSeries(interval, output);
		}

		private static computeIntraday(input: DataSeries, output: DataSeries, param3: number) {
			const intradayInterval = Const.INTRADAY_INTERVAL;
			const _loc5_ = param3 / Const.INTRADAY_INTERVAL;
			for (let regionIndex = input.intradayRegions.length - 1; regionIndex >= 0; regionIndex--) {
				const end = input.intradayRegions[regionIndex].end;
				const start = input.intradayRegions[regionIndex].start;
				output.days.push(output.points.length);
				let unitIndex = end;
				while (unitIndex >= start) {
					let volume = 0;
					for (let unitIndex2 = unitIndex; unitIndex2 > unitIndex - _loc5_ && unitIndex2 >= start; unitIndex2--) {
						volume = Number(volume + input.units[unitIndex2].volumes[intradayInterval]);
					}

					output.points.push(new VolumeIndicatorPoint(
						volume,
						input.units[unitIndex].relativeMinutes,
						(input.points[unitIndex] as IndicatorPoint).point,
						input.units[unitIndex].time,
					));

					unitIndex -= _loc5_;
				}
			}
		}
	}
