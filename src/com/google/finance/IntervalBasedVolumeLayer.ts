namespace com.google.finance
{
	export class IntervalBasedVolumeLayer extends AbstractDrawingLayer<ViewPoint>
	{
		private localYScale: number;

		protected highlightCanvas: flash.display.Sprite;

		constructor(param1: ViewPoint, param2: DataSource)
		{
			super(param1, param2);
			this.highlightCanvas = new flash.display.Sprite("highlightCanvas");
			this.addChild(this.highlightCanvas);
		}

		protected getYPos(param1: number, param2: IViewPoint): number
		{
			return param2.maxy - (param1 >= 0 ? param1 : 0) * this.localYScale;
		}

		protected findPointIndex(param1: number): number
		{
			let _loc2_ = notnull(this.getDataSeries());
			let _loc3_ = this.viewPoint.getDetailLevelForTechnicalStyle();
			let _loc4_ = Const.getDetailLevelInterval(_loc3_);
			let _loc5_ = _loc2_.getPointsInIntervalArray(_loc4_);
			if (!_loc5_)
				return -1;

			let _loc6_ = this.viewPoint.getMinuteOfX(param1);
			let _loc7_ = _loc2_.getRelativeMinuteIndex(_loc6_, _loc5_);
			if (_loc7_ === _loc5_.length - 2)
			{
				if (Math.abs(_loc6_ - _loc5_[_loc7_].relativeMinutes) > Math.abs(_loc6_ - _loc5_[_loc7_ + 1].relativeMinutes))
					_loc7_++;
			}
			if (_loc3_ === Const.WEEKLY)
			{
				while (_loc7_ + 1 < _loc5_.length && _loc5_[_loc7_ + 1].weeklyXPos <= param1)
					_loc7_++;
			}
			while (_loc7_ > 0 && (_loc5_[_loc7_].fake || _loc5_[_loc7_].duplicate || _loc5_[_loc7_].volumes[_loc4_] === 0))
			{
				_loc7_--;
			}
			return _loc7_;
		}

		clearHighlight() 
		{
			this.highlightCanvas.graphics.clear();
		}

		private drawHorizontalLine(param1: number) 
		{
			this.graphics.lineStyle(0, Const.HORIZONTAL_GRID_COLOR, 1);
			this.graphics.moveTo(this.viewPoint.minx + 1, param1);
			this.graphics.lineTo(this.viewPoint.maxx - 1, param1);
		}

		private drawOneBar(param1: number, param2: number, param3: IViewPoint, param4: flash.display.Sprite, param5: number, param6: number = -1) 
		{
			if (param3.maxy - param2 < 1 && param3.maxy - param2 > 0)
				param2 = param3.maxy - 1;
			else if (param2 < param3.miny)
				param2 = param3.miny;

			if (param6 !== -1)
				this.graphics.beginFill(param6);

			param4.graphics.drawRect(param1 - param5 / 2, param2, param5, param3.maxy - param2);
			if (param6 !== -1)
				param4.graphics.endFill();
		}

		protected drawOneLine(param1: number, param2: number, param3: IViewPoint, param4: flash.display.Sprite) 
		{
			if (param3.maxy - param2 < 1 && param3.maxy - param2 > 0)
				param2 = param3.maxy - 1;
			else if (param2 < param3.miny)
				param2 = param3.miny;

			param4.graphics.moveTo(param1, param2);
			param4.graphics.lineTo(param1, param3.maxy);
		}

		getContext(param1: Context, param2 = false) 
		{
			let _loc12_ = NaN;
			let _loc3_ = notnull(this.getDataSeries(param1));
			let _loc4_ = this.viewPoint.getDetailLevelForTechnicalStyle(param1.lastMinute, param1.count);
			let _loc5_ = Const.getDetailLevelInterval(_loc4_);
			let _loc6_ = _loc3_.getPointsInIntervalArray(_loc5_);
			if (!_loc6_)
				return param1;

			let _loc7_ = param1.lastMinute - param1.count;
			let _loc8_ = _loc3_.getRelativeMinuteIndex(_loc7_, _loc6_) - 1;
			if (_loc8_ < 0)
				_loc8_ = 0;

			let _loc9_ = _loc3_.getRelativeMinuteIndex(param1.lastMinute, _loc6_) + 1;
			if (_loc9_ >= _loc6_.length)
				_loc9_ = _loc6_.length - 1;

			let _loc10_ = _loc6_[_loc9_].volumes[_loc5_];
			let _loc11_ = _loc9_ - 1;
			while (_loc11_ >= _loc8_)
			{
				_loc10_ = Utils.extendedMax(_loc10_, _loc6_[_loc11_].volumes[_loc5_]);
				_loc11_--;
			}
			_loc11_ = 1;
			while (_loc11_ < Const.VOLUME_SCALES.length)
			{
				_loc12_ = Const.VOLUME_SCALES[_loc11_];
				if (Math.floor(_loc10_ / _loc12_) < 10)
					break;

				_loc11_++;
			}
			let _loc13_ = (Math.floor(_loc10_ / _loc12_) + 1) * _loc12_;
			param1.maxVolume = Utils.extendedMax(param1.maxVolume, _loc13_);
			return param1;
		}

		renderLayer(param1: Context) 
		{
			let _loc11_= 0;
			let _loc12_ = NaN;
			let _loc13_ = NaN;
			let _loc15_= 0;
			let _loc2_ = notnull(this.getDataSeries());
			let _loc3_ = this.viewPoint;
			this.graphics.clear();
			let _loc4_ = _loc3_.getDetailLevelForTechnicalStyle();
			let _loc5_ = Const.getDetailLevelInterval(_loc4_);
			let _loc6_ = _loc2_.getPointsInIntervalArray(_loc5_);
			if (!_loc6_ || _loc6_.length === 0)
				return;

			if (param1.maxVolume === undefined)
				return;

			this.localYScale = (_loc3_.maxy - _loc3_.miny - Const.BOTTOM_VIEWPOINT_HEADER_HEIGHT) / param1.maxVolume;
			let _loc7_ = Math.max(_loc2_.getRelativeMinuteIndex(_loc3_.getFirstMinute(), _loc6_) - 1, 0);
			let _loc8_ = Math.min(_loc2_.getRelativeMinuteIndex(_loc3_.getLastMinute(), _loc6_) + 1, this.getLastRealPointIndex(_loc6_));
			let _loc9_ = _loc3_.getDisplayManager().getEnabledChartLayer();
			let _loc14_ = Number.MAX_VALUE;
			if (Const.VOLUME_PLUS_ENABLED && Const.VOLUME_PLUS_CHART_TYPE.indexOf(_loc9_) !== -1)
			{
				_loc15_ = this.getBarWidth(_loc4_, _loc2_);
				_loc11_ = _loc8_;
				while (_loc11_ >= _loc7_)
				{
					let _loc10_ = _loc6_[_loc11_];
					if (!isNaN(_loc10_.open))
					{
						if (_loc10_.close >= _loc10_.open)
							this.graphics.lineStyle(1, Const.POSITIVE_DIFFERENCE_COLOR);
						else
							this.graphics.lineStyle(1, Const.NEGATIVE_DIFFERENCE_COLOR);

						if (!_loc2_.minuteIsStartOfDataSession(_loc10_.dayMinute))
						{
							if (_loc4_ === Const.WEEKLY && _loc9_ !== Const.LINE_CHART)
							{
								_loc12_ = this.getWeeklyBarXPos(_loc10_, _loc14_);
								_loc14_ = _loc12_;
							}
							else
							{
								_loc12_ = _loc3_.getXPos(_loc10_);
							}
							_loc13_ = this.getYPos(_loc10_.volumes[_loc5_], _loc3_);
							this.drawOneBar(_loc12_, _loc13_, _loc3_, this, _loc15_, _loc10_.close >= _loc10_.open ? -1 : Const.NEGATIVE_DIFFERENCE_COLOR);
						}
					}
					_loc11_--;
				}
			}
			else
			{
				this.graphics.lineStyle(1, Const.LINE_CHART_LINE_COLOR);
				_loc11_ = _loc8_;
				while (_loc11_ >= _loc7_)
				{
					let _loc10_ = _loc6_[_loc11_];
					if (!_loc2_.minuteIsStartOfDataSession(_loc10_.dayMinute))
					{
						if (_loc4_ === Const.WEEKLY && _loc9_ !== Const.LINE_CHART)
						{
							_loc12_ = this.getWeeklyBarXPos(_loc10_, _loc14_);
							_loc14_ = _loc12_;
						}
						else
						{
							_loc12_ = _loc3_.getXPos(_loc10_);
						}
						_loc13_ = this.getYPos(_loc10_.volumes[_loc5_], _loc3_);
						this.drawOneLine(_loc12_, _loc13_, _loc3_, this);
					}
					_loc11_--;
				}
			}
			this.drawHorizontalLine(_loc3_.miny + Const.BOTTOM_VIEWPOINT_HEADER_HEIGHT);
		}

		highlightPoint(param1: Context, param2: number, param3: { [key: string]: any }) 
		{
			if (param3["ahsetter"])
				return;

			let _loc4_ = notnull(this.getDataSeries());
			let _loc5_ = this.viewPoint;
			let _loc6_ = this.findPointIndex(param2);
			let _loc7_ = _loc5_.getDetailLevelForTechnicalStyle();
			let _loc8_ = Const.getDetailLevelInterval(_loc7_);
			let _loc9_ = _loc4_.getPointsInIntervalArray(_loc8_);
			if (!_loc9_ || _loc6_ === -1)
				return;

			let _loc10_ = _loc9_[_loc6_];
			this.clearHighlight();
			let _loc11_ = !isNaN(_loc10_.weeklyXPos) ? Number(_loc10_.weeklyXPos) : _loc5_.getXPos(_loc10_);
			let _loc12_ = this.getYPos(_loc10_.volumes[_loc8_], _loc5_);
			let _loc13_ = _loc5_.getDisplayManager().getEnabledChartLayer();
			if (Const.VOLUME_PLUS_ENABLED && Const.VOLUME_PLUS_CHART_TYPE.indexOf(_loc13_) !== -1)
			{
				this.highlightCanvas.graphics.lineStyle(5, Const.DOT_COLOR, 1);
				this.highlightCanvas.graphics.moveTo(_loc11_, _loc12_ - 0.2);
				this.highlightCanvas.graphics.lineTo(_loc11_, _loc12_ + 0.2);
			}
			else
			{
				this.highlightCanvas.graphics.lineStyle(2, Const.VOLUME_HIGHLIGHT_COLOR, 1);
				this.drawOneLine(_loc11_, _loc12_, _loc5_, this.highlightCanvas);
			}
			param3[SpaceText.VOLUME_STR] = _loc10_.volumes[_loc8_];
			param3["volumesetter"] = this;
		}
	}
}
