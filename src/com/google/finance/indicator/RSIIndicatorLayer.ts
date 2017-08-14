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

		static getParameterNames()
		{
			return RSIIndicatorLayer.PARAMETER_NAMES;
		}

		protected getIndicatorValueText(param1: number, param2: number, param3: string, context: Context): string
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

			const points = this.originalDataSeries.getPointsInIntervalArray(param1);
			if (!points || points.length === 0)
				return;

			const dataSeries = new DataSeries();
			let _loc5_ = 0;
			let _loc6_ = 0;
			const _loc9_: number[] = [];
			let _loc10_ = points[0].close;
			const indicatorPoint = new IndicatorPoint(NaN, points[0]);
			dataSeries.points.push(indicatorPoint);
			for (let _loc11_ = 1; _loc11_ < points.length; _loc11_++)
			{
				const _loc12_ = points[_loc11_];
				if (!this.shouldSkip(_loc12_, dataSeries))
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
						dataSeries.points.push(new IndicatorPoint(NaN, _loc12_));
					}
					else
					{
						if (_loc5_ + _loc6_ !== 0)
						{
							const _loc4_ = _loc5_ / (_loc5_ + _loc6_) * 100;
							dataSeries.points.push(new IndicatorPoint(_loc4_, _loc12_));
						}
						else
						{
							this.copyLastIndicatorPoint(_loc12_, dataSeries);
						}
						_loc7_ = Number(_loc9_.shift());
						if (_loc7_ > 0)
							_loc5_ -= _loc7_;
						else
							_loc6_ += _loc7_;
					}
				}
			}
			this.indicator.setDataSeries(param1, dataSeries, 0);
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
