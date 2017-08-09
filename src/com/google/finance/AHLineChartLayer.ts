/// <reference path="LineChartLayer.ts" />

namespace com.google.finance
{
	// import flash.display.Sprite;

	export class AHLineChartLayer extends LineChartLayer
	{
		private regionsXLimits: com.google.finance.IntervalSet;
		private visibleSessionsTimes: com.google.finance.IntervalSet;

		protected getPoint(param1: DataSeries, param2: number): DataUnit
		{
			const _loc3_ = this.viewPoint.getMinuteOfX(param2);
			let _loc4_ = param1.getRelativeMinuteIndex(_loc3_);
			const _loc5_ = param1.units[_loc4_].time;
			const _loc6_ = notnull(this.visibleSessionsTimes.getIntervalForValue(_loc5_));
			const _loc7_ = DataSource.getTimeIndex(_loc6_.end, param1.units);
			const _loc8_ = this.viewPoint.getSkipInterval().skip;
			_loc4_ = _loc4_ - (_loc4_ - _loc7_) % _loc8_;
			while (param1.units[_loc4_].fake && param1.units[_loc4_].time > _loc6_.start)
				_loc4_--;

			return param1.units[_loc4_];
		}

		getDataSeries(context?: Context): DataSeries
		{
			return this.dataSource.afterHoursData;
		}

		private getVisibleSessionsTimes(context: Context): com.google.finance.IntervalSet
		{
			const _loc2_ = new com.google.finance.IntervalSet();
			const _loc3_ = this.dataSource.visibleExtendedHours;
			for (let _loc4_ = _loc3_.length() - 1; _loc4_ >= 0; _loc4_--)
			{
				const _loc5_ = _loc3_.getIntervalAt(_loc4_);
				const _loc6_ = this.dataSource.afterHoursData.units[_loc5_.start];
				const _loc7_ = this.dataSource.afterHoursData.units[_loc5_.end];
				if (ViewPoint.sessionVisible(_loc6_, _loc7_, context))
					_loc2_.addInterval(_loc6_.time, _loc7_.time);
			}
			return _loc2_;
		}

		private computeMaxRange(context: Context, param2 = false): number
		{
			this.minPrice = Number.POSITIVE_INFINITY;
			this.maxPrice = 0;
			const _loc3_ = this.getVisibleSessionsTimes(context);

			for (let _loc4_ = 0; _loc4_ < _loc3_.length(); _loc4_++)
			{
				const _loc5_ = _loc3_.getIntervalAt(_loc4_);
				this.computeSessionMinMaxPrice(context, _loc5_.start, _loc5_.end);
			}
			return this.maxPrice !== 0 ? this.maxPrice - this.minPrice : 0;
		}

		private computeSessionMinMaxPrice(context: Context, param2: number, param3: number) 
		{
			const _loc4_ = this.getDataSeries();
			const _loc5_ = DataSource.getTimeIndex(param2, _loc4_.units);
			const _loc6_ = DataSource.getTimeIndex(param3, _loc4_.units);

			for (let _loc7_ = _loc5_; _loc7_ < _loc6_; _loc7_++)
			{
				const _loc8_ = _loc4_.units[_loc7_];
				if (_loc8_.close < this.minPrice)
					this.minPrice = _loc8_.close;
				else if (_loc8_.close > this.maxPrice)
					this.maxPrice = _loc8_.close;
			}
		}

		getContext(context: Context, param2 = false) 
		{
			const _loc3_ = this.getDataSeries();
			if (_loc3_.points.length === 0)
				return context;

			const _loc4_ = _loc3_.getFirstRelativeMinute();
			if (context.lastMinute < _loc4_)
				return context;

			if (this.viewPoint.getDetailLevel() > Const.INTRADAY)
				return context;

			/*const _loc5_ = */this.computeMaxRange(context, param2);
			const _loc6_ = this.getMediumPrice(context.lastMinute, context.count, _loc3_, context.verticalScaling);
			let _loc7_ = 0;
			let _loc8_ = 0;
			if (_loc6_.maxPrice === _loc6_.minPrice && !context.maxPrice && !context.minPrice)
			{
				_loc7_ = Math.min(_loc6_.minPrice, Const.DEFAULT_MAX_RANGE / 2);
				_loc8_ = Const.DEFAULT_MAX_RANGE - _loc7_;
			}
			const _loc9_ = Utils.getLogScaledValue(_loc6_.minPrice - _loc7_, context.verticalScaling);
			context.maxRangeLowerBound = Utils.extendedMin(_loc9_, context.maxRangeLowerBound);
			const _loc10_ = Utils.getLogScaledValue(_loc6_.maxPrice + _loc8_, context.verticalScaling);
			context.maxRangeUpperBound = Utils.extendedMax(_loc10_, context.maxRangeUpperBound);
			const _loc11_ = Utils.getLogScaledValue(_loc6_.minPrice, context.verticalScaling);
			const _loc12_ = Utils.getLogScaledValue(_loc6_.maxPrice, context.verticalScaling);
			context.minPrice = Utils.extendedMin(_loc11_, context.minPrice);
			context.maxPrice = Utils.extendedMax(_loc12_, context.maxPrice);
			context.medPrice = (context.minPrice + context.maxPrice) / 2;
			const _loc13_ = context.maxPrice - context.minPrice;
			context.maxPriceRange = Utils.extendedMax(_loc13_, context.maxPriceRange);
			//console.log(Utils.appendObjectMembersAsStrings("context: ", context));
			return context;
		}

		renderLayer(context: Context) 
		{
			const _loc2_ = this.getDataSeries();
			if (_loc2_.points.length === 0)
				return;

			this.visibleSessionsTimes = this.getVisibleSessionsTimes(context);
			this.graphics.clear();
			this.regionsXLimits = new com.google.finance.IntervalSet();
			let vp = this.viewPoint;
			this.localYOffset = this.viewPoint.miny + vp.medPriceY + vp.V_OFFSET;
			this.localYScale = vp.maxPriceRangeViewSize / context.maxPriceRange;

			for (let _loc3_ = 0; _loc3_ < this.visibleSessionsTimes.length(); _loc3_++)
			{
				const _loc4_ = this.visibleSessionsTimes.getIntervalAt(_loc3_);
				this.drawAfterHoursSession(this, _loc4_.start, _loc4_.end, context);
			}
		}

		highlightPoint(context: Context, param2: number, param3: { [key: string]: any }) 
		{
			this.clearHighlight();
			if (!this.regionsXLimits || this.regionsXLimits.length() === 0)
				return;

			const _loc4_ = this.regionsXLimits.getIntervalForValue(param2);
			if (!_loc4_)
				return;

			if (param3["setter"])
				param3["setter"].clearHighlight();

			const _loc5_ = this.getDataSeries();
			if (!_loc5_)
				return;

			const _loc6_ = this.getPoint(_loc5_, param2);
			let vp = this.viewPoint;
			const _loc7_ = vp.getXPos(_loc6_);
			const _loc8_ = this.getYPos(context, _loc6_);
			const gr = this.highlightCanvas.graphics;
			gr.lineStyle(5, Const.AH_DOT_COLOR, 1);
			gr.moveTo(_loc7_, _loc8_ - 0.2);
			gr.lineTo(_loc7_, _loc8_ + 0.2);
			param3["point"] = _loc6_;
			param3["setter"] = this;
			param3["extraText"] = _loc5_.getSessionDisplayNameForMinute(_loc6_.dayMinute) + ": ";
		}

		protected getMediumPrice(param1: number, param2: number, param3: DataSeries, param4: string) 
		{
			return {
				"medPrice": 0,
				"minPrice": this.minPrice,
				"maxPrice": this.maxPrice
			};
		}

		private drawAfterHoursSession(param1: flash.display.Sprite, param2: number, param3: number, param4: Context) 
		{
			const _loc5_ = Const.INTRADAY_INTERVAL / 60;
			const _loc6_ = this.dataSource.afterHoursData.units;
			const _loc7_ = DataSource.getTimeIndex(param3, _loc6_);
			const _loc8_ = DataSource.getTimeIndex(param2, _loc6_);
			let vp = this.viewPoint;
			const _loc9_ = vp.getXPos(_loc6_[_loc7_]);
			let _loc10_ = 1;
			while (this.viewPoint.minutePix * _loc5_ * _loc10_ < vp.POINTS_DISTANCE)
				_loc10_ = _loc10_ * 2;

			let _loc11_ = _loc7_;
			if (_loc6_[_loc11_].relativeMinutes === 0)
			{
				while (_loc6_[_loc11_].time > param2 && _loc6_[_loc11_].fake)
					_loc11_--;
			}
			_loc11_ = _loc11_ + (_loc7_ - _loc11_) % _loc10_;
			let _loc12_ = vp.getXPos(_loc6_[_loc11_]);
			let _loc13_ = this.getYPos(param4, _loc6_[_loc11_]);
			const gr = param1.graphics;
			gr.lineStyle(0, 0, 0);
			gr.beginFill(Const.ECN_LINE_CHART_FILL_COLOR, Const.ECN_LINE_CHART_FILL_VISIBILITY);
			gr.moveTo(_loc12_, this.viewPoint.maxy - 15);
			gr.lineTo(_loc12_, _loc13_);
			gr.lineStyle(Const.ECN_LINE_CHART_LINE_THICKNESS, Const.ECN_LINE_CHART_LINE_COLOR, Const.ECN_LINE_CHART_LINE_VISIBILITY);
			const _loc14_ = _loc10_ * (this.viewPoint.minutePix * _loc5_);
			for (let _loc15_ = _loc11_; _loc15_ > _loc8_; _loc15_ = _loc15_ - _loc10_)
			{
				_loc13_ = this.getYPos(param4, _loc6_[_loc15_]);
				gr.lineTo(_loc12_, _loc13_);
				_loc12_ = _loc12_ - _loc14_;
			}
			gr.lineTo(_loc12_, _loc13_);
			gr.lineStyle(0, 0, 0);
			gr.lineTo(_loc12_, this.viewPoint.maxy - 15);
			gr.endFill();
			this.regionsXLimits.addInterval(_loc12_, _loc9_);
		}
	}
}
