/// <reference path="IndicatorLayer.ts" />

namespace com.google.finance.indicator
{
	// import com.google.finance.ViewPoint;
	// import com.google.finance.DataSource;

	export class DependentIndicatorLayer extends IndicatorLayer
	{
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
			const viewPoint = this.viewPoint;
			this.localYOffset = viewPoint.miny + viewPoint.medPriceY + viewPoint.V_OFFSET;
			this.localYScale = viewPoint.maxPriceRangeViewSize / context.maxPriceRange;
			this.localMedianValue = context.medPrice;
		}
	}
}
