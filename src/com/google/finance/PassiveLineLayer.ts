namespace com.google.finance
{
	//import flash.display.Sprite;

	export class PassiveLineLayer extends AbstractDrawingLayer<ViewPoint>
	{
		private localYOffset = 0;
		private localYScale = 0;
		
		indicator: com.google.finance.Indicator;
		originalDataSeries: com.google.finance.DataSeries;
		indicatorParams:any;	// any?
		computer: Function;

		constructor(viewPoint: ViewPoint, dataSource: DataSource)
		{
			super(viewPoint, dataSource);
			this.lineColor = Const.LINE_CHART_LINE_COLOR;
		}

		highlightPoint(context: Context, param2: number, param3: { [key: string]: any }) 
		{
			this.clearHighlight();
			const originalDataSeries = this.originalDataSeries;
			const xPos = this.viewPoint.getXPos(originalDataSeries.units[0]);
			//const _loc7_ = this.viewPoint.getXPos(_loc4_.units[_loc4_.points.length - 1]);
			if (param2 < xPos)
				return;

			let _loc5_: DataUnit;
			if (param2 > this.viewPoint.maxx)
				_loc5_ = notnull(this.viewPoint.getLastDataUnit(originalDataSeries));
			else
				_loc5_ = notnull(this.getPoint(originalDataSeries, param2));

			//const _loc8_ = this.viewPoint.getMinuteXPos(_loc5_.relativeMinutes);
			//const _loc9_ = this.getYPos(param1, _loc5_);
			if (param3["points"] === undefined)
				param3["points"] = [];

			const formattedClosePrice = this.getFormattedClosePrice(_loc5_.close);
			const technicalsNameElseQuote = this.getTechnicalsNameElseQuote(this.dataSource.quoteName);
			const infoDotInfo = new InfoDotInfo();
			infoDotInfo.quote = technicalsNameElseQuote;
			infoDotInfo.quoteColor = this.lineColor;
			infoDotInfo.value = formattedClosePrice;
			infoDotInfo.valueColor = this.lineColor;
			infoDotInfo.displayName = "";	// TODO: undefined

			if (this.dataSource.displayName)
				infoDotInfo.displayName = this.dataSource.displayName;

			param3["points"].push(infoDotInfo);
			param3["setter"] = this;
		}

		private getFormattedClosePrice(param1: number): string
		{
			let _loc2_ = "";
			if (Math.floor(param1) !== param1)
			{
				const _loc3_ = Math.floor(param1 * 100) % 100;
				if (_loc3_ % 10 === 0)
					_loc2_ = _loc2_ + (" " + param1 + "0");
				else
					_loc2_ = _loc2_ + (" " + param1);
			}
			else
			{
				_loc2_ = _loc2_ + (" " + param1 + ".00");
			}
			return _loc2_;
		}

		private drawLine_(param1: flash.display.Sprite, param2: number, param3: number, viewPoint: ViewPoint, context: Context, param6: com.google.finance.DataSeries) 
		{
			const units = param6.units;
			const days = param6.days;
			const gr = param1.graphics;
			gr.lineStyle(Const.LINE_CHART_LINE_THICKNESS, this.lineColor, Const.LINE_CHART_LINE_VISIBILITY);
			let nextDayStart = param6.getNextDayStart(param3);
			let _loc10_ = days[nextDayStart];
			while (_loc10_ > param2 && units[_loc10_].fake)
				_loc10_--;

			let xPos = viewPoint.getXPos(units[_loc10_]) + 1;
			let yPos = this.getYPos(context, units[days[nextDayStart]]);
			gr.moveTo(xPos, this.viewPoint.maxy);
			gr.lineStyle(0, 0, 0);
			gr.lineTo(xPos, yPos);
			gr.lineStyle(Const.LINE_CHART_LINE_THICKNESS, this.lineColor, Const.LINE_CHART_LINE_VISIBILITY);
			let vp = this.viewPoint;
			switch (vp.getDetailLevel())
			{
				case Intervals.INTRADAY:
					while (days[nextDayStart] > 0 && days[nextDayStart] >= param2 && days[nextDayStart] !== days[nextDayStart - 1] + 1)
					{
						this.drawDayLine_(param1, nextDayStart, viewPoint, param2, param3, context, param6);
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
					let _loc16_ = param6.fridays.length - 1;
					while (param6.fridays[_loc16_] > param6.days[nextDayStart])
						_loc16_--;

					_loc16_ = _loc16_ + (param6.fridays.length - 1 - _loc16_) % skipInterval.skip;
					_loc16_ = Math.min(_loc16_, param6.fridays.length - 1);
					while (_loc16_ >= 0 && param6.fridays[_loc16_] >= param2)
					{
						const _loc17_ = param6.units[param6.fridays[_loc16_]];
						xPos = vp.getXPos(_loc17_);
						yPos = this.getYPos(context, _loc17_);
						gr.lineTo(xPos, yPos);
						_loc16_ = _loc16_ - skipInterval.skip;
					}
					break;
			}
		}

		private getPoint(param1: com.google.finance.DataSeries, param2: number): DataUnit
		{
			return param1.units[this.getPointIndex(param1, param2)];
		}

		private drawDayLine_(param1: flash.display.Sprite, param2: number, viewPoint: ViewPoint, param4: number, param5: number, context: Context, param7: com.google.finance.DataSeries) 
		{
			let _loc17_ = 0;
			const units = param7.units;
			const days = param7.days;
			if (param2 > 0)
				_loc17_ = days[param2 - 1];
			else
				_loc17_ = 0;

			let _loc12_ = days[param2];
			if (units[_loc12_].fake && _loc12_ === units.length - 1)
			{
				while (units[_loc12_].fake)
					_loc12_--;
			}
			//const _loc13_ = _loc12_;
			while (_loc12_ > param5 && _loc12_ > param4)
				_loc12_--;

			let xPos = viewPoint.getXPos(units[_loc12_]);
			const skipInterval = viewPoint.getSkipInterval(context.count, context.lastMinute);
			const intervalLength = viewPoint.getIntervalLength(skipInterval.interval / 60);
			const gr = param1.graphics;
			while (_loc12_ >= _loc17_ && _loc12_ >= param4)
			{
				const _loc11_ = this.localYOffset - (param7.points[_loc12_].value - context.medPrice) * this.localYScale;
				gr.lineTo(xPos, _loc11_);
				_loc12_--;
				xPos -= intervalLength;
			}
			const xPos2 = viewPoint.getXPos(units[_loc17_]);
			const yPos2 = this.getYPos(context, units[_loc17_]);
			gr.lineTo(xPos2, yPos2);
		}

		private getTechnicalsNameElseQuote(param1: string): string
		{
			const _loc2_ = param1.split("@");
			if (_loc2_.length > 1)
				return _loc2_[1];

			return param1;
		}

		setIndicator(param1: string, param2: Function, param3: com.google.finance.DataSeries, param4:any) 
		{
			this.dataSource.indicators[param1] = new com.google.finance.Indicator();
			this.indicator = this.dataSource.indicators[param1];
			param2 = param2;
			this.indicatorParams = param4;
			this.originalDataSeries = param3;
		}

		getYPos(context: Context, param2: DataUnit): number
		{
			return this.localYOffset - (param2.getCloseLogValue(context.verticalScaling) - context.medPrice) * this.localYScale;
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

		private getPointIndex(param1: com.google.finance.DataSeries, param2: number): number
		{
			const minute = this.viewPoint.getMinuteOfX(param2);
			let minuteIndex = param1.getRelativeMinuteIndex(minute);
			while (param1.units[minuteIndex].fake && minuteIndex > 0)
				minuteIndex--;

			const skipInterval = this.viewPoint.getSkipInterval();
			const skip = skipInterval.skip;
			const interval = skipInterval.interval;
			if (interval < Const.DAILY_INTERVAL)
			{
				const nextDayStart = param1.getNextDayStart(minuteIndex);
				return minuteIndex + (param1.days[nextDayStart] - minuteIndex) % skip;
			}
			return param1.days[param1.getNextDayStart(minuteIndex + 1)];
		}
	}
}
