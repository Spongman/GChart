namespace com.google.finance.indicator
{
	// import com.google.finance.Messages;
	// import com.google.finance.DataUnit;
	// import com.google.finance.DataSeries;
	// import com.google.finance.ViewPoint;
	// import com.google.finance.DataSource;

	export class RSIIndicatorLayer extends IndependentIndicatorLayer
	{
		private static readonly PARAMETER_NAMES = ["period"];


		private period = 9;

		constructor(param1: ViewPoint, param2: DataSource)
		{
			super(param1, param2);
		}

		static getParameterNames()
		{
			return RSIIndicatorLayer.PARAMETER_NAMES;
		}

		protected getIndicatorValueText(param1: number, param2: number, param3: string, param4: Context): string
		{
			if (param1 === 0)
				return Messages.getMsg(Messages.RSI_RSI, param2);

			return "";
		}

		protected getLineStyle(param1: number): number
		{
			if (param1 === 0)
				return IndicatorLineStyle.SIMPLE_LINE;

			return IndicatorLineStyle.NONE;
		}

		protected getIndicatorNameText(param1: string): string
		{
			return Messages.getMsg(Messages.RSI_INTERVAL, this.period, param1);
		}

		computeIntervalIndicator(param1: number) 
		{
			if (this.indicator.hasInterval(param1))
				return;

			let _loc2_ = this.originalDataSeries.getPointsInIntervalArray(param1);
			if (!_loc2_ || _loc2_.length === 0)
				return;

			let _loc3_ = new DataSeries();
			let _loc5_ = 0;
			let _loc6_ = 0;
			let _loc9_: number[] = [];
			let _loc10_ = _loc2_[0].close;
			let _loc8_ = new IndicatorPoint(NaN, _loc2_[0]);
			_loc3_.points.push(_loc8_);
			let _loc11_ = 1;
			while (_loc11_ < _loc2_.length)
			{
				let _loc12_ = _loc2_[_loc11_];
				if (!this.shouldSkip(_loc12_, _loc3_))
				{
					let _loc7_ = _loc12_.close - _loc10_;
					_loc10_ = _loc12_.close;
					_loc9_.push(_loc7_);
					if (_loc7_ > 0)
						_loc5_ = Number(_loc5_ + _loc7_);
					else
						_loc6_ = Number(_loc6_ - _loc7_);

					if (_loc9_.length < this.period)
					{
						_loc3_.points.push(new IndicatorPoint(NaN, _loc12_));
					}
					else
					{
						if (_loc5_ + _loc6_ !== 0)
						{
							let _loc4_ = _loc5_ / (_loc5_ + _loc6_) * 100;
							_loc3_.points.push(new IndicatorPoint(_loc4_, _loc12_));
						}
						else
						{
							this.copyLastIndicatorPoint(_loc12_, _loc3_);
						}
						_loc7_ = Number(_loc9_.shift());
						if (_loc7_ > 0)
							_loc5_ = _loc5_ - _loc7_;
						else
							_loc6_ = _loc6_ + _loc7_;
					}
				}
				_loc11_++;
			}
			this.indicator.setDataSeries(param1, _loc3_, 0);
		}

		setIndicatorInstanceArray(param1: any[]) 
		{
			if (!param1 || param1.length !== 1)
				return;

			this.indicator.clear();
			this.period = (<RSIIndicatorLayer><any>param1[0]).period;
		}
	}
}
