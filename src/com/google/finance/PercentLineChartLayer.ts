namespace com.google.finance
{
	// import flash.geom.Point;

	export class PercentLineChartLayer extends LineChartLayer
	{
		private localStartPrice = 0;

		constructor(param1: ViewPoint, param2: DataSource)
		{
			super(param1, param2);
		}

		protected calculatePercentChangeBase(param1 = 0): number
		{
			let _loc2_ = this.getDataSeries();
			let _loc3_ = _loc2_.units;
			return _loc3_[param1].close;
		}

		protected getYPos(param1: Context, param2: DataUnit): number
		{
			return this.localYOffset + param1.plusSize - (Utils.getLogScaledValue(param2.close / this.localStartPrice, param1.verticalScaling) - Utils.getLogScaledValue(1, param1.verticalScaling)) * this.localYScale;
		}

		private getQuoteText(param1: string): string
		{
			let _loc2_ = Utils.getSymbolFromTicker(param1);
			switch (_loc2_)
			{
				case ".INX":
					return "S&P500";
				case ".DJI":
					return "Dow";
				case ".IXIC":
					return "Nasd";
				default:
					return _loc2_;
			}
		}

		protected getRange(param1: number, param2: number) 
		{
			let _loc3_ = this.getDataSeries();
			if (!_loc3_)
				return null;

			let _loc4_ = _loc3_.units;
			if (!_loc4_ || _loc4_.length === 0)
				return null;

			let _loc5_ = _loc3_.getRelativeMinuteIndex(param1 - param2);
			let _loc6_ = _loc3_.getRelativeMinuteIndex(param1) + 1;
			if (_loc6_ <= _loc5_ + 1)
				_loc6_ = _loc5_ + 2;

			_loc6_ = Math.min(_loc6_, _loc4_.length - 1);
			let _loc7_ = _loc4_[_loc5_].close;
			let _loc8_ = _loc4_[_loc5_].close;
			let _loc9_ = _loc5_;
			while (_loc9_ <= _loc6_)
			{
				if (_loc4_[_loc9_].close < _loc7_)
					_loc7_ = _loc4_[_loc9_].close;
				else if (_loc4_[_loc9_].close > _loc8_)
					_loc8_ = _loc4_[_loc9_].close;

				_loc9_++;
			}
			return {
				"startPrice": this.calculatePercentChangeBase(_loc5_),
				"minPrice": _loc7_,
				"maxPrice": _loc8_
			};
		}

		getContext(param1: Context, param2 = false) 
		{
			let _loc3_ = this.viewPoint;
			let _loc4_ = this.getRange(param1.lastMinute, param1.count);
			if (!_loc4_)
				return param1;

			let _loc5_ = Utils.getLogScaledValue(_loc4_.maxPrice / _loc4_.startPrice, param1.verticalScaling);
			param1.plusVariation = Utils.extendedMax(_loc5_, param1.plusVariation);
			let _loc6_ = Utils.getLogScaledValue(_loc4_.minPrice / _loc4_.startPrice, param1.verticalScaling);
			param1.minusVariation = Utils.extendedMin(_loc6_, param1.minusVariation);
			param1.scaleVariation = param1.plusVariation - param1.minusVariation;
			param1.localYAdjustment = param1.plusVariation - Utils.getLogScaledValue(1, param1.verticalScaling);
			param1.plusSize = param1.localYAdjustment * (_loc3_.maxPriceRangeViewSize - 20) / param1.scaleVariation;
			return param1;
		}

		renderLayer(param1: Context) 
		{
			let _loc2_ = this.viewPoint;
			let _loc3_ = this.getDataSeries();
			let _loc4_ = _loc3_.points;
			const gr = this.graphics;
			gr.clear();
			let _loc5_ = _loc3_.getRelativeMinuteIndex(_loc2_.getLastMinute()) + 1;
			_loc5_ = Math.min(_loc5_, _loc4_.length - 1);
			let _loc6_ = _loc3_.getRelativeMinuteIndex(_loc2_.getFirstMinute());
			_loc6_ = Math.max(_loc6_, 0);
			let _loc7_ = new flash.display.Point(_loc2_.maxx, _loc2_.maxy + 1);
			//this.globalToLocal(_loc7_);
			this.localYOffset = _loc2_.miny + ViewPoint.MIN_EDGE_DISTANCE / 2;
			this.localYScale = (_loc2_.maxPriceRangeViewSize - 20) / param1.scaleVariation;
			this.localStartPrice = this.calculatePercentChangeBase(_loc6_);
			let _loc8_ = this.drawLine(this, _loc6_, _loc5_, _loc2_, param1);
			let _loc9_ = new flash.display.Point(_loc8_, _loc2_.maxy);
			gr.lineStyle(0, 0, 0);
			//this.globalToLocal(_loc9_);	// TODO:?
			gr.lineTo(_loc9_.x, _loc9_.y);
		}

		highlightPoint(param1: Context, param2: number, param3: { [key: string]: any }) 
		{
			this.clearHighlight();
			let _loc4_ = this.getDataSeries();
			let _loc6_ = this.viewPoint.getXPos(_loc4_.units[0]);
			let _loc7_ = this.viewPoint.getXPos(_loc4_.units[_loc4_.units.length - 1]);
			if (param2 < _loc6_)
				return;


			let _loc5_: DataUnit;
			if (param2 > this.viewPoint.maxx)
				_loc5_ = notnull(this.viewPoint.getLastDataUnit(_loc4_));
			else
				_loc5_ = notnull(this.getPoint(_loc4_, param2));

			let _loc8_ = this.viewPoint.getMinuteXPos(_loc5_.relativeMinutes);
			let _loc9_ = this.getYPos(param1, _loc5_);
			const gr = this.highlightCanvas.graphics;
			gr.lineStyle(5, this.lineColor, 1);
			gr.moveTo(_loc8_, _loc9_ - 0.2);
			gr.lineTo(_loc8_, _loc9_ + 0.2);
			if (param3["points"] === undefined)
				param3["points"] = [];

			let _loc10_ = Math.round((_loc5_.close / this.localStartPrice - 1) * 10000) / 100;
			let _loc11_ = " " + this.getPercentText(_loc10_) + "%";
			let _loc12_ = Const.POSITIVE_DIFFERENCE_COLOR;
			if (_loc10_ < 0)
				_loc12_ = Const.NEGATIVE_DIFFERENCE_COLOR;

			let _loc13_ = this.getQuoteText(this.dataSource.quoteName);
			let _loc14_ = new InfoDotInfo();
			_loc14_.quote = _loc13_;
			_loc14_.quoteColor = this.lineColor;
			_loc14_.value = _loc11_;
			_loc14_.valueColor = _loc12_;
			if (this.dataSource.displayName)
				_loc14_.displayName = this.dataSource.displayName;

			param3["points"].push(_loc14_);
			param3["setter"] = this;
		}

		private getPercentText(param1: number): string
		{
			let _loc2_ = "";
			if (param1 > 0)
				_loc2_ = _loc2_ + "+";
			else
				_loc2_ = _loc2_ + "-";

			param1 = Math.abs(param1);
			let _loc3_ = Math.floor(param1);
			_loc2_ = _loc2_ + _loc3_;
			_loc2_ = _loc2_ + ".";
			_loc2_ = _loc2_ + Utils.numberToMinTwoChars(Math.floor((param1 - _loc3_) * 100));
			return _loc2_;
		}
	}
}
