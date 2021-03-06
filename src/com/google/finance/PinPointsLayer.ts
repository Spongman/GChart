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
		private pinPointContentMovie: PinPointContentMovie;
		private localYScale = 0;
		private pinPointYWhenContentDisplayed = 0;
		private activeMovies = 0;
		private pinMovies: PinPointMovie[] = [];
		private lastAbsoluteHeightMin: number;

		constructor(viewPoint: ViewPoint, dataSource: DataSource)
		{
			super(viewPoint, dataSource);
			this.pinPointContentMovie = new PinPointContentMovie(viewPoint);
			viewPoint.addChildToTopCanvas(this.pinPointContentMovie);
		}

		private getFlagGroupCount(context: Context, pinPoints: PinPoint[], pinIndex: number, detailLevel: Intervals): number
		{
			let count = 1;
			const pin = pinPoints[pinIndex];
			if (detailLevel === Intervals.INTRADAY)
			{
				while (pinIndex + count < pinPoints.length && pinPoints[pinIndex + count].pos === pin.pos && pinPoints[pinIndex + count].refDataSeries === pin.refDataSeries)
					count++;
			}
			else
			{
				while (pinIndex + count < pinPoints.length && pinPoints[pinIndex + count].dayPos === pin.dayPos && pinPoints[pinIndex + count].refDataSeries === pin.refDataSeries)
					count++;
			}
			return count;
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
			let movie: PinPointMovie;
			const originalColor = pinPoint.originalObject._color ? pinPoint.originalObject._color : "gray";
			if (this.activeMovies >= this.pinMovies.length)
			{
				movie = originalColor === "orange" ? new OrangePinPointMovie() : new PinPointMovie();
				this.addChild(movie);
				this.pinMovies.push(movie);
			}
			else
			{
				movie = this.pinMovies[this.activeMovies];
				const movieColor = movie instanceof OrangePinPointMovie ? "orange" : "gray";
				if (movieColor !== originalColor)
				{
					movie = originalColor === "orange" ? new OrangePinPointMovie() : new PinPointMovie();
					this.removeChild(this.pinMovies[this.activeMovies]);
					this.pinMovies[this.activeMovies].clearReferences();
					delete this.pinMovies[this.activeMovies];
					this.pinMovies[this.activeMovies] = movie;
				}
			}
			movie.setPinPointContentMovie(this.pinPointContentMovie);
			this.activeMovies++;
			return movie;
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
			const vp = this.viewPoint;
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

		private renderFlagGroups(context: Context, pinPoints: PinPoint[], param3: number, param4: number, detailLevel: Intervals)
		{
			const _loc7_: number[] = [];
			const _loc8_: number[] = [];
			const _loc9_: number[] = [];
			const _loc10_: number[] = [];
			for (let _loc6_ = param3; _loc6_ <= param4;)
			{
				_loc7_.push(_loc6_);
				const flagGroupCount = this.getFlagGroupCount(context, pinPoints, _loc6_, detailLevel);
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
					this.renderFlagsGroup(context, detailLevel, _loc9_[_loc14_], _loc10_[_loc14_], _loc7_[_loc14_], _loc8_[_loc14_], pinPoints, PinPointsLayer.FLAG_POLE_HEIGHT + PinPointsLayer.FLAG_HEIGHT, pinOrientations[_loc14_]);
				}
			}
		}

		private renderFlag(x: number, pinOrientation: PinOrientations, height: number, object: PinPoint, _?: PinPoint, count = 1)
		{
			const pinPointMovieClip = this.getPinPointMovieClip(object);
			this.addChild(pinPointMovieClip);
			pinPointMovieClip.x = x;
			pinPointMovieClip.y = this.pinPointYWhenContentDisplayed;
			pinPointMovieClip.setCount(count);
			pinPointMovieClip.setObj(object);
			pinPointMovieClip.setOrientation(pinOrientation);
			pinPointMovieClip.setHeight(height);
		}

		private getVisibleDataUnit(pinPoint: PinPoint): DataUnit
		{
			const dataSeries = notnull(pinPoint.refDataSeries);
			//const _loc2_ = _loc5_.units[param1.pos];
			const skipInterval = this.viewPoint.getSkipInterval();
			let unitIndex = 0;
			if (skipInterval.interval >= Const.WEEKLY_INTERVAL)
				unitIndex = Number(dataSeries.fridays[dataSeries.getNextWeekEnd(pinPoint.pos)]);
			else if (skipInterval.interval >= Const.DAILY_INTERVAL)
				unitIndex = Number(pinPoint.dayPos);
			else
				unitIndex = Number(pinPoint.pos + (notnull(pinPoint.dayPos) - pinPoint.pos) % skipInterval.skip);

			return dataSeries.units[unitIndex];
		}

		private renderFlagsGroup(context: Context, detailLevel: Intervals, param3: number, param4: number, pinIndex: number, param6: number, pinPoints: PinPoint[], param8: number, pinOrientation: PinOrientations)
		{
			this.lastAbsoluteHeightMin = param4 - param8 + PinPointsLayer.FLAG_HEIGHT;
			let _loc10_ = false;
			for (let _loc11_ = pinIndex; _loc11_ < pinIndex + param6; _loc11_++)
				_loc10_ = _loc10_ || pinPoints[_loc11_].active || pinPoints[_loc11_].forceExpandInGroup;

			if (param6 > 1 && _loc10_ || !Boolean(Const.ENABLE_COMPACT_FLAGS))
			{
				const _loc12_ = param8 + (param6 - 1) * PinPointsLayer.FLAG_HEIGHT;
				for (let _loc11_ = pinIndex; _loc11_ < pinIndex + param6; _loc11_++)
				{
					const _loc13_ = param8 + (_loc11_ - pinIndex) * PinPointsLayer.FLAG_HEIGHT;
					this.renderFlag(param3, pinOrientation, _loc13_, pinPoints[_loc11_]);
					if (pinPoints[_loc11_].active)
						this.pinPointContentMovie.setActivePinPoint(pinPoints[_loc11_], param3, this.pinPointYWhenContentDisplayed - _loc12_);
				}
			}
			else
			{
				const _loc14_ = Math.min(param6, PinPointMovie.MAX_SHOWN_GROUP_COUNT) * 2;
				const _loc12_ = param8 + _loc14_;
				this.renderFlag(param3, pinOrientation, param8 + _loc14_, pinPoints[pinIndex + param6 - 1], pinPoints[pinIndex], param6);
				if (pinPoints[pinIndex].active)
					this.pinPointContentMovie.setActivePinPoint(pinPoints[pinIndex], param3, this.pinPointYWhenContentDisplayed - _loc12_);
			}
			this.lastAbsoluteHeightMax = param4 - this.pinMovies[this.activeMovies - 1].getHeight();
		}
	}
}
