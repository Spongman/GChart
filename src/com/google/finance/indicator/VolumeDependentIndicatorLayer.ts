namespace com.google.finance.indicator
{
	// import com.google.finance.Const;
	// import com.google.finance.ViewPoint;
	// import com.google.finance.DataSource;

	export class VolumeDependentIndicatorLayer extends IndicatorLayer
	{
		protected getYPos(context: Context, param2: IndicatorPoint): number
		{
			return this.viewPoint.maxy - param2.getValue() * this.localYScale;
		}

		getContext(context: Context, param2 = false) 
		{
			return context;
		}

		protected calculateLocalScaleMeters(context: Context) 
		{
			this.localYScale = (this.viewPoint.maxy - this.viewPoint.miny - Const.BOTTOM_VIEWPOINT_HEADER_HEIGHT) / context.maxVolume;
		}
	}
}
