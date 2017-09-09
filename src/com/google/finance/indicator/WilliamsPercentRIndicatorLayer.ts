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
		private static readonly PARAMETER_NAMES: ReadonlyArray<string> = ["period"];

		private period = 10;

		static getParameterNames()
		{
			return WilliamsPercentRIndicatorLayer.PARAMETER_NAMES;
		}

		protected getIndicatorValueText(param1: number, param2: number, param3: string, context: Context): string
		{
			if (param1 === 0)
				return Message.getMsg(Messages.PR_WPR, param2);

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
			return Message.getMsg(Messages.WPR_INTERVAL, this.period, param1);
		}

		computeIntervalIndicator(interval: number)
		{
			if (this.indicator.hasInterval(interval))
				return;

			const pointsInIntervalArray = this.originalDataSeries.getPointsInIntervalArray(interval);
			if (!pointsInIntervalArray)
				return;

			const dataSeries = new DataSeries();
			const dataUnits: DataUnit[] = [];
			for (const point of pointsInIntervalArray)
			{
				if (!this.shouldSkip(point, dataSeries))
				{
					dataUnits.push(point);
					if (dataUnits.length < this.period)
					{
						dataSeries.points.push(new IndicatorPoint(NaN, point));
					}
					else
					{
						let _loc3_ = Number.NEGATIVE_INFINITY;
						let _loc4_ = Number.POSITIVE_INFINITY;
						for (let _loc7_ = 0; _loc7_ < this.period; _loc7_++)
						{
							_loc3_ = Utils.extendedMax(_loc3_, dataUnits[_loc7_].high);
							_loc4_ = Utils.extendedMin(_loc4_, dataUnits[_loc7_].low);
						}
						if (_loc3_ !== _loc4_)
						{
							const value = (_loc3_ - point.close) / (_loc3_ - _loc4_) * 100;
							dataSeries.points.push(new IndicatorPoint(value, point));
						}
						else
						{
							this.copyLastIndicatorPoint(point, dataSeries);
						}
						dataUnits.shift();
					}
				}
			}
			this.indicator.setDataSeries(interval, dataSeries, 0);
		}

		isOhlcDataRequired(): boolean
		{
			return true;
		}

		setIndicatorInstanceArray(indicators: any[])
		{
			if (!indicators || indicators.length !== 1)
				return;

			this.indicator.clear();
			this.period = (<WilliamsPercentRIndicatorLayer><any>indicators[0]).period;
		}
	}
}
