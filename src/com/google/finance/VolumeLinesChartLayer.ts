namespace com.google.finance
{
	// import flash.display.Sprite;

	export class VolumeLinesChartLayer extends AbstractDrawingLayer<ViewPoint>
	{
		protected scaledFactor: number;
		protected factor: number;
		protected indicator: com.google.finance.Indicator;
		protected computer: Function;
		protected highlightCanvas: flash.display.Sprite = new flash.display.Sprite();
		protected maxVolume: { [key: string]: number } = {};
		protected originalDataSeries: com.google.finance.DataSeries;
		protected verticalScale = 0;

		constructor(param1: ViewPoint, param2: DataSource)
		{
			super(param1, param2);
			this.addChild(this.highlightCanvas);
		}

		private drawDayLine(param1: flash.display.Sprite, param2: number, param3: ViewPoint, param4: com.google.finance.DataSeries, param5: number, param6: number, param7: number, param8: number, param9: Context): number
		{
			const _loc10_ = param4.points;
			const _loc11_ = param4.days;
			if (_loc11_[param2 - 1] === _loc11_[param2] - 1)
				return param2;

			let _loc14_ = _loc11_[param2];
			if (_loc14_ > param8)
				_loc14_ = param8;

			let point = <indicator.VolumeIndicatorPoint>param4.points[_loc14_];
			let _loc17_ = param3.getXPos(_loc10_[_loc14_].point);
			const _loc18_ = param3.getIntervalLength(param6 / 60);
			const _loc15_ = Utils.extendedMax(param7, _loc11_[param2 - 1]);
			const gr = param1.graphics;
			while (_loc14_ > _loc15_)
			{
				let _loc13_ = param3.maxy - point.volume * this.verticalScale;
				if (param3.maxy - _loc13_ < 1 && param3.maxy - _loc13_ > 0)
					_loc13_ = param3.maxy - 1;
				else if (_loc13_ < param3.miny)
					_loc13_ = param3.miny;

				gr.moveTo(_loc17_, _loc13_);
				gr.lineTo(_loc17_, param3.maxy);
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
			const _loc1_ = this.originalDataSeries;
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
			const _loc2_ = this.viewPoint.getSkipInterval(param1.count, param1.lastMinute);
			const _loc3_ = this.indicator.getDataSeries(_loc2_.interval);
			if (!_loc3_ || _loc3_.points.length === 0)
				return;

			const _loc4_ = this.viewPoint.getLastMinute();
			const _loc5_ = this.viewPoint.getFirstMinute();
			const _loc6_ = _loc3_.getReferencePointIndex(_loc4_);
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
			const _loc3_ = this.viewPoint.getMinuteOfX(param2);
			let _loc4_ = param1.getReferencePointIndex(_loc3_);
			while (param1.units[_loc4_].fake && _loc4_ >= 0)
				_loc4_--;

			if (_loc4_ < param1.points.length - 1)
			{
				const _loc5_ = param1.points[_loc4_].point;
				const _loc6_ = param1.points[_loc4_ + 1].point;
				const _loc7_ = this.viewPoint.getMinuteXPos(_loc6_.relativeMinutes);
				const _loc8_ = this.viewPoint.getMinuteXPos(_loc5_.relativeMinutes);
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
			const _loc1_ = this.originalDataSeries;
			return _loc1_.getFirstRelativeMinute();
		}

		protected drawLines(param1: flash.display.Sprite, param2: com.google.finance.DataSeries, param3: number, param4: number, param5: ViewPoint, param6: Context) 
		{
			const _loc7_ = <indicator.VolumeIndicatorPoint[]>param2.points;
			//const _loc8_ = param2.days;
			let _loc9_ = param2.getNextDayStart(param4);
			const _loc10_ = param5.getDetailLevel();
			const _loc11_ = param5.getSkipInterval();
			//const _loc12_ = _loc11_.skip;
			const _loc13_ = _loc11_.interval;
			this.verticalScale = (param5.maxy - param5.miny - 6) / param6.maxVolume;
			const gr = param1.graphics;
			gr.clear();
			gr.lineStyle(0, this.lineColor, 1);
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
					{
						//_loc14_ = param5.getXPos(_loc7_[_loc16_].point);
						//_loc17_ = param5.minutePix * (this.dataSource.data.marketDayLength + 1);
						for (let _loc16_ = param4; _loc16_ > param3 && _loc16_ >= 0; _loc16_--)
						{
							let _loc15_ = this.getYPos(param5, _loc7_[_loc16_]);
							const _loc14_ = param5.getXPos(_loc7_[_loc16_].point);
							if (param5.maxy - _loc15_ < 1 && param5.maxy - _loc15_ > 0)
								_loc15_ = param5.maxy - 1;
							else if (_loc15_ < param5.miny)
								_loc15_ = param5.miny;

							gr.moveTo(_loc14_, _loc15_);
							gr.lineTo(_loc14_, param5.maxy);
						}
					}
					break;
				case Const.WEEKLY:
					{
						for (let _loc16_ = param4; _loc16_ > param3 && _loc16_ >= 0; _loc16_--)
						{
							const _loc14_ = param5.getXPos(_loc7_[_loc16_].point);
							let _loc15_ = this.getYPos(param5, _loc7_[_loc16_]);
							if (param5.maxy - _loc15_ < 1 && param5.maxy - _loc15_ > 0)
								_loc15_ = param5.maxy - 1;
							else if (_loc15_ < param5.miny)
								_loc15_ = param5.miny;

							gr.moveTo(_loc14_, _loc15_);
							gr.lineTo(_loc14_, param5.maxy);
						}
					}
					break;
			}
		}

		protected getMaxVolume(param1: number, param2: number, param3: boolean): number
		{
			let _loc13_ = NaN;
			const _loc4_ = this.viewPoint;
			const _loc5_ = _loc4_.getSkipInterval(param2, param1);
			const _loc6_ = _loc5_.interval;
			//const _loc7_ = _loc5_.skip;
			const _loc8_ = notnull(this.indicator.getDataSeries(_loc6_));
			const _loc9_ = _loc4_.getDetailLevel(param2, param1);
			const _loc10_ = "c" + param2 + "-" + _loc9_ + "-" + _loc8_.units.length;
			if (this.maxVolume[_loc10_] !== undefined)
				return this.maxVolume[_loc10_];

			let _loc11_ = 0;
			for (let _loc12_ = 0; _loc12_ < _loc8_.points.length; _loc12_++)
			{
				if ((<indicator.VolumeIndicatorPoint>_loc8_.points[_loc12_]).volume > _loc11_)
					_loc11_ = Number((<indicator.VolumeIndicatorPoint>_loc8_.points[_loc12_]).volume);
			}
			this.maxVolume[_loc10_] = _loc11_;
			for (let _loc12_ = 1; _loc12_ < Const.VOLUME_SCALES.length; _loc12_++)
			{
				_loc13_ = Const.VOLUME_SCALES[_loc12_];
				if (Math.floor(this.maxVolume[_loc10_] / _loc13_) < 10)
					break;
			}
			const _loc14_ = (Math.floor(this.maxVolume[_loc10_] / _loc13_) + 1) * _loc13_;
			this.maxVolume[_loc10_] = _loc14_;
			return this.maxVolume[_loc10_];
		}

		getDataSeries(param1: Context): com.google.finance.DataSeries
		{
			let vp = this.viewPoint;
			if (!param1)
				param1 = vp.layersContext;

			const _loc2_ = vp.getSkipInterval(param1.count, param1.lastMinute);
			this.computer(_loc2_.interval, indicator, this.originalDataSeries);
			return notnull(this.indicator.getDataSeries(_loc2_.interval));
		}

		getContext(param1: Context, param2 = false) 
		{
			const _loc3_ = this.getDataSeries(param1);
			if (_loc3_.points.length === 0)
			{
				if (param1.maxVolume === undefined)
					param1.maxVolume = 0;

				return param1;
			}
			const _loc4_ = this.getMaxVolume(param1.lastMinute, param1.count, param2);
			param1.maxVolume = Utils.extendedMax(param1.maxVolume, _loc4_);
			return param1;
		}

		highlightPoint(param1: Context, param2: number, param3: { [key: string]: any }) 
		{
			this.clearHighlight();
			const _loc4_ = this.viewPoint.getSkipInterval(param1.count, param1.lastMinute);
			const _loc5_ = this.indicator.getDataSeries(_loc4_.interval);
			if (!_loc5_)
				return;

			const _loc6_ = _loc5_.getFirstReferencePoint();
			const _loc7_ = _loc5_.getLastReferencePoint();
			if (!_loc6_ || !_loc7_)
				return;

			const _loc8_ = this.viewPoint.getMinuteXPos(_loc6_.relativeMinutes);
			const _loc9_ = this.viewPoint.getMinuteXPos(_loc7_.relativeMinutes);
			if (param2 < _loc8_ || param2 > _loc9_)
				return;

			if (param3["ahsetter"] !== undefined)
				return;

			const _loc10_ = this.getPoint(_loc5_, param2) as indicator.VolumeIndicatorPoint;
			const _loc11_ = this.viewPoint.getXPos(_loc10_.point);
			const _loc12_ = this.getYPos(this.viewPoint, _loc10_);
			this.highlightCanvas.graphics.lineStyle(2, Const.VOLUME_HIGHLIGHT_COLOR, 1);
			this.drawOneLine(_loc11_, _loc12_, this.highlightCanvas, this.viewPoint);
			param3[SpaceText.VOLUME_STR] = _loc10_.volume;
			param3["volumesetter"] = this;
		}
	}
}
