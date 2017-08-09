/// <reference path="SMAIndicatorLayer.ts" />

namespace com.google.finance.indicator
{
	// import com.google.finance.DataSeries;
	// import com.google.finance.DataUnit;
	// import com.google.finance.Messages;
	// import com.google.finance.ViewPoint;
	// import com.google.finance.DataSource;

	export class EMAIndicatorLayer extends SMAIndicatorLayer
	{
		constructor(param1: ViewPoint, param2: DataSource)
		{
			super(param1, param2);
		}

		static getParameterNames()
		{
			return SMAIndicatorLayer.getParameterNames();
		}

		computeIntervalIndicator(param1: number) 
		{
			if (this.indicator.hasInterval(param1))
				return;

			const _loc2_ = this.originalDataSeries.getPointsInIntervalArray(param1);
			for (let _loc7_ = 0; _loc7_ < this.periods.length; _loc7_++)
			{
				const _loc10_ = new DataSeries();
				let _loc3_ = NaN;
				const _loc4_ = 2 / (Number(this.periods[_loc7_]) + 1);
				let _loc6_ = 0;
				let _loc5_ = 0;
				for (let _loc8_ = 0; _loc8_ < _loc2_.length; _loc8_++)
				{
					const _loc11_ = _loc2_[_loc8_];
					if (!this.shouldSkip(_loc11_, _loc10_))
					{
						_loc5_ = _loc5_ + 1;
						_loc6_ = Number(_loc6_ + _loc11_.close);
						let _loc9_: IndicatorPoint;
						if (_loc5_ < this.periods[_loc7_])
						{
							_loc9_ = new IndicatorPoint(NaN, _loc11_);
						}
						else if (_loc5_ === this.periods[_loc7_])
						{
							_loc3_ = _loc6_ / _loc5_;
							_loc9_ = new IndicatorPoint(_loc3_, _loc11_);
						}
						else
						{
							_loc3_ = (_loc11_.close - _loc3_) * _loc4_ + _loc3_;
							_loc9_ = new IndicatorPoint(_loc3_, _loc11_);
						}
						_loc10_.points.push(_loc9_);
					}
				}
				this.indicator.setDataSeries(param1, _loc10_, _loc7_);
			}
		}

		protected getIndicatorValueText(param1: number, param2: number, param3: string, param4: Context): string
		{
			if (param1 >= 0 && param1 < this.periods.length)
				return Messages.getMsg(Messages.EMA_INTERVAL, this.periods[param1], param3, param2);

			return "";
		}
	}
}
