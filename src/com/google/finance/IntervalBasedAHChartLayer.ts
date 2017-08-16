/// <reference path="IntervalBasedChartLayer.ts" />

namespace com.google.finance
{
	export class IntervalBasedAHChartLayer extends IntervalBasedChartLayer
	{
		private regionsXLimits: com.google.finance.IntervalSet;
		private visibleSessionsTimes: com.google.finance.IntervalSet;

		constructor(viewPoint: ViewPoint, dataSoure: DataSource)
		{
			super(viewPoint, dataSoure);
			this.setEnabled(true);
		}

		private drawOhlcBars(dataUnits: DataUnit[], param2: number, param3: number, context: Context)
		{
			const afterHoursBarWidth = this.getAfterHoursBarWidth();
			const gr = this.graphics;
			for (let _loc6_ = param3; _loc6_ > param2; _loc6_--)
			{
				if (!(isNaN(dataUnits[_loc6_].high) || isNaN(dataUnits[_loc6_].low) || isNaN(dataUnits[_loc6_].open)))
				{
					const _loc7_ = dataUnits[_loc6_];
					const xPos = this.viewPoint.getXPos(_loc7_);
					const ohlcYPos = this.getOhlcYPos(context, _loc7_);
					const ohlcColor = this.getOhlcColor(_loc7_, dataUnits[Math.max(_loc6_ - 1, 0)]);
					gr.lineStyle(1, ohlcColor);
					if (!_loc7_.fake)
					{
						if (Math.abs(ohlcYPos.highY - ohlcYPos.lowY) <= 1)
						{
							const _loc11_ = (ohlcYPos.highY + ohlcYPos.lowY) / 2;
							if (afterHoursBarWidth === 0)
							{
								gr.moveTo(xPos, _loc11_ - 0.5);
								gr.lineTo(xPos, _loc11_ + 0.5);
							}
							else
							{
								gr.moveTo(xPos - afterHoursBarWidth / 2, _loc11_);
								gr.lineTo(xPos + afterHoursBarWidth / 2, _loc11_);
							}
						}
						else
						{
							gr.moveTo(xPos - afterHoursBarWidth / 2, ohlcYPos.openY);
							gr.lineTo(xPos, ohlcYPos.openY);
							gr.moveTo(xPos, ohlcYPos.closeY);
							gr.lineTo(xPos + afterHoursBarWidth / 2, ohlcYPos.closeY);
							gr.moveTo(xPos, ohlcYPos.highY);
							gr.lineTo(xPos, ohlcYPos.lowY);
						}
					}
				}
			}
		}

		renderLayer(context: Context)
		{
			this.graphics.clear();
			let vp = <ViewPoint>this.viewPoint;
			const detailLevel = vp.getDetailLevelForTechnicalStyle();
			const displayManager = vp.getDisplayManager().getEnabledChartLayer();
			if (detailLevel >= Intervals.DAILY || detailLevel !== Intervals.INTRADAY && displayManager !== Const.LINE_CHART)
				return;

			const points = this.getDataSeries().getPointsInIntervalArray(Const.INTRADAY_INTERVAL);
			if (!points)
				return;

			this.visibleSessionsTimes = this.getVisibleSessionsTimes(context, points);
			this.localYOffset = vp.miny + vp.medPriceY + vp.V_OFFSET;
			this.localYScale = vp.maxPriceRangeViewSize / context.maxPriceRange;
			this.regionsXLimits = new com.google.finance.IntervalSet();

			for (let intervalIndex = 0; intervalIndex < this.visibleSessionsTimes.length(); intervalIndex++)
			{
				const interval = this.visibleSessionsTimes.getIntervalAt(intervalIndex);
				this.drawAfterHoursSession(interval.start, interval.end, context, points);
			}
		}

		highlightPoint(context: Context, param2: number, state: Dictionary)
		{
			if (!this.regionsXLimits || !this.regionsXLimits.containsValue(param2))
			{
				this.clearHighlight();
				return;
			}
			super.highlightPoint(context, param2, state);
		}

		private getVisibleSessionsTimes(context: Context, dataUnits: DataUnit[]): com.google.finance.IntervalSet
		{
			const intervalSet = new com.google.finance.IntervalSet();
			const visibleExtendedHours = this.dataSource.visibleExtendedHours;
			for (let _loc5_ = visibleExtendedHours.length() - 1; _loc5_ >= 0; _loc5_--)
			{
				const interval = visibleExtendedHours.getIntervalAt(_loc5_);
				const _loc7_ = dataUnits[interval.start];
				const _loc8_ = dataUnits[interval.end];
				if (ViewPoint.sessionVisible(_loc7_, _loc8_, context))
					intervalSet.addInterval(_loc7_.time, _loc8_.time);
			}
			return intervalSet;
		}

		private drawCandleSticks(dataUnits: DataUnit[], param2: number, param3: number, context: Context)
		{
			const afterHoursBarWidth = this.getAfterHoursBarWidth();
			const gr = this.graphics;
			for (let _loc6_ = param3; _loc6_ > param2; _loc6_--)
			{
				if (!(isNaN(dataUnits[_loc6_].high) || isNaN(dataUnits[_loc6_].low) || isNaN(dataUnits[_loc6_].open)))
				{
					const _loc7_ = dataUnits[_loc6_];
					const xPos = this.viewPoint.getXPos(_loc7_);
					const ohlcYPos = this.getOhlcYPos(context, _loc7_);
					//const _loc10_ = Math.abs(_loc9_.closeY - _loc9_.openY);
					const _loc11_ = _loc7_.close >= _loc7_.open;
					const candleStickColor = this.getCandleStickColor(_loc7_);
					gr.lineStyle(1, candleStickColor);
					if (!_loc7_.fake)
					{
						if (Math.abs(ohlcYPos.closeY - ohlcYPos.openY) <= 1)
						{
							const _loc13_ = (ohlcYPos.closeY + ohlcYPos.openY) / 2;
							if (afterHoursBarWidth === 0)
							{
								gr.moveTo(xPos, _loc13_ - 0.5);
								gr.lineTo(xPos, _loc13_ + 0.5);
							}
							else
							{
								gr.moveTo(xPos - afterHoursBarWidth / 2, _loc13_);
								gr.lineTo(xPos + afterHoursBarWidth / 2, _loc13_);
							}
						}
						else
						{
							gr.moveTo(xPos - afterHoursBarWidth / 2, !!_loc11_ ? Number(ohlcYPos.closeY) : ohlcYPos.openY);
							if (!_loc11_)
								gr.beginFill(candleStickColor);

							gr.lineTo(xPos + afterHoursBarWidth / 2, !!_loc11_ ? Number(ohlcYPos.closeY) : ohlcYPos.openY);
							gr.lineTo(xPos + afterHoursBarWidth / 2, !!_loc11_ ? Number(ohlcYPos.openY) : ohlcYPos.closeY);
							gr.lineTo(xPos - afterHoursBarWidth / 2, !!_loc11_ ? Number(ohlcYPos.openY) : ohlcYPos.closeY);
							gr.lineTo(xPos - afterHoursBarWidth / 2, !!_loc11_ ? Number(ohlcYPos.closeY) : ohlcYPos.openY);
							if (!_loc11_)
								gr.endFill();
						}
						gr.moveTo(xPos, ohlcYPos.lowY);
						gr.lineTo(xPos, !!_loc11_ ? Number(ohlcYPos.openY) : ohlcYPos.closeY);
						gr.moveTo(xPos, !!_loc11_ ? Number(ohlcYPos.closeY) : ohlcYPos.openY);
						gr.lineTo(xPos, ohlcYPos.highY);
					}
				}
			}
		}

		getContext(context: Context, param2 = false)
		{
			if (this.dataSource.visibleExtendedHours.length() > 0)
				return super.getContext(context, param2);

			return context;
		}

		private drawLines(dataUnits: DataUnit[], param2: number, param3: number, context: Context)
		{
			let xPos = this.viewPoint.getXPos(dataUnits[param3]);
			let closeYPos = this.getCloseYPos(context, dataUnits[param3]);
			const gr = this.graphics;
			gr.lineStyle(0, 0, 0);
			gr.beginFill(Const.ECN_LINE_CHART_FILL_COLOR, Const.ECN_LINE_CHART_FILL_VISIBILITY);
			gr.moveTo(xPos, this.viewPoint.maxy - 15);
			gr.lineTo(xPos, closeYPos);
			gr.lineStyle(Const.ECN_LINE_CHART_LINE_THICKNESS, Const.ECN_LINE_CHART_LINE_COLOR, Const.ECN_LINE_CHART_LINE_VISIBILITY);
			for (let _loc7_ = param3; _loc7_ > param2; _loc7_--)
			{
				xPos = this.viewPoint.getXPos(dataUnits[_loc7_]);
				closeYPos = this.getCloseYPos(context, dataUnits[_loc7_]);
				gr.lineTo(xPos, closeYPos);
			}
			gr.lineStyle(0, 0, 0);
			gr.lineTo(xPos, this.viewPoint.maxy - 15);
			gr.endFill();
		}

		private getAfterHoursBarWidth(): number
		{
			const _loc1_ = Const.BAR_WIDTH_RATIO * this.viewPoint.minutePix * 2;
			return _loc1_ % 2 === 0 ? _loc1_ : (_loc1_ - 1);
		}

		getDataSeries(context?: Context): DataSeries
		{
			return this.dataSource.afterHoursData;
		}

		private drawAfterHoursSession(param1: number, param2: number, context: Context, dataUnits: DataUnit[])
		{
			const timeIndex1 = DataSource.getTimeIndex(param2, dataUnits);
			const timeIndex2 = DataSource.getTimeIndex(param1, dataUnits);
			const _loc7_ = Math.min(timeIndex1, this.getLastRealPointIndex(dataUnits));
			switch (this.viewPoint.getDisplayManager().getEnabledChartLayer())
			{
				case Const.CANDLE_STICK:
					this.drawCandleSticks(dataUnits, timeIndex2, _loc7_, context);
					break;
				case Const.OHLC_CHART:
					this.drawOhlcBars(dataUnits, timeIndex2, _loc7_, context);
					break;
				default:
					this.drawLines(dataUnits, timeIndex2, _loc7_, context);
					break;
			}
			this.regionsXLimits.addInterval(this.viewPoint.getXPos(dataUnits[timeIndex2]), this.viewPoint.getXPos(dataUnits[timeIndex1]));
		}
	}
}
