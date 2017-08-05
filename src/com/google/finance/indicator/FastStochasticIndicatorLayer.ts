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
		constructor(param1: ViewPoint, param2: DataSource)
		{
			super(param1, param2);
		}

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
			let _loc3_ = NaN;
			let _loc4_ = NaN;
			let _loc6_ = 0;
			let _loc7_ = 0;
			let _loc8_ = NaN;
			if (this.indicator.hasInterval(param1))
				return;

			let _loc2_ = this.originalDataSeries.getPointsInIntervalArray(param1);
			if (!_loc2_)
				return;

			let _loc5_ = 0;
			let _loc10_ = new DataSeries();
			let _loc11_ = new DataSeries();
			let _loc12_: DataUnit[] = [];
			let _loc13_: number[] = [];
			_loc6_ = 0;
			while (_loc6_ < _loc2_.length)
			{
				let _loc14_ = _loc2_[_loc6_];
				if (!this.shouldSkip(_loc14_, _loc10_, _loc11_))
				{
					_loc12_.push(_loc14_);
					if (_loc12_.length < this.kPeriod)
					{
						let _loc9_ = new IndicatorPoint(NaN, _loc14_);
						_loc10_.points.push(_loc9_);
						_loc11_.points.push(_loc9_);
					}
					else
					{
						_loc3_ = Number.NEGATIVE_INFINITY;
						_loc4_ = Number.POSITIVE_INFINITY;
						_loc7_ = 0;
						while (_loc7_ < this.kPeriod)
						{
							_loc3_ = Utils.extendedMax(_loc3_, _loc12_[_loc7_].high);
							_loc4_ = Utils.extendedMin(_loc4_, _loc12_[_loc7_].low);
							_loc7_++;
						}
						if (_loc3_ === _loc4_)
						{
							this.copyLastIndicatorPoint(_loc14_, _loc10_, _loc11_);
						}
						else
						{
							_loc8_ = (_loc14_.close - _loc4_) / (_loc3_ - _loc4_) * 100;
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
				_loc6_++;
			}
			this.indicator.setDataSeries(param1, _loc10_, 0);
			this.indicator.setDataSeries(param1, _loc11_, 1);
		}
	}
}
