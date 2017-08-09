/// <reference path="IndicatorLayer.ts" />

namespace com.google.finance.indicator
{
	// import com.google.finance.ViewPoint;
	// import com.google.finance.DataSource;

	export class DependentIndicatorLayer extends IndicatorLayer
	{
		constructor(param1: ViewPoint, param2: DataSource)
		{
			super(param1, param2);
		}

		protected getYPos(param1: Context, param2: IndicatorPoint): number
		{
			return this.localYOffset - (param2.getLogValue(param1.verticalScaling) - this.localMedianValue) * this.localYScale;
		}

		getContext(context: Context, param2 = false) 
		{
			return context;
		}

		protected calculateLocalScaleMeters(context: Context) 
		{
			const _loc2_ = this.viewPoint;
			this.localYOffset = _loc2_.miny + _loc2_.medPriceY + _loc2_.V_OFFSET;
			this.localYScale = _loc2_.maxPriceRangeViewSize / context.maxPriceRange;
			this.localMedianValue = context.medPrice;
		}
	}
}
