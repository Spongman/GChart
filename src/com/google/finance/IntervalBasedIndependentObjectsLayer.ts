namespace com.google.finance
{
	// import flash.display.Sprite;

	export class IntervalBasedIndependentObjectsLayer extends AbstractLayer<ViewPoint>
	{
		static readonly POSITION_BOTTOM = "bottom";
		static readonly HIDE_TEXT_THRESHOLD = 1500;
		static readonly POSITION_CHART = "chart";
		static readonly TOP_DEPTH = 16000;
		static readonly MIN_PADDING = 20;
		static readonly OBJECT_DISTANCE = 6;

		private readonly movies: SplitMovie[] = [];
		private activeMovies: number = 0;

		renderObj: string;
		avoidObj: string;
		positioning = IntervalBasedIndependentObjectsLayer.POSITION_CHART;
		readonly highlightCanvas = new flash.display.Sprite("highlightCanvas");

		constructor(viewPoint: ViewPoint, dataSource: DataSource)
		{
			super(viewPoint, dataSource);
			this.viewPoint.addChildToTopCanvas(this.highlightCanvas);
		}

		private resetCanvas()
		{
			for (const movie of this.movies)
				this.removeChild(movie);

			this.movies.splice(0);
		}

		private getDataUnit(stockAssociatedObject: StockAssociatedObject, param2: number): DataUnit
		{
			let posInInterval = notnull(stockAssociatedObject.posInInterval);
			const _loc3_ = notnull(posInInterval[param2].refDataSeries);
			const points = _loc3_.getPointsInIntervalArray(param2);
			return points[posInInterval[param2].position];
		}

		getYPos(context: Context, dataUnit: DataUnit): number
		{
			const viewPoint = this.viewPoint;
			return viewPoint.miny + viewPoint.V_OFFSET + viewPoint.medPriceY - (dataUnit.close - context.medPrice) * viewPoint.maxPriceRangeViewSize / context.maxPriceRange;
		}

		renderLayer(context: Context)
		{
			if (isNaN(context.lastMinute) || isNaN(context.count) || context.count === 0)
				return;

			const _loc2_ = this.dataSource.objects[this.renderObj];
			if (!_loc2_ || _loc2_.length === 0)
			{
				this.resetCanvas();
				return;
			}
			const detailLevel = this.viewPoint.getDetailLevelForTechnicalStyle();
			const detailLevelInterval = Const.getDetailLevelInterval(detailLevel);
			this.activeMovies = 0;
			const firstVisibleObject = this.getFirstVisibleObject(_loc2_, detailLevelInterval, context);
			if (firstVisibleObject === -1)
			{
				this.resetCanvas();
				return;
			}
			const lastVisibleObject = this.getLastVisibleObject(_loc2_, detailLevelInterval, context);
			const _loc7_ = this.viewPoint.count / this.dataSource.data.marketDayLength;
			context[this.renderObj] = [];
			let _loc8_ = 0;
			for (let visibleObjectIndex = firstVisibleObject; visibleObjectIndex <= lastVisibleObject; visibleObjectIndex++)
			{
				const _loc10_ = _loc2_[visibleObjectIndex];
				if (notnull(_loc10_.posInInterval)[detailLevelInterval])
				{
					const position = this.getPosition(_loc10_, detailLevelInterval, context);
					const _loc12_ = this.putObject(_loc10_, position);
					if (_loc7_ > IntervalBasedIndependentObjectsLayer.HIDE_TEXT_THRESHOLD)
					{
						_loc12_.hideText();
						_loc12_.setPersistentHide(true);
					}
					else
					{
						_loc12_.setPersistentHide(false);
					}
					context[this.renderObj].push(_loc12_);
					if (this.avoidObj && context[this.avoidObj])
					{
						while (_loc8_ < context[this.avoidObj].length - 1 && context[this.avoidObj][_loc8_].x < _loc12_.x)
							_loc8_++;

						if (_loc8_ < context[this.avoidObj].length)
						{
							const _loc13_ = context[this.avoidObj][_loc8_];
							if (_loc13_.x === _loc12_.x)
							{
								_loc13_.setOrientation(Orientations.SIDEWAYS + position.orientation);
								_loc12_.setOrientation(Orientations.SIDEWAYS + position.orientation);
							}
						}
					}
				}
			}
			for (let movieIndex = this.activeMovies; movieIndex < this.movies.length; movieIndex++)
				this.removeChild(this.movies[movieIndex]);

			this.movies.splice(this.activeMovies);
		}

		private getPosition(stockAssociatedObject: StockAssociatedObject, param2: number, context: Context): Position
		{
			const position = new Position();
			const dataUnit = this.getDataUnit(stockAssociatedObject, param2);
			const _loc6_ = !isNaN(dataUnit.weeklyXPos) ? Number(dataUnit.weeklyXPos) : this.viewPoint.getXPos(dataUnit);
			const yPos = this.getYPos(context, dataUnit);
			//const _loc8_ = (this.viewPoint.maxy + this.viewPoint.miny) / 2;
			if (this.positioning === IntervalBasedIndependentObjectsLayer.POSITION_CHART)
			{
				if (yPos > this.viewPoint.miny + 40)
				{
					position.y = yPos - IntervalBasedIndependentObjectsLayer.OBJECT_DISTANCE;
					position.orientation = Orientations.DOWN;
				}
				else
				{
					position.y = yPos + IntervalBasedIndependentObjectsLayer.OBJECT_DISTANCE;
					position.orientation = Orientations.UP;
				}
			}
			else if (this.positioning === IntervalBasedIndependentObjectsLayer.POSITION_BOTTOM)
			{
				const bottomLayer = this.viewPoint.getLayer("BottomBarLayer") as BottomBarLayer;
				let _loc10_ = 0;
				if (bottomLayer)
					_loc10_ = Number(bottomLayer.bottomTextHeight);

				position.y = this.viewPoint.maxy - _loc10_;
				position.orientation = Orientations.DOWN;
			}
			position.x = _loc6_;
			return position;
		}

		private getLastVisibleObject(stockAssociatedObjects: StockAssociatedObject[], param2: number, context: Context): number
		{
			const lastMinute = context.lastMinute;
			for (let objectIndex = stockAssociatedObjects.length - 1; objectIndex >= 0; objectIndex--)
			{
				if (notnull(stockAssociatedObjects[objectIndex].posInInterval)[param2])
				{
					const dataUnit = this.getDataUnit(stockAssociatedObjects[objectIndex], param2);
					if (dataUnit && dataUnit.relativeMinutes < lastMinute)
						return objectIndex;
				}
			}
			return -1;
		}

		private putObject(stockAssociatedObject: StockAssociatedObject, position: Position): SplitMovie
		{
			let _loc3_: SplitMovie;
			if (this.activeMovies >= this.movies.length)
			{
				let _loc4_: typeof SplitMovie;
				switch (this.renderObj)
				{
					case "split":
						_loc4_ = SplitMovie;
						break;
					case "dividend":
						_loc4_ = DividendMovie;
						break;
					case "stock_dividend":
						_loc4_ = StockDividendMovie;
						break;
					default:
						throw new Error();
				}
				_loc3_ = new _loc4_();
				this.addChild(_loc3_);
			}
			else
			{
				_loc3_ = this.movies[this.activeMovies];
			}
			_loc3_.x = position.x;
			_loc3_.y = position.y;
			_loc3_.setObject(stockAssociatedObject);
			if (stockAssociatedObject.originalObject._orientation)
			{
				switch (stockAssociatedObject.originalObject._orientation)
				{
					case "down":
						position.orientation = Orientations.DOWN;
						break;
					case "up":
						position.orientation = Orientations.UP;
						break;
				}
			}
			_loc3_.setOrientation(position.orientation);
			_loc3_.setSupportingLayer(this);
			_loc3_.setHighlightCanvas(this.highlightCanvas);
			if (this.activeMovies >= this.movies.length)
				this.movies.push(_loc3_);

			this.activeMovies++;
			return _loc3_;
		}

		private getFirstVisibleObject(stockAssociatedObjects: StockAssociatedObject[], param2: number, context: Context): number
		{
			const _loc4_ = context.lastMinute - context.count;
			for (let objectIndex = 0; objectIndex < stockAssociatedObjects.length; objectIndex++)
			{
				if (notnull(stockAssociatedObjects[objectIndex].posInInterval)[param2])
				{
					const dataUnit = this.getDataUnit(stockAssociatedObjects[objectIndex], param2);
					if (dataUnit && dataUnit.relativeMinutes > _loc4_)
						return objectIndex;
				}
			}
			return -1;
		}
	}
}
