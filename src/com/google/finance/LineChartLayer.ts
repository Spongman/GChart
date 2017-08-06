/// <reference path="AbstractDrawingLayer.ts" />

namespace com.google.finance
{
	// import flash.display.Sprite;
	// import flash.geom.Point;

	export class LineChartLayer extends AbstractDrawingLayer<ViewPoint>
	{
		protected localYOffset = 0;

		private realLIndex: number;

		protected maxPrice: number;

		protected minPrice: number;

		private lastHighlightX: number;

		private lastHighlightY: number;

		protected localYScale = 0;

		protected highlightCanvas: flash.display.Sprite;

		private realRIndex: number;

		constructor(param1: ViewPoint, param2: DataSource)
		{
			super(param1, param2);
			this.highlightCanvas = new flash.display.Sprite("highlightCanvas");
			this.addChild(this.highlightCanvas);
		}

		protected drawWeeklyLine(param1: flash.display.Sprite, param2: number, param3: number, param4: ViewPoint, param5: Context): number
		{
			let _loc6_ = param4.getSkipInterval();
			let _loc7_ = this.getDataSeries();
			let _loc8_ = _loc7_.getNextDayStart(param3);
			let _loc9_ = _loc7_.fridays.length - 1;
			while (_loc7_.fridays[_loc9_] > _loc7_.days[_loc8_])
				_loc9_--;

			_loc9_ = _loc9_ + (_loc7_.fridays.length - 1 - _loc9_) % _loc6_.skip;
			_loc9_ = Math.min(_loc9_, _loc7_.fridays.length - 1);
			let _loc10_: DataUnit | null = null;
			while (_loc9_ >= 0 && _loc7_.fridays[_loc9_] >= param2)
			{
				_loc10_ = _loc7_.units[_loc7_.fridays[_loc9_]];
				this.drawLineToDataUnit(param4, param1, param5, _loc10_);
				_loc9_ = _loc9_ - _loc6_.skip;
			}
			return _loc10_ ? Number(param4.getXPos(_loc10_)) : -1;
		}

		private getAvg_(param1: number, param2: number, param3: DataSeries, param4: string): number
		{
			let _loc7_ = 0;
			let _loc15_ = NaN;
			let _loc16_ = 0;
			let _loc18_ = NaN;
			let _loc19_ = 0;
			let _loc20_ = 0;
			let _loc5_ = 0;
			let _loc6_ = 0;
			let _loc8_ = param1 - param2;
			let _loc9_ = param3.getRelativeMinuteIndex(_loc8_ - Math.floor(param2 / 3));
			let _loc10_ = param3.getRelativeMinuteIndex(param1 + Math.floor(param2 / 3));
			if (_loc10_ - _loc9_ <= 0)
				_loc10_ = _loc9_ + 1;

			this.realLIndex = param3.getRelativeMinuteIndex(_loc8_) + 1;
			this.realRIndex = param3.getRelativeMinuteIndex(param1);
			let vp = this.viewPoint;
			let _loc11_ = vp.getXPos(param3.units[this.realLIndex]);
			if (_loc11_ > this.viewPoint.maxx)
				this.realLIndex--;

			let _loc12_ = vp.getXPos(param3.units[this.realRIndex]);
			if (_loc12_ < this.viewPoint.minx)
				this.realRIndex++;

			let _loc13_ = param3.getNextDayStart(_loc10_);
			let _loc14_ = vp.getDetailLevel(param2, param1);
			loop3:
			switch (_loc14_)
			{
				case Const.INTRADAY:
					_loc7_ = param3.days[_loc13_];
					while (true)
					{
						if (_loc7_ < _loc9_)
							break loop3;

						let _loc17_ = this.getDayAvg(_loc7_, _loc9_, _loc10_, param1, param2, param3, param4);
						_loc5_ = Number(_loc5_ + _loc17_.sum);
						_loc6_ = _loc6_ + _loc17_.cnt;
						_loc18_ = param3.getPrevDayStart(_loc7_);
						if (_loc18_ === -1)
							break loop3;

						_loc7_ = param3.days[_loc18_];
					}
				case Const.DAILY:
				case Const.WEEKLY:
					_loc7_ = _loc13_;
					_loc15_ = param2 / param3.marketDayLength;
					_loc16_ = Math.floor(_loc15_ / 80);
					if (_loc16_ <= 0)
						_loc16_ = 1;

					while (param3.days[_loc7_] >= _loc9_ && _loc7_ >= 0)
					{
						_loc5_ = Number(_loc5_ + param3.units[param3.days[_loc7_]].getCloseLogValue(param4));
						_loc19_ = 0;
						while (_loc19_ < _loc16_)
						{
							_loc20_ = _loc7_ - _loc19_;
							if (_loc20_ < 0)
								break;

							if (param3.days[_loc20_] >= this.realLIndex && param3.days[_loc20_] <= this.realRIndex)
								this.checkMinMax(param3.units[param3.days[_loc20_]].getCloseLogValue(param4));

							_loc19_++;
						}
						_loc6_ = _loc6_ + 1;
						_loc7_ = _loc7_ - _loc16_;
					}
			}
			return _loc5_ / _loc6_;
		}

		private getDayAvg(param1: number, param2: number, param3: number, param4: number, param5: number, param6: DataSeries, param7: string) 
		{
			let _loc12_ = NaN;
			let _loc8_ = this.viewPoint;
			let _loc9_ = param6.units;
			let _loc10_ = {
				"cnt": 0,
				"sum": 0
			};
			let _loc11_ = param6.marketDayLength * (_loc8_.maxx - _loc8_.minx) / param5;
			if (param1 > 0 && _loc9_[param1 - 1].dayMinute === param6.marketCloseMinute)
			{
				_loc12_ = _loc9_[param1].getCloseLogValue(param7);
				if (param1 >= this.realLIndex && param1 <= this.realRIndex)
					this.checkMinMax(_loc12_);

				return {
					"sum": _loc12_,
					"cnt": 1
				};
			}
			let _loc13_ = 1;
			let _loc14_ = param6.marketDayLength / (Const.INTRADAY_INTERVAL / 60);
			let _loc15_ = _loc11_ / _loc14_;
			while (_loc15_ * _loc13_ < _loc8_.POINTS_DISTANCE)
				_loc13_ = _loc13_ * 2;

			let _loc16_ = param1 - _loc14_ + 1;
			while (param1 > _loc16_ && param1 > param2)
			{
				if (param1 < _loc16_)
					param1 = param2;

				if (param1 > param2 && param1 < param3)
				{
					_loc12_ = _loc9_[param1].getCloseLogValue(param7);
					if (param1 >= this.realLIndex - 1 && param1 <= this.realRIndex + 1)
					{
						if (_loc12_ < this.minPrice)
							this.minPrice = _loc12_;
						else if (_loc12_ > this.maxPrice)
							this.maxPrice = _loc12_;
					}
					_loc10_.sum = _loc10_.sum + _loc12_;
					_loc10_.cnt++;
				}
				param1 = param1 - _loc13_;
			}
			return _loc10_;
		}

		private computeMaxRange2(param1: number, param2: number, param3: string, param4 = false) 
		{
			return this.computeMaximizedMaxRange(param1, param2);
		}

		protected normalizeMedPrice(param1: MinMaxMedPrice, param2: number): number
		{
			if (param1.medPrice !== 0)
			{
				if (param1.maxPrice - param1.medPrice > param2 / 2)
					return (param1.maxPrice + param1.minPrice) / 2;

				if (param1.medPrice - param1.minPrice > param2 / 2)
					return (param1.maxPrice + param1.minPrice) / 2;

				if (param1.medPrice < param2 / 2)
					return param2 / 2;
			}
			return param1.medPrice;
		}

		private getPrevOrNextClosestToX(param1: DataUnit[], param2: number[], param3: number, param4: number, param5: number): number
		{
			let _loc6_ = NaN;
			let _loc7_ = NaN;
			if (param3 >= param5)
			{
				_loc6_ = this.viewPoint.getMinuteXPos(param1[param2[param3 - param5]].relativeMinutes);
				_loc7_ = this.viewPoint.getMinuteXPos(param1[param2[param3]].relativeMinutes);
				if (Math.abs(_loc6_ - param4) < Math.abs(_loc7_ - param4))
					return param2[param3 - 1];
			}
			return param2[param3];
		}

		protected drawDayLine(param1: flash.display.Sprite, param2: number, param3: ViewPoint, param4: number, param5: number, param6: Context): number
		{
			let _loc11_ = NaN;
			let _loc12_ = NaN;
			let _loc7_ = this.getDataSeries();
			let _loc8_ = _loc7_.units;
			let _loc9_ = Const.INTRADAY_INTERVAL / 60;
			let _loc10_ = Math.floor(_loc7_.marketDayLength / _loc9_);
			if (_loc8_[param2].dayMinute !== _loc7_.marketCloseMinute)
				return -1;

			if (param2 === 0)
				return 0;

			if (_loc8_[param2 - 1].dayMinute === _loc7_.marketCloseMinute)
			{
				_loc11_ = param3.getXPos(_loc8_[param2 - 1]);
				_loc12_ = this.getYPos(param6, _loc8_[param2 - 1]);
				param1.graphics.lineTo(_loc11_, _loc12_);
				return _loc11_;
			}
			let _loc13_ = 1;
			while (param3.minutePix * _loc9_ * _loc13_ < param3.POINTS_DISTANCE)
				_loc13_ = _loc13_ * 2;

			let _loc14_ = _loc7_.getSessionIndex(_loc8_[param2].dayMinute);
			let _loc15_ = Math.max(_loc14_, 0);
			let _loc16_ = param2 - _loc10_ - _loc15_;
			let _loc17_ = param2;
			if (_loc8_[_loc17_].relativeMinutes === 0 && _loc8_[_loc17_].fake)
			{
				while (_loc8_[_loc17_].fake)
					_loc17_--;

				_loc11_ = param3.getXPos(_loc8_[_loc17_]);
				let _loc23_ = new flash.display.Point(_loc11_, this.viewPoint.maxy);
				//this.globalToLocal(_loc23_);	// TODO: ?
				param1.graphics.lineStyle(0, 0, 0);
				param1.graphics.moveTo(_loc23_.x, _loc23_.y);
				param1.graphics.lineTo(_loc23_.x, this.getYPos(param6, _loc8_[param2]));
				param1.graphics.lineStyle(this.lineThickness, this.lineColor, this.lineVisibility);
			}
			while (param2 > _loc17_)
				param2 = param2 - _loc13_;

			let _loc18_ = param2;
			while (param2 > param5 && param2 > param4)
				param2 = param2 - _loc13_;

			let _loc19_ = param3.getXPos(_loc8_[param2]);
			let _loc20_ = _loc13_ * (param3.minutePix * _loc9_);
			let _loc21_ = _loc13_ * _loc9_;
			let _loc22_ = _loc8_[param2].relativeMinutes;
			while (param2 >= _loc16_ && param2 >= param4)
			{
				_loc12_ = this.getYPos(param6, _loc8_[param2]);
				param1.graphics.lineTo(_loc19_, _loc12_);
				param2 = param2 - _loc13_;
				if (param2 > _loc16_ && param2 > param4 && _loc22_ - _loc8_[param2 - 1].relativeMinutes === _loc21_)
					param2--;

				if (param2 >= _loc16_ && param2 >= param4)
					_loc22_ = _loc8_[param2].relativeMinutes;

				_loc19_ = _loc19_ - _loc20_;
			}
			_loc11_ = param3.getXPos(_loc8_[_loc16_]);
			_loc12_ = this.getYPos(param6, _loc8_[_loc16_]);
			param1.graphics.lineTo(_loc11_, _loc12_);
			return _loc11_;
		}

		highlightPoint(param1: Context, param2: number, param3: { [key: string]: any }) 
		{
			if (param3[SpaceText.SETTER_STR])
				param3[SpaceText.SETTER_STR].clearHighlight();

			let _loc4_ = this.getDataSeries();
			let _loc5_ = this.getPoint(_loc4_, param2);
			let _loc6_ = this.viewPoint.getMinuteXPos(_loc5_.relativeMinutes);
			let _loc7_ = this.getYPos(param1, _loc5_);
			if (this.lastHighlightX !== _loc6_ || this.lastHighlightY !== _loc7_)
			{
				this.clearHighlight();
				this.highlightCanvas.graphics.lineStyle(5, Const.DOT_COLOR, 1);
				this.highlightCanvas.graphics.moveTo(_loc6_, _loc7_ - 0.2);
				this.highlightCanvas.graphics.lineTo(_loc6_, _loc7_ + 0.2);
				param3[SpaceText.POINT_STR] = _loc5_;
				param3[SpaceText.EXTRA_TEXT_STR] = "";
				param3[SpaceText.SETTER_STR] = this;
				this.lastHighlightX = _loc6_;
				this.lastHighlightY = _loc7_;
			}
		}

		protected getMediumPrice(param1: number, param2: number, param3: DataSeries, param4: string): MinMaxMedPrice
		{
			let _loc5_ = 0;
			let _loc7_ = param3.getRelativeMinuteIndex(param1);
			let _loc8_ = param3.units[_loc7_].getCloseLogValue(param4);
			this.minPrice = _loc8_;
			this.maxPrice = _loc8_;
			_loc5_ = Number(this.getAvg_(param1, param2, param3, param4));
			return {
				"medPrice": _loc5_,
				"minPrice": this.minPrice,
				"maxPrice": this.maxPrice
			};
		}

		protected drawLine(param1: flash.display.Sprite, param2: number, param3: number, param4: ViewPoint, param5: Context): number
		{
			let _loc14_ = NaN;
			let _loc6_ = this.getDataSeries();
			let _loc7_ = _loc6_.units;
			param1.graphics.lineStyle(this.lineThickness, this.lineColor, this.lineVisibility);
			let _loc8_ = _loc6_.getNextDayStart(param3);
			let _loc9_ = 1;
			let _loc10_ = param4.minutePix * _loc6_.marketDayLength;
			while (_loc10_ * _loc9_ < param4.POINTS_DISTANCE)
				_loc9_++;

			let _loc11_ = _loc7_[_loc6_.days[_loc8_]];
			let _loc12_ = param4.getXPos(_loc11_) + 1;
			let _loc13_ = this.getYPos(param5, _loc11_);
			param1.graphics.moveTo(_loc12_, this.viewPoint.maxy);
			param1.graphics.lineStyle(0, 0, 0);
			param1.graphics.lineTo(_loc12_, _loc13_);
			param1.graphics.lineStyle(this.lineThickness, this.lineColor, this.lineVisibility);
			switch (param4.getDetailLevel())
			{
				case Const.INTRADAY:
					while (_loc8_ >= 0 && _loc6_.days[_loc8_] >= param2)
					{
						param1.graphics.lineStyle(0, 0, 0);
						_loc11_ = _loc7_[_loc6_.days[_loc8_]];
						param1.graphics.lineTo(_loc12_, param4.maxy);
						param1.graphics.lineTo(param4.getXPos(_loc11_), param4.maxy);
						this.drawLineToDataUnit(param4, param1, param5, _loc11_);
						param1.graphics.lineStyle(this.lineThickness, this.lineColor, this.lineVisibility);
						_loc12_ = this.drawDayLine(param1, _loc6_.days[_loc8_], param4, param2, param3, param5);
						_loc8_--;
					}
					_loc11_ = _loc7_[param2];
					return param4.getXPos(_loc11_);
				case Const.DAILY:
					while (_loc8_ >= 0 && _loc6_.days[_loc8_] >= param2)
					{
						_loc11_ = _loc7_[_loc6_.days[_loc8_]];
						this.drawLineToDataUnit(param4, param1, param5, _loc11_);
						_loc8_--;
					}
					return param4.getXPos(_loc11_);
				case Const.WEEKLY:
					_loc14_ = this.drawWeeklyLine(param1, param2, param3, param4, param5);
					return _loc14_;
				default:
					return -1;
			}
		}

		protected getYPos(param1: Context, param2: DataUnit): number
		{
			return this.localYOffset - (param2.getCloseLogValue(param1.verticalScaling) - param1.medPrice) * this.localYScale;
		}

		private checkMinMax(param1: number) 
		{
			if (param1 < this.minPrice)
				this.minPrice = param1;
			else if (param1 > this.maxPrice)
				this.maxPrice = param1;
		}

		renderLayer(param1: Context) 
		{
			let _loc2_ = this.viewPoint;
			let _loc3_ = this.getDataSeries();
			if (_loc3_.points.length === 0)
				return;

			this.graphics.clear();
			let _loc4_ = _loc3_.getRelativeMinuteIndex(_loc2_.getLastMinute());
			if (_loc4_ < _loc3_.points.length - 1)
				_loc4_ = _loc4_ + 1;

			let _loc5_ = _loc3_.getRelativeMinuteIndex(_loc2_.getFirstMinute()) - 1;
			if (_loc5_ < 0)
				_loc5_ = 0;

			this.lineThickness = Const.LINE_CHART_LINE_THICKNESS;
			this.lineColor = Const.LINE_CHART_LINE_COLOR;
			this.lineVisibility = Const.LINE_CHART_LINE_VISIBILITY;
			this.graphics.beginFill(Const.LINE_CHART_FILL_COLOR, Const.LINE_CHART_FILL_VISIBILITY);
			this.localYOffset = _loc2_.miny + _loc2_.medPriceY + _loc2_.V_OFFSET;
			this.localYScale = _loc2_.maxPriceRangeViewSize / param1.maxPriceRange;
			let _loc6_ = this.drawLine(this, _loc5_, _loc4_, _loc2_, param1);
			this.graphics.lineStyle(0, 0, 0);
			let _loc7_ = new flash.display.Point(_loc6_, _loc2_.maxy);
			//this.globalToLocal(_loc7_);	// TODO: ?
			this.graphics.lineTo(_loc7_.x, _loc7_.y);
			this.graphics.endFill();
		}

		private getPointIndex(param1: DataSeries, param2: number): number
		{
			let _loc3_ = NaN;
			let _loc9_ = NaN;
			let _loc4_ = this.viewPoint.getMinuteOfX(param2);
			let _loc5_ = param1.getRelativeMinuteIndex(_loc4_);
			while (param1.units[_loc5_].fake && _loc5_ > 0)
				_loc5_--;

			let _loc6_ = this.viewPoint.getSkipInterval();
			let _loc7_ = _loc6_.skip;
			let _loc8_ = _loc6_.interval;
			if (_loc8_ < Const.DAILY_INTERVAL)
			{
				_loc3_ = param1.getNextDayStart(_loc5_);
				return _loc5_ + (param1.days[_loc3_] - _loc5_) % _loc7_;
			}
			if (_loc8_ === Const.DAILY_INTERVAL)
			{
				_loc3_ = param1.getNextDayStart(_loc5_ + 1);
				return this.getPrevOrNextClosestToX(param1.units, param1.days, _loc3_, param2, 1);
			}
			_loc9_ = param1.getNextWeekEnd(_loc5_);
			_loc9_ = _loc9_ - (param1.fridays.length - 1 - _loc9_) % _loc7_;
			_loc9_ = Math.min(_loc9_, param1.fridays.length - 1);
			return this.getPrevOrNextClosestToX(param1.units, param1.fridays, _loc9_, param2, _loc7_);
		}

		protected drawLineToDataUnit(param1: ViewPoint, param2: flash.display.Sprite, param3: Context, param4: DataUnit) 
		{
			let _loc5_ = param1.getXPos(param4);
			let _loc6_ = this.getYPos(param3, param4);
			param2.graphics.lineTo(_loc5_, _loc6_);
		}

		protected getPoint(param1: DataSeries, param2: number): DataUnit
		{
			return param1.units[this.getPointIndex(param1, param2)];
		}

		getDataSeries(param1?: Context): DataSeries
		{
			return this.dataSource.data;
		}

		getContext(param1: Context, param2 = false) 
		{
			let _loc3_ = this.viewPoint;
			let _loc4_ = this.dataSource.data;
			if (_loc4_.units.length === 0)
				return param1;

			let _loc5_ = this.computeMaxRange2(param1.lastMinute, param1.count, param1.verticalScaling, param2);
			if (!_loc5_)
				return param1;

			let _loc6_ = Utils.getLogScaledValue(_loc5_.lowerBound, param1.verticalScaling);
			param1.maxRangeLowerBound = Utils.extendedMin(_loc6_, param1.maxRangeLowerBound);
			let _loc7_ = Utils.getLogScaledValue(_loc5_.upperBound, param1.verticalScaling);
			param1.maxRangeUpperBound = Utils.extendedMax(_loc7_, param1.maxRangeUpperBound);
			let _loc8_ = param1.verticalScaling !== Const.LOG_VSCALE && param1.verticalScaling !== Const.NEW_LOG_VSCALE ? Number(_loc5_.range) : _loc7_ - _loc6_;
			param1.maxPriceRange = Utils.extendedMax(_loc8_, param1.maxPriceRange);
			let _loc9_ = this.getMediumPrice(param1.lastMinute, param1.count, _loc4_, param1.verticalScaling);
			let _loc10_ = this.normalizeMedPrice(_loc9_, param1.maxPriceRange);
			param1.medPrice = (Utils.extendedMax(_loc10_, param1.medPrice) + Utils.extendedMin(_loc10_, param1.medPrice)) / 2;
			param1.minPrice = Utils.extendedMin(this.minPrice, param1.minPrice);
			param1.maxPrice = Utils.extendedMax(this.maxPrice, param1.maxPrice);
			let _loc11_ = param1.maxPrice - param1.minPrice;
			param1.maxPriceRange = Utils.extendedMax(_loc11_, param1.maxPriceRange);
			param1.medPrice = this.normalizeMedPrice(param1, param1.maxPriceRange);
			return param1;
		}

		private computeMaximizedMaxRange(param1: number, param2: number) 
		{
			let _loc7_ = NaN;
			let _loc8_ = NaN;
			let _loc15_ = NaN;
			let _loc17_ = NaN;
			let _loc3_ = this.dataSource.data;
			let _loc4_ = _loc3_.units;
			let _loc5_ = _loc3_.days;
			let _loc6_ = _loc3_.fridays;
			let _loc9_ = this.viewPoint.getDetailLevel(param2, param1);
			let _loc10_ = _loc3_.getRelativeMinuteIndex(param1);
			let _loc11_ = _loc4_[_loc10_];
			let _loc12_ = _loc11_.close;
			let _loc13_ = _loc11_.close;
			let _loc14_ = param1 - param2;
			if (_loc9_ <= Const.INTRADAY)
			{
				if (_loc11_.relativeMinutes <= _loc14_)
					return null;

				while (_loc10_ >= 0)
				{
					_loc11_ = _loc4_[_loc10_];
					if (_loc11_.relativeMinutes < _loc14_)
						break;

					_loc7_ = !!_loc11_.low ? _loc11_.low : _loc11_.close;
					if (_loc7_ < _loc12_)
						_loc12_ = _loc7_;

					_loc8_ = !!_loc11_.high ? _loc11_.high : _loc11_.close;
					if (_loc8_ > _loc13_)
						_loc13_ = _loc8_;

					_loc10_--;
				}
				if (_loc10_ >= 0)
				{
					_loc12_ = Utils.extendedMin(_loc12_, !!_loc11_.low ? _loc11_.low : _loc11_.close);
					_loc13_ = Utils.extendedMax(_loc13_, !!_loc11_.high ? _loc11_.high : _loc11_.close);
				}
			}
			else
			{
				let _loc16_: number[];
				if (_loc9_ <= Const.DAILY)
				{
					_loc15_ = _loc3_.getNextDayStart(_loc10_);
					_loc16_ = _loc3_.days;
				}
				else
				{
					_loc15_ = _loc3_.getNextWeekEnd(_loc10_);
					_loc16_ = _loc3_.fridays;
				}
				_loc15_ = Math.min(_loc15_ + 1, _loc16_.length - 1);
				while (_loc15_ >= 0)
				{
					_loc11_ = _loc4_[_loc16_[_loc15_]];
					if (_loc11_.relativeMinutes < _loc14_)
						break;

					_loc7_ = !!_loc11_.low ? Number(_loc11_.low) : _loc11_.close;
					if (_loc7_ < _loc12_)
						_loc12_ = _loc7_;

					_loc8_ = !!_loc11_.high ? Number(_loc11_.high) : _loc11_.close;
					if (_loc8_ > _loc13_)
						_loc13_ = _loc8_;

					_loc15_--;
				}
				if (_loc15_ >= 0)
				{
					_loc12_ = Utils.extendedMin(_loc12_, !!_loc11_.low ? _loc11_.low : _loc11_.close);
					_loc13_ = Utils.extendedMax(_loc13_, !!_loc11_.high ? _loc11_.high : _loc11_.close);
				}
			}
			if (_loc13_ === _loc12_)
			{
				_loc17_ = Math.min(_loc13_ * 2, Const.DEFAULT_MAX_RANGE);
				return {
					"upperBound": _loc17_,
					"lowerBound": 0,
					"range": _loc17_
				};
			}
			return {
				"upperBound": _loc13_,
				"lowerBound": _loc12_,
				"range": _loc13_ - _loc12_
			};
		}

		clearHighlight() 
		{
			this.highlightCanvas.graphics.clear();
		}
	}
}
