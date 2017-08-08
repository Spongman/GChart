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

		protected highlightCanvas: flash.display.Sprite;

		constructor(param1: ViewPoint, param2: DataSource)
		{
			super(param1, param2);
			this.highlightCanvas = new flash.display.Sprite("highlightCanvas");
			this.addChild(this.highlightCanvas);
			this.setEnabled(false);
		}

		protected getCloseYPos(context: Context, param2: DataUnit): number
		{
			return this.getYPos(context, param2.getCloseLogValue(context.verticalScaling));
		}

		getLayerName(): string
		{
			return this.layerName;
		}

		protected getPointsForCurrentDetailLevel(param1 = NaN, param2 = NaN): DataUnit[]
		{
			let _loc3_ = 0;
			let vp = this.viewPoint;
			if (!isNaN(param1) && !isNaN(param2))
				_loc3_ = vp.getDetailLevelForTechnicalStyle(param1, param2);
			else
				_loc3_ = vp.getDetailLevelForTechnicalStyle();

			let _loc4_ = Const.getDetailLevelInterval(_loc3_);
			return notnull(this.getDataSeries()).getPointsInIntervalArray(_loc4_);
		}

		shouldDisplayOhlcText(param1: DataUnit): boolean
		{
			let _loc2_ = this.viewPoint.getDisplayManager().getEnabledChartLayer();
			if (_loc2_ !== Const.CANDLE_STICK && _loc2_ !== Const.OHLC_CHART)
				return false;

			if (isNaN(param1.open) || isNaN(param1.high) || isNaN(param1.low))
				return false;

			return true;
		}

		protected getOhlcYPos(context: Context, param2: DataUnit) 
		{
			return {
				"closeY": this.getYPos(context, param2.getCloseLogValue(context.verticalScaling)),
				"openY": this.getYPos(context, param2.getOpenLogValue(context.verticalScaling)),
				"highY": this.getYPos(context, param2.getHighLogValue(context.verticalScaling)),
				"lowY": this.getYPos(context, param2.getLowLogValue(context.verticalScaling))
			};
		}

		private getYPos(context: Context, param2: number): number
		{
			assert(!isNaN(param2));
			return this.localYOffset - this.localYScale * (param2 - context.medPrice);
		}

		getOhlcBasePrice(param1: DataUnit, param2: DataUnit | null): number
		{
			if (Const.isZhLocale(com.google.i18n.locale.DateTimeLocale.getLocale()))
				return !param2 ? Number(param1.open) : param2.close;

			return -1;
		}

		getCandleStickColor(param1: DataUnit): number
		{
			if (Const.isZhLocale(com.google.i18n.locale.DateTimeLocale.getLocale()))
				return param1.close >= param1.open ? Number(Const.POSITIVE_DIFFERENCE_COLOR) : Const.NEGATIVE_DIFFERENCE_COLOR;

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

			let vp = this.viewPoint;
			let _loc3_ = vp.getDisplayManager().getEnabledChartLayer();
			let _loc4_ = _loc3_ === Const.LINE_CHART;
			let _loc5_ = vp.getDetailLevelForTechnicalStyle(context.lastMinute, context.count);
			let _loc6_ = notnull(this.getDataSeries(context));
			let _loc9_ = NaN;
			let _loc10_ = NaN;
			let _loc11_ = context.lastMinute - context.count;
			let _loc12_ = context.lastMinute;
			let _loc7_ = 0;
			do
			{
				let _loc17_ = Const.getDetailLevelInterval(_loc5_);
				let _loc18_ = _loc6_.getPointsInIntervalArray(_loc17_);
				let _loc19_ = Const.getDetailLevelInterval(_loc5_) / 60;
				if (_loc18_ && _loc18_.length > 0 && _loc18_[0].relativeMinutes <= _loc12_)
				{
					_loc7_ = _loc6_.getRelativeMinuteIndex(_loc11_, _loc18_) - 1;
					if (_loc7_ < 0)
						_loc7_ = 0;

					let _loc8_ = _loc6_.getRelativeMinuteIndex(context.lastMinute, _loc18_) + 1;
					if (_loc8_ >= _loc18_.length)
						_loc8_ = _loc18_.length - 1;

					if (_loc5_ < Const.DAILY)
					{
						while (_loc7_ < _loc18_.length && (isNaN(_loc18_[_loc7_].relativeMinutes) || _loc11_ - _loc18_[_loc7_].relativeMinutes >= _loc19_))
							_loc7_++;

						while (_loc8_ >= 0 && (isNaN(_loc18_[_loc8_].relativeMinutes) || _loc18_[_loc8_].relativeMinutes - _loc12_ >= _loc19_))
							_loc8_--;
					}
					let _loc23_ = _loc8_;
					while (_loc23_ >= _loc7_)
					{
						let _loc20_ = _loc18_[_loc23_];
						let _loc21_ = !_loc4_ && _loc20_.low ? _loc20_.low : _loc20_.close;
						_loc10_ = Utils.extendedMin(_loc10_, _loc21_);
						let _loc22_ = !_loc4_ && _loc20_.high ? _loc20_.high : _loc20_.close;
						_loc9_ = Utils.extendedMax(_loc9_, _loc22_);
						_loc23_--;
					}
					if (_loc18_[0].relativeMinutes - 1 <= _loc11_)
						break;
				}
				_loc5_++;
			}
			while (_loc4_ && _loc5_ <= Const.WEEKLY && _loc7_ === 0);

			if (isNaN(_loc9_) || isNaN(_loc10_))
				return context;

			let _loc13_ = 0;
			let _loc14_ = 0;
			if (_loc9_ === _loc10_ && !context.maxPrice && !context.minPrice)
			{
				_loc13_ = Number(Math.min(_loc10_, Const.DEFAULT_MAX_RANGE / 2));
				_loc14_ = Number(Const.DEFAULT_MAX_RANGE - _loc13_);
			}
			let _loc15_ = Utils.getLogScaledValue(_loc10_ - _loc13_, context.verticalScaling);
			let _loc16_ = Utils.getLogScaledValue(_loc9_ + _loc14_, context.verticalScaling);
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

		setLayerName(param1: string) 
		{
			this.layerName = param1;
		}

		protected findPointIndex(param1: number): number
		{
			let _loc2_ = notnull(this.getDataSeries());
			let _loc3_ = this.getPointsForCurrentDetailLevel();
			if (!_loc3_)
				return -1;

			let _loc4_ = this.viewPoint.getMinuteOfX(param1);
			let _loc5_ = _loc2_.getRelativeMinuteIndex(_loc4_, _loc3_);
			if (_loc5_ === _loc3_.length - 2)
			{
				if (Math.abs(_loc4_ - _loc3_[_loc5_].relativeMinutes) > Math.abs(_loc4_ - _loc3_[_loc5_ + 1].relativeMinutes))
					_loc5_++;
			}
			if (this.viewPoint.getDetailLevelForTechnicalStyle() === Const.WEEKLY)
			{
				while (_loc5_ + 1 < _loc3_.length && _loc3_[_loc5_ + 1].weeklyXPos <= param1)
					_loc5_++;
			}
			while (_loc5_ > 0 && (_loc3_[_loc5_].fake || _loc3_[_loc5_].duplicate))
				_loc5_--;

			return _loc5_;
		}

		highlightPoint(context: Context, param2: number, param3: { [key: string]: any }) 
		{
			if (!this.isEnabled())
				return;

			let _loc4_ = this.findPointIndex(param2);
			let _loc5_ = this.getPointsForCurrentDetailLevel();
			if (!_loc5_ || _loc4_ === -1)
				return;

			let _loc6_ = _loc5_[_loc4_];
			let _loc7_ = !isNaN(_loc6_.weeklyXPos) ? Number(_loc6_.weeklyXPos) : this.viewPoint.getXPos(_loc6_);
			let _loc8_ = this.getCloseYPos(context, _loc6_);
			if (param3[SpaceText.SETTER_STR])
				param3[SpaceText.SETTER_STR].clearHighlight();

			const gr = this.highlightCanvas.graphics;
			gr.clear();
			let _loc9_ = this.getDataSeries() === this.dataSource.afterHoursData ? Number(Const.AH_DOT_COLOR) : Const.DOT_COLOR;
			gr.lineStyle(5, _loc9_, 1);
			gr.moveTo(_loc7_, _loc8_ - 0.2);
			gr.lineTo(_loc7_, _loc8_ + 0.2);
			param3[SpaceText.POINT_STR] = _loc6_;
			param3[SpaceText.EXTRA_TEXT_STR] = "";
			param3[SpaceText.SETTER_STR] = this;
			param3[SpaceText.OHLC_INFO_FLAG_STR] = this.shouldDisplayOhlcText(_loc6_);
			param3[SpaceText.OHLC_BASE_PRICE_STR] = this.getOhlcBasePrice(_loc6_, _loc4_ === 0 ? null : _loc5_[_loc4_ - 1]);
		}

		getOhlcColor(param1: DataUnit, param2: DataUnit): number
		{
			if (Const.isZhLocale(com.google.i18n.locale.DateTimeLocale.getLocale()))
				return param1.close >= param1.open ? Number(Const.POSITIVE_DIFFERENCE_COLOR) : Const.NEGATIVE_DIFFERENCE_COLOR;

			return param1.close >= param2.close ? Number(Const.POSITIVE_DIFFERENCE_COLOR) : Const.NEGATIVE_DIFFERENCE_COLOR;
		}

		setEnabled(param1 = true) 
		{
			this.enabled = param1;
			this.visible = param1;
			this.highlightCanvas.visible = param1;
		}
	}
}
