namespace com.google.finance
{
	export class IntervalBasedLineChartLayer extends IntervalBasedChartLayer
	{
		private drawLine(param1: number, param2: Context, param3: DataUnit[], param4: number, param5: number, param6: number, param7: number): number
		{
			let _loc8_ = NaN;
			const gr = this.graphics;
			switch (param1)
			{
				case Intervals.DAILY:
				case Intervals.WEEKLY:
					if (isNaN(param7))
					{
						const _loc8_ = this.viewPoint.getXPos(param3[param5]);
						const closeYPos = this.getCloseYPos(param2, param3[param5]);
						param5--;
						gr.moveTo(_loc8_, this.viewPoint.maxy);
						gr.lineStyle(0, 0, 0);
						gr.lineTo(_loc8_, closeYPos);
					}
					else
					{
						while (param5 >= param4 && this.viewPoint.getXPos(param3[param5]) >= param6)
							param5--;

						if (param5 < param4)
							return param6;

						gr.moveTo(param6, this.viewPoint.maxy);
						gr.lineStyle(0, 0, 0);
						gr.lineTo(param6, param7);
					}
					gr.lineStyle(this.lineThickness, this.lineColor, this.lineVisibility);
					for (let _loc13_ = param5; _loc13_ >= param4; _loc13_--)
					{
						_loc8_ = this.viewPoint.getXPos(param3[_loc13_]);
						const closeYPos = this.getCloseYPos(param2, param3[_loc13_]);
						gr.lineTo(_loc8_, closeYPos);
					}
					return _loc8_;
				case Intervals.INTRADAY:
				case Intervals.FIVE_MINUTES:
				case Intervals.HALF_HOUR:
					while (param5 >= param4 && this.viewPoint.getXPos(param3[param5]) >= param6)
						param5--;

					if (param5 < param4)
						return param6;

					_loc8_ = this.viewPoint.getXPos(param3[param5]);
					gr.moveTo(_loc8_, this.viewPoint.maxy);
					let _loc10_ = param5;
					const _loc11_ = this.dataSource.visibleExtendedHours.length() === 0;
					const marketDayLength = this.dataSource.data.marketDayLength;
					while (_loc10_ > param4)
					{
						gr.lineStyle(0, 0, 0);
						_loc8_ = this.viewPoint.getXPos(param3[_loc10_]);
						const closeYPos = this.getCloseYPos(param2, param3[_loc10_]);
						gr.lineTo(_loc8_, this.viewPoint.maxy);
						gr.lineTo(_loc8_, closeYPos);
						const _loc14_ = notnull(this.getDataSeries());
						gr.lineStyle(this.lineThickness, this.lineColor, this.lineVisibility);
						while (_loc10_ > param4 && param3[_loc10_].dayMinute !== _loc14_.marketOpenMinute)
						{
							_loc10_--;
							_loc8_ = this.viewPoint.getXPos(param3[_loc10_]);
							const closeYPos = this.getCloseYPos(param2, param3[_loc10_]);
							gr.lineTo(_loc8_, closeYPos);
						}
						gr.lineStyle(0, 0, 0);
						gr.lineTo(_loc8_, this.viewPoint.maxy);
						_loc10_--;
						if (_loc11_ && _loc10_ > param4)
						{
							const _loc15_ = param3[_loc10_].relativeMinutes;
							const _loc16_ = param3[_loc10_ + 1].relativeMinutes;
							if (_loc16_ > _loc15_ + marketDayLength)
							{
								const closeYPos = this.getCloseYPos(param2, param3[_loc10_]);
								_loc8_ = this.viewPoint.getMinuteXPos(_loc16_ - 1);
								gr.lineTo(_loc8_, this.viewPoint.maxy);
								gr.lineTo(_loc8_, closeYPos);
								gr.lineStyle(this.lineThickness, this.lineColor, this.lineVisibility);
								_loc8_ = this.viewPoint.getMinuteXPos(_loc15_ + 1);
								gr.lineTo(_loc8_, closeYPos);
								gr.lineStyle(0, 0, 0);
								gr.lineTo(_loc8_, this.viewPoint.maxy);
							}
						}
					}
					return this.viewPoint.getXPos(param3[param4]);
				default:
					return -1;
			}
		}

		renderLayer(context: Context) 
		{
			if (!this.isEnabled())
				return;

			let vp = this.viewPoint;
			const dataSeries = notnull(this.getDataSeries());
			this.localYOffset = vp.miny + vp.medPriceY + vp.V_OFFSET;
			this.localYScale = vp.maxPriceRangeViewSize / context.maxPriceRange;
			this.lineThickness = Const.LINE_CHART_LINE_THICKNESS;
			this.lineColor = Const.LINE_CHART_LINE_COLOR;
			this.lineVisibility = Const.LINE_CHART_LINE_VISIBILITY;
			let detailLevel = vp.getDetailLevelForTechnicalStyle();
			let _loc4_= 0;
			let _loc6_ = Number.MAX_VALUE;
			let _loc7_ = NaN;
			let _loc8_ = true;
			const gr = this.graphics;
			gr.clear();
			do
			{
				const detailLevelInterval = Const.getDetailLevelInterval(detailLevel);
				const points = dataSeries.getPointsInIntervalArray(detailLevelInterval);
				if (!points || points.length === 0)
				{
					detailLevel++;
				}
				else
				{
					_loc4_ = Math.max(dataSeries.getRelativeMinuteIndex(vp.getFirstMinute(), points) - 1, 0);
					const lastMinuteIndex = Math.min(dataSeries.getRelativeMinuteIndex(vp.getLastMinute(), points) + 1, this.getLastRealPointIndex(points));
					const _loc11_ = points[points.length - 1];
					if (_loc8_ && detailLevel >= Intervals.DAILY && lastMinuteIndex === points.length - 1 && _loc11_.relativeMinutes < vp.getLastMinute())
					{
						const _loc12_ = dataSeries.getPointsInIntervalArray(Const.INTRADAY_INTERVAL);
						if (_loc12_ && _loc12_.length > 0)
						{
							const _loc13_ = _loc12_[_loc12_.length - 1];
							let xPos = vp.getXPos(_loc13_);
							let closeYPos = this.getCloseYPos(context, _loc13_);
							gr.beginFill(Const.LINE_CHART_FILL_COLOR, Const.LINE_CHART_FILL_VISIBILITY);
							gr.moveTo(xPos, vp.maxy);
							gr.lineStyle(0, 0, 0);
							gr.lineTo(xPos, closeYPos);
							xPos = vp.getXPos(_loc11_);
							closeYPos = this.getCloseYPos(context, _loc11_);
							gr.lineStyle(this.lineThickness, this.lineColor, this.lineVisibility);
							gr.lineTo(xPos, closeYPos);
							gr.lineStyle(0, 0, 0);
							gr.lineTo(xPos, vp.maxy);
							gr.endFill();
						}
					}
					gr.beginFill(Const.LINE_CHART_FILL_COLOR, Const.LINE_CHART_FILL_VISIBILITY);
					_loc6_ = this.drawLine(detailLevel, context, points, _loc4_, lastMinuteIndex, _loc6_, _loc7_);
					_loc7_ = this.getCloseYPos(context, points[_loc4_]);
					gr.lineStyle(0, 0, 0);
					gr.lineTo(_loc6_, vp.maxy);
					gr.endFill();
					_loc8_ = false;
					detailLevel++;
				}
			}
			while (detailLevel <= Intervals.WEEKLY && _loc4_ === 0);
		}
	}
}
