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

		static getParameterNames():string[] { return []; }

		constructor(param1: ViewPoint, param2: DataSource)
		{
			super(param1, param2);
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
			for (let _loc3_ = 0; _loc3_ < IndicatorLayer.COLORS.length; _loc3_++)
			{
				let _loc4_ = new flash.text.TextField();
				_loc4_.selectable = false;
				_loc4_.textColor = this.getColor(_loc3_);
				_loc4_.defaultTextFormat = new flash.text.TextFormat(IndicatorLayer.INDICATOR_TEXT_FONT, IndicatorLayer.INDICATOR_TEXT_FONT_SIZE, _loc4_.textColor);
				_loc4_.width = IndicatorLayer.INDICATOR_TEXT_WIDTH;
				_loc4_.height = IndicatorLayer.INDICATOR_TEXT_HEIGHT;
				this.textOutCanvas.addChild(_loc4_);
				this.indicatorValueTextArray.push(_loc4_);
			}
		}

		private getIntervalText(param1: number): string
		{
			switch (param1)
			{
				case Const.INTRADAY:
					return "2m";
				case Const.FIVE_MINUTES:
					return "5m";
				case Const.HALF_HOUR:
					return "30m";
				case Const.DAILY:
					return "1d";
				case Const.WEEKLY:
					return "1w";
				default:
					return "";
			}
		}

		getIndicatorName(): string
		{
			return this.indicatorName;
		}

		private renderHistogramLine(param1: DataSeries[], param2: number, param3: number, param4: number, param5: ViewPoint, param6: Context, param7: number, param8: string) 
		{
			let _loc13_ = 0;
			let _loc14_ = 0;
			let _loc9_ = Number.MAX_VALUE;
			let _loc11_ = this.getYPos(param6, new IndicatorPoint(0, <DataUnit><any>null));	// TODO
			let _loc12_ = param4;
			while (_loc12_ >= param3)
			{
				if (!isNaN(param1[param2].points[_loc12_].getValue()))
				{
					let _loc10_ = param1[param2].points[_loc12_].getPoint();
					if (param7 === Const.WEEKLY && param8 !== Const.LINE_CHART)
						_loc9_ = this.getWeeklyBarXPos(_loc10_, _loc9_);

					_loc13_ = !isNaN(_loc10_.weeklyXPos) ? _loc10_.weeklyXPos : param5.getXPos(_loc10_);
					_loc14_ = this.getYPos(param6, param1[param2].points[_loc12_]);
					this.graphics.lineStyle(1, this.getColor(param2, param1[param2].points[_loc12_].getValue()));
					this.graphics.moveTo(_loc13_, _loc11_);
					this.graphics.lineTo(_loc13_, _loc14_);
				}
				_loc12_--;
			}
		}

		private renderSingleLine(param1: DataSeries[], param2: number, param3: number, param4: number, param5: ViewPoint, param6: Context, param7: number, param8: string) 
		{
			let _loc12_ = 0;
			let _loc13_ = 0;
			let _loc9_ = Number.MAX_VALUE;
			let _loc10_ = param1[param2].points[param4].getPoint();
			if (param7 === Const.WEEKLY && param8 !== Const.LINE_CHART)
				_loc9_ = this.getWeeklyBarXPos(_loc10_, _loc9_);

			this.graphics.lineStyle(1, this.indicatorValueTextArray[param2].textColor);
			this.graphics.moveTo(!isNaN(_loc10_.weeklyXPos) ? Number(_loc10_.weeklyXPos) : param5.getXPos(_loc10_), this.getYPos(param6, param1[param2].points[param4]));
			let _loc11_ = param4 - 1;
			while (_loc11_ >= param3)
			{
				if (!isNaN(param1[param2].points[_loc11_].getValue()))
				{
					_loc10_ = param1[param2].points[_loc11_].getPoint();
					if (param7 === Const.WEEKLY && param8 !== Const.LINE_CHART)
						_loc9_ = this.getWeeklyBarXPos(_loc10_, _loc9_);

					_loc12_ = !isNaN(_loc10_.weeklyXPos) ? _loc10_.weeklyXPos : param5.getXPos(_loc10_);
					_loc13_ = this.getYPos(param6, param1[param2].points[_loc11_]);
					if (_loc13_ < param5.miny)
						this.graphics.moveTo(_loc12_, param5.miny);
					else if (_loc13_ > param5.maxy)
						this.graphics.moveTo(_loc12_, param5.maxy);
					else
						this.graphics.lineTo(_loc12_, _loc13_);
				}
				_loc11_--;
			}
		}

		private renderHistogramLineFromBottom(param1: DataSeries[], param2: number, param3: number, param4: number, param5: ViewPoint, param6: Context, param7: number, param8: string) 
		{
			let _loc12_ = 0;
			let _loc13_ = 0;
			let _loc9_ = Number.MAX_VALUE;
			this.graphics.lineStyle(1, this.indicatorValueTextArray[param2].textColor);
			let _loc11_ = param4;
			while (_loc11_ >= param3)
			{
				if (!isNaN(param1[param2].points[_loc11_].getValue()))
				{
					let _loc10_ = param1[param2].points[_loc11_].getPoint();
					if (param7 === Const.WEEKLY && param8 !== Const.LINE_CHART)
						_loc9_ = this.getWeeklyBarXPos(_loc10_, _loc9_);

					_loc12_ = !isNaN(_loc10_.weeklyXPos) ? _loc10_.weeklyXPos : param5.getXPos(_loc10_);
					_loc13_ = this.getYPos(param6, param1[param2].points[_loc11_]);
					this.graphics.moveTo(_loc12_, this.viewPoint.maxy);
					this.graphics.lineTo(_loc12_, _loc13_);
				}
				_loc11_--;
			}
		}

		protected getYPos(context: Context, param2: IndicatorPoint): number
		{
			return 0;
		}

		protected drawMedianLine(param1: number = -1, param2: flash.display.Sprite) 
		{
			if (param1 === -1)
				param1 = IndicatorLayer.MEDIAN_LINE_COLOR;

			if (!param2)
				param2 = this.medianLineCanvas;

			let _loc3_ = this.localYOffset;
			let _loc4_ = this.viewPoint.minx;
			let _loc5_ = this.viewPoint.maxx;
			let _loc6_ = 0;
			param2.graphics.lineStyle(1, param1);
			do
			{
				param2.graphics.moveTo(_loc4_ + _loc6_ * this.dashSize, _loc3_);
				param2.graphics.lineTo(_loc4_ + (_loc6_ + 1) * this.dashSize, _loc3_);
				_loc6_ = Number(_loc6_ + 2);
			}
			while (_loc4_ + _loc6_ * this.dashSize < _loc5_);
		}

		protected drawAHighlightDot(param1: number, param2: number, param3: number) 
		{
			this.highlightCanvas.graphics.lineStyle(5, param3, 1);
			this.highlightCanvas.graphics.moveTo(param1, param2 - 0.2);
			this.highlightCanvas.graphics.lineTo(param1, param2 + 0.2);
		}

		set enabled(param1: string) 
		{
			this._enabled = param1 === IndicatorLayer.TRUE_STR;
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

		highlightPoint(context: Context, param2: number, param3: { [key: string]: any }) 
		{
			let _loc12_ = 0;
			let _loc13_ = 0;
			let _loc14_ = 0;
			if (!this._enabled)
				return;

			this.clearHighlight();
			let _loc4_ = this.viewPoint;
			let _loc5_ = _loc4_.getDetailLevelForTechnicalStyle();
			let _loc6_ = this.getIntervalText(_loc5_);
			let _loc7_ = this.getDataSeriesArray(_loc5_);
			if (!_loc7_)
				return;

			let _loc8_ = this.findPointIndex(param2);
			if (_loc8_ === -1)
				return;

			for (let _loc11_ = 0; _loc11_ < _loc7_.length; _loc11_++)
			{
				let point = _loc7_[_loc11_].points[_loc8_];
				if (!point)
					continue;	// TODO:
				let _loc9_ = point.getPoint();
				let _loc10_ = point.getValue();
				if (!isNaN(_loc10_))
				{
					_loc12_ = !isNaN(_loc9_.weeklyXPos) ? _loc9_.weeklyXPos : _loc4_.getXPos(_loc9_);
					switch (this.getLineStyle(_loc11_))
					{
						case IndicatorLineStyle.SIMPLE_LINE:
							_loc13_ = this.getYPos(context, point);
							if (_loc13_ < _loc4_.maxy && _loc13_ > _loc4_.miny)
								this.drawAHighlightDot(_loc12_, _loc13_, this.indicatorValueTextArray[_loc11_].textColor);

							_loc10_ = Math.round(_loc10_ * 100) / 100;
							this.indicatorValueTextArray[_loc11_].text = this.getIndicatorValueText(_loc11_, _loc10_, _loc6_, context);
							break;
						case IndicatorLineStyle.HISTOGRAM_LINE:
							_loc14_ = this.getYPos(context, new IndicatorPoint(0, <DataUnit><any>null)); // TODO
							_loc13_ = this.getYPos(context, point);
							this.drawAHighlightLine(_loc12_, _loc14_, _loc12_, _loc13_, this.getColor(_loc11_, point.getValue()));
							_loc10_ = Math.round(_loc10_ * 100) / 100;
							this.indicatorValueTextArray[_loc11_].text = this.getIndicatorValueText(_loc11_, _loc10_, _loc6_, context);
							break;
						case IndicatorLineStyle.HISTOGRAM_LINE_FROM_BOTTOM:
							_loc13_ = this.getYPos(context, point);
							this.drawAHighlightLine(_loc12_, _loc4_.maxy, _loc12_, _loc13_, this.indicatorValueTextArray[_loc11_].textColor);
							_loc10_ = Math.round(_loc10_ * 100) / 100;
							this.indicatorValueTextArray[_loc11_].text = this.getIndicatorValueText(_loc11_, _loc10_, _loc6_, context);
							break;
						case IndicatorLineStyle.NONE:
							break;
					}
				}
			}
			let _loc11_ = _loc7_.length;
			while (_loc11_ < this.indicatorValueTextArray.length)
			{
				this.indicatorValueTextArray[_loc11_].text = "";
				_loc11_++;
			}
		}

		private doCopyLastIndicatorPoint(param1: DataUnit, param2: DataSeries[])
		{
			let _loc5_ = 0;
			let _loc3_ = new IndicatorPoint(NaN, param1);
			for (let _loc4_ = 0; _loc4_ < param2.length; _loc4_++)
			{
				_loc5_ = param2[_loc4_].points.length;
				if (_loc5_ > 0)
					param2[_loc4_].points.push(new IndicatorPoint(param2[_loc4_].points[_loc5_ - 1].getValue(), param1));
				else
					param2[_loc4_].points.push(_loc3_);

				_loc4_++;
			}
		}

		protected findPointIndex(param1: number): number
		{
			let _loc2_ = this.viewPoint;
			let _loc3_ = this.originalDataSeries;
			let _loc4_ = _loc2_.getDetailLevelForTechnicalStyle();
			let _loc5_ = Const.getDetailLevelInterval(_loc4_);
			let _loc6_ = _loc3_.getPointsInIntervalArray(_loc5_);
			if (!_loc6_)
				return -1;

			let _loc7_ = _loc2_.getMinuteOfX(param1);
			let _loc8_ = _loc3_.getRelativeMinuteIndex(_loc7_, _loc6_);
			if (_loc8_ === _loc6_.length - 2)
			{
				if (Math.abs(_loc7_ - _loc6_[_loc8_].relativeMinutes) > Math.abs(_loc7_ - _loc6_[_loc8_ + 1].relativeMinutes))
					_loc8_++;
			}
			if (_loc4_ === Const.WEEKLY)
			{
				while (_loc8_ + 1 < _loc6_.length && _loc6_[_loc8_ + 1].weeklyXPos <= param1)
					_loc8_++;
			}
			while (_loc8_ > 0 && (_loc6_[_loc8_].fake || _loc6_[_loc8_].duplicate))
			{
				_loc8_--;
			}
			return _loc8_;
		}

		protected drawAHighlightLine(param1: number, param2: number, param3: number, param4: number, param5: number) 
		{
			this.highlightCanvas.graphics.lineStyle(2, param5);
			this.highlightCanvas.graphics.moveTo(param1, param2);
			this.highlightCanvas.graphics.lineTo(param3, param4);
		}

		copyLastIndicatorPoint(param1: DataUnit, ...rest: DataSeries[]) 
		{
			this.doCopyLastIndicatorPoint(param1, rest);
		}

		setIndicator(param1: string, param2: DataSeries) 
		{
			this.indicatorName = param1;
			if (this.dataSource.indicators[param1] === undefined)
				this.dataSource.indicators[param1] = new Indicator();

			this.indicator = this.dataSource.indicators[param1];
			this.originalDataSeries = param2;
			this.setIndicatorInstanceArray(Const.INDICATOR_PARAMETERS[param1]);
		}

		protected getIndicatorNameText(param1: string): string
		{
			return "";
		}

		shouldSkip(param1: DataUnit, ...rest: DataSeries[]): boolean
		{
			if (param1.duplicate)
			{
				let _loc3_ = new IndicatorPoint(NaN, param1);
				for (let _loc4_ = 0; _loc4_ < rest.length; _loc4_++)
				{
					rest[_loc4_].points.push(_loc3_);
				}
				return true;
			}
			if (param1.fake)
			{
				this.doCopyLastIndicatorPoint(param1, rest);
				return true;
			}
			return false;
		}

		computeIntervalIndicator(param1: number)
		{
		}

		renderLayer(param1: Context) 
		{
			this.placeIndicatorNameAndValueTexts();
			if (!this._enabled)
				return;

			this.graphics.clear();
			let _loc2_ = this.viewPoint;
			let _loc3_ = _loc2_.getDetailLevelForTechnicalStyle();
			let _loc4_ = Const.getDetailLevelInterval(_loc3_);
			let _loc5_ = this.originalDataSeries;
			let _loc6_ = _loc5_.getPointsInIntervalArray(_loc4_);
			if (!_loc6_)
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
			let _loc7_ = this.getDataSeriesArray(_loc3_);
			if (!_loc7_)
				return;

			let _loc8_ = this.getIntervalText(_loc3_);
			if (this.indicatorNameText)
				this.indicatorNameText.text = this.getIndicatorNameText(_loc8_);

			this.calculateLocalScaleMeters(param1);
			let _loc9_ = _loc5_.getRelativeMinuteIndex(_loc2_.getLastMinute(), _loc6_);
			if (_loc9_ < _loc6_.length - 1)
				_loc9_ = _loc9_ + 1;

			let _loc10_ = this.getLastRealPointIndex(_loc6_);
			if (_loc9_ > _loc10_)
				_loc9_ = _loc10_;

			let _loc11_ = _loc5_.getRelativeMinuteIndex(_loc2_.getFirstMinute(), _loc6_) - 1;
			if (_loc11_ < 0)
				_loc11_ = 0;

			let _loc12_ = this.viewPoint.getDisplayManager().getEnabledChartLayer();
			for (let _loc13_ = 0; _loc13_ < _loc7_.length; _loc13_++)
			{
				let points = _loc7_[_loc13_].points;

				let _loc15_ = _loc9_;
				if (_loc15_ > points.length - 1)
					_loc15_ = points.length - 1;	// TODO: never

				let _loc16_ = _loc11_;
				let _loc17_ = points.length;
				while (_loc16_ < _loc17_ && isNaN(points[_loc16_].getValue()))
					_loc16_++;

				while (_loc15_ >= 0 && isNaN(points[_loc15_].getValue()))
					_loc15_--;

				if (_loc16_ > _loc15_)
				{
					this.indicatorValueTextArray[_loc13_].text = this.getIndicatorValueText(_loc13_, 0, _loc8_, param1);
				}
				else
				{
					switch (this.getLineStyle(_loc13_))
					{
						case IndicatorLineStyle.SIMPLE_LINE:
							this.renderSingleLine(_loc7_, _loc13_, _loc16_, _loc15_, _loc2_, param1, _loc3_, _loc12_);
							break;
						case IndicatorLineStyle.HISTOGRAM_LINE:
							this.renderHistogramLine(_loc7_, _loc13_, _loc16_, _loc15_, _loc2_, param1, _loc3_, _loc12_);
							break;
						case IndicatorLineStyle.HISTOGRAM_LINE_FROM_BOTTOM:
							this.renderHistogramLineFromBottom(_loc7_, _loc13_, _loc16_, _loc15_, _loc2_, param1, _loc3_, _loc12_);
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

		getDataSeriesArray(param1: number, param2?: Context): DataSeries[] | null
		{
			let _loc6_ = 0;
			let _loc3_ = Const.getDetailLevelInterval(param1);
			let _loc4_ = this.originalDataSeries;
			let _loc5_ = _loc4_.getPointsInIntervalArray(_loc3_);
			if (!_loc5_ || _loc5_.length === 0)
				return null;

			if (!this.indicator.hasInterval(_loc3_))
			{
				if (this.isOhlcDataRequired())
				{
					_loc6_ = 0;
					while (_loc6_ < _loc5_.length)
					{
						if (isNaN(_loc5_[_loc6_].high) || isNaN(_loc5_[_loc6_].low) || isNaN(_loc5_[_loc6_].open))
							return null;

						_loc6_++;
					}
				}
				this.computeIntervalIndicator(_loc3_);
			}
			return this.indicator.getDataSeriesArray(_loc3_);
		}

		isOhlcDataRequired(): boolean
		{
			return false;
		}

		protected getIndicatorValueText(param1: number, param2: number, param3: string, param4: Context): string
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

		public setIndicatorInstanceArray(param1: any[])
		{
		}

		protected placeIndicatorNameAndValueTexts() 
		{
			if (this.indicatorNameText)
			{
				this.indicatorNameText.y = this.viewPoint.miny + IndicatorLayer.TEXT_TOP_MARGIN;
				this.indicatorNameText.x = this.viewPoint.minx + IndicatorLayer.TEXT_LEFT_MARGIN;
			}
			for (let _loc1_ = 0; _loc1_ < this.indicatorValueTextArray.length; _loc1_++)
			{
				this.indicatorValueTextArray[_loc1_].y = this.viewPoint.miny + IndicatorLayer.TEXT_TOP_MARGIN;
				this.indicatorValueTextArray[_loc1_].x = this.viewPoint.minx + IndicatorLayer.TEXT_LEFT_MARGIN + (!!this.indicatorNameText ? _loc1_ + 1 : _loc1_) * IndicatorLayer.INDICATOR_TEXT_WIDTH;
			}
		}

		setEnabled(param1 = true) 
		{
			this._enabled = param1;
			this.visible = param1;
			this.highlightCanvas.visible = param1;
			this.textOutCanvas.visible = param1;
			this.medianLineCanvas.visible = param1;
		}
	}
}
