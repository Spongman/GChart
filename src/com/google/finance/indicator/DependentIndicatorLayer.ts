import { Context } from "../ViewPoint";
import { IndicatorLayer } from "./IndicatorLayer";
import { IndicatorPoint } from "./IndicatorPoint";

	// import com.google.finance.ViewPoint;
	// import com.google.finance.DataSource;

export class DependentIndicatorLayer extends IndicatorLayer {
		protected getYPos(context: Context, indicatorPoint: IndicatorPoint): number {
			return this.localYOffset - (indicatorPoint.getLogValue(context.verticalScaling) - this.localMedianValue) * this.localYScale;
		}

		getContext(context: Context, param2 = false) {
			return context;
		}

		protected calculateLocalScaleMeters(context: Context) {
			const viewPoint = this.viewPoint;
			this.localYOffset = viewPoint.miny + viewPoint.medPriceY + viewPoint.V_OFFSET;
			this.localYScale = viewPoint.maxPriceRangeViewSize / context.maxPriceRange;
			this.localMedianValue = context.medPrice;
		}
	}
