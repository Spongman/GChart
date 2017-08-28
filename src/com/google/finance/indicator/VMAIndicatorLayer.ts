/// <reference path="VolumeDependentIndicatorLayer.ts" />

namespace com.google.finance.indicator
{
	// import com.google.finance.Messages;
	// import com.google.finance.Utils;
	// import com.google.finance.DataSeries;
	// import com.google.finance.DataUnit;
	// import com.google.finance.Const;
	// import com.google.finance.ViewPoint;
	// import com.google.finance.DataSource;

	export class VMAIndicatorLayer extends VolumeDependentIndicatorLayer
	{
		private static readonly PARAMETER_NAMES = ["period"];

		protected periods = [20];

		static getParameterNames()
		{
			return VMAIndicatorLayer.PARAMETER_NAMES;
		}

		isNameTextRequired(): boolean
		{
			return true;
		}

		protected getIndicatorValueText(param1: number, param2: number, param3: string, context: Context): string
		{
			let _loc5_ = 1000;
			if (context && context.maxVolume / 1000000 > 0.5)
				_loc5_ = 1000000;

			if (param1 >= 0 && param1 < this.periods.length)
				return Messages.getMsg(Messages.VMA_INTERVAL, this.periods[param1], param3, Utils.numberToString(param2 / _loc5_, 2, 4));

			return "";
		}

		protected getLineStyle(param1: number): number
		{
			if (param1 >= 0 && param1 < this.periods.length)
				return IndicatorLineStyle.SIMPLE_LINE;

			return IndicatorLineStyle.NONE;
		}

		computeIntervalIndicator(param1: number)
		{
			if (this.indicator.hasInterval(param1))
				return;

			const pointsInIntervalArray = this.originalDataSeries.getPointsInIntervalArray(param1);
			for (let _loc4_ = 0; _loc4_ < this.periods.length; _loc4_++)
			{
				const dataSeries = new DataSeries();
				let _loc3_ = 0;
				const _loc8_: number[] = [];
				for (const originalPoint of pointsInIntervalArray)
				{
					if (!this.shouldSkip(originalPoint, dataSeries))
					{
						const volume = originalPoint.volumes[param1];
						if (volume === 0)
						{
							this.copyLastIndicatorPoint(originalPoint, dataSeries);
						}
						else
						{
							_loc3_ = Number(_loc3_ + volume);
							_loc8_.push(volume);
							let point: IndicatorPoint;
							if (_loc8_.length < this.periods[_loc4_])
							{
								point = new IndicatorPoint(NaN, originalPoint);
							}
							else
							{
								point = new IndicatorPoint(_loc3_ / this.periods[_loc4_], originalPoint);
								_loc3_ = Number(_loc3_ - _loc8_.shift()!);
							}
							dataSeries.points.push(point);
						}
					}
				}
				this.indicator.setDataSeries(param1, dataSeries, _loc4_);
			}
		}

		protected getColor(param1: number, param2 = NaN): number
		{
			if (Const.VOLUME_PLUS_ENABLED)
			{
				switch (param1)
				{
					case 0:
						return Const.COLOR_BLUE;
					case 1:
						return Const.COLOR_YELLOW;
					case 2:
						return Const.COLOR_PINK;
					default:
						return 0;
				}
			}
			else
			{
				return super.getColor(param1 + 1);
			}
		}

		setIndicatorInstanceArray(indicators: any[])
		{
			if (!indicators || indicators.length === 0)
				return;

			this.indicator.clear();
			this.periods = [];
			for (const indicator of indicators)
				this.periods.push(indicator.period);
		}
	}
}
