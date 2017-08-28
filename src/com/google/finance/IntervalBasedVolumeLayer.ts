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

		protected findPointIndex(x: number): number
		{
			const dataSeries = notnull(this.getDataSeries());
			const detailLevel = this.viewPoint.getDetailLevelForTechnicalStyle();
			const detailLevelInterval = Const.getDetailLevelInterval(detailLevel);
			const points = dataSeries.getPointsInIntervalArray(detailLevelInterval);
			if (!points)
				return -1;

			const minute = this.viewPoint.getMinuteOfX(x);
			let relativeMinuteIndex = dataSeries.getRelativeMinuteIndex(minute, points);
			if (relativeMinuteIndex === points.length - 2)
			{
				if (Math.abs(minute - points[relativeMinuteIndex].relativeMinutes) > Math.abs(minute - points[relativeMinuteIndex + 1].relativeMinutes))
					relativeMinuteIndex++;
			}
			if (detailLevel === Intervals.WEEKLY)
			{
				while (relativeMinuteIndex + 1 < points.length && points[relativeMinuteIndex + 1].weeklyXPos <= x)
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

			const firstMinute = context.lastMinute - context.count;
			let firstMinuteIndex = dataSeries.getRelativeMinuteIndex(firstMinute, points) - 1;
			if (firstMinuteIndex < 0)
				firstMinuteIndex = 0;

			let lastMinuteIndex = dataSeries.getRelativeMinuteIndex(context.lastMinute, points) + 1;
			if (lastMinuteIndex >= points.length)
				lastMinuteIndex = points.length - 1;

			let volume = points[lastMinuteIndex].volumes[detailLevelInterval];
			for (let minuteIndex = lastMinuteIndex - 1; minuteIndex >= firstMinuteIndex; minuteIndex--)
				volume = Utils.extendedMax(volume, points[minuteIndex].volumes[detailLevelInterval]);

			let _loc12_ = NaN;
			for (let scaleIndex = 1; scaleIndex < Const.VOLUME_SCALES.length; scaleIndex++)
			{
				_loc12_ = Const.VOLUME_SCALES[scaleIndex];
				if (Math.floor(volume / _loc12_) < 10)
					break;
			}
			const _loc13_ = (Math.floor(volume / _loc12_) + 1) * _loc12_;
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
					const unit = points[_loc11_];
					if (!isNaN(unit.open))
					{
						if (unit.close >= unit.open)
							gr.lineStyle(1, Const.POSITIVE_DIFFERENCE_COLOR);
						else
							gr.lineStyle(1, Const.NEGATIVE_DIFFERENCE_COLOR);

						if (!dataSeries.minuteIsStartOfDataSession(unit.dayMinute))
						{
							let _loc12_: number;
							if (detailLevel === Intervals.WEEKLY && displayManager !== Const.LINE_CHART)
							{
								_loc12_ = this.getWeeklyBarXPos(unit, _loc14_);
								_loc14_ = _loc12_;
							}
							else
							{
								_loc12_ = viewPoint.getXPos(unit);
							}
							const y = this.getYPos(unit.volumes[detailLevelInterval], viewPoint);
							this.drawOneBar(_loc12_, y, viewPoint, this, barWidth, unit.close >= unit.open ? -1 : Const.NEGATIVE_DIFFERENCE_COLOR);
						}
					}
				}
			}
			else
			{
				gr.lineStyle(1, Const.LINE_CHART_LINE_COLOR);
				for (let _loc11_ = _loc8_; _loc11_ >= _loc7_; _loc11_--)
				{
					const unit = points[_loc11_];
					if (!dataSeries.minuteIsStartOfDataSession(unit.dayMinute))
					{
						let _loc12_: number;
						if (detailLevel === Intervals.WEEKLY && displayManager !== Const.LINE_CHART)
						{
							_loc12_ = this.getWeeklyBarXPos(unit, _loc14_);
							_loc14_ = _loc12_;
						}
						else
						{
							_loc12_ = viewPoint.getXPos(unit);
						}
						const y = this.getYPos(unit.volumes[detailLevelInterval], viewPoint);
						this.drawOneLine(_loc12_, y, viewPoint, this);
					}
				}
			}
			this.drawHorizontalLine(viewPoint.miny + Const.BOTTOM_VIEWPOINT_HEADER_HEIGHT);
		}

		highlightPoint(context: Context, x: number, state: Dictionary)
		{
			if (state["ahsetter"])
				return;

			const dataSeries = notnull(this.getDataSeries());
			const viewPoint = this.viewPoint;
			const pointIndex = this.findPointIndex(x);
			const detailLevel = viewPoint.getDetailLevelForTechnicalStyle();
			const detailLevelInterval = Const.getDetailLevelInterval(detailLevel);
			const points = dataSeries.getPointsInIntervalArray(detailLevelInterval);
			if (!points || pointIndex === -1)
				return;

			const unit = points[pointIndex];
			this.clearHighlight();
			const _loc11_ = !isNaN(unit.weeklyXPos) ? Number(unit.weeklyXPos) : viewPoint.getXPos(unit);
			const y = this.getYPos(unit.volumes[detailLevelInterval], viewPoint);
			const displayManager = viewPoint.getDisplayManager().getEnabledChartLayer();
			const gr = this.highlightCanvas.graphics;
			if (Const.VOLUME_PLUS_ENABLED && Const.VOLUME_PLUS_CHART_TYPE.indexOf(displayManager) !== -1)
			{
				gr.lineStyle(5, Const.DOT_COLOR, 1);
				gr.moveTo(_loc11_, y - 0.2);
				gr.lineTo(_loc11_, y + 0.2);
			}
			else
			{
				gr.lineStyle(2, Const.VOLUME_HIGHLIGHT_COLOR, 1);
				this.drawOneLine(_loc11_, y, viewPoint, this.highlightCanvas);
			}
			state[SpaceText.VOLUME_STR] = unit.volumes[detailLevelInterval];
			state["volumesetter"] = this;
		}
	}
}
