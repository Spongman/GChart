namespace com.google.finance
{
	export class PrecalculatedPercentLineChartLayer extends PercentLineChartLayer
	{
		protected calculatePercentChangeBase(param1= 0) : number
		{
			return 1;
		}
	}
}
