namespace com.google.finance
{
	export class IntervalBasedPinPointsLayer extends AbstractLayer<ViewPoint>
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
		private activeMovies: number = 0;
		private pinMovies: PinPointMovie[] = [];
		private lastAbsoluteHeightMin: number;

		constructor(viewPoint: ViewPoint, dataSource: DataSource)
		{
			super(viewPoint, dataSource);
			this.pinPointContentMovie = new PinPointContentMovie(viewPoint);
			viewPoint.addChildToTopCanvas(this.pinPointContentMovie);
		}

		private getDataUnit(stockAssociatedObject: StockAssociatedObject, param2: number): DataUnit
		{
			const posInInterval = notnull(stockAssociatedObject.posInInterval);
			const refDataSeries = posInInterval[param2].refDataSeries;
			const points = notnull(refDataSeries).getPointsInIntervalArray(param2);
			return points[posInInterval[param2].position];
		}

		private getLastVisibleFlagIndex(context: Context, stockAssociatedObjects: StockAssociatedObject[], param3: number): number
		{
			for (let objectIndex = stockAssociatedObjects.length - 1; objectIndex >= 0; objectIndex--)
			{
				const object = stockAssociatedObjects[objectIndex];
				if (notnull(object.posInInterval)[param3])
				{
					if (this.getDataUnit(object, param3).relativeMinutes <= context.lastMinute)
						return objectIndex;
				}
			}
			return -1;
		}

		private getFirstVisibleFlagIndex(context: Context, stockAssociatedObjects: StockAssociatedObject[], param3: number): number
		{
			for (let objectIndex = 0; objectIndex < stockAssociatedObjects.length; objectIndex++)
			{
				const _loc5_ = stockAssociatedObjects[objectIndex];
				if (notnull(_loc5_.posInInterval)[param3])
				{
					if (this.getDataUnit(_loc5_, param3).relativeMinutes > context.lastMinute - context.count)
						return objectIndex;
				}
			}
			return stockAssociatedObjects.length - 1;
		}

		private getPinPointMovieClip(pinPoint: PinPoint): PinPointMovie
		{
			let movie: PinPointMovie | null;
			const objectColor = pinPoint.originalObject._color ? pinPoint.originalObject._color : "gray";
			if (this.activeMovies >= this.pinMovies.length)
			{
				movie = objectColor === "orange" ? new OrangePinPointMovie() : new PinPointMovie();
				this.addChild(movie);
				this.pinMovies.push(movie);
			}
			else
			{
				movie = this.pinMovies[this.activeMovies];
				const movieColor = movie instanceof OrangePinPointMovie ? "orange" : "gray";
				if (movieColor !== objectColor)
				{
					movie = objectColor === "orange" ? new OrangePinPointMovie() : new PinPointMovie();
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

		private removePinMovies(firstIndex: number)
		{
			for (let movieIndex = firstIndex; movieIndex < this.pinMovies.length; movieIndex++)
			{
				this.removeChild(this.pinMovies[movieIndex]);
				this.pinMovies[movieIndex].clearReferences();
				delete this.pinMovies[movieIndex];
			}
			this.pinMovies.splice(firstIndex);
		}

		private getYPos(context: Context, dataUnit: DataUnit): number
		{
			return this.localYOffset - (dataUnit.getCloseLogValue(context.verticalScaling) - context.medPrice) * this.localYScale;
		}

		renderLayer(context: Context)
		{
			if (isNaN(context.lastMinute) || isNaN(context.count) || context.count === 0)
				return;

			const vp = this.viewPoint;
			const newsObjects = <PinPoint[]>this.dataSource.objects["newspin"];
			this.activeMovies = 0;
			this.pinPointContentMovie.clearMovie();
			if (!newsObjects || newsObjects.length === 0)
			{
				this.removePinMovies(0);
				return;
			}
			const _loc3_ = newsObjects[0].originalObject._color !== "orange";
			if (!Const.DISPLAY_NEWS_PINS && _loc3_)
			{
				this.removePinMovies(0);
				return;
			}
			this.localYOffset = vp.miny + vp.medPriceY + vp.V_OFFSET;
			this.localYScale = vp.maxPriceRangeViewSize / context.maxPriceRange;
			const layer = vp.getLayer("BottomBarLayer") as BottomBarLayer;
			this.pinPointYWhenContentDisplayed = vp.maxy - (!layer ? 0 : layer.bottomTextHeight);
			const detailLevel = vp.getDetailLevelForTechnicalStyle();
			const detailLevelInterval = Const.getDetailLevelInterval(detailLevel);
			const firstVisibleFlagIndex = this.getFirstVisibleFlagIndex(context, newsObjects, detailLevelInterval);
			const lastVisibleFlagIndex = this.getLastVisibleFlagIndex(context, newsObjects, detailLevelInterval);
			this.lastAbsoluteHeightMin = 0;
			this.lastAbsoluteHeightMax = 0;
			this.renderFlagGroups(context, newsObjects, firstVisibleFlagIndex, lastVisibleFlagIndex, detailLevelInterval);
			this.removePinMovies(this.activeMovies);
			if (!_loc3_)
				this.pinPointContentMovie.renderMovie();
		}

		private renderFlagGroups(context: Context, pinPoints: PinPoint[], param3: number, param4: number, param5: number)
		{
			let _loc11_ = 0;
			const _loc7_: number[] = [];
			const _loc8_: number[] = [];
			const _loc9_: number[] = [];
			const _loc10_: number[] = [];
			for (let _loc6_ = param3; _loc6_ <= param4; _loc6_ += _loc11_)
			{
				_loc7_.push(_loc6_);
				_loc11_ = this.getFlagGroupCount(context, pinPoints, _loc6_, param5);
				_loc8_.push(_loc11_);
				const dataUnit = this.getDataUnit(pinPoints[_loc6_], param5);
				_loc9_.push(Math.floor(!isNaN(dataUnit.weeklyXPos) ? Number(dataUnit.weeklyXPos) : this.viewPoint.getXPos(dataUnit)));
				_loc10_.push(this.getYPos(context, dataUnit));
			}
			if (_loc7_.length > 0)
			{
				const pinOrientations: PinOrientations[] = [];
				for (let _loc14_ = _loc7_.length - 1; _loc14_ >= 0; _loc14_--)
				{
					if ((pinOrientations.length === 0 || pinOrientations[pinOrientations.length - 1] === PinOrientations.LEFT_ORIENTATION) && _loc9_[_loc14_] + (_loc7_.length - _loc14_) * IntervalBasedPinPointsLayer.MIN_FLAGS_DIST > this.viewPoint.maxx)
						pinOrientations.push(PinOrientations.LEFT_ORIENTATION);
					else
						pinOrientations.push(PinOrientations.RIGHT_ORIENTATION);

				}
				pinOrientations.reverse();
				for (let _loc14_ = 0; _loc14_ < _loc7_.length; _loc14_++)
					this.renderFlagsGroup(context, param5, _loc9_[_loc14_], _loc10_[_loc14_], _loc7_[_loc14_], _loc8_[_loc14_], pinPoints, IntervalBasedPinPointsLayer.FLAG_POLE_HEIGHT + IntervalBasedPinPointsLayer.FLAG_HEIGHT, pinOrientations[_loc14_]);
			}
		}

		private renderFlag(x: number, pinOrientation: PinOrientations, height: number, pinPoint: PinPoint, param5?: PinPoint, count = 1)
		{
			const pinPointMovieClip = this.getPinPointMovieClip(pinPoint);
			this.addChild(pinPointMovieClip);
			pinPointMovieClip.x = x;
			pinPointMovieClip.y = this.pinPointYWhenContentDisplayed;
			pinPointMovieClip.setCount(count);
			pinPointMovieClip.setObj(pinPoint);
			pinPointMovieClip.setOrientation(pinOrientation);
			pinPointMovieClip.setHeight(height);
		}

		private getFlagGroupCount(context: Context, pinPoints: PinPoint[], pinIndex: number, param4: number): number
		{
			let _loc5_ = 1;
			const _loc6_ = pinPoints[pinIndex];
			const _loc7_ = notnull(_loc6_.posInInterval)[param4];
			if (!_loc7_)
				return _loc5_;

			while (pinIndex + _loc5_ < pinPoints.length)
			{
				const _loc8_ = notnull(pinPoints[pinIndex + _loc5_].posInInterval)[param4];
				if (!_loc8_ || _loc7_.position !== _loc8_.position || _loc7_.refDataSeries !== _loc8_.refDataSeries)
					break;

				_loc5_++;
			}
			return _loc5_;
		}

		private renderFlagsGroup(context: Context, param2: number, param3: number, param4: number, param5: number, param6: number, pinPoints: PinPoint[], param8: number, pinOrientation: PinOrientations)
		{
			this.lastAbsoluteHeightMin = param4 - param8 + IntervalBasedPinPointsLayer.FLAG_HEIGHT;
			let _loc10_ = false;
			for (let _loc11_ = param5; _loc11_ < param5 + param6; _loc11_++)
				_loc10_ = _loc10_ || pinPoints[_loc11_].active || pinPoints[_loc11_].forceExpandInGroup;

			let _loc12_: number;
			if (param6 > 1 && _loc10_ || !Boolean(Const.ENABLE_COMPACT_FLAGS))
			{
				_loc12_ = param8 + (param6 - 1) * IntervalBasedPinPointsLayer.FLAG_HEIGHT;
				for (let _loc11_ = param5; _loc11_ < param5 + param6; _loc11_++)
				{
					const _loc13_ = param8 + (_loc11_ - param5) * IntervalBasedPinPointsLayer.FLAG_HEIGHT;
					this.renderFlag(param3, pinOrientation, _loc13_, pinPoints[_loc11_]);
					if (pinPoints[_loc11_].active)
						this.pinPointContentMovie.setActivePinPoint(pinPoints[_loc11_], param3, this.pinPointYWhenContentDisplayed - _loc12_);
				}
			}
			else
			{
				const _loc14_ = Math.min(param6, PinPointMovie.MAX_SHOWN_GROUP_COUNT) * 2;
				_loc12_ = param8 + _loc14_;
				this.renderFlag(param3, pinOrientation, param8 + _loc14_, pinPoints[param5 + param6 - 1], pinPoints[param5], param6);
				if (pinPoints[param5].active)
					this.pinPointContentMovie.setActivePinPoint(pinPoints[param5], param3, this.pinPointYWhenContentDisplayed - _loc12_);
			}
			this.lastAbsoluteHeightMax = param4 - this.pinMovies[this.activeMovies - 1].getHeight();
		}
	}
}
