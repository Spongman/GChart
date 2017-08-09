namespace com.google.finance
{
	//import flash.display.Sprite;

	export class PassiveLineLayer extends AbstractDrawingLayer<ViewPoint>
	{
		private localYOffset = 0;
		private localYScale = 0;
		
		indicator: com.google.finance.Indicator;
		originalDataSeries: com.google.finance.DataSeries;
		indicatorParams:any;	// any?
		computer: Function;

		constructor(viewPoint: ViewPoint, dataSource: DataSource)
		{
			super(viewPoint, dataSource);
			this.lineColor = Const.LINE_CHART_LINE_COLOR;
		}

		highlightPoint(param1: Context, param2: number, param3: { [key: string]: any }) 
		{
			this.clearHighlight();
			const _loc4_ = this.originalDataSeries;
			const _loc6_ = this.viewPoint.getXPos(_loc4_.units[0]);
			//const _loc7_ = this.viewPoint.getXPos(_loc4_.units[_loc4_.points.length - 1]);
			if (param2 < _loc6_)
				return;

			let _loc5_: DataUnit;
			if (param2 > this.viewPoint.maxx)
				_loc5_ = notnull(this.viewPoint.getLastDataUnit(_loc4_));
			else
				_loc5_ = notnull(this.getPoint(_loc4_, param2));

			//const _loc8_ = this.viewPoint.getMinuteXPos(_loc5_.relativeMinutes);
			//const _loc9_ = this.getYPos(param1, _loc5_);
			if (param3["points"] === undefined)
				param3["points"] = [];

			const _loc10_ = this.getFormattedClosePrice(_loc5_.close);
			const _loc11_ = this.getTechnicalsNameElseQuote(this.dataSource.quoteName);
			const _loc12_ = new InfoDotInfo();
			_loc12_.quote = _loc11_;
			_loc12_.quoteColor = this.lineColor;
			_loc12_.value = _loc10_;
			_loc12_.valueColor = this.lineColor;
			_loc12_.displayName = undefined;

			if (this.dataSource.displayName)
				_loc12_.displayName = this.dataSource.displayName;

			param3["points"].push(_loc12_);
			param3["setter"] = this;
		}

		private getFormattedClosePrice(param1: number): string
		{
			let _loc2_ = "";
			if (Math.floor(param1) !== param1)
			{
				const _loc3_ = Math.floor(param1 * 100) % 100;
				if (_loc3_ % 10 === 0)
					_loc2_ = _loc2_ + (" " + param1 + "0");
				else
					_loc2_ = _loc2_ + (" " + param1);
			}
			else
			{
				_loc2_ = _loc2_ + (" " + param1 + ".00");
			}
			return _loc2_;
		}

		private drawLine_(param1: flash.display.Sprite, param2: number, param3: number, param4: ViewPoint, param5: Context, param6: com.google.finance.DataSeries) 
		{
			const _loc7_ = param6.units;
			const _loc8_ = param6.days;
			const gr = param1.graphics;
			gr.lineStyle(Const.LINE_CHART_LINE_THICKNESS, this.lineColor, Const.LINE_CHART_LINE_VISIBILITY);
			let _loc9_ = param6.getNextDayStart(param3);
			let _loc10_ = _loc8_[_loc9_];
			while (_loc10_ > param2 && _loc7_[_loc10_].fake)
				_loc10_--;

			let _loc11_ = param4.getXPos(_loc7_[_loc10_]) + 1;
			let _loc12_ = this.getYPos(param5, _loc7_[_loc8_[_loc9_]]);
			gr.moveTo(_loc11_, this.viewPoint.maxy);
			gr.lineStyle(0, 0, 0);
			gr.lineTo(_loc11_, _loc12_);
			gr.lineStyle(Const.LINE_CHART_LINE_THICKNESS, this.lineColor, Const.LINE_CHART_LINE_VISIBILITY);
			let vp = this.viewPoint;
			switch (vp.getDetailLevel())
			{
				case Const.INTRADAY:
					while (_loc8_[_loc9_] > 0 && _loc8_[_loc9_] >= param2 && _loc8_[_loc9_] !== _loc8_[_loc9_ - 1] + 1)
					{
						this.drawDayLine_(param1, _loc9_, param4, param2, param3, param5, param6);
						_loc9_--;
					}
					break;
				case Const.DAILY:
					let _loc13_ = param3;
					_loc11_ = param4.getXPos(_loc7_[_loc13_]);
					const _loc14_ = param4.minutePix * (this.dataSource.data.marketDayLength + 2);
					while (_loc13_ >= param2 && _loc13_ > 0)
					{
						_loc12_ = this.getYPos(param5, _loc7_[_loc13_]);
						gr.lineTo(_loc11_, _loc12_);
						_loc13_--;
						_loc11_ = _loc11_ - _loc14_;
					}
					break;
				case Const.WEEKLY:
					const _loc15_ = param4.getSkipInterval();
					let _loc16_ = param6.fridays.length - 1;
					while (param6.fridays[_loc16_] > param6.days[_loc9_])
						_loc16_--;

					_loc16_ = _loc16_ + (param6.fridays.length - 1 - _loc16_) % _loc15_.skip;
					_loc16_ = Math.min(_loc16_, param6.fridays.length - 1);
					while (_loc16_ >= 0 && param6.fridays[_loc16_] >= param2)
					{
						const _loc17_ = param6.units[param6.fridays[_loc16_]];
						_loc11_ = vp.getXPos(_loc17_);
						_loc12_ = this.getYPos(param5, _loc17_);
						gr.lineTo(_loc11_, _loc12_);
						_loc16_ = _loc16_ - _loc15_.skip;
					}
					break;
			}
		}

		private getPoint(param1: com.google.finance.DataSeries, param2: number): DataUnit
		{
			return param1.units[this.getPointIndex(param1, param2)];
		}

		private drawDayLine_(param1: flash.display.Sprite, param2: number, param3: ViewPoint, param4: number, param5: number, param6: Context, param7: com.google.finance.DataSeries) 
		{
			let _loc17_ = 0;
			const _loc8_ = param7.units;
			const _loc9_ = param7.days;
			if (param2 > 0)
				_loc17_ = _loc9_[param2 - 1];
			else
				_loc17_ = 0;

			let _loc12_ = _loc9_[param2];
			if (_loc8_[_loc12_].fake && _loc12_ === _loc8_.length - 1)
			{
				while (_loc8_[_loc12_].fake)
					_loc12_--;
			}
			//const _loc13_ = _loc12_;
			while (_loc12_ > param5 && _loc12_ > param4)
				_loc12_--;

			let _loc14_ = param3.getXPos(_loc8_[_loc12_]);
			const _loc15_ = param3.getSkipInterval(param6.count, param6.lastMinute);
			const _loc16_ = param3.getIntervalLength(_loc15_.interval / 60);
			const gr = param1.graphics;
			while (_loc12_ >= _loc17_ && _loc12_ >= param4)
			{
				const _loc11_ = this.localYOffset - (param7.points[_loc12_].value - param6.medPrice) * this.localYScale;
				gr.lineTo(_loc14_, _loc11_);
				_loc12_--;
				_loc14_ = _loc14_ - _loc16_;
			}
			const _loc10_ = param3.getXPos(_loc8_[_loc17_]);
			const _loc11_ = this.getYPos(param6, _loc8_[_loc17_]);
			gr.lineTo(_loc10_, _loc11_);
		}

		private getTechnicalsNameElseQuote(param1: string): string
		{
			const _loc2_ = param1.split("@");
			if (_loc2_.length > 1)
				return _loc2_[1];

			return param1;
		}

		setIndicator(param1: string, param2: Function, param3: com.google.finance.DataSeries, param4:any) 
		{
			this.dataSource.indicators[param1] = new com.google.finance.Indicator();
			this.indicator = this.dataSource.indicators[param1];
			param2 = param2;
			this.indicatorParams = param4;
			this.originalDataSeries = param3;
		}

		getYPos(param1: Context, param2: DataUnit): number
		{
			return this.localYOffset - (param2.getCloseLogValue(param1.verticalScaling) - param1.medPrice) * this.localYScale;
		}

		getDataSeries(param1: Context): com.google.finance.DataSeries | null
		{
			if (!param1)
				return null;

			const _loc2_ = this.viewPoint.getSkipInterval(param1.count, param1.lastMinute);
			if (!this.computer)
				return null;

			this.computer(_loc2_.interval, this.indicator, this.originalDataSeries, this.indicatorParams);
			return this.indicator.getDataSeries(_loc2_.interval);
		}

		renderLayer(param1: Context) 
		{
			const _loc2_ = this.viewPoint;
			const _loc3_ = this.getDataSeries(param1);
			if (!_loc3_ || _loc3_.points.length === 0)
				return;

			this.graphics.clear();
			let _loc4_ = _loc3_.getRelativeMinuteIndex(_loc2_.getLastMinute());
			if (_loc4_ < _loc3_.points.length - 1)
				_loc4_ = _loc4_ + 1;

			let _loc5_ = _loc3_.getRelativeMinuteIndex(_loc2_.getFirstMinute()) - 1;
			if (_loc5_ < 0)
				_loc5_ = 0;

			this.localYOffset = _loc2_.miny + _loc2_.medPriceY + _loc2_.V_OFFSET;
			this.localYScale = _loc2_.maxPriceRangeViewSize / param1.maxPriceRange;
			this.drawLine_(this, _loc5_, _loc4_, _loc2_, param1, _loc3_);
		}

		private getPointIndex(param1: com.google.finance.DataSeries, param2: number): number
		{
			const _loc3_ = this.viewPoint.getMinuteOfX(param2);
			let _loc4_ = param1.getRelativeMinuteIndex(_loc3_);
			while (param1.units[_loc4_].fake && _loc4_ > 0)
				_loc4_--;

			const _loc5_ = this.viewPoint.getSkipInterval();
			const _loc6_ = _loc5_.skip;
			const _loc7_ = _loc5_.interval;
			if (_loc7_ < Const.DAILY_INTERVAL)
			{
				const _loc8_ = param1.getNextDayStart(_loc4_);
				return _loc4_ + (param1.days[_loc8_] - _loc4_) % _loc6_;
			}
			const _loc8_ = param1.getNextDayStart(_loc4_ + 1);
			return param1.days[_loc8_];
		}
	}
}
