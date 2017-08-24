/// <reference path="AbstractDrawingLayer.ts" />

namespace com.google.finance
{
	// import flash.display.Sprite;
	// import flash.geom.Point;

	export class LineChartLayer extends AbstractDrawingLayer<ViewPoint>
	{
		private realLIndex: number;
		private lastHighlightX: number;
		private lastHighlightY: number;
		private realRIndex: number;

		protected localYOffset = 0;
		protected maxPrice: number;
		protected minPrice: number;
		protected localYScale = 0;
		protected highlightCanvas = new flash.display.Sprite("highlightCanvas");

		constructor(viewPoint: ViewPoint, dataSource: DataSource)
		{
			super(viewPoint, dataSource);
			this.addChild(this.highlightCanvas);
		}

		protected drawWeeklyLine(sprite: flash.display.Sprite, param2: number, param3: number, viewPoint: ViewPoint, context: Context): number
		{
			const skipInterval = viewPoint.getSkipInterval();
			const dataSeries = this.getDataSeries();
			const tNextDayStart = dataSeries.getNextDayStart(param3);
			let _loc9_ = dataSeries.fridays.length - 1;
			while (dataSeries.fridays[_loc9_] > dataSeries.days[tNextDayStart])
				_loc9_--;

			_loc9_ += (dataSeries.fridays.length - 1 - _loc9_) % skipInterval.skip;
			_loc9_ = Math.min(_loc9_, dataSeries.fridays.length - 1);
			let _loc10_: DataUnit | null = null;
			while (_loc9_ >= 0 && dataSeries.fridays[_loc9_] >= param2)
			{
				_loc10_ = dataSeries.units[dataSeries.fridays[_loc9_]];
				this.drawLineToDataUnit(viewPoint, sprite, context, _loc10_);
				_loc9_ -= skipInterval.skip;
			}
			return _loc10_ ? Number(viewPoint.getXPos(_loc10_)) : -1;
		}

		private getAvg_(param1: number, param2: number, dataSeries: DataSeries, param4: string): number
		{
			let _loc7_ = 0;
			let _loc5_ = 0;
			let _loc6_ = 0;
			const _loc8_ = param1 - param2;
			const _loc9_ = dataSeries.getRelativeMinuteIndex(_loc8_ - Math.floor(param2 / 3));
			let _loc10_ = dataSeries.getRelativeMinuteIndex(param1 + Math.floor(param2 / 3));
			if (_loc10_ - _loc9_ <= 0)
				_loc10_ = _loc9_ + 1;

			this.realLIndex = dataSeries.getRelativeMinuteIndex(_loc8_) + 1;
			this.realRIndex = dataSeries.getRelativeMinuteIndex(param1);
			let vp = this.viewPoint;
			const xPosMax = vp.getXPos(dataSeries.units[this.realLIndex]);
			if (xPosMax > this.viewPoint.maxx)
				this.realLIndex--;

			const xPosMin = vp.getXPos(dataSeries.units[this.realRIndex]);
			if (xPosMin < this.viewPoint.minx)
				this.realRIndex++;

			const nextDayStart = dataSeries.getNextDayStart(_loc10_);
			const detailLevel = vp.getDetailLevel(param2, param1);
			loop3:
			switch (detailLevel)
			{
				case Intervals.INTRADAY:
					_loc7_ = dataSeries.days[nextDayStart];
					while (true)
					{
						if (_loc7_ < _loc9_)
							break loop3;

						const dayAvg = this.getDayAvg(_loc7_, _loc9_, _loc10_, param1, param2, dataSeries, param4);
						_loc5_ = Number(_loc5_ + dayAvg.sum);
						_loc6_ += dayAvg.cnt;
						const prevDayStart = dataSeries.getPrevDayStart(_loc7_);
						if (prevDayStart === -1)
							break loop3;

						_loc7_ = dataSeries.days[prevDayStart];
					}
				case Intervals.DAILY:
				case Intervals.WEEKLY:
					_loc7_ = nextDayStart;
					const _loc15_ = param2 / dataSeries.marketDayLength;
					let _loc16_ = Math.floor(_loc15_ / 80);
					if (_loc16_ <= 0)
						_loc16_ = 1;

					while (dataSeries.days[_loc7_] >= _loc9_ && _loc7_ >= 0)
					{
						_loc5_ = Number(_loc5_ + dataSeries.units[dataSeries.days[_loc7_]].getCloseLogValue(param4));
						for (let _loc19_ = 0; _loc19_ < _loc16_; _loc19_++)
						{
							const _loc20_ = _loc7_ - _loc19_;
							if (_loc20_ < 0)
								break;

							if (dataSeries.days[_loc20_] >= this.realLIndex && dataSeries.days[_loc20_] <= this.realRIndex)
								this.checkMinMax(dataSeries.units[dataSeries.days[_loc20_]].getCloseLogValue(param4));

						}
						_loc6_++;
						_loc7_ -= _loc16_;
					}
			}
			return _loc5_ / _loc6_;
		}

		private getDayAvg(param1: number, param2: number, param3: number, param4: number, param5: number, dataSeries: DataSeries, param7: string) 
		{
			const viewPoint = this.viewPoint;
			const units = dataSeries.units;
			const _loc10_ = {
				cnt: 0,
				sum: 0
			};
			const _loc11_ = dataSeries.marketDayLength * (viewPoint.maxx - viewPoint.minx) / param5;
			if (param1 > 0 && units[param1 - 1].dayMinute === dataSeries.marketCloseMinute)
			{
				const closeLogValue = units[param1].getCloseLogValue(param7);
				if (param1 >= this.realLIndex && param1 <= this.realRIndex)
					this.checkMinMax(closeLogValue);

				return {
					sum: closeLogValue,
					cnt: 1
				};
			}
			let _loc13_ = 1;
			const _loc14_ = dataSeries.marketDayLength / (Const.INTRADAY_INTERVAL / 60);
			const _loc15_ = _loc11_ / _loc14_;
			while (_loc15_ * _loc13_ < viewPoint.POINTS_DISTANCE)
				_loc13_ *= 2;

			const _loc16_ = param1 - _loc14_ + 1;
			while (param1 > _loc16_ && param1 > param2)
			{
				if (param1 < _loc16_)
					param1 = param2;

				if (param1 > param2 && param1 < param3)
				{
					const closeLogValue = units[param1].getCloseLogValue(param7);
					if (param1 >= this.realLIndex - 1 && param1 <= this.realRIndex + 1)
					{
						if (closeLogValue < this.minPrice)
							this.minPrice = closeLogValue;
						else if (closeLogValue > this.maxPrice)
							this.maxPrice = closeLogValue;
					}
					_loc10_.sum += closeLogValue;
					_loc10_.cnt++;
				}
				param1 -= _loc13_;
			}
			return _loc10_;
		}

		private computeMaxRange2(param1: number, param2: number, param3: string, param4 = false) 
		{
			return this.computeMaximizedMaxRange(param1, param2);
		}

		protected normalizeMedPrice(minMaxMedPrice: MinMaxMedPrice, param2: number): number
		{
			if (minMaxMedPrice.medPrice !== 0)
			{
				if (minMaxMedPrice.maxPrice - minMaxMedPrice.medPrice > param2 / 2)
					return (minMaxMedPrice.maxPrice + minMaxMedPrice.minPrice) / 2;

				if (minMaxMedPrice.medPrice - minMaxMedPrice.minPrice > param2 / 2)
					return (minMaxMedPrice.maxPrice + minMaxMedPrice.minPrice) / 2;

				if (minMaxMedPrice.medPrice < param2 / 2)
					return param2 / 2;
			}
			return minMaxMedPrice.medPrice;
		}

		private getPrevOrNextClosestToX(dataUnits: DataUnit[], param2: number[], param3: number, param4: number, param5: number): number
		{
			if (param3 >= param5)
			{
				const minuteXPos1 = this.viewPoint.getMinuteXPos(dataUnits[param2[param3 - param5]].relativeMinutes);
				const minuteXPos2 = this.viewPoint.getMinuteXPos(dataUnits[param2[param3]].relativeMinutes);
				if (Math.abs(minuteXPos1 - param4) < Math.abs(minuteXPos2 - param4))
					return param2[param3 - 1];
			}
			return param2[param3];
		}

		protected drawDayLine(sprite: flash.display.Sprite, param2: number, viewPoint: ViewPoint, param4: number, param5: number, context: Context): number
		{
			const dataSeries = this.getDataSeries();
			const units = dataSeries.units;
			const _loc9_ = Const.INTRADAY_INTERVAL / 60;
			const _loc10_ = Math.floor(dataSeries.marketDayLength / _loc9_);
			if (units[param2].dayMinute !== dataSeries.marketCloseMinute)
				return -1;

			if (param2 === 0)
				return 0;

			const gr = sprite.graphics;
			if (units[param2 - 1].dayMinute === dataSeries.marketCloseMinute)
			{
				const xPos = viewPoint.getXPos(units[param2 - 1]);
				const yPos = this.getYPos(context, units[param2 - 1]);
				gr.lineTo(xPos, yPos);
				return xPos;
			}
			let _loc13_ = 1;
			while (viewPoint.minutePix * _loc9_ * _loc13_ < viewPoint.POINTS_DISTANCE)
				_loc13_ *= 2;

			const sessionIndex = dataSeries.getSessionIndex(units[param2].dayMinute);
			const _loc15_ = Math.max(sessionIndex, 0);
			const _loc16_ = param2 - _loc10_ - _loc15_;
			let _loc17_ = param2;
			if (units[_loc17_].relativeMinutes === 0 && units[_loc17_].fake)
			{
				while (units[_loc17_].fake)
					_loc17_--;

				const xPos = viewPoint.getXPos(units[_loc17_]);
				const point = new flash.display.Point(xPos, this.viewPoint.maxy);
				//this.globalToLocal(_loc23_);	// TODO: ?
				gr.lineStyle(0, 0, 0);
				gr.moveTo(point.x, point.y);
				gr.lineTo(point.x, this.getYPos(context, units[param2]));
				gr.lineStyle(this.lineThickness, this.lineColor, this.lineVisibility);
			}
			while (param2 > _loc17_)
				param2 -= _loc13_;

			//const _loc18_ = param2;
			while (param2 > param5 && param2 > param4)
				param2 -= _loc13_;

			let xPos = viewPoint.getXPos(units[param2]);
			const _loc20_ = _loc13_ * (viewPoint.minutePix * _loc9_);
			const _loc21_ = _loc13_ * _loc9_;
			let _loc22_ = units[param2].relativeMinutes;
			while (param2 >= _loc16_ && param2 >= param4)
			{
				const yPos = this.getYPos(context, units[param2]);
				gr.lineTo(xPos, yPos);
				param2 -= _loc13_;
				if (param2 > _loc16_ && param2 > param4 && _loc22_ - units[param2 - 1].relativeMinutes === _loc21_)
					param2--;

				if (param2 >= _loc16_ && param2 >= param4)
					_loc22_ = units[param2].relativeMinutes;

				xPos -= _loc20_;
			}
			const xPos2 = viewPoint.getXPos(units[_loc16_]);
			const yPos2 = this.getYPos(context, units[_loc16_]);
			gr.lineTo(xPos2, yPos2);
			return xPos2;
		}

		highlightPoint(context: Context, param2: number, state: Dictionary) 
		{
			if (state[SpaceText.SETTER_STR])
				state[SpaceText.SETTER_STR].clearHighlight();

			const dataSeries = this.getDataSeries();
			const point = this.getPoint(dataSeries, param2);
			const minuteXPos = this.viewPoint.getMinuteXPos(point.relativeMinutes);
			const yPos = this.getYPos(context, point);
			if (this.lastHighlightX !== minuteXPos || this.lastHighlightY !== yPos)
			{
				this.clearHighlight();
				const gr = this.highlightCanvas.graphics;
				gr.lineStyle(5, Const.DOT_COLOR, 1);
				gr.moveTo(minuteXPos, yPos - 0.2);
				gr.lineTo(minuteXPos, yPos + 0.2);
				state[SpaceText.POINT_STR] = point;
				state[SpaceText.EXTRA_TEXT_STR] = "";
				state[SpaceText.SETTER_STR] = this;
				this.lastHighlightX = minuteXPos;
				this.lastHighlightY = yPos;
			}
		}

		protected getMediumPrice(param1: number, param2: number, dataSeries: DataSeries, param4: string): MinMaxMedPrice
		{
			const relativeMinuteIndex = dataSeries.getRelativeMinuteIndex(param1);
			const etCloseLogValue = dataSeries.units[relativeMinuteIndex].getCloseLogValue(param4);
			this.minPrice = etCloseLogValue;
			this.maxPrice = etCloseLogValue;
			return {
				medPrice: Number(this.getAvg_(param1, param2, dataSeries, param4)),
				minPrice: this.minPrice,
				maxPrice: this.maxPrice
			};
		}

		protected drawLine(sprite: flash.display.Sprite, param2: number, param3: number, viewPoint: ViewPoint, context: Context): number
		{
			const dataSeries = this.getDataSeries();
			const units = dataSeries.units;
			const gr = sprite.graphics;
			gr.lineStyle(this.lineThickness, this.lineColor, this.lineVisibility);
			let nextDayStart = dataSeries.getNextDayStart(param3);
			let _loc9_ = 1;
			const _loc10_ = viewPoint.minutePix * dataSeries.marketDayLength;
			while (_loc10_ * _loc9_ < viewPoint.POINTS_DISTANCE)
				_loc9_++;

			let _loc11_ = units[dataSeries.days[nextDayStart]];
			let _loc12_ = viewPoint.getXPos(_loc11_) + 1;
			const _loc13_ = this.getYPos(context, _loc11_);
			gr.moveTo(_loc12_, this.viewPoint.maxy);
			gr.lineStyle(0, 0, 0);
			gr.lineTo(_loc12_, _loc13_);
			gr.lineStyle(this.lineThickness, this.lineColor, this.lineVisibility);
			switch (viewPoint.getDetailLevel())
			{
				case Intervals.INTRADAY:
					while (nextDayStart >= 0 && dataSeries.days[nextDayStart] >= param2)
					{
						gr.lineStyle(0, 0, 0);
						_loc11_ = units[dataSeries.days[nextDayStart]];
						gr.lineTo(_loc12_, viewPoint.maxy);
						gr.lineTo(viewPoint.getXPos(_loc11_), viewPoint.maxy);
						this.drawLineToDataUnit(viewPoint, sprite, context, _loc11_);
						gr.lineStyle(this.lineThickness, this.lineColor, this.lineVisibility);
						_loc12_ = this.drawDayLine(sprite, dataSeries.days[nextDayStart], viewPoint, param2, param3, context);
						nextDayStart--;
					}
					_loc11_ = units[param2];
					return viewPoint.getXPos(_loc11_);
				case Intervals.DAILY:
					while (nextDayStart >= 0 && dataSeries.days[nextDayStart] >= param2)
					{
						_loc11_ = units[dataSeries.days[nextDayStart]];
						this.drawLineToDataUnit(viewPoint, sprite, context, _loc11_);
						nextDayStart--;
					}
					return viewPoint.getXPos(_loc11_);
				case Intervals.WEEKLY:
					return this.drawWeeklyLine(sprite, param2, param3, viewPoint, context);
				default:
					return -1;
			}
		}

		protected getYPos(context: Context, dataUnit: DataUnit): number
		{
			return this.localYOffset - (dataUnit.getCloseLogValue(context.verticalScaling) - context.medPrice) * this.localYScale;
		}

		private checkMinMax(param1: number) 
		{
			if (param1 < this.minPrice)
				this.minPrice = param1;
			else if (param1 > this.maxPrice)
				this.maxPrice = param1;
		}

		renderLayer(context: Context) 
		{
			const viewPoint = this.viewPoint;
			const dataSeries = this.getDataSeries();
			if (dataSeries.points.length === 0)
				return;

			const gr = this.graphics;
			gr.clear();
			let lastMinuteIndex = dataSeries.getRelativeMinuteIndex(viewPoint.getLastMinute());
			if (lastMinuteIndex < dataSeries.points.length - 1)
				lastMinuteIndex++;

			let firstMinuteIndex = dataSeries.getRelativeMinuteIndex(viewPoint.getFirstMinute()) - 1;
			if (firstMinuteIndex < 0)
				firstMinuteIndex = 0;

			this.lineThickness = Const.LINE_CHART_LINE_THICKNESS;
			this.lineColor = Const.LINE_CHART_LINE_COLOR;
			this.lineVisibility = Const.LINE_CHART_LINE_VISIBILITY;
			gr.beginFill(Const.LINE_CHART_FILL_COLOR, Const.LINE_CHART_FILL_VISIBILITY);
			this.localYOffset = viewPoint.miny + viewPoint.medPriceY + viewPoint.V_OFFSET;
			this.localYScale = viewPoint.maxPriceRangeViewSize / context.maxPriceRange;
			const _loc6_ = this.drawLine(this, firstMinuteIndex, lastMinuteIndex, viewPoint, context);
			gr.lineStyle(0, 0, 0);
			const point = new flash.display.Point(_loc6_, viewPoint.maxy);
			//this.globalToLocal(_loc7_);	// TODO: ?
			gr.lineTo(point.x, point.y);
			gr.endFill();
		}

		private getPointIndex(dataSeries: DataSeries, param2: number): number
		{
			const _loc4_ = this.viewPoint.getMinuteOfX(param2);
			let _loc5_ = dataSeries.getRelativeMinuteIndex(_loc4_);
			while (dataSeries.units[_loc5_].fake && _loc5_ > 0)
				_loc5_--;

			const _loc6_ = this.viewPoint.getSkipInterval();
			const skip = _loc6_.skip;
			const interval = _loc6_.interval;
			if (interval < Const.DAILY_INTERVAL)
			{
				const _loc3_ = dataSeries.getNextDayStart(_loc5_);
				return _loc5_ + (dataSeries.days[_loc3_] - _loc5_) % skip;
			}
			if (interval === Const.DAILY_INTERVAL)
			{
				const _loc3_ = dataSeries.getNextDayStart(_loc5_ + 1);
				return this.getPrevOrNextClosestToX(dataSeries.units, dataSeries.days, _loc3_, param2, 1);
			}
			let _loc9_ = dataSeries.getNextWeekEnd(_loc5_);
			_loc9_ -= (dataSeries.fridays.length - 1 - _loc9_) % skip;
			_loc9_ = Math.min(_loc9_, dataSeries.fridays.length - 1);
			return this.getPrevOrNextClosestToX(dataSeries.units, dataSeries.fridays, _loc9_, param2, skip);
		}

		protected drawLineToDataUnit(viewPoint: ViewPoint, sprite: flash.display.Sprite, context: Context, dataUnit: DataUnit) 
		{
			const xPos = viewPoint.getXPos(dataUnit);
			const yPos = this.getYPos(context, dataUnit);
			sprite.graphics.lineTo(xPos, yPos);
		}

		protected getPoint(dataSeries: DataSeries, param2: number): DataUnit
		{
			return dataSeries.units[this.getPointIndex(dataSeries, param2)];
		}

		getDataSeries(context?: Context): DataSeries
		{
			return this.dataSource.data;
		}

		getContext(context: Context, param2 = false) 
		{
			//const _loc3_ = this.viewPoint;
			const data = this.dataSource.data;
			if (data.units.length === 0)
				return context;

			const _loc5_ = this.computeMaxRange2(context.lastMinute, context.count, context.verticalScaling, param2);
			if (!_loc5_)
				return context;

			const _loc6_ = Utils.getLogScaledValue(_loc5_.lowerBound, context.verticalScaling);
			context.maxRangeLowerBound = Utils.extendedMin(_loc6_, context.maxRangeLowerBound);
			const _loc7_ = Utils.getLogScaledValue(_loc5_.upperBound, context.verticalScaling);
			context.maxRangeUpperBound = Utils.extendedMax(_loc7_, context.maxRangeUpperBound);
			const _loc8_ = context.verticalScaling !== Const.LOG_VSCALE && context.verticalScaling !== Const.NEW_LOG_VSCALE ? Number(_loc5_.range) : _loc7_ - _loc6_;
			context.maxPriceRange = Utils.extendedMax(_loc8_, context.maxPriceRange);
			const _loc9_ = this.getMediumPrice(context.lastMinute, context.count, data, context.verticalScaling);
			const _loc10_ = this.normalizeMedPrice(_loc9_, context.maxPriceRange);
			context.medPrice = (Utils.extendedMax(_loc10_, context.medPrice) + Utils.extendedMin(_loc10_, context.medPrice)) / 2;
			context.minPrice = Utils.extendedMin(this.minPrice, context.minPrice);
			context.maxPrice = Utils.extendedMax(this.maxPrice, context.maxPrice);
			const _loc11_ = context.maxPrice - context.minPrice;
			context.maxPriceRange = Utils.extendedMax(_loc11_, context.maxPriceRange);
			context.medPrice = this.normalizeMedPrice(context, context.maxPriceRange);
			return context;
		}

		private computeMaximizedMaxRange(param1: number, param2: number) 
		{
			const data = this.dataSource.data;
			const units = data.units;
			//const _loc5_ = _loc3_.days;
			//const _loc6_ = _loc3_.fridays;
			const _loc9_ = this.viewPoint.getDetailLevel(param2, param1);
			let _loc10_ = data.getRelativeMinuteIndex(param1);
			let _loc11_ = units[_loc10_];
			let _loc12_ = _loc11_.close;
			let _loc13_ = _loc11_.close;
			const _loc14_ = param1 - param2;
			if (_loc9_ <= Intervals.INTRADAY)
			{
				if (_loc11_.relativeMinutes <= _loc14_)
					return null;

				while (_loc10_ >= 0)
				{
					let _loc11_ = units[_loc10_];
					if (_loc11_.relativeMinutes < _loc14_)
						break;

					const _loc7_ = !!_loc11_.low ? _loc11_.low : _loc11_.close;
					if (_loc7_ < _loc12_)
						_loc12_ = _loc7_;

					const _loc8_ = !!_loc11_.high ? _loc11_.high : _loc11_.close;
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
				let _loc15_: number;
				let _loc16_: number[];
				if (_loc9_ <= Intervals.DAILY)
				{
					_loc15_ = data.getNextDayStart(_loc10_);
					_loc16_ = data.days;
				}
				else
				{
					_loc15_ = data.getNextWeekEnd(_loc10_);
					_loc16_ = data.fridays;
				}
				_loc15_ = Math.min(_loc15_ + 1, _loc16_.length - 1);
				while (_loc15_ >= 0)
				{
					_loc11_ = units[_loc16_[_loc15_]];
					if (_loc11_.relativeMinutes < _loc14_)
						break;

					const _loc7_ = !!_loc11_.low ? Number(_loc11_.low) : _loc11_.close;
					if (_loc7_ < _loc12_)
						_loc12_ = _loc7_;

					const _loc8_ = !!_loc11_.high ? Number(_loc11_.high) : _loc11_.close;
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
				const _loc17_ = Math.min(_loc13_ * 2, Const.DEFAULT_MAX_RANGE);
				return {
					upperBound: _loc17_,
					lowerBound: 0,
					range: _loc17_
				};
			}
			return {
				upperBound: _loc13_,
				lowerBound: _loc12_,
				range: _loc13_ - _loc12_
			};
		}

		clearHighlight() 
		{
			this.highlightCanvas.graphics.clear();
		}
	}
}
