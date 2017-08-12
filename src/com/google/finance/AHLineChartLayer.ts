/// <reference path="LineChartLayer.ts" />

namespace com.google.finance
{
	// import flash.display.Sprite;

	export class AHLineChartLayer extends LineChartLayer
	{
		private regionsXLimits: com.google.finance.IntervalSet;
		private visibleSessionsTimes: com.google.finance.IntervalSet;

		protected getPoint(dataSeries: DataSeries, param2: number): DataUnit
		{
			const minute = this.viewPoint.getMinuteOfX(param2);
			let relativeMinuteIndex = dataSeries.getRelativeMinuteIndex(minute);
			const time = dataSeries.units[relativeMinuteIndex].time;
			const interval = notnull(this.visibleSessionsTimes.getIntervalForValue(time));
			const timeIndex = DataSource.getTimeIndex(interval.end, dataSeries.units);
			const skipInterval = this.viewPoint.getSkipInterval().skip;
			relativeMinuteIndex = relativeMinuteIndex - (relativeMinuteIndex - timeIndex) % skipInterval;
			while (dataSeries.units[relativeMinuteIndex].fake && dataSeries.units[relativeMinuteIndex].time > interval.start)
				relativeMinuteIndex--;

			return dataSeries.units[relativeMinuteIndex];
		}

		getDataSeries(context?: Context): DataSeries
		{
			return this.dataSource.afterHoursData;
		}

		private getVisibleSessionsTimes(context: Context): com.google.finance.IntervalSet
		{
			const intervalSet = new com.google.finance.IntervalSet();
			const visibleExtendedHours = this.dataSource.visibleExtendedHours;
			for (let intervalIndex = visibleExtendedHours.length() - 1; intervalIndex >= 0; intervalIndex--)
			{
				const interval = visibleExtendedHours.getIntervalAt(intervalIndex);
				const _loc6_ = this.dataSource.afterHoursData.units[interval.start];
				const _loc7_ = this.dataSource.afterHoursData.units[interval.end];
				if (ViewPoint.sessionVisible(_loc6_, _loc7_, context))
					intervalSet.addInterval(_loc6_.time, _loc7_.time);
			}
			return intervalSet;
		}

		private computeMaxRange(context: Context, param2 = false): number
		{
			this.minPrice = Number.POSITIVE_INFINITY;
			this.maxPrice = 0;
			const visibleSessionsTimes = this.getVisibleSessionsTimes(context);

			for (let intervalIndex = 0; intervalIndex < visibleSessionsTimes.length(); intervalIndex++)
			{
				const interval = visibleSessionsTimes.getIntervalAt(intervalIndex);
				this.computeSessionMinMaxPrice(context, interval.start, interval.end);
			}
			return this.maxPrice !== 0 ? this.maxPrice - this.minPrice : 0;
		}

		private computeSessionMinMaxPrice(context: Context, param2: number, param3: number) 
		{
			const dataSeries = this.getDataSeries();
			const timeIndex1 = DataSource.getTimeIndex(param2, dataSeries.units);
			const timeIndex2 = DataSource.getTimeIndex(param3, dataSeries.units);

			for (let timeIndex = timeIndex1; timeIndex < timeIndex2; timeIndex++)
			{
				const _loc8_ = dataSeries.units[timeIndex];
				if (_loc8_.close < this.minPrice)
					this.minPrice = _loc8_.close;
				else if (_loc8_.close > this.maxPrice)
					this.maxPrice = _loc8_.close;
			}
		}

		getContext(context: Context, param2 = false) 
		{
			const dataSeries = this.getDataSeries();
			if (dataSeries.points.length === 0)
				return context;

			const firstRelativeMinute = dataSeries.getFirstRelativeMinute();
			if (context.lastMinute < firstRelativeMinute)
				return context;

			if (this.viewPoint.getDetailLevel() > Intervals.INTRADAY)
				return context;

			/*const _loc5_ = */this.computeMaxRange(context, param2);
			const mediumPrice = this.getMediumPrice(context.lastMinute, context.count, dataSeries, context.verticalScaling);
			let _loc7_ = 0;
			let _loc8_ = 0;
			if (mediumPrice.maxPrice === mediumPrice.minPrice && !context.maxPrice && !context.minPrice)
			{
				_loc7_ = Math.min(mediumPrice.minPrice, Const.DEFAULT_MAX_RANGE / 2);
				_loc8_ = Const.DEFAULT_MAX_RANGE - _loc7_;
			}
			const _loc9_ = Utils.getLogScaledValue(mediumPrice.minPrice - _loc7_, context.verticalScaling);
			context.maxRangeLowerBound = Utils.extendedMin(_loc9_, context.maxRangeLowerBound);
			const _loc10_ = Utils.getLogScaledValue(mediumPrice.maxPrice + _loc8_, context.verticalScaling);
			context.maxRangeUpperBound = Utils.extendedMax(_loc10_, context.maxRangeUpperBound);
			const _loc11_ = Utils.getLogScaledValue(mediumPrice.minPrice, context.verticalScaling);
			const _loc12_ = Utils.getLogScaledValue(mediumPrice.maxPrice, context.verticalScaling);
			context.minPrice = Utils.extendedMin(_loc11_, context.minPrice);
			context.maxPrice = Utils.extendedMax(_loc12_, context.maxPrice);
			context.medPrice = (context.minPrice + context.maxPrice) / 2;
			const _loc13_ = context.maxPrice - context.minPrice;
			context.maxPriceRange = Utils.extendedMax(_loc13_, context.maxPriceRange);
			//console.log(Utils.appendObjectMembersAsStrings("context: ", context));
			return context;
		}

		renderLayer(context: Context) 
		{
			const dataSeries = this.getDataSeries();
			if (dataSeries.points.length === 0)
				return;

			this.visibleSessionsTimes = this.getVisibleSessionsTimes(context);
			this.graphics.clear();
			this.regionsXLimits = new com.google.finance.IntervalSet();
			let vp = this.viewPoint;
			this.localYOffset = this.viewPoint.miny + vp.medPriceY + vp.V_OFFSET;
			this.localYScale = vp.maxPriceRangeViewSize / context.maxPriceRange;

			for (let intervalIndex = 0; intervalIndex < this.visibleSessionsTimes.length(); intervalIndex++)
			{
				const interval = this.visibleSessionsTimes.getIntervalAt(intervalIndex);
				this.drawAfterHoursSession(this, interval.start, interval.end, context);
			}
		}

		highlightPoint(context: Context, param2: number, param3: { [key: string]: any }) 
		{
			this.clearHighlight();
			if (!this.regionsXLimits || this.regionsXLimits.length() === 0)
				return;

			const _loc4_ = this.regionsXLimits.getIntervalForValue(param2);
			if (!_loc4_)
				return;

			if (param3["setter"])
				param3["setter"].clearHighlight();

			const dataSeries = this.getDataSeries();
			if (!dataSeries)
				return;

			const point = this.getPoint(dataSeries, param2);
			let vp = this.viewPoint;
			const xPos = vp.getXPos(point);
			const yPos = this.getYPos(context, point);
			const gr = this.highlightCanvas.graphics;
			gr.lineStyle(5, Const.AH_DOT_COLOR, 1);
			gr.moveTo(xPos, yPos - 0.2);
			gr.lineTo(xPos, yPos + 0.2);
			param3["point"] = point;
			param3["setter"] = this;
			param3["extraText"] = dataSeries.getSessionDisplayNameForMinute(point.dayMinute) + ": ";
		}

		protected getMediumPrice(param1: number, param2: number, dataSeries: DataSeries, param4: string) 
		{
			return {
				"medPrice": 0,
				"minPrice": this.minPrice,
				"maxPrice": this.maxPrice
			};
		}

		private drawAfterHoursSession(param1: flash.display.Sprite, param2: number, param3: number, param4: Context) 
		{
			const _loc5_ = Const.INTRADAY_INTERVAL / 60;
			const units = this.dataSource.afterHoursData.units;
			const timeIndex1 = DataSource.getTimeIndex(param3, units);
			const timeIndex2 = DataSource.getTimeIndex(param2, units);
			let vp = this.viewPoint;
			const xPos = vp.getXPos(units[timeIndex1]);
			let _loc10_ = 1;
			while (this.viewPoint.minutePix * _loc5_ * _loc10_ < vp.POINTS_DISTANCE)
				_loc10_ = _loc10_ * 2;

			let _loc11_ = timeIndex1;
			if (units[_loc11_].relativeMinutes === 0)
			{
				while (units[_loc11_].time > param2 && units[_loc11_].fake)
					_loc11_--;
			}
			_loc11_ = _loc11_ + (timeIndex1 - _loc11_) % _loc10_;
			let _loc12_ = vp.getXPos(units[_loc11_]);
			let _loc13_ = this.getYPos(param4, units[_loc11_]);
			const gr = param1.graphics;
			gr.lineStyle(0, 0, 0);
			gr.beginFill(Const.ECN_LINE_CHART_FILL_COLOR, Const.ECN_LINE_CHART_FILL_VISIBILITY);
			gr.moveTo(_loc12_, this.viewPoint.maxy - 15);
			gr.lineTo(_loc12_, _loc13_);
			gr.lineStyle(Const.ECN_LINE_CHART_LINE_THICKNESS, Const.ECN_LINE_CHART_LINE_COLOR, Const.ECN_LINE_CHART_LINE_VISIBILITY);
			const _loc14_ = _loc10_ * (this.viewPoint.minutePix * _loc5_);
			for (let timeIndex = _loc11_; timeIndex > timeIndex2; timeIndex = timeIndex - _loc10_)
			{
				_loc13_ = this.getYPos(param4, units[timeIndex]);
				gr.lineTo(_loc12_, _loc13_);
				_loc12_ = _loc12_ - _loc14_;
			}
			gr.lineTo(_loc12_, _loc13_);
			gr.lineStyle(0, 0, 0);
			gr.lineTo(_loc12_, this.viewPoint.maxy - 15);
			gr.endFill();
			this.regionsXLimits.addInterval(_loc12_, xPos);
		}
	}
}
