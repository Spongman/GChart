/// <reference path="SMAIndicatorLayer.ts" />

namespace com.google.finance.indicator
{
	// import com.google.finance.DataSeries;
	// import com.google.finance.DataUnit;
	// import com.google.finance.Messages;
	// import com.google.finance.ViewPoint;
	// import com.google.finance.DataSource;

	export class EMAIndicatorLayer extends SMAIndicatorLayer
	{
		static getParameterNames()
		{
			return SMAIndicatorLayer.getParameterNames();
		}

		computeIntervalIndicator(param1: number)
		{
			if (this.indicator.hasInterval(param1))
				return;

			const points = this.originalDataSeries.getPointsInIntervalArray(param1);
			for (let periodIndex = 0; periodIndex < this.periods.length; periodIndex++)
			{
				const dataSeries = new DataSeries();
				let _loc3_ = NaN;
				const _loc4_ = 2 / (Number(this.periods[periodIndex]) + 1);
				let _loc6_ = 0;
				let _loc5_ = 0;
				for (const point of points)
				{
					if (!this.shouldSkip(point, dataSeries))
					{
						_loc5_++;
						_loc6_ = Number(_loc6_ + point.close);
						let _loc9_: IndicatorPoint;
						if (_loc5_ < this.periods[periodIndex])
						{
							_loc9_ = new IndicatorPoint(NaN, point);
						}
						else if (_loc5_ === this.periods[periodIndex])
						{
							_loc3_ = _loc6_ / _loc5_;
							_loc9_ = new IndicatorPoint(_loc3_, point);
						}
						else
						{
							_loc3_ = (point.close - _loc3_) * _loc4_ + _loc3_;
							_loc9_ = new IndicatorPoint(_loc3_, point);
						}
						dataSeries.points.push(_loc9_);
					}
				}
				this.indicator.setDataSeries(param1, dataSeries, periodIndex);
			}
		}

		protected getIndicatorValueText(param1: number, param2: number, param3: string, context: Context): string
		{
			if (param1 >= 0 && param1 < this.periods.length)
				return Messages.getMsg(Messages.EMA_INTERVAL, this.periods[param1], param3, param2);

			return "";
		}
	}
}
