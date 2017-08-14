namespace com.google.finance
{
	// import flash.display.Sprite;

	export class VolumeLinesChartLayer extends AbstractDrawingLayer<ViewPoint>
	{
		protected scaledFactor: number;
		protected factor: number;
		protected indicator: com.google.finance.Indicator;
		protected computer: Function;
		protected highlightCanvas: flash.display.Sprite = new flash.display.Sprite();
		protected maxVolume: { [key: string]: number } = {};
		protected originalDataSeries: com.google.finance.DataSeries;
		protected verticalScale = 0;

		constructor(viewPoint: ViewPoint, dataSource: DataSource)
		{
			super(viewPoint, dataSource);
			this.addChild(this.highlightCanvas);
		}

		private drawDayLine(param1: flash.display.Sprite, param2: number, viewPoint: ViewPoint, param4: com.google.finance.DataSeries, param5: number, param6: number, param7: number, param8: number, context: Context): number
		{
			const points = param4.points;
			const days = param4.days;
			if (days[param2 - 1] === days[param2] - 1)
				return param2;

			let _loc14_ = days[param2];
			if (_loc14_ > param8)
				_loc14_ = param8;

			let point = <indicator.VolumeIndicatorPoint>param4.points[_loc14_];
			let xPos = viewPoint.getXPos(points[_loc14_].point);
			const intervalLength = viewPoint.getIntervalLength(param6 / 60);
			const _loc15_ = Utils.extendedMax(param7, days[param2 - 1]);
			const gr = param1.graphics;
			while (_loc14_ > _loc15_)
			{
				let _loc13_ = viewPoint.maxy - point.volume * this.verticalScale;
				if (viewPoint.maxy - _loc13_ < 1 && viewPoint.maxy - _loc13_ > 0)
					_loc13_ = viewPoint.maxy - 1;
				else if (_loc13_ < viewPoint.miny)
					_loc13_ = viewPoint.miny;

				gr.moveTo(xPos, _loc13_);
				gr.lineTo(xPos, viewPoint.maxy);
				_loc14_--;
				xPos -= intervalLength;
			}
			return param2;
		}

		setIndicator(param1: string, param2: Function, param3: com.google.finance.DataSeries) 
		{
			this.dataSource.indicators[param1] = new com.google.finance.Indicator();
			this.indicator = this.dataSource.indicators[param1];
			this.indicator.clearAllOnAddData = true;
			this.computer = param2;
			this.originalDataSeries = param3;
		}

		getNewestMinute(): number
		{
			const originalDataSeries = this.originalDataSeries;
			return originalDataSeries.getLastRelativeMinute();
		}

		protected getYPos(param1: IViewPoint, param2: indicator.VolumeIndicatorPoint): number
		{
			if (isNaN(param2.volume))
				return param1.maxy;

			return param1.maxy - param2.volume * this.verticalScale;
		}

		getPoint(param1: com.google.finance.DataSeries, param2: number) 
		{
			let pointIndex = this.getPointIndex(param1, param2);
			while (pointIndex > 0 && (<indicator.VolumeIndicatorPoint>param1.points[pointIndex]).volume === 0)
			{
				pointIndex--;
			}
			return param1.points[pointIndex];
		}

		renderLayer(context: Context) 
		{
			const skipInterval = this.viewPoint.getSkipInterval(context.count, context.lastMinute);
			const dataSeries = this.indicator.getDataSeries(skipInterval.interval);
			if (!dataSeries || dataSeries.points.length === 0)
				return;

			const lastMinute = this.viewPoint.getLastMinute();
			const firstMinute = this.viewPoint.getFirstMinute();
			const lastReferencePointIndex = dataSeries.getReferencePointIndex(lastMinute);
			let firstReferencePointIndex = Number(dataSeries.getReferencePointIndex(firstMinute) - 1);
			if (firstReferencePointIndex < 0)
				firstReferencePointIndex = 0;

			this.drawLines(this, dataSeries, firstReferencePointIndex, lastReferencePointIndex, this.viewPoint, context);
		}

		protected drawOneLine(param1: number, param2: number, param3: flash.display.Sprite, param4: IViewPoint) 
		{
			if (param4.maxy - param2 < 1 && param4.maxy - param2 > 0)
				param2 = param4.maxy - 1;
			else if (param2 < param4.miny)
				param2 = param4.miny;

			param3.graphics.moveTo(param1, param2);
			param3.graphics.lineTo(param1, param4.maxy);
		}

		private getPointIndex(param1: com.google.finance.DataSeries, param2: number): number
		{
			const minute = this.viewPoint.getMinuteOfX(param2);
			let referencePointIndex = param1.getReferencePointIndex(minute);
			while (param1.units[referencePointIndex].fake && referencePointIndex >= 0)
				referencePointIndex--;

			if (referencePointIndex < param1.points.length - 1)
			{
				const _loc5_ = param1.points[referencePointIndex].point;
				const _loc6_ = param1.points[referencePointIndex + 1].point;
				const _loc7_ = this.viewPoint.getMinuteXPos(_loc6_.relativeMinutes);
				const _loc8_ = this.viewPoint.getMinuteXPos(_loc5_.relativeMinutes);
				if (Math.abs(_loc7_ - param2) < Math.abs(_loc8_ - param2))
					return referencePointIndex + 1;
			}
			return referencePointIndex;
		}

		clearHighlight() 
		{
			this.highlightCanvas.graphics.clear();
		}

		getOldestMinute(): number
		{
			const originalDataSeries = this.originalDataSeries;
			return originalDataSeries.getFirstRelativeMinute();
		}

		protected drawLines(param1: flash.display.Sprite, param2: com.google.finance.DataSeries, param3: number, param4: number, viewPoint: ViewPoint, context: Context) 
		{
			const _loc7_ = <indicator.VolumeIndicatorPoint[]>param2.points;
			//const _loc8_ = param2.days;
			let nextDayStart = param2.getNextDayStart(param4);
			const detailLevel = viewPoint.getDetailLevel();
			const skipInterval = viewPoint.getSkipInterval();
			//const _loc12_ = _loc11_.skip;
			const interval = skipInterval.interval;
			this.verticalScale = (viewPoint.maxy - viewPoint.miny - 6) / context.maxVolume;
			const gr = param1.graphics;
			gr.clear();
			gr.lineStyle(0, this.lineColor, 1);
			switch (detailLevel)
			{
				case Intervals.INTRADAY:
					while (param2.days[nextDayStart] > param3 && nextDayStart >= 0)
					{
						this.drawDayLine(param1, nextDayStart, viewPoint, param2, detailLevel, interval, param3, param4, context);
						nextDayStart--;
					}
					break;
				case Intervals.DAILY:
					{
						//_loc14_ = param5.getXPos(_loc7_[_loc16_].point);
						//_loc17_ = param5.minutePix * (this.dataSource.data.marketDayLength + 1);
						for (let _loc16_ = param4; _loc16_ > param3 && _loc16_ >= 0; _loc16_--)
						{
							let _loc15_ = this.getYPos(viewPoint, _loc7_[_loc16_]);
							const _loc14_ = viewPoint.getXPos(_loc7_[_loc16_].point);
							if (viewPoint.maxy - _loc15_ < 1 && viewPoint.maxy - _loc15_ > 0)
								_loc15_ = viewPoint.maxy - 1;
							else if (_loc15_ < viewPoint.miny)
								_loc15_ = viewPoint.miny;

							gr.moveTo(_loc14_, _loc15_);
							gr.lineTo(_loc14_, viewPoint.maxy);
						}
					}
					break;
				case Intervals.WEEKLY:
					{
						for (let _loc16_ = param4; _loc16_ > param3 && _loc16_ >= 0; _loc16_--)
						{
							const _loc14_ = viewPoint.getXPos(_loc7_[_loc16_].point);
							let _loc15_ = this.getYPos(viewPoint, _loc7_[_loc16_]);
							if (viewPoint.maxy - _loc15_ < 1 && viewPoint.maxy - _loc15_ > 0)
								_loc15_ = viewPoint.maxy - 1;
							else if (_loc15_ < viewPoint.miny)
								_loc15_ = viewPoint.miny;

							gr.moveTo(_loc14_, _loc15_);
							gr.lineTo(_loc14_, viewPoint.maxy);
						}
					}
					break;
			}
		}

		protected getMaxVolume(param1: number, param2: number, param3: boolean): number
		{
			let _loc13_ = NaN;
			const viewPoint = this.viewPoint;
			const skipInterval = viewPoint.getSkipInterval(param2, param1);
			const interval = skipInterval.interval;
			//const _loc7_ = _loc5_.skip;
			const dataSeries = notnull(this.indicator.getDataSeries(interval));
			const detailLevel = viewPoint.getDetailLevel(param2, param1);
			const _loc10_ = "c" + param2 + "-" + detailLevel + "-" + dataSeries.units.length;
			if (this.maxVolume[_loc10_] !== undefined)
				return this.maxVolume[_loc10_];

			let _loc11_ = 0;
			for (let _loc12_ = 0; _loc12_ < dataSeries.points.length; _loc12_++)
			{
				if ((<indicator.VolumeIndicatorPoint>dataSeries.points[_loc12_]).volume > _loc11_)
					_loc11_ = Number((<indicator.VolumeIndicatorPoint>dataSeries.points[_loc12_]).volume);
			}
			this.maxVolume[_loc10_] = _loc11_;
			for (let _loc12_ = 1; _loc12_ < Const.VOLUME_SCALES.length; _loc12_++)
			{
				_loc13_ = Const.VOLUME_SCALES[_loc12_];
				if (Math.floor(this.maxVolume[_loc10_] / _loc13_) < 10)
					break;
			}
			const _loc14_ = (Math.floor(this.maxVolume[_loc10_] / _loc13_) + 1) * _loc13_;
			this.maxVolume[_loc10_] = _loc14_;
			return this.maxVolume[_loc10_];
		}

		getDataSeries(context: Context): com.google.finance.DataSeries
		{
			let vp = this.viewPoint;
			if (!context)
				context = vp.layersContext;

			const skipInterval = vp.getSkipInterval(context.count, context.lastMinute);
			this.computer(skipInterval.interval, indicator, this.originalDataSeries);
			return notnull(this.indicator.getDataSeries(skipInterval.interval));
		}

		getContext(context: Context, param2 = false) 
		{
			const dataSeries = this.getDataSeries(context);
			if (dataSeries.points.length === 0)
			{
				if (context.maxVolume === undefined)
					context.maxVolume = 0;

				return context;
			}
			const maxVolume = this.getMaxVolume(context.lastMinute, context.count, param2);
			context.maxVolume = Utils.extendedMax(context.maxVolume, maxVolume);
			return context;
		}

		highlightPoint(context: Context, param2: number, param3: { [key: string]: any }) 
		{
			this.clearHighlight();
			const skipInterval = this.viewPoint.getSkipInterval(context.count, context.lastMinute);
			const dataSeries = this.indicator.getDataSeries(skipInterval.interval);
			if (!dataSeries)
				return;

			const firstReferencePoint = dataSeries.getFirstReferencePoint();
			const lastReferencePoint = dataSeries.getLastReferencePoint();
			if (!firstReferencePoint || !lastReferencePoint)
				return;

			const firstMinuteXPos = this.viewPoint.getMinuteXPos(firstReferencePoint.relativeMinutes);
			const lastMinuteXPos = this.viewPoint.getMinuteXPos(lastReferencePoint.relativeMinutes);
			if (param2 < firstMinuteXPos || param2 > lastMinuteXPos)
				return;

			if (param3["ahsetter"] !== undefined)
				return;

			const point = this.getPoint(dataSeries, param2) as indicator.VolumeIndicatorPoint;
			const xPos = this.viewPoint.getXPos(point.point);
			const yPos = this.getYPos(this.viewPoint, point);
			this.highlightCanvas.graphics.lineStyle(2, Const.VOLUME_HIGHLIGHT_COLOR, 1);
			this.drawOneLine(xPos, yPos, this.highlightCanvas, this.viewPoint);
			param3[SpaceText.VOLUME_STR] = point.volume;
			param3["volumesetter"] = this;
		}
	}
}
