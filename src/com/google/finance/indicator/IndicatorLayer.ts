namespace com.google.finance.indicator
{
	// import com.google.finance.AbstractDrawingLayer;
	// import flash.text.TextField;
	// import com.google.finance.Const;
	// import com.google.finance.Indicator;
	// import com.google.finance.ViewPoint;
	// import com.google.finance.DataUnit;
	// import flash.display.Sprite;
	// import com.google.finance.DataSeries;
	// import com.google.finance.DataSource;
	// import flash.text.TextFormat;

	export abstract class IndicatorLayer extends AbstractDrawingLayer<ViewPoint>
	{
		static readonly TRUE_STR = "true";

		static readonly INDICATOR_TEXT_WIDTH = 118;

		static readonly NAME_TEXT_COLOR = 0x999999;

		static readonly TEXT_TOP_MARGIN = 2;

		static readonly MEDIAN_LINE_COLOR = 0xaa0000;

		static readonly COLORS = [0x66cc, 0xcc3300, 0x339933, 0xff00ff];

		static readonly INDICATOR_TEXT_FONT = "Verdana";

		static readonly FALSE_STR = "false";

		static readonly INDICATOR_TEXT_FONT_SIZE = 9;

		static readonly INDICATOR_TEXT_HEIGHT = 16;

		static readonly TEXT_LEFT_MARGIN = 2;

		protected localYOffset = 0;

		protected _enabled = false;

		protected indicatorNameText: flash.text.TextField;

		indicator: Indicator;

		protected medianLineCanvas: flash.display.Sprite;

		protected textOutCanvas: flash.display.Sprite;

		protected localMedianValue = 0;

		protected localYScale = 0;

		protected indicatorValueTextArray: flash.text.TextField[];

		protected indicatorName: string;

		protected highlightCanvas: flash.display.Sprite;

		protected dashSize = 7;

		protected originalDataSeries: DataSeries;

		static getParameterNames(): string[] { return []; }

		constructor(viewPoint: ViewPoint, dataSource: DataSource)
		{
			super(viewPoint, dataSource);
			this.highlightCanvas = new flash.display.Sprite("highlightCanvas");
			this.addChild(this.highlightCanvas);
			this.textOutCanvas = new flash.display.Sprite("textOutCanvas");
			this.addChild(this.textOutCanvas);
			this.medianLineCanvas = new flash.display.Sprite("medianLineCanvas");
			this.addChild(this.medianLineCanvas);
			if (this.isNameTextRequired())
			{
				this.indicatorNameText = new flash.text.TextField();
				this.indicatorNameText.selectable = false;
				this.indicatorNameText.textColor = IndicatorLayer.NAME_TEXT_COLOR;
				this.indicatorNameText.defaultTextFormat = new flash.text.TextFormat(IndicatorLayer.INDICATOR_TEXT_FONT, IndicatorLayer.INDICATOR_TEXT_FONT_SIZE, IndicatorLayer.NAME_TEXT_COLOR);
				this.indicatorNameText.width = IndicatorLayer.INDICATOR_TEXT_WIDTH;
				this.indicatorNameText.height = IndicatorLayer.INDICATOR_TEXT_HEIGHT;
				this.textOutCanvas.addChild(this.indicatorNameText);
			}
			this.indicatorValueTextArray = [];
			for (let colorIndex = 0; colorIndex < IndicatorLayer.COLORS.length; colorIndex++)
			{
				const layerTextFormat = new flash.text.TextField();
				layerTextFormat.selectable = false;
				layerTextFormat.textColor = this.getColor(colorIndex);
				layerTextFormat.defaultTextFormat = new flash.text.TextFormat(IndicatorLayer.INDICATOR_TEXT_FONT, IndicatorLayer.INDICATOR_TEXT_FONT_SIZE, layerTextFormat.textColor);
				layerTextFormat.width = IndicatorLayer.INDICATOR_TEXT_WIDTH;
				layerTextFormat.height = IndicatorLayer.INDICATOR_TEXT_HEIGHT;
				this.textOutCanvas.addChild(layerTextFormat);
				this.indicatorValueTextArray.push(layerTextFormat);
			}
		}

		private getIntervalText(detailLevel: number): string
		{
			switch (detailLevel)
			{
				case Intervals.INTRADAY:
					return "2m";
				case Intervals.FIVE_MINUTES:
					return "5m";
				case Intervals.HALF_HOUR:
					return "30m";
				case Intervals.DAILY:
					return "1d";
				case Intervals.WEEKLY:
					return "1w";
				default:
					return "";
			}
		}

		getIndicatorName(): string
		{
			return this.indicatorName;
		}

		private renderHistogramLine(dataSeriesArray: DataSeries[], dataSeriesIndex: number, param3: number, param4: number, viewPoint: ViewPoint, context: Context, detailLevel: number, layerType: string)
		{
			let xPos = Number.MAX_VALUE;
			const yPos = this.getYPos(context, new IndicatorPoint(0, <DataUnit><any>null));	// TODO
			const gr = this.graphics;
			for (let pointIndex = param4; pointIndex >= param3; pointIndex--)
			{
				if (!isNaN(dataSeriesArray[dataSeriesIndex].points[pointIndex].getValue()))
				{
					const point = dataSeriesArray[dataSeriesIndex].points[pointIndex].getPoint();
					if (detailLevel === Intervals.WEEKLY && layerType !== Const.LINE_CHART)
						xPos = this.getWeeklyBarXPos(point, xPos);

					const _loc13_ = !isNaN(point.weeklyXPos) ? point.weeklyXPos : viewPoint.getXPos(point);
					const _loc14_ = this.getYPos(context, dataSeriesArray[dataSeriesIndex].points[pointIndex]);
					gr.lineStyle(1, this.getColor(dataSeriesIndex, dataSeriesArray[dataSeriesIndex].points[pointIndex].getValue()));
					gr.moveTo(_loc13_, yPos);
					gr.lineTo(_loc13_, _loc14_);
				}
			}
		}

		private renderSingleLine(dataSeriesArray: DataSeries[], param2: number, param3: number, param4: number, viewPoint: ViewPoint, context: Context, detailLevel: number, layerType: string)
		{
			let _loc9_ = Number.MAX_VALUE;
			let point = dataSeriesArray[param2].points[param4].getPoint();
			if (detailLevel === Intervals.WEEKLY && layerType !== Const.LINE_CHART)
				_loc9_ = this.getWeeklyBarXPos(point, _loc9_);

			const gr = this.graphics;
			gr.lineStyle(1, this.indicatorValueTextArray[param2].textColor);
			gr.moveTo(!isNaN(point.weeklyXPos) ? Number(point.weeklyXPos) : viewPoint.getXPos(point), this.getYPos(context, dataSeriesArray[param2].points[param4]));
			let _loc11_ = param4 - 1;
			while (_loc11_ >= param3)
			{
				if (!isNaN(dataSeriesArray[param2].points[_loc11_].getValue()))
				{
					point = dataSeriesArray[param2].points[_loc11_].getPoint();
					if (detailLevel === Intervals.WEEKLY && layerType !== Const.LINE_CHART)
						_loc9_ = this.getWeeklyBarXPos(point, _loc9_);

					const _loc12_ = !isNaN(point.weeklyXPos) ? point.weeklyXPos : viewPoint.getXPos(point);
					const _loc13_ = this.getYPos(context, dataSeriesArray[param2].points[_loc11_]);
					if (_loc13_ < viewPoint.miny)
						gr.moveTo(_loc12_, viewPoint.miny);
					else if (_loc13_ > viewPoint.maxy)
						gr.moveTo(_loc12_, viewPoint.maxy);
					else
						gr.lineTo(_loc12_, _loc13_);
				}
				_loc11_--;
			}
		}

		private renderHistogramLineFromBottom(dataSeriesArray: DataSeries[], param2: number, param3: number, param4: number, viewPoint: ViewPoint, context: Context, detailLevel: number, layerType: string)
		{
			let _loc9_ = Number.MAX_VALUE;
			const gr = this.graphics;
			gr.lineStyle(1, this.indicatorValueTextArray[param2].textColor);
			let _loc11_ = param4;
			while (_loc11_ >= param3)
			{
				if (!isNaN(dataSeriesArray[param2].points[_loc11_].getValue()))
				{
					const point = dataSeriesArray[param2].points[_loc11_].getPoint();
					if (detailLevel === Intervals.WEEKLY && layerType !== Const.LINE_CHART)
						_loc9_ = this.getWeeklyBarXPos(point, _loc9_);

					const _loc12_ = !isNaN(point.weeklyXPos) ? point.weeklyXPos : viewPoint.getXPos(point);
					const _loc13_ = this.getYPos(context, dataSeriesArray[param2].points[_loc11_]);
					gr.moveTo(_loc12_, this.viewPoint.maxy);
					gr.lineTo(_loc12_, _loc13_);
				}
				_loc11_--;
			}
		}

		protected getYPos(context: Context, indicatorPoint: IndicatorPoint): number
		{
			return 0;
		}

		protected drawMedianLine(param1: number = -1, sprite: flash.display.Sprite)
		{
			if (param1 === -1)
				param1 = IndicatorLayer.MEDIAN_LINE_COLOR;

			if (!sprite)
				sprite = this.medianLineCanvas;

			const localYOffset = this.localYOffset;
			const minx = this.viewPoint.minx;
			const maxx = this.viewPoint.maxx;
			let _loc6_ = 0;
			const gr = sprite.graphics;
			gr.lineStyle(1, param1);
			do
			{
				gr.moveTo(minx + _loc6_ * this.dashSize, localYOffset);
				gr.lineTo(minx + (_loc6_ + 1) * this.dashSize, localYOffset);
				_loc6_ = Number(_loc6_ + 2);
			}
			while (minx + _loc6_ * this.dashSize < maxx);
		}

		protected drawAHighlightDot(param1: number, param2: number, param3: number)
		{
			const gr = this.highlightCanvas.graphics;
			gr.lineStyle(5, param3, 1);
			gr.moveTo(param1, param2 - 0.2);
			gr.lineTo(param1, param2 + 0.2);
		}

		set enabled(enabled: string)
		{
			this._enabled = enabled === IndicatorLayer.TRUE_STR;
		}

		protected abstract calculateLocalScaleMeters(context: Context): void;

		protected getColor(param1: number, param2 = NaN): number
		{
			return IndicatorLayer.COLORS[param1 % IndicatorLayer.COLORS.length];
		}

		getDataSeries(context: Context): DataSeries | null
		{
			return null;
		}

		highlightPoint(context: Context, param2: number, state: Dictionary)
		{

			if (!this._enabled)
				return;

			this.clearHighlight();
			const viewPoint = this.viewPoint;
			const detailLevel = viewPoint.getDetailLevelForTechnicalStyle();
			const intervalText = this.getIntervalText(detailLevel);
			const dataSeriesArray = this.getDataSeriesArray(detailLevel);
			if (!dataSeriesArray)
				return;

			const dPointIndex = this.findPointIndex(param2);
			if (dPointIndex === -1)
				return;

			for (let dataSeriesIndex = 0; dataSeriesIndex < dataSeriesArray.length; dataSeriesIndex++)
			{
				const point = dataSeriesArray[dataSeriesIndex].points[dPointIndex];
				if (!point)
					continue;	// TODO:
				const _loc9_ = point.getPoint();
				let value = point.getValue();
				if (!isNaN(value))
				{
					const _loc12_ = !isNaN(_loc9_.weeklyXPos) ? _loc9_.weeklyXPos : viewPoint.getXPos(_loc9_);
					let _loc13_;
					switch (this.getLineStyle(dataSeriesIndex))
					{
						case IndicatorLineStyle.SIMPLE_LINE:
							_loc13_ = this.getYPos(context, point);
							if (_loc13_ < viewPoint.maxy && _loc13_ > viewPoint.miny)
								this.drawAHighlightDot(_loc12_, _loc13_, this.indicatorValueTextArray[dataSeriesIndex].textColor);

							value = Math.round(value * 100) / 100;
							this.indicatorValueTextArray[dataSeriesIndex].text = this.getIndicatorValueText(dataSeriesIndex, value, intervalText, context);
							break;
						case IndicatorLineStyle.HISTOGRAM_LINE:
							const _loc14_ = this.getYPos(context, new IndicatorPoint(0, <DataUnit><any>null)); // TODO
							_loc13_ = this.getYPos(context, point);
							this.drawAHighlightLine(_loc12_, _loc14_, _loc12_, _loc13_, this.getColor(dataSeriesIndex, point.getValue()));
							value = Math.round(value * 100) / 100;
							this.indicatorValueTextArray[dataSeriesIndex].text = this.getIndicatorValueText(dataSeriesIndex, value, intervalText, context);
							break;
						case IndicatorLineStyle.HISTOGRAM_LINE_FROM_BOTTOM:
							_loc13_ = this.getYPos(context, point);
							this.drawAHighlightLine(_loc12_, viewPoint.maxy, _loc12_, _loc13_, this.indicatorValueTextArray[dataSeriesIndex].textColor);
							value = Math.round(value * 100) / 100;
							this.indicatorValueTextArray[dataSeriesIndex].text = this.getIndicatorValueText(dataSeriesIndex, value, intervalText, context);
							break;
						case IndicatorLineStyle.NONE:
							break;
					}
				}
			}
			let length = dataSeriesArray.length;
			while (length < this.indicatorValueTextArray.length)
			{
				this.indicatorValueTextArray[length].text = "";
				length++;
			}
		}

		private doCopyLastIndicatorPoint(dataUnit: DataUnit, dataSeriesArray: DataSeries[])
		{
			const indicatorPoint = new IndicatorPoint(NaN, dataUnit);
			for (let dataSeriesIndex = 0; dataSeriesIndex < dataSeriesArray.length; dataSeriesIndex++)
			{
				const _loc5_ = dataSeriesArray[dataSeriesIndex].points.length;
				if (_loc5_ > 0)
					dataSeriesArray[dataSeriesIndex].points.push(new IndicatorPoint(dataSeriesArray[dataSeriesIndex].points[_loc5_ - 1].getValue(), dataUnit));
				else
					dataSeriesArray[dataSeriesIndex].points.push(indicatorPoint);

				dataSeriesIndex++;
			}
		}

		protected findPointIndex(param1: number): number
		{
			const viewPoint = this.viewPoint;
			const originalDataSeries = this.originalDataSeries;
			const detailLevel = viewPoint.getDetailLevelForTechnicalStyle();
			const detailLevelInterval = Const.getDetailLevelInterval(detailLevel);
			const points = originalDataSeries.getPointsInIntervalArray(detailLevelInterval);
			if (!points)
				return -1;

			const minuteOfX = viewPoint.getMinuteOfX(param1);
			let relativeMinuteIndex = originalDataSeries.getRelativeMinuteIndex(minuteOfX, points);
			if (relativeMinuteIndex === points.length - 2)
			{
				if (Math.abs(minuteOfX - points[relativeMinuteIndex].relativeMinutes) > Math.abs(minuteOfX - points[relativeMinuteIndex + 1].relativeMinutes))
					relativeMinuteIndex++;
			}
			if (detailLevel === Intervals.WEEKLY)
			{
				while (relativeMinuteIndex + 1 < points.length && points[relativeMinuteIndex + 1].weeklyXPos <= param1)
					relativeMinuteIndex++;
			}
			while (relativeMinuteIndex > 0 && (points[relativeMinuteIndex].fake || points[relativeMinuteIndex].duplicate))
			{
				relativeMinuteIndex--;
			}
			return relativeMinuteIndex;
		}

		protected drawAHighlightLine(param1: number, param2: number, param3: number, param4: number, param5: number)
		{
			const gr = this.highlightCanvas.graphics;
			gr.lineStyle(2, param5);
			gr.moveTo(param1, param2);
			gr.lineTo(param3, param4);
		}

		copyLastIndicatorPoint(dataUnit: DataUnit, ...rest: DataSeries[])
		{
			this.doCopyLastIndicatorPoint(dataUnit, rest);
		}

		setIndicator(indicatorName: string, dataSeries: DataSeries)
		{
			this.indicatorName = indicatorName;
			if (this.dataSource.indicators[indicatorName] === undefined)
				this.dataSource.indicators[indicatorName] = new Indicator();

			this.indicator = this.dataSource.indicators[indicatorName];
			this.originalDataSeries = dataSeries;
			this.setIndicatorInstanceArray(Const.INDICATOR_PARAMETERS[indicatorName]);
		}

		protected getIndicatorNameText(param1: string): string
		{
			return "";
		}

		shouldSkip(dataUnit: DataUnit, ...rest: DataSeries[]): boolean
		{
			if (dataUnit.duplicate)
			{
				const indicatorPoint = new IndicatorPoint(NaN, dataUnit);
				for (const dataSeries of rest)
					dataSeries.points.push(indicatorPoint);
				return true;
			}
			if (dataUnit.fake)
			{
				this.doCopyLastIndicatorPoint(dataUnit, rest);
				return true;
			}
			return false;
		}

		computeIntervalIndicator(param1: number)
		{
		}

		renderLayer(context: Context)
		{
			this.placeIndicatorNameAndValueTexts();
			if (!this._enabled)
				return;

			this.graphics.clear();
			const viewPoint = this.viewPoint;
			const detailLevel = viewPoint.getDetailLevelForTechnicalStyle();
			const detailLevelInterval = Const.getDetailLevelInterval(detailLevel);
			const originalDataSeries = this.originalDataSeries;
			const points = originalDataSeries.getPointsInIntervalArray(detailLevelInterval);
			if (!points)
			{
				if (this.indicatorNameText)
					this.indicatorNameText.text = "";

				let _loc14_ = 0;
				while (_loc14_ < this.indicatorValueTextArray.length)
				{
					this.indicatorValueTextArray[_loc14_].text = "";
					_loc14_++;
				}
				return;
			}
			const dataSeriesArray = this.getDataSeriesArray(detailLevel);
			if (!dataSeriesArray)
				return;

			const intervalText = this.getIntervalText(detailLevel);
			if (this.indicatorNameText)
				this.indicatorNameText.text = this.getIndicatorNameText(intervalText);

			this.calculateLocalScaleMeters(context);
			let lastMinuteIndex = originalDataSeries.getRelativeMinuteIndex(viewPoint.getLastMinute(), points);
			if (lastMinuteIndex < points.length - 1)
				lastMinuteIndex++;

			const lastRealPointIndex = this.getLastRealPointIndex(points);
			if (lastMinuteIndex > lastRealPointIndex)
				lastMinuteIndex = lastRealPointIndex;

			let firstMinuteIndex = originalDataSeries.getRelativeMinuteIndex(viewPoint.getFirstMinute(), points) - 1;
			if (firstMinuteIndex < 0)
				firstMinuteIndex = 0;

			const enabledChartLayer = this.viewPoint.getDisplayManager().getEnabledChartLayer();
			for (let dataSeriesIndex = 0; dataSeriesIndex < dataSeriesArray.length; dataSeriesIndex++)
			{
				const points2 = dataSeriesArray[dataSeriesIndex].points;

				let _loc15_ = lastMinuteIndex;
				if (_loc15_ > points2.length - 1)
					_loc15_ = points2.length - 1;	// TODO: never

				let _loc16_ = firstMinuteIndex;
				const numPoints = points2.length;
				while (_loc16_ < numPoints && isNaN(points2[_loc16_].getValue()))
					_loc16_++;

				while (_loc15_ >= 0 && isNaN(points2[_loc15_].getValue()))
					_loc15_--;

				if (_loc16_ > _loc15_)
				{
					this.indicatorValueTextArray[dataSeriesIndex].text = this.getIndicatorValueText(dataSeriesIndex, 0, intervalText, context);
				}
				else
				{
					switch (this.getLineStyle(dataSeriesIndex))
					{
						case IndicatorLineStyle.SIMPLE_LINE:
							this.renderSingleLine(dataSeriesArray, dataSeriesIndex, _loc16_, _loc15_, viewPoint, context, detailLevel, enabledChartLayer);
							break;
						case IndicatorLineStyle.HISTOGRAM_LINE:
							this.renderHistogramLine(dataSeriesArray, dataSeriesIndex, _loc16_, _loc15_, viewPoint, context, detailLevel, enabledChartLayer);
							break;
						case IndicatorLineStyle.HISTOGRAM_LINE_FROM_BOTTOM:
							this.renderHistogramLineFromBottom(dataSeriesArray, dataSeriesIndex, _loc16_, _loc15_, viewPoint, context, detailLevel, enabledChartLayer);
							break;
						case IndicatorLineStyle.NONE:
							break;
					}
				}
			}
		}

		isNameTextRequired(): boolean
		{
			return true;
		}

		getDataSeriesArray(param1: number, context?: Context): DataSeries[] | null
		{
			let _loc6_ = 0;
			const detailLevelInterval = Const.getDetailLevelInterval(param1);
			const originalDataSeries = this.originalDataSeries;
			const points = originalDataSeries.getPointsInIntervalArray(detailLevelInterval);
			if (!points || points.length === 0)
				return null;

			if (!this.indicator.hasInterval(detailLevelInterval))
			{
				if (this.isOhlcDataRequired())
				{
					_loc6_ = 0;
					while (_loc6_ < points.length)
					{
						if (isNaN(points[_loc6_].high) || isNaN(points[_loc6_].low) || isNaN(points[_loc6_].open))
							return null;

						_loc6_++;
					}
				}
				this.computeIntervalIndicator(detailLevelInterval);
			}
			return this.indicator.getDataSeriesArray(detailLevelInterval);
		}

		isOhlcDataRequired(): boolean
		{
			return false;
		}

		protected getIndicatorValueText(param1: number, param2: number, param3: string, context: Context): string
		{
			return "";
		}

		protected getLineStyle(param1: number): number
		{
			return IndicatorLineStyle.NONE;
		}

		clearHighlight()
		{
			this.highlightCanvas.graphics.clear();
		}

		public setIndicatorInstanceArray(indicators: any[])
		{
		}

		protected placeIndicatorNameAndValueTexts()
		{
			if (this.indicatorNameText)
			{
				this.indicatorNameText.y = this.viewPoint.miny + IndicatorLayer.TEXT_TOP_MARGIN;
				this.indicatorNameText.x = this.viewPoint.minx + IndicatorLayer.TEXT_LEFT_MARGIN;
			}
			for (let textFieldIndex = 0; textFieldIndex < this.indicatorValueTextArray.length; textFieldIndex++)
			{
				this.indicatorValueTextArray[textFieldIndex].y = this.viewPoint.miny + IndicatorLayer.TEXT_TOP_MARGIN;
				this.indicatorValueTextArray[textFieldIndex].x = this.viewPoint.minx + IndicatorLayer.TEXT_LEFT_MARGIN + (!!this.indicatorNameText ? textFieldIndex + 1 : textFieldIndex) * IndicatorLayer.INDICATOR_TEXT_WIDTH;
			}
		}

		setEnabled(enabled = true)
		{
			this._enabled = enabled;
			this.visible = enabled;
			this.highlightCanvas.visible = enabled;
			this.textOutCanvas.visible = enabled;
			this.medianLineCanvas.visible = enabled;
		}
	}
}
