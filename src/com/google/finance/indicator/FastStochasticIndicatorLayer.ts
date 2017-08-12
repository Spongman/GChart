namespace com.google.finance.indicator
{
	// import com.google.finance.Messages;
	// import com.google.finance.DataUnit;
	// import com.google.finance.DataSeries;
	// import com.google.finance.Utils;
	// import com.google.finance.ViewPoint;
	// import com.google.finance.DataSource;

	export class FastStochasticIndicatorLayer extends AbstractStochasticIndicatorLayer
	{
		static getParameterNames()
		{
			return AbstractStochasticIndicatorLayer.getParameterNames();
		}

		protected getIndicatorNameText(param1: string): string
		{
			return Messages.getMsg(Messages.FSTO_INTERVAL, this.kPeriod, this.dPeriod, param1);
		}

		computeIntervalIndicator(param1: number) 
		{
			if (this.indicator.hasInterval(param1))
				return;

			const points = this.originalDataSeries.getPointsInIntervalArray(param1);
			if (!points)
				return;

			let _loc5_ = 0;
			const dataSeries0 = new DataSeries();
			const dataSeries1 = new DataSeries();
			const _loc12_: DataUnit[] = [];
			const _loc13_: number[] = [];
			for (let pointIndex = 0; pointIndex < points.length; pointIndex++)
			{
				const _loc14_ = points[pointIndex];
				if (!this.shouldSkip(_loc14_, dataSeries0, dataSeries1))
				{
					_loc12_.push(_loc14_);
					if (_loc12_.length < this.kPeriod)
					{
						const indicatorPoint = new IndicatorPoint(NaN, _loc14_);
						dataSeries0.points.push(indicatorPoint);
						dataSeries1.points.push(indicatorPoint);
					}
					else
					{
						let _loc3_ = Number.NEGATIVE_INFINITY;
						let _loc4_ = Number.POSITIVE_INFINITY;
						for (let _loc7_ = 0; _loc7_ < this.kPeriod; _loc7_++)
						{
							_loc3_ = Utils.extendedMax(_loc3_, _loc12_[_loc7_].high);
							_loc4_ = Utils.extendedMin(_loc4_, _loc12_[_loc7_].low);
						}
						if (_loc3_ === _loc4_)
						{
							this.copyLastIndicatorPoint(_loc14_, dataSeries0, dataSeries1);
						}
						else
						{
							const _loc8_ = (_loc14_.close - _loc4_) / (_loc3_ - _loc4_) * 100;
							dataSeries0.points.push(new IndicatorPoint(_loc8_, _loc14_));
							_loc5_ = Number(_loc5_ + _loc8_);
							_loc13_.push(_loc8_);
							if (_loc13_.length < this.dPeriod)
							{
								this.copyLastIndicatorPoint(_loc14_, dataSeries1);
							}
							else
							{
								dataSeries1.points.push(new IndicatorPoint(_loc5_ / this.dPeriod, _loc14_));
								_loc5_ = Number(_loc5_ - _loc13_.shift()!);
							}
						}
						_loc12_.shift();
					}
				}
			}
			this.indicator.setDataSeries(param1, dataSeries0, 0);
			this.indicator.setDataSeries(param1, dataSeries1, 1);
		}
	}
}
