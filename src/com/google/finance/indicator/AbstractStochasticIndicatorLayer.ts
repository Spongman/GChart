/// <reference path="IndependentIndicatorLayer.ts" />

namespace com.google.finance.indicator
{
	// import com.google.finance.Messages;
	// import com.google.finance.ViewPoint;
	// import com.google.finance.DataSource;

	export class AbstractStochasticIndicatorLayer extends IndependentIndicatorLayer
	{
		private static readonly PARAMETER_NAMES = ["kPeriod", "dPeriod"];


		protected dPeriod = 3;

		protected kPeriod = 14;

		constructor(param1: ViewPoint, param2: DataSource)
		{
			super(param1, param2);
		}

		static getParameterNames()
		{
			return AbstractStochasticIndicatorLayer.PARAMETER_NAMES;
		}

		isOhlcDataRequired(): boolean
		{
			return true;
		}

		protected getIndicatorValueText(param1: number, param2: number, param3: string, param4: Context): string
		{
			switch (param1)
			{
				case 0:
					return Messages.getMsg(Messages.K_STOCHASTIC, param2);
				case 1:
					return Messages.getMsg(Messages.D_STOCHASTIC, param2);
				default:
					return "";
			}
		}

		protected getLineStyle(param1: number): number
		{
			if (param1 >= 0 && param1 < 2)
				return IndicatorLineStyle.SIMPLE_LINE;

			return IndicatorLineStyle.NONE;
		}

		setIndicatorInstanceArray(param1: any[]) 
		{
			if (!param1 || param1.length !== 1)
				return;

			this.indicator.clear();
			this.kPeriod = param1[0].kPeriod;
			this.dPeriod = param1[0].dPeriod;
		}
	}
}
