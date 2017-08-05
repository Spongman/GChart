namespace com.google.finance.indicator
{
	// import com.google.finance.Messages;
	// import com.google.finance.DataUnit;
	// import com.google.finance.DataSeries;
	// import com.google.finance.Utils;
	// import com.google.finance.ViewPoint;
	// import com.google.finance.DataSource;

	export class WilliamsPercentRIndicatorLayer extends IndependentIndicatorLayer
	{
		private static readonly PARAMETER_NAMES = ["period"];


		private period = 10;

		constructor(param1: ViewPoint, param2: DataSource)
		{
			super(param1, param2);
		}

		static getParameterNames()
		{
			return WilliamsPercentRIndicatorLayer.PARAMETER_NAMES;
		}

		protected getIndicatorValueText(param1: number, param2: number, param3: string, param4: Context): string
		{
			if (param1 === 0)
				return Messages.getMsg(Messages.PR_WPR, param2);

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
			return Messages.getMsg(Messages.WPR_INTERVAL, this.period, param1);
		}

		computeIntervalIndicator(param1: number) 
		{
			let _loc3_ = NaN;
			let _loc4_ = NaN;
			let _loc5_ = NaN;
			let _loc6_ = 0;
			let _loc7_ = 0;
			if (this.indicator.hasInterval(param1))
				return;

			let _loc2_ = this.originalDataSeries.getPointsInIntervalArray(param1);
			if (!_loc2_)
				return;

			let _loc9_ = new DataSeries();
			let _loc8_: DataUnit[] = [];
			_loc6_ = 0;
			while (_loc6_ < _loc2_.length)
			{
				let _loc10_ = _loc2_[_loc6_];
				if (!this.shouldSkip(_loc10_, _loc9_))
				{
					_loc8_.push(_loc10_);
					if (_loc8_.length < this.period)
					{
						_loc9_.points.push(new IndicatorPoint(NaN, _loc10_));
					}
					else
					{
						_loc3_ = Number.NEGATIVE_INFINITY;
						_loc4_ = Number.POSITIVE_INFINITY;
						_loc7_ = 0;
						while (_loc7_ < this.period)
						{
							_loc3_ = Utils.extendedMax(_loc3_, _loc8_[_loc7_].high);
							_loc4_ = Utils.extendedMin(_loc4_, _loc8_[_loc7_].low);
							_loc7_++;
						}
						if (_loc3_ !== _loc4_)
						{
							_loc5_ = (_loc3_ - _loc10_.close) / (_loc3_ - _loc4_) * 100;
							_loc9_.points.push(new IndicatorPoint(_loc5_, _loc10_));
						}
						else
						{
							this.copyLastIndicatorPoint(_loc10_, _loc9_);
						}
						_loc8_.shift();
					}
				}
				_loc6_++;
			}
			this.indicator.setDataSeries(param1, _loc9_, 0);
		}

		isOhlcDataRequired(): boolean
		{
			return true;
		}

		setIndicatorInstanceArray(param1: any[]) 
		{
			if (!param1 || param1.length !== 1)
				return;

			this.indicator.clear();
			this.period = (<WilliamsPercentRIndicatorLayer><any>param1[0]).period;
		}
	}
}
