namespace com.google.finance
{
	export class PinPointsLayer extends AbstractLayer<ViewPoint>
	{
		private static readonly FLAG_HEIGHT = 14;
		private static readonly MIN_FLAGS_DIST = 10;
		private static readonly FLAG_POLE_HEIGHT = 10;
		/*
		private static readonly LEFT_SIDE_OFFSET = 4;
		private static readonly FLAG_WIDTH = 18;
		private static readonly MAX_FLAGS_DEPTH = 1000;
		*/

		private localYOffset = 0;
		private lastAbsoluteHeightMax: number;
		private pinPointContentMovie: com.google.finance.PinPointContentMovie;
		private localYScale = 0;
		private pinPointYWhenContentDisplayed = 0;
		private activeMovies = 0;
		private pinMovies: PinPointMovie[] = [];
		private lastAbsoluteHeightMin: number;
		
		constructor(viewPoint: ViewPoint, dataSource: DataSource)
		{
			super(viewPoint, dataSource);
			this.pinPointContentMovie = new com.google.finance.PinPointContentMovie(viewPoint);
			viewPoint.addChildToTopCanvas(this.pinPointContentMovie);
		}

		private getFlagGroupCount(context: Context, pinPoints: PinPoint[], param3: number, param4: number): number
		{
			let _loc5_ = 1;
			const _loc6_ = pinPoints[param3];
			if (param4 === Intervals.INTRADAY)
			{
				while (param3 + _loc5_ < pinPoints.length && pinPoints[param3 + _loc5_].pos === _loc6_.pos && pinPoints[param3 + _loc5_].refDataSeries === _loc6_.refDataSeries)
					_loc5_++;
			}
			else
			{
				while (param3 + _loc5_ < pinPoints.length && pinPoints[param3 + _loc5_].dayPos === _loc6_.dayPos && pinPoints[param3 + _loc5_].refDataSeries === _loc6_.refDataSeries)
					_loc5_++;
			}
			return _loc5_;
		}

		private getLastVisibleFlagIndex(context: Context, pinPoints: PinPoint[]): number
		{
			for (let pinIndex = pinPoints.length - 1; pinIndex >= 0; pinIndex--)
			{
				const _loc4_ = pinPoints[pinIndex];
				const _loc5_ = notnull(_loc4_.refDataSeries).units[_loc4_.pos];
				if (_loc5_.relativeMinutes <= context.lastMinute)
					return pinIndex;

			}
			return -1;
		}

		private getFirstVisibleFlagIndex(context: Context, pinPoints: PinPoint[]): number
		{
			for (let pinIndex = 0; pinIndex < pinPoints.length; pinIndex++)
			{
				const _loc4_ = pinPoints[pinIndex];
				const _loc5_ = notnull(_loc4_.refDataSeries).units[_loc4_.pos];
				if (_loc5_.relativeMinutes > context.lastMinute - context.count)
					return pinIndex;
			}
			return pinPoints.length - 1;
		}

		private getPinPointMovieClip(pinPoint: PinPoint): PinPointMovie
		{
			let _loc2_: PinPointMovie;
			const _loc3_ = !!pinPoint.originalObject._color ? pinPoint.originalObject._color : "gray";
			if (this.activeMovies >= this.pinMovies.length)
			{
				_loc2_ = _loc3_ === "orange" ? new OrangePinPointMovie() : new PinPointMovie();
				this.addChild(_loc2_);
				this.pinMovies.push(_loc2_);
			}
			else
			{
				_loc2_ = this.pinMovies[this.activeMovies];
				const _loc4_ = _loc2_ instanceof OrangePinPointMovie ? "orange" : "gray";
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
			for (let movieIndex = param1; movieIndex < this.pinMovies.length; movieIndex++)
			{
				this.removeChild(this.pinMovies[movieIndex]);
				this.pinMovies[movieIndex].clearReferences();
				delete this.pinMovies[movieIndex];
			}
			this.pinMovies.splice(param1);
		}

		private getYPos(context: Context, dataUnit: DataUnit): number
		{
			return this.localYOffset - (dataUnit.getCloseLogValue(context.verticalScaling) - context.medPrice) * this.localYScale;
		}

		renderLayer(context: Context) 
		{
			if (isNaN(context.lastMinute) || isNaN(context.count) || context.count === 0)
				return;

			const _loc2_ = <PinPoint[]>this.dataSource.objects["newspin"];
			this.activeMovies = 0;
			this.pinPointContentMovie.clearMovie();
			if (!_loc2_ || _loc2_.length === 0)
			{
				this.removePinMovies(0);
				return;
			}
			const _loc3_ = _loc2_[0].originalObject._color !== "orange";
			if (!Const.DISPLAY_NEWS_PINS && _loc3_)
			{
				this.removePinMovies(0);
				return;
			}
			let vp = this.viewPoint;
			this.localYOffset = vp.miny + vp.medPriceY + vp.V_OFFSET;
			this.localYScale = vp.maxPriceRangeViewSize / context.maxPriceRange;
			const bottomBarLayer = vp.getLayer("BottomBarLayer") as BottomBarLayer;
			this.pinPointYWhenContentDisplayed = vp.maxy - (!bottomBarLayer ? 0 : bottomBarLayer.bottomTextHeight);
			const firstVisibleFlagIndex = this.getFirstVisibleFlagIndex(context, _loc2_);
			const lastVisibleFlagIndex = this.getLastVisibleFlagIndex(context, _loc2_);
			this.lastAbsoluteHeightMin = 0;
			this.lastAbsoluteHeightMax = 0;
			const detailLevel = vp.getDetailLevel(context.count, context.lastMinute);
			this.renderFlagGroups(context, _loc2_, firstVisibleFlagIndex, lastVisibleFlagIndex, detailLevel);
			this.removePinMovies(this.activeMovies);
			if (!_loc3_)
				this.pinPointContentMovie.renderMovie();
		}

		private renderFlagGroups(context: Context, pinPoints: PinPoint[], param3: number, param4: number, param5: number) 
		{
			const _loc7_: number[] = [];
			const _loc8_: number[] = [];
			const _loc9_: number[] = [];
			const _loc10_: number[] = [];
			for (let _loc6_ = param3; _loc6_ <= param4; )
			{
				_loc7_.push(_loc6_);
				const flagGroupCount = this.getFlagGroupCount(context, pinPoints, _loc6_, param5);
				_loc8_.push(flagGroupCount);
				const visibleDataUnit = this.getVisibleDataUnit(pinPoints[_loc6_]);
				_loc9_.push(Math.floor(this.viewPoint.getXPos(visibleDataUnit)));
				_loc10_.push(this.getYPos(context, visibleDataUnit));
				_loc6_ += flagGroupCount;
			}

			if (_loc7_.length > 0)
			{
				const pinOrientations: PinOrientations[] = [];
				for (let _loc14_ = _loc7_.length - 1; _loc14_ >= 0; _loc14_--)
				{
					if ((pinOrientations.length === 0 || pinOrientations[pinOrientations.length - 1] === PinOrientations.LEFT_ORIENTATION) && _loc9_[_loc14_] + (_loc7_.length - _loc14_) * PinPointsLayer.MIN_FLAGS_DIST > this.viewPoint.maxx)
						pinOrientations.push(PinOrientations.LEFT_ORIENTATION);
					else
						pinOrientations.push(PinOrientations.RIGHT_ORIENTATION);

				}
				pinOrientations.reverse();
				for (let _loc14_ = 0; _loc14_ < _loc7_.length; _loc14_++)
				{
					this.renderFlagsGroup(context, param5, _loc9_[_loc14_], _loc10_[_loc14_], _loc7_[_loc14_], _loc8_[_loc14_], pinPoints, PinPointsLayer.FLAG_POLE_HEIGHT + PinPointsLayer.FLAG_HEIGHT, pinOrientations[_loc14_]);
				}
			}
		}

		private renderFlag(param1: number, pinOrientation: PinOrientations, param3: number, pinPoint: PinPoint, _?: PinPoint, param6 = 1) 
		{
			const pinPointMovieClip = this.getPinPointMovieClip(pinPoint);
			this.addChild(pinPointMovieClip);
			pinPointMovieClip.x = param1;
			pinPointMovieClip.y = this.pinPointYWhenContentDisplayed;
			pinPointMovieClip.setCount(param6);
			pinPointMovieClip.setObj(pinPoint);
			pinPointMovieClip.setOrientation(pinOrientation);
			pinPointMovieClip.setHeight(param3);
		}

		private getVisibleDataUnit(pinPoint: PinPoint): DataUnit
		{
			const _loc5_ = notnull(pinPoint.refDataSeries);
			//const _loc2_ = _loc5_.units[param1.pos];
			const skipInterval = this.viewPoint.getSkipInterval();
			let _loc4_ = 0;
			if (skipInterval.interval >= Const.WEEKLY_INTERVAL)
			{
				const nextWeekEnd = _loc5_.getNextWeekEnd(pinPoint.pos);
				_loc4_ = Number(_loc5_.fridays[nextWeekEnd]);
			}
			else if (skipInterval.interval >= Const.DAILY_INTERVAL)
				_loc4_ = Number(pinPoint.dayPos);
			else
				_loc4_ = Number(pinPoint.pos + (notnull(pinPoint.dayPos) - pinPoint.pos) % skipInterval.skip);

			return _loc5_.units[_loc4_];
		}

		private renderFlagsGroup(context: Context, param2: number, param3: number, param4: number, param5: number, param6: number, pinPoints: PinPoint[], param8: number, pinOrientation: PinOrientations) 
		{
			this.lastAbsoluteHeightMin = param4 - param8 + PinPointsLayer.FLAG_HEIGHT;
			let _loc10_ = false;
			for (let _loc11_ = param5; _loc11_ < param5 + param6; _loc11_++)
				_loc10_ = _loc10_ || pinPoints[_loc11_].active || pinPoints[_loc11_].forceExpandInGroup;

			if (param6 > 1 && _loc10_ || !Boolean(Const.ENABLE_COMPACT_FLAGS))
			{
				const _loc12_ = param8 + (param6 - 1) * PinPointsLayer.FLAG_HEIGHT;
				for (let _loc11_ = param5; _loc11_ < param5 + param6; _loc11_++)
				{
					const _loc13_ = param8 + (_loc11_ - param5) * PinPointsLayer.FLAG_HEIGHT;
					this.renderFlag(param3, pinOrientation, _loc13_, pinPoints[_loc11_]);
					if (pinPoints[_loc11_].active)
						this.pinPointContentMovie.setActivePinPoint(pinPoints[_loc11_], param3, this.pinPointYWhenContentDisplayed - _loc12_);
				}
			}
			else
			{
				const _loc14_ = Math.min(param6, PinPointMovie.MAX_SHOWN_GROUP_COUNT) * 2;
				const _loc12_ = param8 + _loc14_;
				this.renderFlag(param3, pinOrientation, param8 + _loc14_, pinPoints[param5 + param6 - 1], pinPoints[param5], param6);
				if (pinPoints[param5].active)
					this.pinPointContentMovie.setActivePinPoint(pinPoints[param5], param3, this.pinPointYWhenContentDisplayed - _loc12_);
			}
			this.lastAbsoluteHeightMax = param4 - this.pinMovies[this.activeMovies - 1].getHeight();
		}
	}
}
