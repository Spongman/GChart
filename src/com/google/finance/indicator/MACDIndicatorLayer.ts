namespace com.google.finance.indicator
{
	// import com.google.finance.Messages;
	// import com.google.finance.Const;
	// import com.google.finance.DataUnit;
	// import com.google.finance.DataSeries;
	// import com.google.finance.Utils;
	// import com.google.finance.ViewPoint;
	// import com.google.finance.DataSource;

	export class MACDIndicatorLayer extends IndependentIndicatorLayer
	{
		private static readonly PARAMETER_NAMES = ["shortPeriod", "longPeriod", "emaPeriod"];

		private emaPeriod = 9;
		private longPeriod = 26;
		private shortPeriod = 12;

		static getParameterNames()
		{
			return MACDIndicatorLayer.PARAMETER_NAMES;
		}

		protected getIndicatorValueText(param1: number, param2: number, param3: string, context: Context): string
		{
			switch (param1)
			{
				case 0:
					return Messages.getMsg(!!Const.APPLY_CHINESE_STYLE_MACD ? Number(Messages.DIFF_MACD) : Messages.MACD_MACD, param2);
				case 1:
					return Messages.getMsg(!!Const.APPLY_CHINESE_STYLE_MACD ? Number(Messages.DEA_MACD) : Messages.EMA_MACD, param2);
				case 2:
					return Messages.getMsg(!!Const.APPLY_CHINESE_STYLE_MACD ? Number(Messages.MACD_MACD) : Messages.DIVERGENCE_MACD, param2);
				default:
					return "";
			}
		}

		protected getLineStyle(param1: number): number
		{
			switch (param1)
			{
				case 0:
				case 1:
					return IndicatorLineStyle.SIMPLE_LINE;
				case 2:
					return IndicatorLineStyle.HISTOGRAM_LINE;
				default:
					return IndicatorLineStyle.NONE;
			}
		}

		protected getColor(param1: number, param2 = NaN): number
		{
			switch (param1)
			{
				case 0:
					return Const.COLOR_BLUE;
				case 1:
					return !!Const.APPLY_CHINESE_STYLE_MACD ? Const.COLOR_YELLOW : Const.COLOR_RED;
				case 2:
					return Const.APPLY_CHINESE_STYLE_MACD && param2 > 0 ? Const.COLOR_RED : Const.COLOR_GREEN;
				default:
					return 0;
			}
		}

		protected getIndicatorNameText(param1: string): string
		{
			return Messages.getMsg(Messages.MACD_INTERVAL, this.shortPeriod, this.longPeriod, this.emaPeriod, param1);
		}

		computeIntervalIndicator(param1: number)
		{
			if (this.indicator.hasInterval(param1))
				return;

			const points = this.originalDataSeries.getPointsInIntervalArray(param1);
			if (!points || points.length === 0)
				return;

			const dataSeries0 = new DataSeries();
			const dataSeries1 = new DataSeries();
			const dataSeries2 = new DataSeries();
			let _loc3_ = points[0].close;
			let _loc4_ = _loc3_;
			let _loc5_ = _loc3_ - _loc4_;
			let _loc6_ = _loc5_;
			const indicatorPoint = new IndicatorPoint(0, points[0]);
			dataSeries0.points.push(indicatorPoint);
			dataSeries1.points.push(indicatorPoint);
			dataSeries2.points.push(indicatorPoint);
			for (let pointIndex = 1; pointIndex < points.length; pointIndex++)
			{
				const _loc14_ = points[pointIndex];
				if (!this.shouldSkip(_loc14_, dataSeries0, dataSeries1, dataSeries2))
				{
					_loc3_ = (_loc3_ * (this.shortPeriod - 1) + _loc14_.close * 2) / (this.shortPeriod + 1);
					_loc4_ = (_loc4_ * (this.longPeriod - 1) + _loc14_.close * 2) / (this.longPeriod + 1);
					_loc5_ = _loc3_ - _loc4_;
					_loc6_ = (_loc6_ * (this.emaPeriod - 1) + _loc5_ * 2) / (this.emaPeriod + 1);
					const _loc7_ = (!!Const.APPLY_CHINESE_STYLE_MACD ? 2 : 1) * (_loc5_ - _loc6_);
					dataSeries0.points.push(new IndicatorPoint(_loc5_, _loc14_));
					dataSeries1.points.push(new IndicatorPoint(_loc6_, _loc14_));
					dataSeries2.points.push(new IndicatorPoint(_loc7_, _loc14_));
				}
			}
			this.indicator.setDataSeries(param1, dataSeries0, 0);
			this.indicator.setDataSeries(param1, dataSeries1, 1);
			this.indicator.setDataSeries(param1, dataSeries2, 2);
		}

		setIndicatorInstanceArray(indicators: com.google.finance.indicator.MACDIndicatorLayer[])
		{
			if (!indicators || indicators.length !== 1)
				return;

			this.indicator.clear();
			this.shortPeriod = indicators[0].shortPeriod;
			this.longPeriod = indicators[0].longPeriod;
			this.emaPeriod = indicators[0].emaPeriod;
		}

		getContext(context: Context, param2 = false)
		{
			context = super.getContext(context, param2);
			context.maxValue = Utils.extendedMax(0, context.maxValue);
			context.minValue = Utils.extendedMin(0, context.minValue);
			return context;
		}
	}
}
