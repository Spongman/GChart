namespace com.google.finance
{
	export class IntervalBasedVolumeLayer extends AbstractDrawingLayer<ViewPoint>
	{
		private localYScale: number;

		protected highlightCanvas = new flash.display.Sprite("highlightCanvas");

		constructor(viewPoint: ViewPoint, dataSource: DataSource)
		{
			super(viewPoint, dataSource);
			this.addChild(this.highlightCanvas);
		}

		protected getYPos(param1: number, viewPoint: IViewPoint): number
		{
			return viewPoint.maxy - (param1 >= 0 ? param1 : 0) * this.localYScale;
		}

		protected findPointIndex(param1: number): number
		{
			const dataSeries = notnull(this.getDataSeries());
			const detailLevel = this.viewPoint.getDetailLevelForTechnicalStyle();
			const detailLevelInterval = Const.getDetailLevelInterval(detailLevel);
			const points = dataSeries.getPointsInIntervalArray(detailLevelInterval);
			if (!points)
				return -1;

			const minute = this.viewPoint.getMinuteOfX(param1);
			let relativeMinuteIndex = dataSeries.getRelativeMinuteIndex(minute, points);
			if (relativeMinuteIndex === points.length - 2)
			{
				if (Math.abs(minute - points[relativeMinuteIndex].relativeMinutes) > Math.abs(minute - points[relativeMinuteIndex + 1].relativeMinutes))
					relativeMinuteIndex++;
			}
			if (detailLevel === Intervals.WEEKLY)
			{
				while (relativeMinuteIndex + 1 < points.length && points[relativeMinuteIndex + 1].weeklyXPos <= param1)
					relativeMinuteIndex++;
			}
			while (relativeMinuteIndex > 0 && (points[relativeMinuteIndex].fake || points[relativeMinuteIndex].duplicate || points[relativeMinuteIndex].volumes[detailLevelInterval] === 0))
				relativeMinuteIndex--;

			return relativeMinuteIndex;
		}

		clearHighlight()
		{
			this.highlightCanvas.graphics.clear();
		}

		private drawHorizontalLine(param1: number)
		{
			const gr = this.graphics;
			gr.lineStyle(0, Const.HORIZONTAL_GRID_COLOR, 1);
			gr.moveTo(this.viewPoint.minx + 1, param1);
			gr.lineTo(this.viewPoint.maxx - 1, param1);
		}

		private drawOneBar(param1: number, param2: number, viewPoint: IViewPoint, sprite: flash.display.Sprite, param5: number, param6: number = -1)
		{
			if (viewPoint.maxy - param2 < 1 && viewPoint.maxy - param2 > 0)
				param2 = viewPoint.maxy - 1;
			else if (param2 < viewPoint.miny)
				param2 = viewPoint.miny;

			const gr = sprite.graphics;
			if (param6 !== -1)
				gr.beginFill(param6);

			gr.drawRect(param1 - param5 / 2, param2, param5, viewPoint.maxy - param2);
			if (param6 !== -1)
				gr.endFill();
		}

		protected drawOneLine(param1: number, param2: number, viewPoint: IViewPoint, sprite: flash.display.Sprite)
		{
			if (viewPoint.maxy - param2 < 1 && viewPoint.maxy - param2 > 0)
				param2 = viewPoint.maxy - 1;
			else if (param2 < viewPoint.miny)
				param2 = viewPoint.miny;

			const gr = sprite.graphics;
			gr.moveTo(param1, param2);
			gr.lineTo(param1, viewPoint.maxy);
		}

		getContext(context: Context, param2 = false)
		{
			const dataSeries = notnull(this.getDataSeries(context));
			const detailLevel = this.viewPoint.getDetailLevelForTechnicalStyle(context.lastMinute, context.count);
			const detailLevelInterval = Const.getDetailLevelInterval(detailLevel);
			const points = dataSeries.getPointsInIntervalArray(detailLevelInterval);
			if (!points)
				return context;

			const _loc7_ = context.lastMinute - context.count;
			let _loc8_ = dataSeries.getRelativeMinuteIndex(_loc7_, points) - 1;
			if (_loc8_ < 0)
				_loc8_ = 0;

			let _loc9_ = dataSeries.getRelativeMinuteIndex(context.lastMinute, points) + 1;
			if (_loc9_ >= points.length)
				_loc9_ = points.length - 1;

			let _loc10_ = points[_loc9_].volumes[detailLevelInterval];
			for (let _loc11_ = _loc9_ - 1; _loc11_ >= _loc8_; _loc11_--)
			{
				_loc10_ = Utils.extendedMax(_loc10_, points[_loc11_].volumes[detailLevelInterval]);
			}
			let _loc12_ = NaN;
			for (let scaleIndex = 1; scaleIndex < Const.VOLUME_SCALES.length; scaleIndex++)
			{
				_loc12_ = Const.VOLUME_SCALES[scaleIndex];
				if (Math.floor(_loc10_ / _loc12_) < 10)
					break;
			}
			const _loc13_ = (Math.floor(_loc10_ / _loc12_) + 1) * _loc12_;
			context.maxVolume = Utils.extendedMax(context.maxVolume, _loc13_);
			return context;
		}

		renderLayer(context: Context)
		{
			const dataSeries = notnull(this.getDataSeries());
			const viewPoint = this.viewPoint;
			const gr = this.graphics;
			gr.clear();
			const detailLevel = viewPoint.getDetailLevelForTechnicalStyle();
			const detailLevelInterval = Const.getDetailLevelInterval(detailLevel);
			const points = dataSeries.getPointsInIntervalArray(detailLevelInterval);
			if (!points || points.length === 0)
				return;

			if (context.maxVolume === undefined)
				return;

			this.localYScale = (viewPoint.maxy - viewPoint.miny - Const.BOTTOM_VIEWPOINT_HEADER_HEIGHT) / context.maxVolume;
			const _loc7_ = Math.max(dataSeries.getRelativeMinuteIndex(viewPoint.getFirstMinute(), points) - 1, 0);
			const _loc8_ = Math.min(dataSeries.getRelativeMinuteIndex(viewPoint.getLastMinute(), points) + 1, this.getLastRealPointIndex(points));
			const displayManager = viewPoint.getDisplayManager().getEnabledChartLayer();
			let _loc14_ = Number.MAX_VALUE;
			if (Const.VOLUME_PLUS_ENABLED && Const.VOLUME_PLUS_CHART_TYPE.indexOf(displayManager) !== -1)
			{
				const barWidth = this.getBarWidth(detailLevel, dataSeries);
				for (let _loc11_ = _loc8_; _loc11_ >= _loc7_; _loc11_--)
				{
					const _loc10_ = points[_loc11_];
					if (!isNaN(_loc10_.open))
					{
						if (_loc10_.close >= _loc10_.open)
							gr.lineStyle(1, Const.POSITIVE_DIFFERENCE_COLOR);
						else
							gr.lineStyle(1, Const.NEGATIVE_DIFFERENCE_COLOR);

						if (!dataSeries.minuteIsStartOfDataSession(_loc10_.dayMinute))
						{
							let _loc12_: number;
							if (detailLevel === Intervals.WEEKLY && displayManager !== Const.LINE_CHART)
							{
								_loc12_ = this.getWeeklyBarXPos(_loc10_, _loc14_);
								_loc14_ = _loc12_;
							}
							else
							{
								_loc12_ = viewPoint.getXPos(_loc10_);
							}
							const yPos = this.getYPos(_loc10_.volumes[detailLevelInterval], viewPoint);
							this.drawOneBar(_loc12_, yPos, viewPoint, this, barWidth, _loc10_.close >= _loc10_.open ? -1 : Const.NEGATIVE_DIFFERENCE_COLOR);
						}
					}
				}
			}
			else
			{
				gr.lineStyle(1, Const.LINE_CHART_LINE_COLOR);
				for (let _loc11_ = _loc8_; _loc11_ >= _loc7_; _loc11_--)
				{
					const _loc10_ = points[_loc11_];
					if (!dataSeries.minuteIsStartOfDataSession(_loc10_.dayMinute))
					{
						let _loc12_: number;
						if (detailLevel === Intervals.WEEKLY && displayManager !== Const.LINE_CHART)
						{
							_loc12_ = this.getWeeklyBarXPos(_loc10_, _loc14_);
							_loc14_ = _loc12_;
						}
						else
						{
							_loc12_ = viewPoint.getXPos(_loc10_);
						}
						const yPos = this.getYPos(_loc10_.volumes[detailLevelInterval], viewPoint);
						this.drawOneLine(_loc12_, yPos, viewPoint, this);
					}
				}
			}
			this.drawHorizontalLine(viewPoint.miny + Const.BOTTOM_VIEWPOINT_HEADER_HEIGHT);
		}

		highlightPoint(context: Context, param2: number, state: Dictionary)
		{
			if (state["ahsetter"])
				return;

			const _loc4_ = notnull(this.getDataSeries());
			const viewPoint = this.viewPoint;
			const _loc6_ = this.findPointIndex(param2);
			const detailLevel = viewPoint.getDetailLevelForTechnicalStyle();
			const detailLevelInterval = Const.getDetailLevelInterval(detailLevel);
			const points = _loc4_.getPointsInIntervalArray(detailLevelInterval);
			if (!points || _loc6_ === -1)
				return;

			const _loc10_ = points[_loc6_];
			this.clearHighlight();
			const _loc11_ = !isNaN(_loc10_.weeklyXPos) ? Number(_loc10_.weeklyXPos) : viewPoint.getXPos(_loc10_);
			const yPos = this.getYPos(_loc10_.volumes[detailLevelInterval], viewPoint);
			const displayManager = viewPoint.getDisplayManager().getEnabledChartLayer();
			const gr = this.highlightCanvas.graphics;
			if (Const.VOLUME_PLUS_ENABLED && Const.VOLUME_PLUS_CHART_TYPE.indexOf(displayManager) !== -1)
			{
				gr.lineStyle(5, Const.DOT_COLOR, 1);
				gr.moveTo(_loc11_, yPos - 0.2);
				gr.lineTo(_loc11_, yPos + 0.2);
			}
			else
			{
				gr.lineStyle(2, Const.VOLUME_HIGHLIGHT_COLOR, 1);
				this.drawOneLine(_loc11_, yPos, viewPoint, this.highlightCanvas);
			}
			state[SpaceText.VOLUME_STR] = _loc10_.volumes[detailLevelInterval];
			state["volumesetter"] = this;
		}
	}
}
