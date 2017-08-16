/// <reference path="AbstractLayer.ts" />

namespace com.google.finance
{
	export class AbstractDrawingLayer<T extends IViewPoint> extends AbstractLayer<T>
	{
		getContext(context: Context, param2 = false)
		{
			return context;
		}

		protected getBarWidth(interval: Intervals, dataSeries: DataSeries): number
		{
			let numDays = 0;
			if (interval === Intervals.WEEKLY)
				numDays = dataSeries.marketDayLength * 5;
			else if (interval === Intervals.DAILY)
				numDays = dataSeries.marketDayLength;
			else
				numDays = Const.getDetailLevelInterval(interval) / 60;

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
			const width = this.viewPoint.minutePix * marketDayLength * 4;
			if (param2 < xPos + width)
				xPos = param2 - width;

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

		highlightPoint(context: Context, param2: number, state: Dictionary)
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
