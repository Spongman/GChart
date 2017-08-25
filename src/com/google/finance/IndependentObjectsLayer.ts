namespace com.google.finance
{
	// import flash.display.Sprite;

	export class Position
	{
		x: number;
		y: number;
		orientation: number;
	}

	export class IndependentObjectsLayer extends AbstractLayer<ViewPoint>
	{
		static readonly POSITION_BOTTOM = "bottom";
		static readonly HIDE_TEXT_THRESHOLD = 1500;
		static readonly POSITION_CHART = "chart";
		static readonly TOP_DEPTH = 16000;
		static readonly MIN_PADDING = 20;
		static readonly OBJECT_DISTANCE = 6;

		private readonly movies: SplitMovie[] = [];
		private readonly highlightCanvas = new flash.display.Sprite("highlightCanvas");
		private activeMovies: number = 0;

		renderObj: string;
		avoidObj: string;
		positioning = IndependentObjectsLayer.POSITION_CHART;

		constructor(viewPoint: ViewPoint, dataSource: DataSource)
		{
			super(viewPoint, dataSource);
			viewPoint.addChildToTopCanvas(this.highlightCanvas);
		}

		private resetCanvas()
		{
			for (const movie of this.movies)
				this.removeChild(movie);

			this.movies.splice(0);
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
			const units = this.dataSource.data.units;
			const detailLevel = this.viewPoint.getDetailLevel();
			this.activeMovies = 0;
			const firstVisibleObject = this.getFirstVisibleObject(_loc2_, units, context);
			if (firstVisibleObject === -1)
			{
				this.resetCanvas();
				return;
			}

			const lastVisibleObject = this.getLastVisibleObject(_loc2_, units, context);
			const _loc7_ = this.viewPoint.count / this.dataSource.data.marketDayLength;
			context[this.renderObj] = [];
			let _loc8_ = 0;
			for (let visibleObjectIndex = firstVisibleObject; visibleObjectIndex <= lastVisibleObject; visibleObjectIndex++)
			{
				const position = this.getPosition(_loc2_[visibleObjectIndex], units, detailLevel, context);
				const _loc11_ = this.putObject(_loc2_[visibleObjectIndex], position);
				if (_loc7_ > IndependentObjectsLayer.HIDE_TEXT_THRESHOLD)
				{
					_loc11_.hideText();
					_loc11_.setPersistentHide(true);
				}
				else
				{
					_loc11_.setPersistentHide(false);
				}
				context[this.renderObj].push(_loc11_);
				if (this.avoidObj && context[this.avoidObj])
				{
					while (_loc8_ < context[this.avoidObj].length - 1 && context[this.avoidObj][_loc8_].x < _loc11_.x)
						_loc8_++;

					if (_loc8_ < context[this.avoidObj].length)
					{
						const _loc12_ = context[this.avoidObj][_loc8_];
						if (_loc12_.x === _loc11_.x)
						{
							_loc12_.setOrientation(Orientations.SIDEWAYS + position.orientation);
							_loc11_.setOrientation(Orientations.SIDEWAYS + position.orientation);
						}
					}
				}
			}
			for (let movieIndex = this.activeMovies; movieIndex < this.movies.length; movieIndex++)
				this.removeChild(this.movies[movieIndex]);

			this.movies.splice(this.activeMovies);
		}

		private getPosition(seriesPosition: SeriesPosition, dataUnits: DataUnit[], param3: number, context: Context): Position
		{
			const position = new Position();
			const dataSeries = notnull(seriesPosition.refDataSeries);
			const xPos = this.viewPoint.getXPos(dataSeries.units[seriesPosition.pos]);
			const yPos = this.getYPos(context, dataSeries.units[seriesPosition.pos]);
			//const _loc8_ = (this.viewPoint.maxy + this.viewPoint.miny) / 2;
			if (this.positioning === IndependentObjectsLayer.POSITION_CHART)
			{
				if (yPos > this.viewPoint.miny + 40)
				{
					position.y = yPos - IndependentObjectsLayer.OBJECT_DISTANCE;
					position.orientation = Orientations.DOWN;
				}
				else
				{
					position.y = yPos + IndependentObjectsLayer.OBJECT_DISTANCE;
					position.orientation = Orientations.UP;
				}
			}
			else if (this.positioning === IndependentObjectsLayer.POSITION_BOTTOM)
			{
				const layer = this.viewPoint.getLayer("BottomBarLayer") as BottomBarLayer;
				let _loc10_ = 0;
				if (layer)
					_loc10_ = Number(layer.bottomTextHeight);

				position.y = this.viewPoint.maxy - _loc10_;
				position.orientation = Orientations.DOWN;
			}
			position.x = xPos;
			return position;
		}

		private getLastVisibleObject(seriesPositions: SeriesPosition[], dataUnits: DataUnit[], context: Context): number
		{
			const lastMinute = context.lastMinute;
			for (let seriesPositionIndex = seriesPositions.length - 1; seriesPositionIndex >= 0; seriesPositionIndex--)
			{
				const _loc6_ = seriesPositions[seriesPositionIndex];
				const relativeMinutes = notnull(_loc6_.refDataSeries).units[_loc6_.pos].relativeMinutes;
				if (relativeMinutes < lastMinute)
					return seriesPositionIndex;
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

		private getFirstVisibleObject(seriesPositions: SeriesPosition[], dataUnits: DataUnit[], context: Context): number
		{
			const _loc4_ = context.lastMinute - context.count;
			for (let seriesPositionIndex = 0; seriesPositionIndex < seriesPositions.length; seriesPositionIndex++)
			{
				const _loc6_ = seriesPositions[seriesPositionIndex];
				const relativeMinutes = notnull(_loc6_.refDataSeries).units[_loc6_.pos].relativeMinutes;
				if (relativeMinutes > _loc4_ && _loc6_.pos > 0)
					return seriesPositionIndex;
			}
			return -1;
		}
	}
}
