namespace com.google.finance
{
	// import com.google.finance.indicator.IndicatorPoint;

	export class GVizFormatConverter
	{
		private static readonly VALUE_PROPERTY_NAME = "v";
		private static readonly COLS_PROPERTY_NAME = "cols";
		private static readonly ROWS_PROPERTY_NAME = "rows";
		private static readonly TYPE_PROPERTY_NAME = "type";
		private static readonly COL_PROPERTY_NAME = "c";
		private static readonly NUMBER_TYPE = "number";
		private static readonly DATETIME_TYPE = "datetime";

		static validateGVizData(param1:any): boolean
		{
			const _loc2_ = !!param1 ? param1[GVizFormatConverter.COLS_PROPERTY_NAME] : null;
			if (!_loc2_ || _loc2_.length === 0)
				return false;

			if (_loc2_[0][GVizFormatConverter.TYPE_PROPERTY_NAME] !== GVizFormatConverter.DATETIME_TYPE)
				return false;

			for (let _loc3_= 1; _loc3_ < _loc2_.length; _loc3_++)
			{
				if (_loc2_[_loc3_][GVizFormatConverter.TYPE_PROPERTY_NAME] !== GVizFormatConverter.NUMBER_TYPE)
					return false;
			}
			return true;
		}

		static convertGVizData(param1:any, param2: number, dataSeries: DataSeries, indicator: Indicator) 
		{
			if (!GVizFormatConverter.validateGVizData(param1))
				return;

			const points = dataSeries.getPointsInIntervalArray(param2);
			if (!points || points.length === 0)
				return;

			const _loc6_ = param1[GVizFormatConverter.ROWS_PROPERTY_NAME];
			const _loc7_: DataSeries[] = [];
			for (let _loc8_= 1; _loc8_ < param1[GVizFormatConverter.COLS_PROPERTY_NAME].length; _loc8_++)
				_loc7_.push(new DataSeries());

			for (let _loc8_ = 0; _loc8_ < _loc6_.length; _loc8_++)
			{
				const _loc9_ = _loc6_[_loc8_][GVizFormatConverter.COL_PROPERTY_NAME][0][GVizFormatConverter.VALUE_PROPERTY_NAME];
				const _loc10_ = Date.parse(_loc9_.toString());
				const timestampIndex = dataSeries.getTimestampIndex(_loc10_, points);
				const _loc12_ = points[timestampIndex];
				for (let _loc13_ = 1; _loc13_ < _loc6_[_loc8_][GVizFormatConverter.COL_PROPERTY_NAME].length; _loc13_++)
				{
					const _loc14_ = _loc6_[_loc8_][GVizFormatConverter.COL_PROPERTY_NAME][_loc13_][GVizFormatConverter.VALUE_PROPERTY_NAME];
					_loc7_[_loc13_ - 1].points.push(new com.google.finance.indicator.IndicatorPoint(_loc14_, _loc12_));
				}
			}

			indicator.clear(param2);
			for (let dataSeriesIndex = 0; dataSeriesIndex < _loc7_.length; dataSeriesIndex++)
				indicator.setDataSeries(param2, _loc7_[dataSeriesIndex], dataSeriesIndex);
		}
	}
}
