namespace com.google.finance
{
	// import com.google.i18n.locale.DateTimeLocale;
	// import flash.display.Sprite;

	export class IntervalBasedChartLayer extends AbstractDrawingLayer<ViewPoint>
	{
		private enabled: boolean;
		private layerName: string;

		protected localYOffset: number;
		protected localYScale: number;
		protected readonly highlightCanvas = new flash.display.Sprite("highlightCanvas");

		constructor(viewPoint: ViewPoint, dataSource: DataSource)
		{
			super(viewPoint, dataSource);
			this.addChild(this.highlightCanvas);
			this.setEnabled(false);
		}

		protected getCloseYPos(context: Context, dataUnit: DataUnit): number
		{
			return this.getYPos(context, dataUnit.getCloseLogValue(context.verticalScaling));
		}

		getLayerName(): string
		{
			return this.layerName;
		}

		protected getPointsForCurrentDetailLevel(param1 = NaN, param2 = NaN): DataUnit[]
		{
			let detailLevel;
			const vp = this.viewPoint;
			if (!isNaN(param1) && !isNaN(param2))
				detailLevel = vp.getDetailLevelForTechnicalStyle(param1, param2);
			else
				detailLevel = vp.getDetailLevelForTechnicalStyle();

			const detailLevelInterval = Const.getDetailLevelInterval(detailLevel);
			return notnull(this.getDataSeries()).getPointsInIntervalArray(detailLevelInterval);
		}

		shouldDisplayOhlcText(dataUnit: DataUnit): boolean
		{
			const enabledChartLayer = this.viewPoint.getDisplayManager().getEnabledChartLayer();
			if (enabledChartLayer !== Const.CANDLE_STICK && enabledChartLayer !== Const.OHLC_CHART)
				return false;

			if (isNaN(dataUnit.open) || isNaN(dataUnit.high) || isNaN(dataUnit.low))
				return false;

			return true;
		}

		protected getOhlcYPos(context: Context, dataUnit: DataUnit)
		{
			return {
				closeY: this.getYPos(context, dataUnit.getCloseLogValue(context.verticalScaling)),
				openY: this.getYPos(context, dataUnit.getOpenLogValue(context.verticalScaling)),
				highY: this.getYPos(context, dataUnit.getHighLogValue(context.verticalScaling)),
				lowY: this.getYPos(context, dataUnit.getLowLogValue(context.verticalScaling))
			};
		}

		private getYPos(context: Context, param2: number): number
		{
			assert(!isNaN(param2));
			return this.localYOffset - this.localYScale * (param2 - context.medPrice);
		}

		getOhlcBasePrice(dataUnit1: DataUnit, dataUnit2: DataUnit | null): number
		{
			if (Const.isZhLocale(i18n.locale.DateTimeLocale.getLocale()))
				return !dataUnit2 ? Number(dataUnit1.open) : dataUnit2.close;

			return -1;
		}

		getCandleStickColor(dataUnit: DataUnit): number
		{
			if (Const.isZhLocale(i18n.locale.DateTimeLocale.getLocale()))
				return dataUnit.close >= dataUnit.open ? Number(Const.POSITIVE_DIFFERENCE_COLOR) : Const.NEGATIVE_DIFFERENCE_COLOR;

			return Const.LINE_CHART_LINE_COLOR;
		}

		clearHighlight()
		{
			this.highlightCanvas.graphics.clear();
		}

		isEnabled(): boolean
		{
			return this.enabled;
		}

		getContext(context: Context, param2 = false)
		{
			if (!this.isEnabled())
				return context;

			const vp = this.viewPoint;
			const displayManager = vp.getDisplayManager().getEnabledChartLayer();
			const _loc4_ = displayManager === Const.LINE_CHART;
			let detailLevel = vp.getDetailLevelForTechnicalStyle(context.lastMinute, context.count);
			const dataSeries = notnull(this.getDataSeries(context));
			let _loc9_ = NaN;
			let _loc10_ = NaN;
			const _loc11_ = context.lastMinute - context.count;
			const lastMinute = context.lastMinute;
			let _loc7_ = 0;
			do
			{
				const _loc17_ = Const.getDetailLevelInterval(detailLevel);
				const points = dataSeries.getPointsInIntervalArray(_loc17_);
				const _loc19_ = Const.getDetailLevelInterval(detailLevel) / 60;
				if (points && points.length > 0 && points[0].relativeMinutes <= lastMinute)
				{
					_loc7_ = dataSeries.getRelativeMinuteIndex(_loc11_, points) - 1;
					if (_loc7_ < 0)
						_loc7_ = 0;

					let lastMinuteIndex = dataSeries.getRelativeMinuteIndex(context.lastMinute, points) + 1;
					if (lastMinuteIndex >= points.length)
						lastMinuteIndex = points.length - 1;

					if (detailLevel < Intervals.DAILY)
					{
						while (_loc7_ < points.length && (isNaN(points[_loc7_].relativeMinutes) || _loc11_ - points[_loc7_].relativeMinutes >= _loc19_))
							_loc7_++;

						while (lastMinuteIndex >= 0 && (isNaN(points[lastMinuteIndex].relativeMinutes) || points[lastMinuteIndex].relativeMinutes - lastMinute >= _loc19_))
							lastMinuteIndex--;
					}
					for (let minuteIndex = lastMinuteIndex; minuteIndex >= _loc7_; minuteIndex--)
					{
						const unit = points[minuteIndex];
						const _loc21_ = !_loc4_ && unit.low ? unit.low : unit.close;
						_loc10_ = Utils.extendedMin(_loc10_, _loc21_);
						const _loc22_ = !_loc4_ && unit.high ? unit.high : unit.close;
						_loc9_ = Utils.extendedMax(_loc9_, _loc22_);
					}
					if (points[0].relativeMinutes - 1 <= _loc11_)
						break;
				}
				detailLevel++;
			}
			while (_loc4_ && detailLevel <= Intervals.WEEKLY && _loc7_ === 0);

			if (isNaN(_loc9_) || isNaN(_loc10_))
				return context;

			let _loc13_ = 0;
			let _loc14_ = 0;
			if (_loc9_ === _loc10_ && !context.maxPrice && !context.minPrice)
			{
				_loc13_ = Number(Math.min(_loc10_, Const.DEFAULT_MAX_RANGE / 2));
				_loc14_ = Number(Const.DEFAULT_MAX_RANGE - _loc13_);
			}
			const _loc15_ = Utils.getLogScaledValue(_loc10_ - _loc13_, context.verticalScaling);
			const _loc16_ = Utils.getLogScaledValue(_loc9_ + _loc14_, context.verticalScaling);
			context.maxRangeUpperBound = Utils.extendedMax(_loc16_, context.maxRangeUpperBound);
			context.maxRangeLowerBound = Utils.extendedMin(_loc15_, context.maxRangeLowerBound);
			context.maxPriceRange = Utils.extendedMax(context.maxRangeUpperBound - context.maxRangeLowerBound, context.maxPriceRange);
			_loc10_ = Utils.getLogScaledValue(_loc10_, context.verticalScaling);
			_loc9_ = Utils.getLogScaledValue(_loc9_, context.verticalScaling);
			context.maxPrice = Utils.extendedMax(context.maxPrice, _loc9_);
			context.minPrice = Utils.extendedMin(context.minPrice, _loc10_);
			context.medPrice = (context.maxPrice + context.minPrice) / 2;
			return context;
		}

		setLayerName(layerName: string)
		{
			this.layerName = layerName;
		}

		protected findPointIndex(x: number): number
		{
			const dataSeries = notnull(this.getDataSeries());
			const points = this.getPointsForCurrentDetailLevel();
			if (!points)
				return -1;

			const minute = this.viewPoint.getMinuteOfX(x);
			let relativeMinuteIndex = dataSeries.getRelativeMinuteIndex(minute, points);
			if (relativeMinuteIndex === points.length - 2)
			{
				if (Math.abs(minute - points[relativeMinuteIndex].relativeMinutes) > Math.abs(minute - points[relativeMinuteIndex + 1].relativeMinutes))
					relativeMinuteIndex++;
			}
			if (this.viewPoint.getDetailLevelForTechnicalStyle() === Intervals.WEEKLY)
			{
				while (relativeMinuteIndex + 1 < points.length && points[relativeMinuteIndex + 1].weeklyXPos <= x)
					relativeMinuteIndex++;
			}
			while (relativeMinuteIndex > 0 && (points[relativeMinuteIndex].fake || points[relativeMinuteIndex].duplicate))
				relativeMinuteIndex--;

			return relativeMinuteIndex;
		}

		highlightPoint(context: Context, x: number, state: Dictionary)
		{
			if (!this.isEnabled())
				return;

			const pointIndex = this.findPointIndex(x);
			const points = this.getPointsForCurrentDetailLevel();
			if (!points || pointIndex === -1)
				return;

			const unit = points[pointIndex];
			const xPos = !isNaN(unit.weeklyXPos) ? Number(unit.weeklyXPos) : this.viewPoint.getXPos(unit);
			const closeYPos = this.getCloseYPos(context, unit);
			if (state[SpaceText.SETTER_STR])
				state[SpaceText.SETTER_STR].clearHighlight();

			const gr = this.highlightCanvas.graphics;
			gr.clear();
			const dataSeries = this.getDataSeries() === this.dataSource.afterHoursData ? Number(Const.AH_DOT_COLOR) : Const.DOT_COLOR;
			gr.lineStyle(5, dataSeries, 1);
			gr.moveTo(xPos, closeYPos - 0.2);
			gr.lineTo(xPos, closeYPos + 0.2);
			state[SpaceText.POINT_STR] = unit;
			state[SpaceText.EXTRA_TEXT_STR] = "";
			state[SpaceText.SETTER_STR] = this;
			state[SpaceText.OHLC_INFO_FLAG_STR] = this.shouldDisplayOhlcText(unit);
			state[SpaceText.OHLC_BASE_PRICE_STR] = this.getOhlcBasePrice(unit, pointIndex === 0 ? null : points[pointIndex - 1]);
		}

		getOhlcColor(dataUnit1: DataUnit, dataUnit2: DataUnit): number
		{
			if (Const.isZhLocale(i18n.locale.DateTimeLocale.getLocale()))
				return dataUnit1.close >= dataUnit1.open ? Number(Const.POSITIVE_DIFFERENCE_COLOR) : Const.NEGATIVE_DIFFERENCE_COLOR;

			return dataUnit1.close >= dataUnit2.close ? Number(Const.POSITIVE_DIFFERENCE_COLOR) : Const.NEGATIVE_DIFFERENCE_COLOR;
		}

		setEnabled(enabled = true)
		{
			this.enabled = enabled;
			this.visible = enabled;
			this.highlightCanvas.visible = enabled;
		}
	}
}
