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

			const _loc2_ = this.originalDataSeries.getPointsInIntervalArray(param1);
			if (!_loc2_)
				return;

			let _loc5_ = 0;
			const _loc10_ = new DataSeries();
			const _loc11_ = new DataSeries();
			const _loc12_: DataUnit[] = [];
			const _loc13_: number[] = [];
			for (let _loc6_ = 0; _loc6_ < _loc2_.length; _loc6_++)
			{
				const _loc14_ = _loc2_[_loc6_];
				if (!this.shouldSkip(_loc14_, _loc10_, _loc11_))
				{
					_loc12_.push(_loc14_);
					if (_loc12_.length < this.kPeriod)
					{
						const _loc9_ = new IndicatorPoint(NaN, _loc14_);
						_loc10_.points.push(_loc9_);
						_loc11_.points.push(_loc9_);
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
							this.copyLastIndicatorPoint(_loc14_, _loc10_, _loc11_);
						}
						else
						{
							const _loc8_ = (_loc14_.close - _loc4_) / (_loc3_ - _loc4_) * 100;
							_loc10_.points.push(new IndicatorPoint(_loc8_, _loc14_));
							_loc5_ = Number(_loc5_ + _loc8_);
							_loc13_.push(_loc8_);
							if (_loc13_.length < this.dPeriod)
							{
								this.copyLastIndicatorPoint(_loc14_, _loc11_);
							}
							else
							{
								_loc11_.points.push(new IndicatorPoint(_loc5_ / this.dPeriod, _loc14_));
								_loc5_ = Number(_loc5_ - _loc13_.shift()!);
							}
						}
						_loc12_.shift();
					}
				}
			}
			this.indicator.setDataSeries(param1, _loc10_, 0);
			this.indicator.setDataSeries(param1, _loc11_, 1);
		}
	}
}
