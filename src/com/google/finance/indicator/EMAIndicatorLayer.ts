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

			const originalPoints = this.originalDataSeries.getPointsInIntervalArray(param1);
			for (let periodIndex = 0; periodIndex < this.periods.length; periodIndex++)
			{
				const dataSeries = new DataSeries();
				let _loc3_ = NaN;
				const _loc4_ = 2 / (Number(this.periods[periodIndex]) + 1);
				let _loc6_ = 0;
				let _loc5_ = 0;
				for (const originalPoint of originalPoints)
				{
					if (!this.shouldSkip(originalPoint, dataSeries))
					{
						_loc5_++;
						_loc6_ = Number(_loc6_ + originalPoint.close);
						let point: IndicatorPoint;
						if (_loc5_ < this.periods[periodIndex])
						{
							point = new IndicatorPoint(NaN, originalPoint);
						}
						else if (_loc5_ === this.periods[periodIndex])
						{
							_loc3_ = _loc6_ / _loc5_;
							point = new IndicatorPoint(_loc3_, originalPoint);
						}
						else
						{
							_loc3_ = (originalPoint.close - _loc3_) * _loc4_ + _loc3_;
							point = new IndicatorPoint(_loc3_, originalPoint);
						}
						dataSeries.points.push(point);
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
