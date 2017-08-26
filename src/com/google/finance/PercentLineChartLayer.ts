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

		protected getYPos(context: Context, dataUnit: DataUnit): number
		{
			return this.localYOffset + context.plusSize - (Utils.getLogScaledValue(dataUnit.close / this.localStartPrice, context.verticalScaling) - Utils.getLogScaledValue(1, context.verticalScaling)) * this.localYScale;
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
				startPrice: this.calculatePercentChangeBase(_loc5_),
				minPrice: _loc7_,
				maxPrice: _loc8_
			};
		}

		getContext(context: Context, param2 = false)
		{
			const viewPoint = this.viewPoint;
			const range = this.getRange(context.lastMinute, context.count);
			if (!range)
				return context;

			const _loc5_ = Utils.getLogScaledValue(range.maxPrice / range.startPrice, context.verticalScaling);
			context.plusVariation = Utils.extendedMax(_loc5_, context.plusVariation);
			const _loc6_ = Utils.getLogScaledValue(range.minPrice / range.startPrice, context.verticalScaling);
			context.minusVariation = Utils.extendedMin(_loc6_, context.minusVariation);
			context.scaleVariation = context.plusVariation - context.minusVariation;
			context.localYAdjustment = context.plusVariation - Utils.getLogScaledValue(1, context.verticalScaling);
			context.plusSize = context.localYAdjustment * (viewPoint.maxPriceRangeViewSize - 20) / context.scaleVariation;
			return context;
		}

		renderLayer(context: Context)
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
			this.localYScale = (viewPoint.maxPriceRangeViewSize - 20) / context.scaleVariation;
			this.localStartPrice = this.calculatePercentChangeBase(_loc6_);
			const _loc8_ = this.drawLine(this, _loc6_, lastRelativeMinuteIndex, viewPoint, context);
			const point = new flash.display.Point(_loc8_, viewPoint.maxy);
			gr.lineStyle(0, 0, 0);
			//this.globalToLocal(_loc9_);	// TODO:?
			gr.lineTo(point.x, point.y);
		}

		highlightPoint(context: Context, param2: number, state: Dictionary)
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
			const _loc9_ = this.getYPos(context, _loc5_);
			const gr = this.highlightCanvas.graphics;
			gr.lineStyle(5, this.lineColor, 1);
			gr.moveTo(_loc8_, _loc9_ - 0.2);
			gr.lineTo(_loc8_, _loc9_ + 0.2);
			if (state["points"] === undefined)
				state["points"] = [];

			const _loc10_ = Math.round((_loc5_.close / this.localStartPrice - 1) * 10000) / 100;
			const _loc11_ = ' ' + this.getPercentText(_loc10_) + '%';
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

			state["points"].push(infoDotInfo);
			state["setter"] = this;
		}

		private getPercentText(param1: number): string
		{
			let percentText = "";
			if (param1 > 0)
				percentText += '+';
			else
				percentText += '-';

			param1 = Math.abs(param1);
			const _loc3_ = Math.floor(param1);
			percentText += _loc3_;
			percentText += '.';
			percentText += Utils.numberToMinTwoChars(Math.floor((param1 - _loc3_) * 100));
			return percentText;
		}
	}
}
