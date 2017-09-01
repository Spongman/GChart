namespace com.google.finance
{
	// import flash.display.Sprite;

	export class Position
	{
		x: number;
		y: number;
		orientation: Orientations;
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

			const objects = this.dataSource.objects[this.renderObj];
			if (!objects || objects.length === 0)
			{
				this.resetCanvas();
				return;
			}
			const units = this.dataSource.data.units;
			const detailLevel = this.viewPoint.getDetailLevel();
			this.activeMovies = 0;
			const firstVisibleObject = this.getFirstVisibleObject(objects, units, context);
			if (firstVisibleObject === -1)
			{
				this.resetCanvas();
				return;
			}

			const lastVisibleObject = this.getLastVisibleObject(objects, units, context);
			const _loc7_ = this.viewPoint.count / this.dataSource.data.marketDayLength;
			context[this.renderObj] = [];
			let _loc8_ = 0;
			for (let visibleObjectIndex = firstVisibleObject; visibleObjectIndex <= lastVisibleObject; visibleObjectIndex++)
			{
				const position = this.getPosition(objects[visibleObjectIndex], units, detailLevel, context);
				const _loc11_ = this.putObject(objects[visibleObjectIndex], position);
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

		private getPosition(seriesPosition: SeriesPosition, dataUnits: DataUnit[], detailLevel: Intervals, context: Context): Position
		{
			const position = new Position();
			const dataSeries = notnull(seriesPosition.refDataSeries);
			const x = this.viewPoint.getXPos(dataSeries.units[seriesPosition.pos]);
			const y = this.getYPos(context, dataSeries.units[seriesPosition.pos]);
			//const _loc8_ = (this.viewPoint.maxy + this.viewPoint.miny) / 2;
			if (this.positioning === IndependentObjectsLayer.POSITION_CHART)
			{
				if (y > this.viewPoint.miny + 40)
				{
					position.y = y - IndependentObjectsLayer.OBJECT_DISTANCE;
					position.orientation = Orientations.DOWN;
				}
				else
				{
					position.y = y + IndependentObjectsLayer.OBJECT_DISTANCE;
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
			position.x = x;
			return position;
		}

		private getLastVisibleObject(seriesPositions: SeriesPosition[], dataUnits: DataUnit[], context: Context): number
		{
			const lastMinute = context.lastMinute;
			for (let seriesPositionIndex = seriesPositions.length - 1; seriesPositionIndex >= 0; seriesPositionIndex--)
			{
				const position = seriesPositions[seriesPositionIndex];
				const relativeMinutes = notnull(position.refDataSeries).units[position.pos].relativeMinutes;
				if (relativeMinutes < lastMinute)
					return seriesPositionIndex;
			}
			return -1;
		}

		private putObject(stockAssociatedObject: StockAssociatedObject, position: Position): SplitMovie
		{
			let movie: SplitMovie;
			if (this.activeMovies >= this.movies.length)
			{
				let movieType: typeof SplitMovie;
				switch (this.renderObj)
				{
					case "split":
						movieType = SplitMovie;
						break;
					case "dividend":
						movieType = DividendMovie;
						break;
					case "stock_dividend":
						movieType = StockDividendMovie;
						break;
					default:
						throw new Error();
				}
				movie = new movieType();
				this.addChild(movie);
			}
			else
			{
				movie = this.movies[this.activeMovies];
			}
			movie.x = position.x;
			movie.y = position.y;
			movie.setObject(stockAssociatedObject);
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
			movie.setOrientation(position.orientation);
			movie.setSupportingLayer(this);
			movie.setHighlightCanvas(this.highlightCanvas);
			if (this.activeMovies >= this.movies.length)
				this.movies.push(movie);

			this.activeMovies++;
			return movie;
		}

		private getFirstVisibleObject(seriesPositions: SeriesPosition[], dataUnits: DataUnit[], context: Context): number
		{
			const _loc4_ = context.lastMinute - context.count;
			for (let seriesPositionIndex = 0; seriesPositionIndex < seriesPositions.length; seriesPositionIndex++)
			{
				const position = seriesPositions[seriesPositionIndex];
				const relativeMinutes = notnull(position.refDataSeries).units[position.pos].relativeMinutes;
				if (relativeMinutes > _loc4_ && position.pos > 0)
					return seriesPositionIndex;
			}
			return -1;
		}
	}
}
