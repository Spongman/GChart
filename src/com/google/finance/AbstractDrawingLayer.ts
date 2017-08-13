/// <reference path="AbstractLayer.ts" />

namespace com.google.finance
{
	export class AbstractDrawingLayer<T extends IViewPoint> extends AbstractLayer<T>
	{
		getContext(context: Context, param2 = false)
		{
			return context;
		}

		protected getBarWidth(param1: Intervals, dataSeries: DataSeries): number
		{
			let numDays = 0;
			if (param1 === Intervals.WEEKLY)
				numDays = dataSeries.marketDayLength * 5;
			else if (param1 === Intervals.DAILY)
				numDays = dataSeries.marketDayLength;
			else
				numDays = Const.getDetailLevelInterval(param1) / 60;

			if (this.viewPoint.count === 0)
				return 0;

			let width = Const.BAR_WIDTH_RATIO * numDays * this.viewPoint.minutePix;
			if (width % 2 === 1)
				width--;

			return width;
		}

		clearHighlight() 
		{
		}

		protected getWeeklyBarXPos(dataUnit: DataUnit, param2: number): number
		{
			let xPos = (<ViewPoint><any>this.viewPoint).getXPos(dataUnit);
			const marketDayLength = this.dataSource.data.marketDayLength;
			const _loc5_ = this.viewPoint.minutePix * marketDayLength * 4;
			if (param2 < xPos + _loc5_)
				xPos = param2 - _loc5_;

			dataUnit.weeklyXPos = xPos;
			return xPos;
		}

		getOldestMinute(): number
		{
			const dataSeries = this.getDataSeries();
			if (dataSeries)
				return dataSeries.getFirstRelativeMinute();
			return 0;
		}

		protected getLastRealPointIndex(dataUnits: DataUnit[]): number
		{
			if (Boolean(MainManager.paramsObj.hasExtendedHours) && dataUnits[dataUnits.length - 1].relativeMinutes !== 0)
				return dataUnits.length - 1;

			return Utils.getLastRealPointIndex(dataUnits);
		}

		highlightPoint(context: Context, param2: number, param3: { [key: string]: any })
		{
		}

		getNewestMinute(): number
		{
			const dataSeries = this.getDataSeries();
			if (dataSeries)
				return dataSeries.getLastRelativeMinute();
			return 0;
		}
	}
}
