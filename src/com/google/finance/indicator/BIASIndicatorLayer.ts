/// <reference path="IndependentIndicatorLayer.ts" />

namespace com.google.finance.indicator
{
	// import com.google.finance.Messages;
	// import com.google.finance.DataUnit;
	// import com.google.finance.DataSeries;
	// import com.google.finance.ViewPoint;
	// import com.google.finance.DataSource;

	export class BIASIndicatorLayer extends IndependentIndicatorLayer
	{
		private static readonly PARAMETER_NAMES = ["period"];

		private period = 20;

		static getParameterNames()
		{
			return BIASIndicatorLayer.PARAMETER_NAMES;
		}

		protected getIndicatorValueText(param1: number, param2: number, param3: string, param4: Context): string
		{
			if (param1 === 0)
				return Messages.getMsg(Messages.BIAS_BIAS, param2);

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
			return Messages.getMsg(Messages.BIAS_INTERVAL, this.period, param1);
		}

		computeIntervalIndicator(param1: number) 
		{
			if (this.indicator.hasInterval(param1))
				return;

			const _loc2_ = this.originalDataSeries.getPointsInIntervalArray(param1);
			if (!_loc2_)
				return;

			const _loc3_ = new DataSeries();
			let _loc5_ = 0;
			let _loc6_ = 0;
			const _loc8_: number[] = [];
			for (let _loc9_ = 0; _loc9_ < _loc2_.length; _loc9_++)
			{
				const _loc10_ = _loc2_[_loc9_];
				if (!this.shouldSkip(_loc10_, _loc3_))
				{
					_loc5_ = Number(_loc5_ + _loc10_.close);
					_loc8_.push(_loc10_.close);
					let _loc4_: number;
					if (_loc8_.length < this.period)
					{
						_loc4_ = NaN;
					}
					else
					{
						_loc6_ = Number(_loc5_ / this.period);
						_loc4_ = (_loc10_.close - _loc6_) / _loc6_ * 100;
						_loc5_ = Number(_loc5_ - _loc8_.shift()!);
					}
					const _loc7_ = new IndicatorPoint(_loc4_, _loc2_[_loc9_]);
					_loc3_.points.push(_loc7_);
				}
			}
			this.indicator.setDataSeries(param1, _loc3_, 0);
		}

		setIndicatorInstanceArray(param1: any[]) 
		{
			if (!param1 || param1.length !== 1)
				return;

			this.indicator.clear();
			this.period = (<BIASIndicatorLayer><any>param1[0]).period;
		}
	}
}
