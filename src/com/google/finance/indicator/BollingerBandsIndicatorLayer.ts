/// <reference path="DependentIndicatorLayer.ts" />

namespace com.google.finance.indicator
{
	// import com.google.finance.Messages;
	// import com.google.finance.DataUnit;
	// import com.google.finance.DataSeries;
	// import com.google.finance.ViewPoint;
	// import com.google.finance.DataSource;

	export class BollingerBandsIndicatorLayer extends DependentIndicatorLayer
	{
		private static readonly PARAMETER_NAMES = ["period"];

		private multiplier = 2;
		private period = 20;

		static getParameterNames()
		{
			return BollingerBandsIndicatorLayer.PARAMETER_NAMES;
		}

		protected getIndicatorNameText(param1: string): string
		{
			return Messages.getMsg(Messages.BOLL_INTERVAL, this.period, param1);
		}

		protected getIndicatorValueText(param1: number, param2: number, param3: string, context: Context): string
		{
			switch (param1)
			{
				case 0:
					return Messages.getMsg(Messages.MID_BOLL, param2);
				case 1:
					return Messages.getMsg(Messages.LOWER_BOLL, param2);
				case 2:
					return Messages.getMsg(Messages.UPPER_BOLL, param2);
				default:
					return "";
			}
		}

		protected getLineStyle(param1: number): number
		{
			if (param1 >= 0 && param1 < 3)
				return IndicatorLineStyle.SIMPLE_LINE;

			return IndicatorLineStyle.NONE;
		}

		computeIntervalIndicator(param1: number)
		{
			if (this.indicator.hasInterval(param1))
				return;

			const points = this.originalDataSeries.getPointsInIntervalArray(param1);
			if (!points)
				return;

			let _loc9_ = 0;
			const dataSeries0 = new DataSeries();
			const dataSeries1 = new DataSeries();
			const dataSeries2 = new DataSeries();
			const _loc14_: number[] = [];
			for (const point of points)
			{
				if (!this.shouldSkip(point, dataSeries0, dataSeries1, dataSeries2))
				{
					_loc9_ = Number(_loc9_ + point.close);
					_loc14_.push(point.close);
					if (_loc14_.length < this.period)
					{
						const indicatorPoint = new IndicatorPoint(NaN, point);
						dataSeries0.points.push(indicatorPoint);
						dataSeries1.points.push(indicatorPoint);
						dataSeries2.points.push(indicatorPoint);
					}
					else
					{
						const _loc5_ = _loc9_ / this.period;
						let _loc6_ = 0;
						for (let periodIndex = 0; periodIndex < this.period; periodIndex++)
							_loc6_ = Number(_loc6_ + (_loc14_[periodIndex] - _loc5_) * (_loc14_[periodIndex] - _loc5_));

						_loc6_ = Number(Math.sqrt(_loc6_ / this.period));
						const _loc7_ = _loc5_ + this.multiplier * _loc6_;
						const _loc8_ = _loc5_ - this.multiplier * _loc6_;
						dataSeries0.points.push(new IndicatorPoint(_loc5_, point));
						dataSeries1.points.push(new IndicatorPoint(_loc7_, point));
						dataSeries2.points.push(new IndicatorPoint(_loc8_, point));
						_loc9_ = Number(_loc9_ - _loc14_.shift()!);
					}
				}
			}
			this.indicator.setDataSeries(param1, dataSeries0, 0);
			this.indicator.setDataSeries(param1, dataSeries2, 1);
			this.indicator.setDataSeries(param1, dataSeries1, 2);
		}

		setIndicatorInstanceArray(indicators: any[])
		{
			if (!indicators || indicators.length !== 1)
				return;

			this.indicator.clear();
			this.period = (<BollingerBandsIndicatorLayer>indicators[0]).period;
		}
	}
}
