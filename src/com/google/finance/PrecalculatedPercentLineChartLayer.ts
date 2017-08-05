namespace com.google.finance
{
	export class PrecalculatedPercentLineChartLayer extends PercentLineChartLayer
	{
		constructor(param1: ViewPoint, param2: DataSource)
		{
			super(param1,param2);
		}
		
		protected calculatePercentChangeBase(param1= 0) : number
		{
			return 1;
		}
	}
}
