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

		private drawOhlcBars(param1: DataUnit[], param2: number, param3: number, param4: Context)
		{
			const afterHoursBarWidth = this.getAfterHoursBarWidth();
			const gr = this.graphics;
			for (let _loc6_ = param3; _loc6_ > param2; _loc6_--)
			{
				if (!(isNaN(param1[_loc6_].high) || isNaN(param1[_loc6_].low) || isNaN(param1[_loc6_].open)))
				{
					const _loc7_ = param1[_loc6_];
					const xPos = this.viewPoint.getXPos(_loc7_);
					const ohlcYPos = this.getOhlcYPos(param4, _loc7_);
					const ohlcColor = this.getOhlcColor(_loc7_, param1[Math.max(_loc6_ - 1, 0)]);
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

		highlightPoint(context: Context, param2: number, param3: { [key: string]: any }) 
		{
			if (!this.regionsXLimits || !this.regionsXLimits.containsValue(param2))
			{
				this.clearHighlight();
				return;
			}
			super.highlightPoint(context, param2, param3);
		}

		private getVisibleSessionsTimes(context: Context, param2: DataUnit[]): com.google.finance.IntervalSet
		{
			const intervalSet = new com.google.finance.IntervalSet();
			const visibleExtendedHours = this.dataSource.visibleExtendedHours;
			for (let _loc5_ = visibleExtendedHours.length() - 1; _loc5_ >= 0; _loc5_--)
			{
				const interval = visibleExtendedHours.getIntervalAt(_loc5_);
				const _loc7_ = param2[interval.start];
				const _loc8_ = param2[interval.end];
				if (ViewPoint.sessionVisible(_loc7_, _loc8_, context))
					intervalSet.addInterval(_loc7_.time, _loc8_.time);
			}
			return intervalSet;
		}

		private drawCandleSticks(param1: DataUnit[], param2: number, param3: number, param4: Context) 
		{
			const afterHoursBarWidth = this.getAfterHoursBarWidth();
			const gr = this.graphics;
			for (let _loc6_ = param3; _loc6_ > param2; _loc6_--)
			{
				if (!(isNaN(param1[_loc6_].high) || isNaN(param1[_loc6_].low) || isNaN(param1[_loc6_].open)))
				{
					const _loc7_ = param1[_loc6_];
					const xPos = this.viewPoint.getXPos(_loc7_);
					const ohlcYPos = this.getOhlcYPos(param4, _loc7_);
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

		private drawLines(param1: DataUnit[], param2: number, param3: number, param4: Context) 
		{
			let xPos = this.viewPoint.getXPos(param1[param3]);
			let closeYPos = this.getCloseYPos(param4, param1[param3]);
			const gr = this.graphics;
			gr.lineStyle(0, 0, 0);
			gr.beginFill(Const.ECN_LINE_CHART_FILL_COLOR, Const.ECN_LINE_CHART_FILL_VISIBILITY);
			gr.moveTo(xPos, this.viewPoint.maxy - 15);
			gr.lineTo(xPos, closeYPos);
			gr.lineStyle(Const.ECN_LINE_CHART_LINE_THICKNESS, Const.ECN_LINE_CHART_LINE_COLOR, Const.ECN_LINE_CHART_LINE_VISIBILITY);
			for (let _loc7_ = param3; _loc7_ > param2; _loc7_--)
			{
				xPos = this.viewPoint.getXPos(param1[_loc7_]);
				closeYPos = this.getCloseYPos(param4, param1[_loc7_]);
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

		private drawAfterHoursSession(param1: number, param2: number, param3: Context, param4: DataUnit[]) 
		{
			const timeIndex1 = DataSource.getTimeIndex(param2, param4);
			const timeIndex2 = DataSource.getTimeIndex(param1, param4);
			const _loc7_ = Math.min(timeIndex1, this.getLastRealPointIndex(param4));
			switch (this.viewPoint.getDisplayManager().getEnabledChartLayer())
			{
				case Const.CANDLE_STICK:
					this.drawCandleSticks(param4, timeIndex2, _loc7_, param3);
					break;
				case Const.OHLC_CHART:
					this.drawOhlcBars(param4, timeIndex2, _loc7_, param3);
					break;
				default:
					this.drawLines(param4, timeIndex2, _loc7_, param3);
					break;
			}
			this.regionsXLimits.addInterval(this.viewPoint.getXPos(param4[timeIndex2]), this.viewPoint.getXPos(param4[timeIndex1]));
		}
	}
}
