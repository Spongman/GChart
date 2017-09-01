namespace com.google.finance.indicator
{
	// import com.google.finance.Messages;
	// import com.google.finance.DataUnit;
	// import com.google.finance.DataSeries;
	// import com.google.finance.Utils;
	// import com.google.finance.ViewPoint;
	// import com.google.finance.DataSource;

	export class SlowStochasticIndicatorLayer extends AbstractStochasticIndicatorLayer
	{
		private static readonly FAST_SLOW_RATIO = 3;

		static getParameterNames()
		{
			return AbstractStochasticIndicatorLayer.getParameterNames();
		}

		protected getIndicatorNameText(param1: string): string
		{
			return Messages.getMsg(Messages.SSTO_INTERVAL, this.kPeriod, this.dPeriod, param1);
		}

		computeIntervalIndicator(interval: number)
		{
			if (this.indicator.hasInterval(interval))
				return;

			const points = this.originalDataSeries.getPointsInIntervalArray(interval);
			if (!points)
				return;

			let _loc5_ = 0;
			let _loc6_ = 0;
			const dataSeries0 = new DataSeries();
			const dataSeries1 = new DataSeries();
			const dataUnits: DataUnit[] = [];
			const _loc15_: number[] = [];
			const _loc16_: number[] = [];
			for (const point of points)
			{
				if (!this.shouldSkip(point, dataSeries0, dataSeries1))
				{
					dataUnits.push(point);
					if (dataUnits.length < this.kPeriod)
					{
						const indicatorPoint = new IndicatorPoint(NaN, point);
						dataSeries0.points.push(indicatorPoint);
						dataSeries1.points.push(indicatorPoint);
					}
					else
					{
						let _loc3_ = Number.NEGATIVE_INFINITY;
						let _loc4_ = Number.POSITIVE_INFINITY;
						for (let periodIndex = 0; periodIndex < this.kPeriod; periodIndex++)
						{
							_loc3_ = Utils.extendedMax(_loc3_, dataUnits[periodIndex].high);
							_loc4_ = Utils.extendedMin(_loc4_, dataUnits[periodIndex].low);
						}
						if (_loc3_ === _loc4_)
						{
							this.copyLastIndicatorPoint(point, dataSeries0, dataSeries1);
						}
						else
						{
							const _loc9_ = (point.close - _loc4_) / (_loc3_ - _loc4_) * 100;
							_loc5_ = Number(_loc5_ + _loc9_);
							_loc15_.push(_loc9_);
							if (_loc15_.length < SlowStochasticIndicatorLayer.FAST_SLOW_RATIO)
							{
								const indicatorPoint = new IndicatorPoint(NaN, point);
								dataSeries0.points.push(indicatorPoint);
								dataSeries1.points.push(indicatorPoint);
							}
							else
							{
								const _loc10_ = _loc5_ / SlowStochasticIndicatorLayer.FAST_SLOW_RATIO;
								dataSeries0.points.push(new IndicatorPoint(_loc10_, point));
								_loc6_ = Number(_loc6_ + _loc10_);
								_loc16_.push(_loc10_);
								if (_loc16_.length < this.dPeriod)
								{
									this.copyLastIndicatorPoint(point, dataSeries1);
								}
								else
								{
									dataSeries1.points.push(new IndicatorPoint(_loc6_ / this.dPeriod, point));
									_loc6_ = Number(_loc6_ - _loc16_.shift()!);
								}
								_loc5_ = Number(_loc5_ - _loc15_.shift()!);
							}
						}
						dataUnits.shift();
					}
				}
			}
			this.indicator.setDataSeries(interval, dataSeries0, 0);
			this.indicator.setDataSeries(interval, dataSeries1, 1);
		}
	}
}
