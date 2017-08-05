/// <reference path="DependentIndicatorLayer.ts" />

namespace com.google.finance.indicator
{
	// import com.google.finance.Messages;
	// import com.google.finance.DataUnit;
	// import com.google.finance.DataSeries;
	// import com.google.finance.ViewPoint;
	// import com.google.finance.DataSource;

	export class BollingerBandsIndicatorLayer extends DependentIndicatorLayer
	{
		private static readonly PARAMETER_NAMES = ["period"];


		private multiplier = 2;

		private period = 20;

		constructor(param1: ViewPoint, param2: DataSource)
		{
			super(param1, param2);
		}

		static getParameterNames()
		{
			return BollingerBandsIndicatorLayer.PARAMETER_NAMES;
		}

		protected getIndicatorNameText(param1: string): string
		{
			return Messages.getMsg(Messages.BOLL_INTERVAL, this.period, param1);
		}

		protected getIndicatorValueText(param1: number, param2: number, param3: string, param4: Context): string
		{
			switch (param1)
			{
				case 0:
					return Messages.getMsg(Messages.MID_BOLL, param2);
				case 1:
					return Messages.getMsg(Messages.LOWER_BOLL, param2);
				case 2:
					return Messages.getMsg(Messages.UPPER_BOLL, param2);
				default:
					return "";
			}
		}

		protected getLineStyle(param1: number): number
		{
			if (param1 >= 0 && param1 < 3)
				return IndicatorLineStyle.SIMPLE_LINE;

			return IndicatorLineStyle.NONE;
		}

		computeIntervalIndicator(param1: number) 
		{
			let _loc3_ = 0;
			let _loc4_ = 0;
			let _loc5_ = NaN;
			let _loc6_ = NaN;
			let _loc7_ = NaN;
			let _loc8_ = NaN;
			if (this.indicator.hasInterval(param1))
				return;

			let _loc2_ = this.originalDataSeries.getPointsInIntervalArray(param1);
			if (!_loc2_)
				return;

			let _loc9_ = 0;
			let _loc11_ = new DataSeries();
			let _loc12_ = new DataSeries();
			let _loc13_ = new DataSeries();
			let _loc14_: number[] = [];
			_loc3_ = 0;
			while (_loc3_ < _loc2_.length)
			{
				let _loc15_ = _loc2_[_loc3_];
				if (!this.shouldSkip(_loc15_, _loc11_, _loc12_, _loc13_))
				{
					_loc9_ = Number(_loc9_ + _loc15_.close);
					_loc14_.push(_loc15_.close);
					if (_loc14_.length < this.period)
					{
						let _loc10_ = new IndicatorPoint(NaN, _loc15_);
						_loc11_.points.push(_loc10_);
						_loc12_.points.push(_loc10_);
						_loc13_.points.push(_loc10_);
					}
					else
					{
						_loc5_ = _loc9_ / this.period;
						_loc6_ = 0;
						_loc4_ = 0;
						while (_loc4_ < this.period)
						{
							_loc6_ = Number(_loc6_ + (_loc14_[_loc4_] - _loc5_) * (_loc14_[_loc4_] - _loc5_));
							_loc4_++;
						}
						_loc6_ = Number(Math.sqrt(_loc6_ / this.period));
						_loc7_ = _loc5_ + this.multiplier * _loc6_;
						_loc8_ = _loc5_ - this.multiplier * _loc6_;
						_loc11_.points.push(new IndicatorPoint(_loc5_, _loc15_));
						_loc12_.points.push(new IndicatorPoint(_loc7_, _loc15_));
						_loc13_.points.push(new IndicatorPoint(_loc8_, _loc15_));
						_loc9_ = Number(_loc9_ - _loc14_.shift()!);
					}
				}
				_loc3_++;
			}
			this.indicator.setDataSeries(param1, _loc11_, 0);
			this.indicator.setDataSeries(param1, _loc13_, 1);
			this.indicator.setDataSeries(param1, _loc12_, 2);
		}

		setIndicatorInstanceArray(param1: any[]) 
		{
			if (!param1 || param1.length !== 1)
				return;

			this.indicator.clear();
			this.period = (<BollingerBandsIndicatorLayer>param1[0]).period;
		}
	}
}
