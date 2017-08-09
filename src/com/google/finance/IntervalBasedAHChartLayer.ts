/// <reference path="IntervalBasedChartLayer.ts" />

namespace com.google.finance
{
	export class IntervalBasedAHChartLayer extends IntervalBasedChartLayer
	{
		private regionsXLimits: com.google.finance.IntervalSet;
		private visibleSessionsTimes: com.google.finance.IntervalSet;

		constructor(param1: ViewPoint, param2: DataSource)
		{
			super(param1, param2);
			this.setEnabled(true);
		}

		private drawOhlcBars(param1: DataUnit[], param2: number, param3: number, param4: Context)
		{
			const _loc5_ = this.getAfterHoursBarWidth();
			const gr = this.graphics;
			for (let _loc6_ = param3; _loc6_ > param2; _loc6_--)
			{
				if (!(isNaN(param1[_loc6_].high) || isNaN(param1[_loc6_].low) || isNaN(param1[_loc6_].open)))
				{
					const _loc7_ = param1[_loc6_];
					const _loc8_ = this.viewPoint.getXPos(_loc7_);
					const _loc9_ = this.getOhlcYPos(param4, _loc7_);
					const _loc10_ = this.getOhlcColor(_loc7_, param1[Math.max(_loc6_ - 1, 0)]);
					gr.lineStyle(1, _loc10_);
					if (!_loc7_.fake)
					{
						if (Math.abs(_loc9_.highY - _loc9_.lowY) <= 1)
						{
							const _loc11_ = (_loc9_.highY + _loc9_.lowY) / 2;
							if (_loc5_ === 0)
							{
								gr.moveTo(_loc8_, _loc11_ - 0.5);
								gr.lineTo(_loc8_, _loc11_ + 0.5);
							}
							else
							{
								gr.moveTo(_loc8_ - _loc5_ / 2, _loc11_);
								gr.lineTo(_loc8_ + _loc5_ / 2, _loc11_);
							}
						}
						else
						{
							gr.moveTo(_loc8_ - _loc5_ / 2, _loc9_.openY);
							gr.lineTo(_loc8_, _loc9_.openY);
							gr.moveTo(_loc8_, _loc9_.closeY);
							gr.lineTo(_loc8_ + _loc5_ / 2, _loc9_.closeY);
							gr.moveTo(_loc8_, _loc9_.highY);
							gr.lineTo(_loc8_, _loc9_.lowY);
						}
					}
				}
			}
		}

		renderLayer(context: Context) 
		{
			this.graphics.clear();
			let vp = <ViewPoint>this.viewPoint;
			const _loc2_ = vp.getDetailLevelForTechnicalStyle();
			const _loc3_ = vp.getDisplayManager().getEnabledChartLayer();
			if (_loc2_ >= Const.DAILY || _loc2_ !== Const.INTRADAY && _loc3_ !== Const.LINE_CHART)
				return;

			const _loc4_ = this.getDataSeries().getPointsInIntervalArray(Const.INTRADAY_INTERVAL);
			if (!_loc4_)
				return;

			this.visibleSessionsTimes = this.getVisibleSessionsTimes(context, _loc4_);
			this.localYOffset = vp.miny + vp.medPriceY + vp.V_OFFSET;
			this.localYScale = vp.maxPriceRangeViewSize / context.maxPriceRange;
			this.regionsXLimits = new com.google.finance.IntervalSet();

			for (let _loc5_ = 0; _loc5_ < this.visibleSessionsTimes.length(); _loc5_++)
			{
				const _loc6_ = this.visibleSessionsTimes.method_1(_loc5_);
				this.drawAfterHoursSession(_loc6_.start, _loc6_.end, context, _loc4_);
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
			const _loc3_ = new com.google.finance.IntervalSet();
			const _loc4_ = this.dataSource.visibleExtendedHours;
			for (let _loc5_ = _loc4_.length() - 1; _loc5_ >= 0; _loc5_--)
			{
				const _loc6_ = _loc4_.method_1(_loc5_);
				const _loc7_ = param2[_loc6_.start];
				const _loc8_ = param2[_loc6_.end];
				if (ViewPoint.sessionVisible(_loc7_, _loc8_, context))
					_loc3_.addInterval(_loc7_.time, _loc8_.time);

			}
			return _loc3_;
		}

		private drawCandleSticks(param1: DataUnit[], param2: number, param3: number, param4: Context) 
		{
			const _loc5_ = this.getAfterHoursBarWidth();
			const gr = this.graphics;
			for (let _loc6_ = param3; _loc6_ > param2; _loc6_--)
			{
				if (!(isNaN(param1[_loc6_].high) || isNaN(param1[_loc6_].low) || isNaN(param1[_loc6_].open)))
				{
					const _loc7_ = param1[_loc6_];
					const _loc8_ = this.viewPoint.getXPos(_loc7_);
					const _loc9_ = this.getOhlcYPos(param4, _loc7_);
					//const _loc10_ = Math.abs(_loc9_.closeY - _loc9_.openY);
					const _loc11_ = _loc7_.close >= _loc7_.open;
					const _loc12_ = this.getCandleStickColor(_loc7_);
					gr.lineStyle(1, _loc12_);
					if (!_loc7_.fake)
					{
						if (Math.abs(_loc9_.closeY - _loc9_.openY) <= 1)
						{
							const _loc13_ = (_loc9_.closeY + _loc9_.openY) / 2;
							if (_loc5_ === 0)
							{
								gr.moveTo(_loc8_, _loc13_ - 0.5);
								gr.lineTo(_loc8_, _loc13_ + 0.5);
							}
							else
							{
								gr.moveTo(_loc8_ - _loc5_ / 2, _loc13_);
								gr.lineTo(_loc8_ + _loc5_ / 2, _loc13_);
							}
						}
						else
						{
							gr.moveTo(_loc8_ - _loc5_ / 2, !!_loc11_ ? Number(_loc9_.closeY) : _loc9_.openY);
							if (!_loc11_)
								gr.beginFill(_loc12_);

							gr.lineTo(_loc8_ + _loc5_ / 2, !!_loc11_ ? Number(_loc9_.closeY) : _loc9_.openY);
							gr.lineTo(_loc8_ + _loc5_ / 2, !!_loc11_ ? Number(_loc9_.openY) : _loc9_.closeY);
							gr.lineTo(_loc8_ - _loc5_ / 2, !!_loc11_ ? Number(_loc9_.openY) : _loc9_.closeY);
							gr.lineTo(_loc8_ - _loc5_ / 2, !!_loc11_ ? Number(_loc9_.closeY) : _loc9_.openY);
							if (!_loc11_)
								gr.endFill();
						}
						gr.moveTo(_loc8_, _loc9_.lowY);
						gr.lineTo(_loc8_, !!_loc11_ ? Number(_loc9_.openY) : _loc9_.closeY);
						gr.moveTo(_loc8_, !!_loc11_ ? Number(_loc9_.closeY) : _loc9_.openY);
						gr.lineTo(_loc8_, _loc9_.highY);
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
			let _loc5_ = this.viewPoint.getXPos(param1[param3]);
			let _loc6_ = this.getCloseYPos(param4, param1[param3]);
			const gr = this.graphics;
			gr.lineStyle(0, 0, 0);
			gr.beginFill(Const.ECN_LINE_CHART_FILL_COLOR, Const.ECN_LINE_CHART_FILL_VISIBILITY);
			gr.moveTo(_loc5_, this.viewPoint.maxy - 15);
			gr.lineTo(_loc5_, _loc6_);
			gr.lineStyle(Const.ECN_LINE_CHART_LINE_THICKNESS, Const.ECN_LINE_CHART_LINE_COLOR, Const.ECN_LINE_CHART_LINE_VISIBILITY);
			for (let _loc7_ = param3; _loc7_ > param2; _loc7_--)
			{
				_loc5_ = this.viewPoint.getXPos(param1[_loc7_]);
				_loc6_ = this.getCloseYPos(param4, param1[_loc7_]);
				gr.lineTo(_loc5_, _loc6_);
			}
			gr.lineStyle(0, 0, 0);
			gr.lineTo(_loc5_, this.viewPoint.maxy - 15);
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
			const _loc5_ = DataSource.getTimeIndex(param2, param4);
			const _loc6_ = DataSource.getTimeIndex(param1, param4);
			const _loc7_ = Math.min(_loc5_, this.getLastRealPointIndex(param4));
			switch (this.viewPoint.getDisplayManager().getEnabledChartLayer())
			{
				case Const.CANDLE_STICK:
					this.drawCandleSticks(param4, _loc6_, _loc7_, param3);
					break;
				case Const.OHLC_CHART:
					this.drawOhlcBars(param4, _loc6_, _loc7_, param3);
					break;
				default:
					this.drawLines(param4, _loc6_, _loc7_, param3);
					break;
			}
			this.regionsXLimits.addInterval(this.viewPoint.getXPos(param4[_loc6_]), this.viewPoint.getXPos(param4[_loc5_]));
		}
	}
}
