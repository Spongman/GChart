namespace com.google.finance.indicator
{
	// import com.google.finance.Messages;
	// import com.google.finance.DataSeries;
	// import com.google.finance.DataUnit;
	// import com.google.finance.ViewPoint;
	// import com.google.finance.DataSource;

	export class SMAIndicatorLayer extends DependentIndicatorLayer
	{
		private static readonly PARAMETER_NAMES = ["period"];

		protected periods = [20];

		static getParameterNames()
		{
			return SMAIndicatorLayer.PARAMETER_NAMES;
		}

		isNameTextRequired(): boolean
		{
			return false;
		}

		protected getIndicatorValueText(param1: number, param2: number, param3: string, param4: Context): string
		{
			if (param1 >= 0 && param1 < this.periods.length)
				return Messages.getMsg(Messages.SMA_INTERVAL, this.periods[param1], param3, param2);

			return "";
		}

		protected getLineStyle(param1: number): number
		{
			if (param1 >= 0 && param1 < this.periods.length)
				return IndicatorLineStyle.SIMPLE_LINE;

			return IndicatorLineStyle.NONE;
		}

		computeIntervalIndicator(param1: number) 
		{
			if (this.indicator.hasInterval(param1))
				return;

			const _loc2_ = this.originalDataSeries.getPointsInIntervalArray(param1);
			for (let _loc4_ = 0; _loc4_ < this.periods.length; _loc4_++)
			{
				const _loc9_ = new DataSeries();
				let _loc3_ = 0;
				const _loc8_: number[] = [];
				for (let _loc5_ = 0; _loc5_ < _loc2_.length; _loc5_++)
				{
					const _loc10_ = _loc2_[_loc5_];
					if (!this.shouldSkip(_loc10_, _loc9_))
					{
						_loc3_ = Number(_loc3_ + _loc10_.close);
						_loc8_.push(_loc10_.close);
						let _loc7_: IndicatorPoint;
						if (_loc8_.length < this.periods[_loc4_])
						{
							_loc7_ = new IndicatorPoint(NaN, _loc10_);
						}
						else
						{
							_loc7_ = new IndicatorPoint(_loc3_ / this.periods[_loc4_], _loc10_);
							_loc3_ = Number(_loc3_ - _loc8_.shift()!);
						}
						_loc9_.points.push(_loc7_);
					}
				}
				this.indicator.setDataSeries(param1, _loc9_, _loc4_);
			}
		}

		protected getColor(param1: number, param2 = NaN): number
		{
			return super.getColor(param1 + 1);
		}

		setIndicatorInstanceArray(param1: any[]) 
		{
			if (!param1 || param1.length === 0)
				return;

			this.indicator.clear();
			this.periods = [];
			for (let _loc2_ = 0; _loc2_ < param1.length; _loc2_++)
			{
				this.periods.push(param1[_loc2_].period);
			}
		}
	}
}
