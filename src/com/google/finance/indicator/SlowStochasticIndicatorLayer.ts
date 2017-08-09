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

			const _loc2_ = this.originalDataSeries.getPointsInIntervalArray(param1);
			if (!_loc2_)
				return;

			let _loc5_ = 0;
			let _loc6_ = 0;
			const _loc12_ = new DataSeries();
			const _loc13_ = new DataSeries();
			const _loc14_: DataUnit[] = [];
			const _loc15_: number[] = [];
			const _loc16_: number[] = [];
			for (let _loc7_ = 0; _loc7_ < _loc2_.length; _loc7_++)
			{
				const _loc17_ = _loc2_[_loc7_];
				if (!this.shouldSkip(_loc17_, _loc12_, _loc13_))
				{
					_loc14_.push(_loc17_);
					if (_loc14_.length < this.kPeriod)
					{
						const _loc11_ = new IndicatorPoint(NaN, _loc17_);
						_loc12_.points.push(_loc11_);
						_loc13_.points.push(_loc11_);
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
							this.copyLastIndicatorPoint(_loc17_, _loc12_, _loc13_);
						}
						else
						{
							const _loc9_ = (_loc17_.close - _loc4_) / (_loc3_ - _loc4_) * 100;
							_loc5_ = Number(_loc5_ + _loc9_);
							_loc15_.push(_loc9_);
							if (_loc15_.length < SlowStochasticIndicatorLayer.FAST_SLOW_RATIO)
							{
								const _loc11_ = new IndicatorPoint(NaN, _loc17_);
								_loc12_.points.push(_loc11_);
								_loc13_.points.push(_loc11_);
							}
							else
							{
								const _loc10_ = _loc5_ / SlowStochasticIndicatorLayer.FAST_SLOW_RATIO;
								_loc12_.points.push(new IndicatorPoint(_loc10_, _loc17_));
								_loc6_ = Number(_loc6_ + _loc10_);
								_loc16_.push(_loc10_);
								if (_loc16_.length < this.dPeriod)
								{
									this.copyLastIndicatorPoint(_loc17_, _loc13_);
								}
								else
								{
									_loc13_.points.push(new IndicatorPoint(_loc6_ / this.dPeriod, _loc17_));
									_loc6_ = Number(_loc6_ - _loc16_.shift()!);
								}
								_loc5_ = Number(_loc5_ - _loc15_.shift()!);
							}
						}
						_loc14_.shift();
					}
				}
			}
			this.indicator.setDataSeries(param1, _loc12_, 0);
			this.indicator.setDataSeries(param1, _loc13_, 1);
		}
	}
}
