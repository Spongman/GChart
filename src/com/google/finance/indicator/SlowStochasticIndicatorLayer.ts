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

		computeIntervalIndicator(param1: number) 
		{
			if (this.indicator.hasInterval(param1))
				return;

			const points = this.originalDataSeries.getPointsInIntervalArray(param1);
			if (!points)
				return;

			let _loc5_ = 0;
			let _loc6_ = 0;
			const dataSeries0 = new DataSeries();
			const dataSeries1 = new DataSeries();
			const _loc14_: DataUnit[] = [];
			const _loc15_: number[] = [];
			const _loc16_: number[] = [];
			for (let pointIndex = 0; pointIndex < points.length; pointIndex++)
			{
				const _loc17_ = points[pointIndex];
				if (!this.shouldSkip(_loc17_, dataSeries0, dataSeries1))
				{
					_loc14_.push(_loc17_);
					if (_loc14_.length < this.kPeriod)
					{
						const indicatorPoint = new IndicatorPoint(NaN, _loc17_);
						dataSeries0.points.push(indicatorPoint);
						dataSeries1.points.push(indicatorPoint);
					}
					else
					{
						let _loc3_ = Number.NEGATIVE_INFINITY;
						let _loc4_ = Number.POSITIVE_INFINITY;
						for (let _loc8_ = 0; _loc8_ < this.kPeriod; _loc8_++)
						{
							_loc3_ = Utils.extendedMax(_loc3_, _loc14_[_loc8_].high);
							_loc4_ = Utils.extendedMin(_loc4_, _loc14_[_loc8_].low);
						}
						if (_loc3_ === _loc4_)
						{
							this.copyLastIndicatorPoint(_loc17_, dataSeries0, dataSeries1);
						}
						else
						{
							const _loc9_ = (_loc17_.close - _loc4_) / (_loc3_ - _loc4_) * 100;
							_loc5_ = Number(_loc5_ + _loc9_);
							_loc15_.push(_loc9_);
							if (_loc15_.length < SlowStochasticIndicatorLayer.FAST_SLOW_RATIO)
							{
								const indicatorPoint = new IndicatorPoint(NaN, _loc17_);
								dataSeries0.points.push(indicatorPoint);
								dataSeries1.points.push(indicatorPoint);
							}
							else
							{
								const _loc10_ = _loc5_ / SlowStochasticIndicatorLayer.FAST_SLOW_RATIO;
								dataSeries0.points.push(new IndicatorPoint(_loc10_, _loc17_));
								_loc6_ = Number(_loc6_ + _loc10_);
								_loc16_.push(_loc10_);
								if (_loc16_.length < this.dPeriod)
								{
									this.copyLastIndicatorPoint(_loc17_, dataSeries1);
								}
								else
								{
									dataSeries1.points.push(new IndicatorPoint(_loc6_ / this.dPeriod, _loc17_));
									_loc6_ = Number(_loc6_ - _loc16_.shift()!);
								}
								_loc5_ = Number(_loc5_ - _loc15_.shift()!);
							}
						}
						_loc14_.shift();
					}
				}
			}
			this.indicator.setDataSeries(param1, dataSeries0, 0);
			this.indicator.setDataSeries(param1, dataSeries1, 1);
		}
	}
}
