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
			let _loc3_ = 0;
			let _loc4_ = 0;
			if (param1 === Intervals.WEEKLY)
				_loc3_ = dataSeries.marketDayLength * 5;
			else if (param1 === Intervals.DAILY)
				_loc3_ = dataSeries.marketDayLength;
			else
				_loc3_ = Const.getDetailLevelInterval(param1) / 60;

			if (this.viewPoint.count === 0)
				return 0;

			_loc4_ = Const.BAR_WIDTH_RATIO * _loc3_ * this.viewPoint.minutePix;
			if (_loc4_ % 2 === 1)
				_loc4_--;

			return _loc4_;
		}

		clearHighlight() 
		{
		}

		protected getWeeklyBarXPos(param1: DataUnit, param2: number): number
		{
			let _loc3_ = (<ViewPoint><any>this.viewPoint).getXPos(param1);
			const _loc4_ = this.dataSource.data.marketDayLength;
			const _loc5_ = this.viewPoint.minutePix * _loc4_ * 4;
			if (param2 < _loc3_ + _loc5_)
				_loc3_ = param2 - _loc5_;

			param1.weeklyXPos = _loc3_;
			return _loc3_;
		}

		getOldestMinute(): number
		{
			const _loc1_ = this.getDataSeries();
			if (_loc1_)
				return _loc1_.getFirstRelativeMinute();
			return 0;
		}

		protected getLastRealPointIndex(param1: DataUnit[]): number
		{
			if (Boolean(MainManager.paramsObj.hasExtendedHours) && param1[param1.length - 1].relativeMinutes !== 0)
				return param1.length - 1;

			return Utils.getLastRealPointIndex(param1);
		}

		highlightPoint(context: Context, param2: number, param3: { [key: string]: any })
		{
		}

		getNewestMinute(): number
		{
			const _loc1_ = this.getDataSeries();
			if (_loc1_)
				return _loc1_.getLastRelativeMinute();
			return 0;
		}
	}
}
