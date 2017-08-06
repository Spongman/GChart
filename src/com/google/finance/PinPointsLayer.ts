namespace com.google.finance
{
	export class PinPointsLayer extends AbstractLayer<ViewPoint>
	{
		private localYOffset = 0;

		private static readonly LEFT_SIDE_OFFSET = 4;

		private lastAbsoluteHeightMax: number;

		private pinPointContentMovie: com.google.finance.PinPointContentMovie;

		private static readonly FLAG_WIDTH = 18;

		private static readonly MAX_FLAGS_DEPTH = 1000;

		private localYScale = 0;

		private static readonly FLAG_HEIGHT = 14;

		private pinPointYWhenContentDisplayed = 0;

		private activeMovies: number;

		private static readonly MIN_FLAGS_DIST = 10;

		private static readonly RIGHT_ORIENTATION = 0;

		private pinMovies: PinPointMovie[];

		private static readonly FLAG_POLE_HEIGHT = 10;

		private lastAbsoluteHeightMin: number;

		private static readonly LEFT_ORIENTATION = 1;

		constructor(param1: ViewPoint, param2: DataSource)
		{
			super(param1, param2);
			this.pinMovies = [];
			this.activeMovies = 0;
			this.pinPointContentMovie = new com.google.finance.PinPointContentMovie(param1);
			param1.addChildToTopCanvas(this.pinPointContentMovie);
		}

		private getFlagGroupCount(param1: Context, param2: PinPoint[], param3: number, param4: number): number
		{
			let _loc5_ = 1;
			let _loc6_ = param2[param3];
			if (param4 === Const.INTRADAY)
			{
				while (param3 + _loc5_ < param2.length && param2[param3 + _loc5_].pos === _loc6_.pos && param2[param3 + _loc5_].refDataSeries === _loc6_.refDataSeries)
					_loc5_++;
			}
			else
			{
				while (param3 + _loc5_ < param2.length && param2[param3 + _loc5_].dayPos === _loc6_.dayPos && param2[param3 + _loc5_].refDataSeries === _loc6_.refDataSeries)
					_loc5_++;
			}
			return _loc5_;
		}

		private getLastVisibleFlagIndex(param1: Context, param2: PinPoint[]): number
		{
			let _loc3_ = param2.length - 1;
			while (_loc3_ >= 0)
			{
				let _loc4_ = param2[_loc3_];
				let _loc5_ = notnull(_loc4_.refDataSeries).units[_loc4_.pos];
				if (_loc5_.relativeMinutes <= param1.lastMinute)
					return _loc3_;

				_loc3_--;
			}
			return -1;
		}

		private getFirstVisibleFlagIndex(param1: Context, param2: PinPoint[]): number
		{
			for (let _loc3_ = 0; _loc3_ < param2.length; _loc3_++)
			{
				let _loc4_ = param2[_loc3_];
				let _loc5_ = notnull(_loc4_.refDataSeries).units[_loc4_.pos];
				if (_loc5_.relativeMinutes > param1.lastMinute - param1.count)
					return _loc3_;
			}
			return param2.length - 1;
		}

		private getPinPointMovieClip(param1: PinPoint): PinPointMovie
		{
			let _loc2_: PinPointMovie;
			let _loc3_ = !!param1.originalObject._color ? param1.originalObject._color : "gray";
			if (this.activeMovies >= this.pinMovies.length)
			{
				_loc2_ = _loc3_ === "orange" ? new OrangePinPointMovie() : new PinPointMovie();
				this.addChild(_loc2_);
				this.pinMovies.push(_loc2_);
			}
			else
			{
				_loc2_ = this.pinMovies[this.activeMovies];
				let _loc4_ = _loc2_ instanceof OrangePinPointMovie ? "orange" : "gray";
				if (_loc4_ !== _loc3_)
				{
					_loc2_ = _loc3_ === "orange" ? new OrangePinPointMovie() : new PinPointMovie();
					this.removeChild(this.pinMovies[this.activeMovies]);
					this.pinMovies[this.activeMovies].clearReferences();
					delete this.pinMovies[this.activeMovies];
					this.pinMovies[this.activeMovies] = _loc2_;
				}
			}
			_loc2_.setPinPointContentMovie(this.pinPointContentMovie);
			this.activeMovies++;
			return _loc2_;
		}

		private removePinMovies(param1: number) 
		{
			let _loc2_ = param1;
			while (_loc2_ < this.pinMovies.length)
			{
				this.removeChild(this.pinMovies[_loc2_]);
				this.pinMovies[_loc2_].clearReferences();
				delete this.pinMovies[_loc2_];
				_loc2_++;
			}
			this.pinMovies.splice(param1);
		}

		private getYPos(param1: Context, param2: DataUnit): number
		{
			return this.localYOffset - (param2.getCloseLogValue(param1.verticalScaling) - param1.medPrice) * this.localYScale;
		}

		renderLayer(param1: Context) 
		{
			if (isNaN(param1.lastMinute) || isNaN(param1.count) || param1.count === 0)
				return;

			let _loc2_ = <PinPoint[]>this.dataSource.objects["newspin"];
			this.activeMovies = 0;
			this.pinPointContentMovie.clearMovie();
			if (!_loc2_ || _loc2_.length === 0)
			{
				this.removePinMovies(0);
				return;
			}
			let _loc3_ = _loc2_[0].originalObject._color !== "orange";
			if (!Const.DISPLAY_NEWS_PINS && _loc3_)
			{
				this.removePinMovies(0);
				return;
			}
			let vp = this.viewPoint;
			this.localYOffset = vp.miny + vp.medPriceY + vp.V_OFFSET;
			this.localYScale = vp.maxPriceRangeViewSize / param1.maxPriceRange;
			let _loc4_ = vp.getLayer("BottomBarLayer") as BottomBarLayer;
			this.pinPointYWhenContentDisplayed = vp.maxy - (!_loc4_ ? 0 : _loc4_.bottomTextHeight);
			let _loc5_ = this.getFirstVisibleFlagIndex(param1, _loc2_);
			let _loc6_ = this.getLastVisibleFlagIndex(param1, _loc2_);
			this.lastAbsoluteHeightMin = 0;
			this.lastAbsoluteHeightMax = 0;
			let _loc7_ = vp.getDetailLevel(param1.count, param1.lastMinute);
			this.renderFlagGroups(param1, _loc2_, _loc5_, _loc6_, _loc7_);
			this.removePinMovies(this.activeMovies);
			if (!_loc3_)
				this.pinPointContentMovie.renderMovie();
		}

		private renderFlagGroups(param1: Context, param2: PinPoint[], param3: number, param4: number, param5: number) 
		{
			let _loc14_ = 0;
			let _loc6_ = param3;
			let _loc7_: number[] = [];
			let _loc8_: number[] = [];
			let _loc9_: number[] = [];
			let _loc10_: number[] = [];
			while (_loc6_ <= param4)
			{
				_loc7_.push(_loc6_);
				let _loc11_ = this.getFlagGroupCount(param1, param2, _loc6_, param5);
				_loc8_.push(_loc11_);
				let _loc12_ = this.getVisibleDataUnit(param2[_loc6_]);
				_loc9_.push(Math.floor(this.viewPoint.getXPos(_loc12_)));
				_loc10_.push(this.getYPos(param1, _loc12_));
				_loc6_ = _loc6_ + _loc11_;
			}
			if (_loc7_.length > 0)
			{
				let _loc13_: number[] = [];
				_loc14_ = _loc7_.length - 1;
				while (_loc14_ >= 0)
				{
					if ((_loc13_.length === 0 || _loc13_[_loc13_.length - 1] === PinPointsLayer.LEFT_ORIENTATION) && _loc9_[_loc14_] + (_loc7_.length - _loc14_) * PinPointsLayer.MIN_FLAGS_DIST > this.viewPoint.maxx)
						_loc13_.push(PinPointsLayer.LEFT_ORIENTATION);
					else
						_loc13_.push(PinPointsLayer.RIGHT_ORIENTATION);

					_loc14_--;
				}
				_loc13_.reverse();
				_loc14_ = 0;
				while (_loc14_ < _loc7_.length)
				{
					this.renderFlagsGroup(param1, param5, _loc9_[_loc14_], _loc10_[_loc14_], _loc7_[_loc14_], _loc8_[_loc14_], param2, PinPointsLayer.FLAG_POLE_HEIGHT + PinPointsLayer.FLAG_HEIGHT, _loc13_[_loc14_]);
					_loc14_++;
				}
			}
		}

		private renderFlag(param1: number, param2: number, param3: number, param4: PinPoint, param5?: PinPoint, param6 = 1) 
		{
			let _loc7_ = this.getPinPointMovieClip(param4);
			this.addChild(_loc7_);
			_loc7_.x = param1;
			_loc7_.y = this.pinPointYWhenContentDisplayed;
			_loc7_.setCount(param6);
			_loc7_.setObj(param4);
			_loc7_.setOrientation(param2);
			_loc7_.setHeight(param3);
		}

		private getVisibleDataUnit(param1: PinPoint): DataUnit
		{
			let _loc5_ = notnull(param1.refDataSeries);
			let _loc2_ = _loc5_.units[param1.pos];
			let _loc3_ = this.viewPoint.getSkipInterval();
			let _loc4_ = 0;
			if (_loc3_.interval >= Const.WEEKLY_INTERVAL)
			{
				let _loc6_ = _loc5_.getNextWeekEnd(param1.pos);
				_loc4_ = Number(_loc5_.fridays[_loc6_]);
			}
			else if (_loc3_.interval >= Const.DAILY_INTERVAL)
				_loc4_ = Number(param1.dayPos);
			else
				_loc4_ = Number(param1.pos + (param1.dayPos - param1.pos) % _loc3_.skip);

			return _loc5_.units[_loc4_];
		}

		private renderFlagsGroup(param1: Context, param2: number, param3: number, param4: number, param5: number, param6: number, param7: PinPoint[], param8: number, param9: number) 
		{
			let _loc12_ = NaN;
			let _loc13_ = NaN;
			let _loc14_ = NaN;
			this.lastAbsoluteHeightMin = param4 - param8 + PinPointsLayer.FLAG_HEIGHT;
			let _loc10_ = false;
			let _loc11_ = param5;
			while (_loc11_ < param5 + param6)
			{
				_loc10_ = _loc10_ || param7[_loc11_].active || param7[_loc11_].forceExpandInGroup;
				_loc11_++;
			}
			if (param6 > 1 && _loc10_ || Const.ENABLE_COMPACT_FLAGS === "false")
			{
				_loc12_ = param8 + (param6 - 1) * PinPointsLayer.FLAG_HEIGHT;
				_loc11_ = param5;
				while (_loc11_ < param5 + param6)
				{
					_loc13_ = param8 + (_loc11_ - param5) * PinPointsLayer.FLAG_HEIGHT;
					this.renderFlag(param3, param9, _loc13_, param7[_loc11_]);
					if (param7[_loc11_].active)
						this.pinPointContentMovie.setActivePinPoint(param7[_loc11_], param3, this.pinPointYWhenContentDisplayed - _loc12_);

					_loc11_++;
				}
			}
			else
			{
				_loc14_ = Math.min(param6, PinPointMovie.MAX_SHOWN_GROUP_COUNT) * 2;
				_loc12_ = param8 + _loc14_;
				this.renderFlag(param3, param9, param8 + _loc14_, param7[param5 + param6 - 1], param7[param5], param6);
				if (param7[param5].active)
					this.pinPointContentMovie.setActivePinPoint(param7[param5], param3, this.pinPointYWhenContentDisplayed - _loc12_);
			}
			this.lastAbsoluteHeightMax = param4 - this.pinMovies[this.activeMovies - 1].getHeight();
		}
	}
}
