namespace com.google.finance
{
	export class IntervalBasedPinPointsLayer extends AbstractLayer<ViewPoint>
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
		private static readonly LEFT_ORIENTATION = 1;

		private pinMovies: PinPointMovie[];

		private static readonly FLAG_POLE_HEIGHT = 10;

		private lastAbsoluteHeightMin: number;


		constructor(param1: ViewPoint, param2: DataSource)
		{
			super(param1, param2);
			this.pinMovies = [];
			this.activeMovies = 0;
			this.pinPointContentMovie = new com.google.finance.PinPointContentMovie(param1);
			param1.addChildToTopCanvas(this.pinPointContentMovie);
		}

		private getDataUnit(param1: StockAssociatedObject, param2: number): DataUnit
		{
			let posInInterval = notnull(param1.posInInterval);
			let _loc3_ = posInInterval[param2].refDataSeries;
			let _loc4_ = _loc3_.getPointsInIntervalArray(param2);
			return _loc4_[posInInterval[param2].position];
		}

		private getLastVisibleFlagIndex(context: Context, param2: StockAssociatedObject[], param3: number): number
		{
			let _loc4_ = param2.length - 1;
			while (_loc4_ >= 0)
			{
				let _loc5_ = param2[_loc4_];
				if (notnull(_loc5_.posInInterval)[param3])
				{
					let _loc6_ = this.getDataUnit(_loc5_, param3);
					if (_loc6_.relativeMinutes <= context.lastMinute)
						return _loc4_;
				}
				_loc4_--;
			}
			return -1;
		}

		private getFirstVisibleFlagIndex(context: Context, param2: StockAssociatedObject[], param3: number): number
		{
			for (let _loc4_ = 0; _loc4_ < param2.length; _loc4_++)
			{
				let _loc5_ = param2[_loc4_];
				if (notnull(_loc5_.posInInterval)[param3])
				{
					let _loc6_ = this.getDataUnit(_loc5_, param3);
					if (_loc6_.relativeMinutes > context.lastMinute - context.count)
						return _loc4_;
				}
			}
			return param2.length - 1;
		}

		private getPinPointMovieClip(param1: PinPoint): PinPointMovie
		{
			let _loc2_: PinPointMovie | null;
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

		private getYPos(context: Context, param2: DataUnit): number
		{
			return this.localYOffset - (param2.getCloseLogValue(context.verticalScaling) - context.medPrice) * this.localYScale;
		}

		renderLayer(context: Context) 
		{
			if (isNaN(context.lastMinute) || isNaN(context.count) || context.count === 0)
				return;

			let vp = this.viewPoint;
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
			this.localYOffset = vp.miny + vp.medPriceY + vp.V_OFFSET;
			this.localYScale = vp.maxPriceRangeViewSize / context.maxPriceRange;
			let _loc4_ = vp.getLayer("BottomBarLayer") as BottomBarLayer;
			this.pinPointYWhenContentDisplayed = vp.maxy - (!_loc4_ ? 0 : _loc4_.bottomTextHeight);
			let _loc5_ = vp.getDetailLevelForTechnicalStyle();
			let _loc6_ = Const.getDetailLevelInterval(_loc5_);
			let _loc7_ = this.getFirstVisibleFlagIndex(context, _loc2_, _loc6_);
			let _loc8_ = this.getLastVisibleFlagIndex(context, _loc2_, _loc6_);
			this.lastAbsoluteHeightMin = 0;
			this.lastAbsoluteHeightMax = 0;
			this.renderFlagGroups(context, _loc2_, _loc7_, _loc8_, _loc6_);
			this.removePinMovies(this.activeMovies);
			if (!_loc3_)
				this.pinPointContentMovie.renderMovie();
		}

		private renderFlagGroups(context: Context, param2: PinPoint[], param3: number, param4: number, param5: number) 
		{
			let _loc11_ = 0;
			let _loc6_ = param3;
			let _loc7_: number[] = [];
			let _loc8_: number[] = [];
			let _loc9_: number[] = [];
			let _loc10_: number[] = [];
			while (_loc6_ <= param4)
			{
				_loc7_.push(_loc6_);
				_loc11_ = this.getFlagGroupCount(context, param2, _loc6_, param5);
				_loc8_.push(_loc11_);
				let _loc12_ = this.getDataUnit(param2[_loc6_], param5);
				_loc9_.push(Math.floor(!isNaN(_loc12_.weeklyXPos) ? Number(_loc12_.weeklyXPos) : this.viewPoint.getXPos(_loc12_)));
				_loc10_.push(this.getYPos(context, _loc12_));
				_loc6_ = _loc6_ + _loc11_;
			}
			if (_loc7_.length > 0)
			{
				let _loc13_: number[] = [];
				let _loc14_ = _loc7_.length - 1;
				while (_loc14_ >= 0)
				{
					if ((_loc13_.length === 0 || _loc13_[_loc13_.length - 1] === IntervalBasedPinPointsLayer.LEFT_ORIENTATION) && _loc9_[_loc14_] + (_loc7_.length - _loc14_) * IntervalBasedPinPointsLayer.MIN_FLAGS_DIST > this.viewPoint.maxx)
						_loc13_.push(IntervalBasedPinPointsLayer.LEFT_ORIENTATION);
					else
						_loc13_.push(IntervalBasedPinPointsLayer.RIGHT_ORIENTATION);

					_loc14_--;
				}
				_loc13_.reverse();
				_loc14_ = 0;
				while (_loc14_ < _loc7_.length)
				{
					this.renderFlagsGroup(context, param5, _loc9_[_loc14_], _loc10_[_loc14_], _loc7_[_loc14_], _loc8_[_loc14_], param2, IntervalBasedPinPointsLayer.FLAG_POLE_HEIGHT + IntervalBasedPinPointsLayer.FLAG_HEIGHT, _loc13_[_loc14_]);
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

		private getFlagGroupCount(param1: Context, param2: PinPoint[], param3: number, param4: number): number
		{
			let _loc5_ = 1;
			let _loc6_ = param2[param3];
			let _loc7_ = notnull(_loc6_.posInInterval)[param4];
			if (!_loc7_)
				return _loc5_;

			while (param3 + _loc5_ < param2.length)
			{
				let _loc8_ = notnull(param2[param3 + _loc5_].posInInterval)[param4];
				if (!_loc8_ || _loc7_.position !== _loc8_.position || _loc7_.refDataSeries !== _loc8_.refDataSeries)
					break;

				_loc5_++;
			}
			return _loc5_;
		}

		private renderFlagsGroup(param1: Context, param2: number, param3: number, param4: number, param5: number, param6: number, param7: PinPoint[], param8: number, param9: number) 
		{
			let _loc12_ = NaN;
			let _loc13_ = NaN;
			let _loc14_ = NaN;
			this.lastAbsoluteHeightMin = param4 - param8 + IntervalBasedPinPointsLayer.FLAG_HEIGHT;
			let _loc10_ = false;
			let _loc11_ = param5;
			while (_loc11_ < param5 + param6)
			{
				_loc10_ = _loc10_ || param7[_loc11_].active || param7[_loc11_].forceExpandInGroup;
				_loc11_++;
			}
			if (param6 > 1 && _loc10_ || Const.ENABLE_COMPACT_FLAGS === "false")
			{
				_loc12_ = param8 + (param6 - 1) * IntervalBasedPinPointsLayer.FLAG_HEIGHT;
				_loc11_ = param5;
				while (_loc11_ < param5 + param6)
				{
					_loc13_ = param8 + (_loc11_ - param5) * IntervalBasedPinPointsLayer.FLAG_HEIGHT;
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
