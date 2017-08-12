namespace com.google.finance.indicator
{
	// import com.google.finance.Messages;
	// import com.google.finance.DataUnit;
	// import com.google.finance.DataSeries;
	// import com.google.finance.Utils;
	// import com.google.finance.ViewPoint;
	// import com.google.finance.DataSource;

	export class KDJIndicatorLayer extends IndependentIndicatorLayer
	{
		private static readonly PARAMETER_NAMES = ["period"];

		private period = 14;
		private alphaNumber = 0.3333333333333333;

		static getParameterNames()
		{
			return KDJIndicatorLayer.PARAMETER_NAMES;
		}

		protected getIndicatorValueText(param1: number, param2: number, param3: string, param4: Context): string
		{
			switch (param1)
			{
				case 0:
					return Messages.getMsg(Messages.K_KDJ, param2);
				case 1:
					return Messages.getMsg(Messages.D_KDJ, param2);
				case 2:
					return Messages.getMsg(Messages.J_KDJ, param2);
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

		protected getIndicatorNameText(param1: string): string
		{
			return Messages.getMsg(Messages.KDJ_INTERVAL, this.period, param1);
		}

		computeIntervalIndicator(param1: number) 
		{
			if (this.indicator.hasInterval(param1))
				return;

			const points = this.originalDataSeries.getPointsInIntervalArray(param1);
			if (!points)
				return;

			let _loc8_ = NaN;
			let _loc9_ = NaN;
			let _loc10_ = NaN;
			const dataSeries0 = new DataSeries();
			const dataSeries1 = new DataSeries();
			const dataSeries2 = new DataSeries();
			const _loc15_: DataUnit[] = [];
			for (let pointIndex = 0; pointIndex < points.length; pointIndex++)
			{
				const _loc16_ = points[pointIndex];
				if (!this.shouldSkip(_loc16_, dataSeries0, dataSeries1, dataSeries2))
				{
					_loc15_.push(_loc16_);
					if (_loc15_.length < this.period)
					{
						const indicatorPoint = new IndicatorPoint(NaN, _loc16_);
						dataSeries0.points.push(indicatorPoint);
						dataSeries1.points.push(indicatorPoint);
						dataSeries2.points.push(indicatorPoint);
					}
					else
					{
						let _loc3_ = Number.NEGATIVE_INFINITY;
						let _loc4_ = Number.POSITIVE_INFINITY;
						for (let _loc7_ = 0; _loc7_ < this.period; _loc7_++)
						{
							_loc3_ = Utils.extendedMax(_loc3_, _loc15_[_loc7_].high);
							_loc4_ = Utils.extendedMin(_loc4_, _loc15_[_loc7_].low);
						}
						const _loc5_ = (_loc16_.close - _loc4_) / (_loc3_ - _loc4_) * 100;
						if (isNaN(_loc8_))
						{
							const indicatorPoint = new IndicatorPoint(_loc5_, _loc16_);
							_loc8_ = _loc5_;
							_loc9_ = _loc5_;
							_loc10_ = _loc5_;	// not used?
							dataSeries0.points.push(indicatorPoint);
							dataSeries1.points.push(indicatorPoint);
							dataSeries2.points.push(indicatorPoint);
						}
						else if (_loc3_ === _loc4_)
						{
							this.copyLastIndicatorPoint(_loc16_, dataSeries0, dataSeries1, dataSeries2);
						}
						else
						{
							_loc8_ = _loc5_ * this.alphaNumber + _loc8_ * (1 - this.alphaNumber);
							_loc9_ = _loc8_ * this.alphaNumber + _loc9_ * (1 - this.alphaNumber);
							_loc10_ = 3 * _loc9_ - 2 * _loc8_;
							dataSeries0.points.push(new IndicatorPoint(_loc8_, _loc16_));
							dataSeries1.points.push(new IndicatorPoint(_loc9_, _loc16_));
							dataSeries2.points.push(new IndicatorPoint(_loc10_, _loc16_));
						}
						_loc15_.shift();
					}
				}
			}
			this.indicator.setDataSeries(param1, dataSeries0, 0);
			this.indicator.setDataSeries(param1, dataSeries1, 1);
			this.indicator.setDataSeries(param1, dataSeries2, 2);
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
			this.period = (<KDJIndicatorLayer><any>param1[0]).period;
		}
	}
}
