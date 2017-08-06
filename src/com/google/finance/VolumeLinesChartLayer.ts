namespace com.google.finance
{
	// import flash.display.Sprite;

	export class VolumeLinesChartLayer extends AbstractDrawingLayer<ViewPoint>
	{
		protected scaledFactor: number;

		protected factor: number;

		protected indicator: com.google.finance.Indicator;

		protected computer: Function;

		protected highlightCanvas: flash.display.Sprite;

		protected maxVolume: { [key: string]: number };

		protected originalDataSeries: com.google.finance.DataSeries;

		protected verticalScale= 0;

		constructor(param1: ViewPoint, param2: DataSource)
		{
			super(param1, param2);
			this.maxVolume = {};
			this.highlightCanvas = new flash.display.Sprite();
			this.addChild(this.highlightCanvas);
		}

		private drawDayLine(param1: flash.display.Sprite, param2: number, param3: ViewPoint, param4: com.google.finance.DataSeries, param5: number, param6: number, param7: number, param8: number, param9:Context): number
		{
			let _loc12_ = NaN;
			let _loc13_ = NaN;
			let _loc14_= 0;
			let _loc15_= 0;
			let _loc10_ = param4.points;
			let _loc11_ = param4.days;
			if (_loc11_[param2 - 1] === _loc11_[param2] - 1)
				return param2;

			_loc14_ = _loc11_[param2];
			while (_loc14_ > param8)
				_loc14_--;

			let point = <indicator.VolumeIndicatorPoint>param4.points[_loc14_];
			let _loc17_ = param3.getXPos(_loc10_[_loc14_].point);
			let _loc18_ = param3.getIntervalLength(param6 / 60);
			_loc15_ = Utils.extendedMax(param7, _loc11_[param2 - 1]);
			while (_loc14_ > _loc15_)
			{
				_loc13_ = param3.maxy - point.volume * this.verticalScale;
				if (param3.maxy - _loc13_ < 1 && param3.maxy - _loc13_ > 0)
					_loc13_ = param3.maxy - 1;
				else if (_loc13_ < param3.miny)
					_loc13_ = param3.miny;

				param1.graphics.moveTo(_loc17_, _loc13_);
				param1.graphics.lineTo(_loc17_, param3.maxy);
				_loc14_--;
				_loc17_ = _loc17_ - _loc18_;
			}
			return param2;
		}

		setIndicator(param1: string, param2: Function, param3: com.google.finance.DataSeries) 
		{
			this.dataSource.indicators[param1] = new com.google.finance.Indicator();
			this.indicator = this.dataSource.indicators[param1];
			this.indicator.clearAllOnAddData = true;
			this.computer = param2;
			this.originalDataSeries = param3;
		}

		getNewestMinute(): number
		{
			let _loc1_ = this.originalDataSeries;
			return _loc1_.getLastRelativeMinute();
		}

		protected getYPos(param1: IViewPoint, param2: indicator.VolumeIndicatorPoint): number
		{
			if (isNaN(param2.volume))
				return param1.maxy;

			return param1.maxy - param2.volume * this.verticalScale;
		}

		getPoint(param1: com.google.finance.DataSeries, param2: number) 
		{
			let _loc3_ = this.getPointIndex(param1, param2);
			while (_loc3_ > 0 && (<indicator.VolumeIndicatorPoint>param1.points[_loc3_]).volume === 0)
			{
				_loc3_--;
			}
			return param1.points[_loc3_];
		}

		renderLayer(param1: Context) 
		{
			let _loc2_ = this.viewPoint.getSkipInterval(param1.count, param1.lastMinute);
			let _loc3_ = this.indicator.getDataSeries(_loc2_.interval);
			if (!_loc3_ || _loc3_.points.length === 0)
				return;

			let _loc4_ = this.viewPoint.getLastMinute();
			let _loc5_ = this.viewPoint.getFirstMinute();
			let _loc6_ = _loc3_.getReferencePointIndex(_loc4_);
			let _loc7_ = Number(_loc3_.getReferencePointIndex(_loc5_) - 1);
			if (_loc7_ < 0)
				_loc7_ = 0;

			this.drawLines(this, _loc3_, _loc7_, _loc6_, this.viewPoint, param1);
		}

		protected drawOneLine(param1: number, param2: number, param3: flash.display.Sprite, param4: IViewPoint) 
		{
			if (param4.maxy - param2 < 1 && param4.maxy - param2 > 0)
				param2 = param4.maxy - 1;
			else if (param2 < param4.miny)
				param2 = param4.miny;

			param3.graphics.moveTo(param1, param2);
			param3.graphics.lineTo(param1, param4.maxy);
		}

		private getPointIndex(param1: com.google.finance.DataSeries, param2: number): number
		{
			let _loc3_ = this.viewPoint.getMinuteOfX(param2);
			let _loc4_ = param1.getReferencePointIndex(_loc3_);
			while (param1.units[_loc4_].fake && _loc4_ >= 0)
				_loc4_--;

			if (_loc4_ < param1.points.length - 1)
			{
				let _loc5_ = param1.points[_loc4_].point;
				let _loc6_ = param1.points[_loc4_ + 1].point;
				let _loc7_ = this.viewPoint.getMinuteXPos(_loc6_.relativeMinutes);
				let _loc8_ = this.viewPoint.getMinuteXPos(_loc5_.relativeMinutes);
				if (Math.abs(_loc7_ - param2) < Math.abs(_loc8_ - param2))
					return _loc4_ + 1;
			}
			return _loc4_;
		}

		clearHighlight() 
		{
			this.highlightCanvas.graphics.clear();
		}

		getOldestMinute(): number
		{
			let _loc1_ = this.originalDataSeries;
			return _loc1_.getFirstRelativeMinute();
		}

		protected drawLines(param1: flash.display.Sprite, param2: com.google.finance.DataSeries, param3: number, param4: number, param5: ViewPoint, param6:Context) 
		{
			let _loc14_ = NaN;
			let _loc15_ = NaN;
			let _loc16_ = NaN;
			let _loc17_ = NaN;
			let _loc7_ = <indicator.VolumeIndicatorPoint[]>param2.points;
			let _loc8_ = param2.days;
			let _loc9_ = param2.getNextDayStart(param4);
			let _loc10_ = param5.getDetailLevel();
			let _loc11_ = param5.getSkipInterval();
			let _loc12_ = _loc11_.skip;
			let _loc13_ = _loc11_.interval;
			this.verticalScale = (param5.maxy - param5.miny - 6) / param6.maxVolume;
			param1.graphics.clear();
			param1.graphics.lineStyle(0, this.lineColor, 1);
			switch (_loc10_)
			{
				case Const.INTRADAY:
					while (param2.days[_loc9_] > param3 && _loc9_ >= 0)
					{
						this.drawDayLine(param1, _loc9_, param5, param2, _loc10_, _loc13_, param3, param4, param6);
						_loc9_--;
					}
					break;
				case Const.DAILY:
					_loc16_ = param4;
					_loc14_ = param5.getXPos(_loc7_[_loc16_].point);
					_loc17_ = param5.minutePix * (this.dataSource.data.marketDayLength + 1);
					while (_loc16_ > param3 && _loc16_ >= 0)
					{
						_loc15_ = this.getYPos(param5, _loc7_[_loc16_]);
						_loc14_ = param5.getXPos(_loc7_[_loc16_].point);
						if (param5.maxy - _loc15_ < 1 && param5.maxy - _loc15_ > 0)
							_loc15_ = param5.maxy - 1;
						else if (_loc15_ < param5.miny)
							_loc15_ = param5.miny;

						param1.graphics.moveTo(_loc14_, _loc15_);
						param1.graphics.lineTo(_loc14_, param5.maxy);
						_loc16_--;
					}
					break;
				case Const.WEEKLY:
					_loc16_ = param4;
					while (_loc16_ > param3 && _loc16_ >= 0)
					{
						_loc14_ = param5.getXPos(_loc7_[_loc16_].point);
						_loc15_ = this.getYPos(param5, _loc7_[_loc16_]);
						if (param5.maxy - _loc15_ < 1 && param5.maxy - _loc15_ > 0)
							_loc15_ = param5.maxy - 1;
						else if (_loc15_ < param5.miny)
							_loc15_ = param5.miny;

						param1.graphics.moveTo(_loc14_, _loc15_);
						param1.graphics.lineTo(_loc14_, param5.maxy);
						_loc16_--;
					}
					break;
			}
		}

		protected getMaxVolume(param1: number, param2: number, param3: boolean): number
		{
			let _loc13_ = NaN;
			let _loc4_ = this.viewPoint;
			let _loc5_ = _loc4_.getSkipInterval(param2, param1);
			let _loc6_ = _loc5_.interval;
			let _loc7_ = _loc5_.skip;
			let _loc8_ = notnull(this.indicator.getDataSeries(_loc6_));
			let _loc9_ = _loc4_.getDetailLevel(param2, param1);
			let _loc10_ = "c" + param2 + "-" + _loc9_ + "-" + _loc8_.units.length;
			if (this.maxVolume[_loc10_] !== undefined)
				return this.maxVolume[_loc10_];

			let _loc11_ = 0;
			let _loc12_= 0;
			while (_loc12_ < _loc8_.points.length)
			{
				if ((<indicator.VolumeIndicatorPoint>_loc8_.points[_loc12_]).volume > _loc11_)
					_loc11_ = Number((<indicator.VolumeIndicatorPoint>_loc8_.points[_loc12_]).volume);

				_loc12_++;
			}
			this.maxVolume[_loc10_] = _loc11_;
			_loc12_ = 1;
			while (_loc12_ < Const.VOLUME_SCALES.length)
			{
				_loc13_ = Const.VOLUME_SCALES[_loc12_];
				if (Math.floor(this.maxVolume[_loc10_] / _loc13_) < 10)
					break;

				_loc12_++;
			}
			let _loc14_ = (Math.floor(this.maxVolume[_loc10_] / _loc13_) + 1) * _loc13_;
			this.maxVolume[_loc10_] = _loc14_;
			return this.maxVolume[_loc10_];
		}

		getDataSeries(param1: Context): com.google.finance.DataSeries
		{
			let vp = this.viewPoint;
			if (!param1)
				param1 = vp.layersContext;

			let _loc2_ = vp.getSkipInterval(param1.count, param1.lastMinute);
			this.computer(_loc2_.interval, indicator, this.originalDataSeries);
			return notnull(this.indicator.getDataSeries(_loc2_.interval));
		}

		getContext(param1: Context, param2 = false) 
		{
			let _loc3_ = this.getDataSeries(param1);
			if (_loc3_.points.length === 0)
			{
				if (param1.maxVolume === undefined)
					param1.maxVolume = 0;

				return param1;
			}
			let _loc4_ = this.getMaxVolume(param1.lastMinute, param1.count, param2);
			param1.maxVolume = Utils.extendedMax(param1.maxVolume, _loc4_);
			return param1;
		}

		highlightPoint(param1: Context, param2: number, param3: { [key: string]: any }) 
		{
			this.clearHighlight();
			let _loc4_ = this.viewPoint.getSkipInterval(param1.count, param1.lastMinute);
			let _loc5_ = this.indicator.getDataSeries(_loc4_.interval);
			if (!_loc5_)
				return;

			let _loc6_ = _loc5_.getFirstReferencePoint();
			let _loc7_ = _loc5_.getLastReferencePoint();
			if (!_loc6_ || !_loc7_)
				return;

			let _loc8_ = this.viewPoint.getMinuteXPos(_loc6_.relativeMinutes);
			let _loc9_ = this.viewPoint.getMinuteXPos(_loc7_.relativeMinutes);
			if (param2 < _loc8_ || param2 > _loc9_)
				return;

			if (param3["ahsetter"] !== undefined)
				return;

			let _loc10_ = this.getPoint(_loc5_, param2) as indicator.VolumeIndicatorPoint;
			let _loc11_ = this.viewPoint.getXPos(_loc10_.point);
			let _loc12_ = this.getYPos(this.viewPoint, _loc10_);
			this.highlightCanvas.graphics.lineStyle(2, Const.VOLUME_HIGHLIGHT_COLOR, 1);
			this.drawOneLine(_loc11_, _loc12_, this.highlightCanvas, this.viewPoint);
			param3[SpaceText.VOLUME_STR] = _loc10_.volume;
			param3["volumesetter"] = this;
		}
	}
}
