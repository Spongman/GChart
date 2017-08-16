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

		static getParameterNames()
		{
			return CCIIndicatorLayer.PARAMETER_NAMES;
		}

		protected getIndicatorValueText(param1: number, param2: number, param3: string, context: Context): string
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
			if (this.indicator.hasInterval(param1))
				return;

			const points = this.originalDataSeries.getPointsInIntervalArray(param1);
			if (!points)
				return;

			const dataSeries = new DataSeries();
			let _loc4_ = 0;
			const _loc5_: number[] = [];
			for (let pointIndex = 0; pointIndex < points.length; pointIndex++)
			{
				const _loc7_ = points[pointIndex];
				if (!this.shouldSkip(_loc7_, dataSeries))
				{
					const _loc8_ = (_loc7_.close + _loc7_.high + _loc7_.low) / 3;
					_loc5_.push(_loc8_);
					_loc4_ = Number(_loc4_ + _loc8_);
					if (_loc5_.length < this.period)
					{
						dataSeries.points.push(new IndicatorPoint(NaN, _loc7_));
					}
					else
					{
						const _loc9_ = _loc4_ / this.period;
						let _loc10_ = 0;
						for (let periodIndex = 0; periodIndex < this.period; periodIndex++)
							_loc10_ = Number(_loc10_ + Math.abs(_loc5_[periodIndex] - _loc9_));

						_loc10_ = Number(_loc10_ / this.period);
						if (_loc10_ !== 0)
							dataSeries.points.push(new IndicatorPoint((_loc8_ - _loc9_) / (0.015 * _loc10_), _loc7_));
						else
							dataSeries.points.push(new IndicatorPoint(0, _loc7_));

						_loc4_ = Number(_loc4_ - _loc5_.shift()!);
					}
				}
			}
			this.indicator.setDataSeries(param1, dataSeries, 0);
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
