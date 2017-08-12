namespace com.google.finance
{
	// import flash.geom.Point;

	export class PercentLineChartLayer extends LineChartLayer
	{
		private localStartPrice = 0;

		protected calculatePercentChangeBase(param1 = 0): number
		{
			const dataSeries = this.getDataSeries();
			const units = dataSeries.units;
			return units[param1].close;
		}

		protected getYPos(param1: Context, param2: DataUnit): number
		{
			return this.localYOffset + param1.plusSize - (Utils.getLogScaledValue(param2.close / this.localStartPrice, param1.verticalScaling) - Utils.getLogScaledValue(1, param1.verticalScaling)) * this.localYScale;
		}

		private getQuoteText(param1: string): string
		{
			const symbol = Utils.getSymbolFromTicker(param1);
			switch (symbol)
			{
				case ".INX":
					return "S&P500";
				case ".DJI":
					return "Dow";
				case ".IXIC":
					return "Nasd";
				default:
					return symbol;
			}
		}

		protected getRange(param1: number, param2: number) 
		{
			const dataSeries = this.getDataSeries();
			if (!dataSeries)
				return null;

			const units = dataSeries.units;
			if (!units || units.length === 0)
				return null;

			const _loc5_ = dataSeries.getRelativeMinuteIndex(param1 - param2);
			let _loc6_ = dataSeries.getRelativeMinuteIndex(param1) + 1;
			if (_loc6_ <= _loc5_ + 1)
				_loc6_ = _loc5_ + 2;

			_loc6_ = Math.min(_loc6_, units.length - 1);
			let _loc7_ = units[_loc5_].close;
			let _loc8_ = units[_loc5_].close;
			for (let _loc9_ = _loc5_; _loc9_ <= _loc6_; _loc9_++)
			{
				if (units[_loc9_].close < _loc7_)
					_loc7_ = units[_loc9_].close;
				else if (units[_loc9_].close > _loc8_)
					_loc8_ = units[_loc9_].close;

			}
			return {
				"startPrice": this.calculatePercentChangeBase(_loc5_),
				"minPrice": _loc7_,
				"maxPrice": _loc8_
			};
		}

		getContext(param1: Context, param2 = false) 
		{
			const viewPoint = this.viewPoint;
			const range = this.getRange(param1.lastMinute, param1.count);
			if (!range)
				return param1;

			const _loc5_ = Utils.getLogScaledValue(range.maxPrice / range.startPrice, param1.verticalScaling);
			param1.plusVariation = Utils.extendedMax(_loc5_, param1.plusVariation);
			const _loc6_ = Utils.getLogScaledValue(range.minPrice / range.startPrice, param1.verticalScaling);
			param1.minusVariation = Utils.extendedMin(_loc6_, param1.minusVariation);
			param1.scaleVariation = param1.plusVariation - param1.minusVariation;
			param1.localYAdjustment = param1.plusVariation - Utils.getLogScaledValue(1, param1.verticalScaling);
			param1.plusSize = param1.localYAdjustment * (viewPoint.maxPriceRangeViewSize - 20) / param1.scaleVariation;
			return param1;
		}

		renderLayer(param1: Context) 
		{
			const viewPoint = this.viewPoint;
			const dataSeries = this.getDataSeries();
			const points = dataSeries.points;
			const gr = this.graphics;
			gr.clear();
			let lastRelativeMinuteIndex = dataSeries.getRelativeMinuteIndex(viewPoint.getLastMinute()) + 1;
			lastRelativeMinuteIndex = Math.min(lastRelativeMinuteIndex, points.length - 1);
			let _loc6_ = dataSeries.getRelativeMinuteIndex(viewPoint.getFirstMinute());
			_loc6_ = Math.max(_loc6_, 0);
			//const _loc7_ = new flash.display.Point(_loc2_.maxx, _loc2_.maxy + 1);
			//this.globalToLocal(_loc7_);
			this.localYOffset = viewPoint.miny + ViewPoint.MIN_EDGE_DISTANCE / 2;
			this.localYScale = (viewPoint.maxPriceRangeViewSize - 20) / param1.scaleVariation;
			this.localStartPrice = this.calculatePercentChangeBase(_loc6_);
			const _loc8_ = this.drawLine(this, _loc6_, lastRelativeMinuteIndex, viewPoint, param1);
			const point = new flash.display.Point(_loc8_, viewPoint.maxy);
			gr.lineStyle(0, 0, 0);
			//this.globalToLocal(_loc9_);	// TODO:?
			gr.lineTo(point.x, point.y);
		}

		highlightPoint(param1: Context, param2: number, param3: { [key: string]: any }) 
		{
			this.clearHighlight();
			const dataSeries = this.getDataSeries();
			const _loc6_ = this.viewPoint.getXPos(dataSeries.units[0]);
			//const _loc7_ = this.viewPoint.getXPos(_loc4_.units[_loc4_.units.length - 1]);
			if (param2 < _loc6_)
				return;


			let _loc5_: DataUnit;
			if (param2 > this.viewPoint.maxx)
				_loc5_ = notnull(this.viewPoint.getLastDataUnit(dataSeries));
			else
				_loc5_ = notnull(this.getPoint(dataSeries, param2));

			const _loc8_ = this.viewPoint.getMinuteXPos(_loc5_.relativeMinutes);
			const _loc9_ = this.getYPos(param1, _loc5_);
			const gr = this.highlightCanvas.graphics;
			gr.lineStyle(5, this.lineColor, 1);
			gr.moveTo(_loc8_, _loc9_ - 0.2);
			gr.lineTo(_loc8_, _loc9_ + 0.2);
			if (param3["points"] === undefined)
				param3["points"] = [];

			const _loc10_ = Math.round((_loc5_.close / this.localStartPrice - 1) * 10000) / 100;
			const _loc11_ = " " + this.getPercentText(_loc10_) + "%";
			let _loc12_ = Const.POSITIVE_DIFFERENCE_COLOR;
			if (_loc10_ < 0)
				_loc12_ = Const.NEGATIVE_DIFFERENCE_COLOR;

			const quoteText = this.getQuoteText(this.dataSource.quoteName);
			const infoDotInfo = new InfoDotInfo();
			infoDotInfo.quote = quoteText;
			infoDotInfo.quoteColor = this.lineColor;
			infoDotInfo.value = _loc11_;
			infoDotInfo.valueColor = _loc12_;
			if (this.dataSource.displayName)
				infoDotInfo.displayName = this.dataSource.displayName;

			param3["points"].push(infoDotInfo);
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
			const _loc3_ = Math.floor(param1);
			_loc2_ = _loc2_ + _loc3_;
			_loc2_ = _loc2_ + ".";
			_loc2_ = _loc2_ + Utils.numberToMinTwoChars(Math.floor((param1 - _loc3_) * 100));
			return _loc2_;
		}
	}
}
