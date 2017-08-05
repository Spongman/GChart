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
			return Messages.getMsg(Messages.SSTO_INTERVAL, this.kPeriod, this.dPeriod, param1);
		}

		computeIntervalIndicator(param1: number) 
		{
			let _loc3_ = NaN;
			let _loc4_ = NaN;
			let _loc7_ = 0;
			let _loc8_ = 0;
			let _loc9_ = NaN;
			let _loc10_ = NaN;
			if (this.indicator.hasInterval(param1))
				return;

			let _loc2_ = this.originalDataSeries.getPointsInIntervalArray(param1);
			if (!_loc2_)
				return;

			let _loc5_ = 0;
			let _loc6_ = 0;
			let _loc12_ = new DataSeries();
			let _loc13_ = new DataSeries();
			let _loc14_: DataUnit[] = [];
			let _loc15_: number[] = [];
			let _loc16_: number[] = [];
			_loc7_ = 0;
			while (_loc7_ < _loc2_.length)
			{
				let _loc17_ = _loc2_[_loc7_];
				if (!this.shouldSkip(_loc17_, _loc12_, _loc13_))
				{
					_loc14_.push(_loc17_);
					if (_loc14_.length < this.kPeriod)
					{
						let _loc11_ = new IndicatorPoint(NaN, _loc17_);
						_loc12_.points.push(_loc11_);
						_loc13_.points.push(_loc11_);
					}
					else
					{
						_loc3_ = Number.NEGATIVE_INFINITY;
						_loc4_ = Number.POSITIVE_INFINITY;
						_loc8_ = 0;
						while (_loc8_ < this.kPeriod)
						{
							_loc3_ = Utils.extendedMax(_loc3_, _loc14_[_loc8_].high);
							_loc4_ = Utils.extendedMin(_loc4_, _loc14_[_loc8_].low);
							_loc8_++;
						}
						if (_loc3_ === _loc4_)
						{
							this.copyLastIndicatorPoint(_loc17_, _loc12_, _loc13_);
						}
						else
						{
							_loc9_ = (_loc17_.close - _loc4_) / (_loc3_ - _loc4_) * 100;
							_loc5_ = Number(_loc5_ + _loc9_);
							_loc15_.push(_loc9_);
							if (_loc15_.length < SlowStochasticIndicatorLayer.FAST_SLOW_RATIO)
							{
								let _loc11_ = new IndicatorPoint(NaN, _loc17_);
								_loc12_.points.push(_loc11_);
								_loc13_.points.push(_loc11_);
							}
							else
							{
								_loc10_ = _loc5_ / SlowStochasticIndicatorLayer.FAST_SLOW_RATIO;
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
				_loc7_++;
			}
			this.indicator.setDataSeries(param1, _loc12_, 0);
			this.indicator.setDataSeries(param1, _loc13_, 1);
		}
	}
}
