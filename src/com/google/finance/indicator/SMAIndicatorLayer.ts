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

		protected getIndicatorValueText(periodIndex: number, param2: number, param3: string, context: Context): string
		{
			if (periodIndex >= 0 && periodIndex < this.periods.length)
				return Messages.getMsg(Messages.SMA_INTERVAL, this.periods[periodIndex], param3, param2);

			return "";
		}

		protected getLineStyle(param1: number): number
		{
			if (param1 >= 0 && param1 < this.periods.length)
				return IndicatorLineStyle.SIMPLE_LINE;

			return IndicatorLineStyle.NONE;
		}

		computeIntervalIndicator(interval: number)
		{
			if (this.indicator.hasInterval(interval))
				return;

			const pointsInIntervalArray = this.originalDataSeries.getPointsInIntervalArray(interval);
			for (let pointIndex = 0; pointIndex < this.periods.length; pointIndex++)
			{
				const dataSeries = new DataSeries();
				let _loc3_ = 0;
				const closes: number[] = [];
				for (const originalPoint of pointsInIntervalArray)
				{
					if (!this.shouldSkip(originalPoint, dataSeries))
					{
						_loc3_ = Number(_loc3_ + originalPoint.close);
						closes.push(originalPoint.close);
						let point: IndicatorPoint;
						if (closes.length < this.periods[pointIndex])
						{
							point = new IndicatorPoint(NaN, originalPoint);
						}
						else
						{
							point = new IndicatorPoint(_loc3_ / this.periods[pointIndex], originalPoint);
							_loc3_ = Number(_loc3_ - closes.shift()!);
						}
						dataSeries.points.push(point);
					}
				}
				this.indicator.setDataSeries(interval, dataSeries, pointIndex);
			}
		}

		protected getColor(param1: number, param2 = NaN): number
		{
			return super.getColor(param1 + 1);
		}

		setIndicatorInstanceArray(indicators: any[])
		{
			if (!indicators || indicators.length === 0)
				return;

			this.indicator.clear();
			this.periods = [];
			for (const indicator of indicators)
				this.periods.push(indicator.period);
		}
	}
}
