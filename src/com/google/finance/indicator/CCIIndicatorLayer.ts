/// <reference path="IndependentIndicatorLayer.ts" />

namespace com.google.finance.indicator
{
	// import com.google.finance.Messages;
	// import com.google.finance.DataUnit;
	// import com.google.finance.DataSeries;
	// import com.google.finance.ViewPoint;
	// import com.google.finance.DataSource;

	export class CCIIndicatorLayer extends IndependentIndicatorLayer
	{
		private static readonly PARAMETER_NAMES = ["period"];


		private period = 20;

		constructor(param1: ViewPoint, param2: DataSource)
		{
			super(param1, param2);
		}

		static getParameterNames()
		{
			return CCIIndicatorLayer.PARAMETER_NAMES;
		}

		protected getIndicatorValueText(param1: number, param2: number, param3: string, param4: Context): string
		{
			if (param1 === 0)
				return Messages.getMsg(Messages.CCI_CCI, param2);

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
			return Messages.getMsg(Messages.CCI_INTERVAL, this.period, param1);
		}

		computeIntervalIndicator(param1: number) 
		{
			let _loc8_ = NaN;
			let _loc9_ = NaN;
			let _loc10_ = NaN;
			let _loc11_ = 0;
			if (this.indicator.hasInterval(param1))
				return;

			let _loc2_ = this.originalDataSeries.getPointsInIntervalArray(param1);
			if (!_loc2_)
				return;

			let _loc3_ = new DataSeries();
			let _loc4_ = 0;
			let _loc5_: number[] = [];
			for (let _loc6_ = 0; _loc6_ < _loc2_.length; _loc6_++)
			{
				let _loc7_ = _loc2_[_loc6_];
				if (!this.shouldSkip(_loc7_, _loc3_))
				{
					_loc8_ = (_loc7_.close + _loc7_.high + _loc7_.low) / 3;
					_loc5_.push(_loc8_);
					_loc4_ = Number(_loc4_ + _loc8_);
					if (_loc5_.length < this.period)
					{
						_loc3_.points.push(new IndicatorPoint(NaN, _loc7_));
					}
					else
					{
						_loc9_ = _loc4_ / this.period;
						_loc10_ = 0;
						_loc11_ = 0;
						while (_loc11_ < this.period)
						{
							_loc10_ = Number(_loc10_ + Math.abs(_loc5_[_loc11_] - _loc9_));
							_loc11_++;
						}
						_loc10_ = Number(_loc10_ / this.period);
						if (_loc10_ !== 0)
							_loc3_.points.push(new IndicatorPoint((_loc8_ - _loc9_) / (0.015 * _loc10_), _loc7_));
						else
							_loc3_.points.push(new IndicatorPoint(0, _loc7_));

						_loc4_ = Number(_loc4_ - _loc5_.shift()!);
					}
				}
			}
			this.indicator.setDataSeries(param1, _loc3_, 0);
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
			this.period = (<CCIIndicatorLayer><any>param1[0]).period;
		}
	}
}
