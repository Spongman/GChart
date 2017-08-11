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
						const _loc9_ = this.getCloseYPos(param2, param3[param5]);
						param5--;
						gr.moveTo(_loc8_, this.viewPoint.maxy);
						gr.lineStyle(0, 0, 0);
						gr.lineTo(_loc8_, _loc9_);
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
						const _loc9_ = this.getCloseYPos(param2, param3[_loc13_]);
						gr.lineTo(_loc8_, _loc9_);
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
					const _loc12_ = this.dataSource.data.marketDayLength;
					while (_loc10_ > param4)
					{
						gr.lineStyle(0, 0, 0);
						_loc8_ = this.viewPoint.getXPos(param3[_loc10_]);
						const _loc9_ = this.getCloseYPos(param2, param3[_loc10_]);
						gr.lineTo(_loc8_, this.viewPoint.maxy);
						gr.lineTo(_loc8_, _loc9_);
						const _loc14_ = notnull(this.getDataSeries());
						gr.lineStyle(this.lineThickness, this.lineColor, this.lineVisibility);
						while (_loc10_ > param4 && param3[_loc10_].dayMinute !== _loc14_.marketOpenMinute)
						{
							_loc10_--;
							_loc8_ = this.viewPoint.getXPos(param3[_loc10_]);
							const _loc9_ = this.getCloseYPos(param2, param3[_loc10_]);
							gr.lineTo(_loc8_, _loc9_);
						}
						gr.lineStyle(0, 0, 0);
						gr.lineTo(_loc8_, this.viewPoint.maxy);
						_loc10_--;
						if (_loc11_ && _loc10_ > param4)
						{
							const _loc15_ = param3[_loc10_].relativeMinutes;
							const _loc16_ = param3[_loc10_ + 1].relativeMinutes;
							if (_loc16_ > _loc15_ + _loc12_)
							{
								const _loc9_ = this.getCloseYPos(param2, param3[_loc10_]);
								_loc8_ = this.viewPoint.getMinuteXPos(_loc16_ - 1);
								gr.lineTo(_loc8_, this.viewPoint.maxy);
								gr.lineTo(_loc8_, _loc9_);
								gr.lineStyle(this.lineThickness, this.lineColor, this.lineVisibility);
								_loc8_ = this.viewPoint.getMinuteXPos(_loc15_ + 1);
								gr.lineTo(_loc8_, _loc9_);
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
			const _loc2_ = notnull(this.getDataSeries());
			this.localYOffset = vp.miny + vp.medPriceY + vp.V_OFFSET;
			this.localYScale = vp.maxPriceRangeViewSize / context.maxPriceRange;
			this.lineThickness = Const.LINE_CHART_LINE_THICKNESS;
			this.lineColor = Const.LINE_CHART_LINE_COLOR;
			this.lineVisibility = Const.LINE_CHART_LINE_VISIBILITY;
			let _loc3_ = vp.getDetailLevelForTechnicalStyle();
			let _loc4_= 0;
			let _loc6_ = Number.MAX_VALUE;
			let _loc7_ = NaN;
			let _loc8_ = true;
			const gr = this.graphics;
			gr.clear();
			do
			{
				const _loc9_ = Const.getDetailLevelInterval(_loc3_);
				const _loc10_ = _loc2_.getPointsInIntervalArray(_loc9_);
				if (!_loc10_ || _loc10_.length === 0)
				{
					_loc3_++;
				}
				else
				{
					_loc4_ = Math.max(_loc2_.getRelativeMinuteIndex(vp.getFirstMinute(), _loc10_) - 1, 0);
					const _loc5_ = Math.min(_loc2_.getRelativeMinuteIndex(vp.getLastMinute(), _loc10_) + 1, this.getLastRealPointIndex(_loc10_));
					const _loc11_ = _loc10_[_loc10_.length - 1];
					if (_loc8_ && _loc3_ >= Intervals.DAILY && _loc5_ === _loc10_.length - 1 && _loc11_.relativeMinutes < vp.getLastMinute())
					{
						const _loc12_ = _loc2_.getPointsInIntervalArray(Const.INTRADAY_INTERVAL);
						if (_loc12_ && _loc12_.length > 0)
						{
							const _loc13_ = _loc12_[_loc12_.length - 1];
							let _loc14_ = vp.getXPos(_loc13_);
							let _loc15_ = this.getCloseYPos(context, _loc13_);
							gr.beginFill(Const.LINE_CHART_FILL_COLOR, Const.LINE_CHART_FILL_VISIBILITY);
							gr.moveTo(_loc14_, vp.maxy);
							gr.lineStyle(0, 0, 0);
							gr.lineTo(_loc14_, _loc15_);
							_loc14_ = vp.getXPos(_loc11_);
							_loc15_ = this.getCloseYPos(context, _loc11_);
							gr.lineStyle(this.lineThickness, this.lineColor, this.lineVisibility);
							gr.lineTo(_loc14_, _loc15_);
							gr.lineStyle(0, 0, 0);
							gr.lineTo(_loc14_, vp.maxy);
							gr.endFill();
						}
					}
					gr.beginFill(Const.LINE_CHART_FILL_COLOR, Const.LINE_CHART_FILL_VISIBILITY);
					_loc6_ = this.drawLine(_loc3_, context, _loc10_, _loc4_, _loc5_, _loc6_, _loc7_);
					_loc7_ = this.getCloseYPos(context, _loc10_[_loc4_]);
					gr.lineStyle(0, 0, 0);
					gr.lineTo(_loc6_, vp.maxy);
					gr.endFill();
					_loc8_ = false;
					_loc3_++;
				}
			}
			while (_loc3_ <= Intervals.WEEKLY && _loc4_ === 0);
		}
	}
}
