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

			const _loc2_ = this.originalDataSeries.getPointsInIntervalArray(param1);
			if (!_loc2_)
				return;

			let _loc8_ = NaN;
			let _loc9_ = NaN;
			let _loc10_ = NaN;
			const _loc12_ = new DataSeries();
			const _loc13_ = new DataSeries();
			const _loc14_ = new DataSeries();
			const _loc15_: DataUnit[] = [];
			for (let _loc6_ = 0; _loc6_ < _loc2_.length; _loc6_++)
			{
				const _loc16_ = _loc2_[_loc6_];
				if (!this.shouldSkip(_loc16_, _loc12_, _loc13_, _loc14_))
				{
					_loc15_.push(_loc16_);
					if (_loc15_.length < this.period)
					{
						const _loc11_ = new IndicatorPoint(NaN, _loc16_);
						_loc12_.points.push(_loc11_);
						_loc13_.points.push(_loc11_);
						_loc14_.points.push(_loc11_);
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
							const _loc11_ = new IndicatorPoint(_loc5_, _loc16_);
							_loc8_ = _loc5_;
							_loc9_ = _loc5_;
							_loc10_ = _loc5_;	// not used?
							_loc12_.points.push(_loc11_);
							_loc13_.points.push(_loc11_);
							_loc14_.points.push(_loc11_);
						}
						else if (_loc3_ === _loc4_)
						{
							this.copyLastIndicatorPoint(_loc16_, _loc12_, _loc13_, _loc14_);
						}
						else
						{
							_loc8_ = _loc5_ * this.alphaNumber + _loc8_ * (1 - this.alphaNumber);
							_loc9_ = _loc8_ * this.alphaNumber + _loc9_ * (1 - this.alphaNumber);
							_loc10_ = 3 * _loc9_ - 2 * _loc8_;
							_loc12_.points.push(new IndicatorPoint(_loc8_, _loc16_));
							_loc13_.points.push(new IndicatorPoint(_loc9_, _loc16_));
							_loc14_.points.push(new IndicatorPoint(_loc10_, _loc16_));
						}
						_loc15_.shift();
					}
				}
			}
			this.indicator.setDataSeries(param1, _loc12_, 0);
			this.indicator.setDataSeries(param1, _loc13_, 1);
			this.indicator.setDataSeries(param1, _loc14_, 2);
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
