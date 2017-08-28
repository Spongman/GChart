namespace com.google.finance
{
	//import flash.display.Sprite;

	export class PassiveLineLayer extends AbstractDrawingLayer<ViewPoint>
	{
		private localYOffset = 0;
		private localYScale = 0;

		indicator: com.google.finance.Indicator;
		originalDataSeries: com.google.finance.DataSeries;
		indicatorParams: any;	// any?
		computer: Function;

		constructor(viewPoint: ViewPoint, dataSource: DataSource)
		{
			super(viewPoint, dataSource);
			this.lineColor = Const.LINE_CHART_LINE_COLOR;
		}

		highlightPoint(context: Context, param2: number, state: Dictionary)
		{
			this.clearHighlight();
			const originalDataSeries = this.originalDataSeries;
			const x = this.viewPoint.getXPos(originalDataSeries.units[0]);
			//const _loc7_ = this.viewPoint.getXPos(_loc4_.units[_loc4_.points.length - 1]);
			if (param2 < x)
				return;

			let unit: DataUnit;
			if (param2 > this.viewPoint.maxx)
				unit = notnull(this.viewPoint.getLastDataUnit(originalDataSeries));
			else
				unit = notnull(this.getPoint(originalDataSeries, param2));

			//const _loc8_ = this.viewPoint.getMinuteXPos(_loc5_.relativeMinutes);
			//const _loc9_ = this.getYPos(param1, _loc5_);
			if (state["points"] === undefined)
				state["points"] = [];

			const formattedClosePrice = this.getFormattedClosePrice(unit.close);
			const technicalsNameElseQuote = this.getTechnicalsNameElseQuote(this.dataSource.quoteName);
			const infoDotInfo = new InfoDotInfo();
			infoDotInfo.quote = technicalsNameElseQuote;
			infoDotInfo.quoteColor = this.lineColor;
			infoDotInfo.value = formattedClosePrice;
			infoDotInfo.valueColor = this.lineColor;
			infoDotInfo.displayName = "";	// TODO: undefined

			if (this.dataSource.displayName)
				infoDotInfo.displayName = this.dataSource.displayName;

			state["points"].push(infoDotInfo);
			state["setter"] = this;
		}

		private getFormattedClosePrice(param1: number): string
		{
			let value = "";
			if (Math.floor(param1) !== param1)
			{
				const _loc3_ = Math.floor(param1 * 100) % 100;
				if (_loc3_ % 10 === 0)
					value += ' ' + param1 + '0';
				else
					value += ' ' + param1;
			}
			else
			{
				value += ' ' + param1 + ".00";
			}
			return value;
		}

		private drawLine_(sprite: flash.display.Sprite, param2: number, param3: number, viewPoint: ViewPoint, context: Context, dataSeries: com.google.finance.DataSeries)
		{
			const units = dataSeries.units;
			const days = dataSeries.days;
			const gr = sprite.graphics;
			gr.lineStyle(Const.LINE_CHART_LINE_THICKNESS, this.lineColor, Const.LINE_CHART_LINE_VISIBILITY);
			let nextDayStart = dataSeries.getNextDayStart(param3);
			let day = days[nextDayStart];
			while (day > param2 && units[day].fake)
				day--;

			let xPos = viewPoint.getXPos(units[day]) + 1;
			let yPos = this.getYPos(context, units[days[nextDayStart]]);
			gr.moveTo(xPos, this.viewPoint.maxy);
			gr.lineStyle(0, 0, 0);
			gr.lineTo(xPos, yPos);
			gr.lineStyle(Const.LINE_CHART_LINE_THICKNESS, this.lineColor, Const.LINE_CHART_LINE_VISIBILITY);
			const vp = this.viewPoint;
			switch (vp.getDetailLevel())
			{
				case Intervals.INTRADAY:
					while (days[nextDayStart] > 0 && days[nextDayStart] >= param2 && days[nextDayStart] !== days[nextDayStart - 1] + 1)
					{
						this.drawDayLine_(sprite, nextDayStart, viewPoint, param2, param3, context, dataSeries);
						nextDayStart--;
					}
					break;
				case Intervals.DAILY:
					let _loc13_ = param3;
					xPos = viewPoint.getXPos(units[_loc13_]);
					const _loc14_ = viewPoint.minutePix * (this.dataSource.data.marketDayLength + 2);
					while (_loc13_ >= param2 && _loc13_ > 0)
					{
						yPos = this.getYPos(context, units[_loc13_]);
						gr.lineTo(xPos, yPos);
						_loc13_--;
						xPos -= _loc14_;
					}
					break;
				case Intervals.WEEKLY:
					const skipInterval = viewPoint.getSkipInterval();
					let _loc16_ = dataSeries.fridays.length - 1;
					while (dataSeries.fridays[_loc16_] > dataSeries.days[nextDayStart])
						_loc16_--;

					_loc16_ += (dataSeries.fridays.length - 1 - _loc16_) % skipInterval.skip;
					_loc16_ = Math.min(_loc16_, dataSeries.fridays.length - 1);
					while (_loc16_ >= 0 && dataSeries.fridays[_loc16_] >= param2)
					{
						const unit = dataSeries.units[dataSeries.fridays[_loc16_]];
						xPos = vp.getXPos(unit);
						yPos = this.getYPos(context, unit);
						gr.lineTo(xPos, yPos);
						_loc16_ -= skipInterval.skip;
					}
					break;
			}
		}

		private getPoint(dataSeries: com.google.finance.DataSeries, param2: number): DataUnit
		{
			return dataSeries.units[this.getPointIndex(dataSeries, param2)];
		}

		private drawDayLine_(sprite: flash.display.Sprite, dayIndex: number, viewPoint: ViewPoint, param4: number, param5: number, context: Context, dataSeries: com.google.finance.DataSeries)
		{
			const units = dataSeries.units;
			const days = dataSeries.days;
			let previousDay;
			if (dayIndex > 0)
				previousDay = days[dayIndex - 1];
			else
				previousDay = 0;

			let day = days[dayIndex];
			if (units[day].fake && day === units.length - 1)
			{
				while (units[day].fake)
					day--;
			}
			//const _loc13_ = _loc12_;
			while (day > param5 && day > param4)
				day--;

			let xPos = viewPoint.getXPos(units[day]);
			const skipInterval = viewPoint.getSkipInterval(context.count, context.lastMinute);
			const intervalLength = viewPoint.getIntervalLength(skipInterval.interval / 60);
			const gr = sprite.graphics;
			while (day >= previousDay && day >= param4)
			{
				const _loc11_ = this.localYOffset - (dataSeries.points[day].value - context.medPrice) * this.localYScale;
				gr.lineTo(xPos, _loc11_);
				day--;
				xPos -= intervalLength;
			}
			const xPos2 = viewPoint.getXPos(units[previousDay]);
			const yPos2 = this.getYPos(context, units[previousDay]);
			gr.lineTo(xPos2, yPos2);
		}

		private getTechnicalsNameElseQuote(param1: string): string
		{
			const _loc2_ = param1.split('@');
			if (_loc2_.length > 1)
				return _loc2_[1];

			return param1;
		}

		setIndicator(indicatorName: string, fn: Function, dataSeries: com.google.finance.DataSeries, params: any)
		{
			this.dataSource.indicators[indicatorName] = new com.google.finance.Indicator();
			this.indicator = this.dataSource.indicators[indicatorName];
			fn = fn;
			this.indicatorParams = params;
			this.originalDataSeries = dataSeries;
		}

		getYPos(context: Context, dataUnit: DataUnit): number
		{
			return this.localYOffset - (dataUnit.getCloseLogValue(context.verticalScaling) - context.medPrice) * this.localYScale;
		}

		getDataSeries(context: Context): com.google.finance.DataSeries | null
		{
			if (!context)
				return null;

			const skipInterval = this.viewPoint.getSkipInterval(context.count, context.lastMinute);
			if (!this.computer)
				return null;

			this.computer(skipInterval.interval, this.indicator, this.originalDataSeries, this.indicatorParams);
			return this.indicator.getDataSeries(skipInterval.interval);
		}

		renderLayer(context: Context)
		{
			const viewPoint = this.viewPoint;
			const dataSeries = this.getDataSeries(context);
			if (!dataSeries || dataSeries.points.length === 0)
				return;

			this.graphics.clear();
			let lastMinuteIndex = dataSeries.getRelativeMinuteIndex(viewPoint.getLastMinute());
			if (lastMinuteIndex < dataSeries.points.length - 1)
				lastMinuteIndex++;

			let firstMinuteIndex = dataSeries.getRelativeMinuteIndex(viewPoint.getFirstMinute()) - 1;
			if (firstMinuteIndex < 0)
				firstMinuteIndex = 0;

			this.localYOffset = viewPoint.miny + viewPoint.medPriceY + viewPoint.V_OFFSET;
			this.localYScale = viewPoint.maxPriceRangeViewSize / context.maxPriceRange;
			this.drawLine_(this, firstMinuteIndex, lastMinuteIndex, viewPoint, context, dataSeries);
		}

		private getPointIndex(dataSeries: com.google.finance.DataSeries, xPos: number): number
		{
			const minute = this.viewPoint.getMinuteOfX(xPos);
			let minuteIndex = dataSeries.getRelativeMinuteIndex(minute);
			while (dataSeries.units[minuteIndex].fake && minuteIndex > 0)
				minuteIndex--;

			const skipInterval = this.viewPoint.getSkipInterval();
			const skip = skipInterval.skip;
			const interval = skipInterval.interval;
			if (interval < Const.DAILY_INTERVAL)
			{
				const nextDayStart = dataSeries.getNextDayStart(minuteIndex);
				return minuteIndex + (dataSeries.days[nextDayStart] - minuteIndex) % skip;
			}
			return dataSeries.days[dataSeries.getNextDayStart(minuteIndex + 1)];
		}
	}
}
