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
			(<ViewPoint><any>this.viewPoint).addChildToTopCanvas(this.highlightCanvas);
		}

		private resetCanvas() 
		{
			for (let movieIndex = 0; movieIndex < this.movies.length; movieIndex++)
				this.removeChild(this.movies[movieIndex]);

			this.movies.splice(0);
		}

		private getDataUnit(param1: StockAssociatedObject, param2: number): DataUnit
		{
			let posInInterval = notnull(param1.posInInterval);
			const _loc3_ = notnull(posInInterval[param2].refDataSeries);
			const points = _loc3_.getPointsInIntervalArray(param2);
			return points[posInInterval[param2].position];
		}

		getYPos(context: Context, param2: DataUnit): number
		{
			const viewPoint = this.viewPoint;
			return viewPoint.miny + viewPoint.V_OFFSET + viewPoint.medPriceY - (param2.close - context.medPrice) * viewPoint.maxPriceRangeViewSize / context.maxPriceRange;
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
			for (let _loc9_ = firstVisibleObject; _loc9_ <= lastVisibleObject; _loc9_++)
			{
				const _loc10_ = _loc2_[_loc9_];
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
			for (let _loc9_ = this.activeMovies; _loc9_ < this.movies.length; _loc9_++)
				this.removeChild(this.movies[_loc9_]);

			this.movies.splice(this.activeMovies);
		}

		private getPosition(param1: StockAssociatedObject, param2: number, param3: Context): Position
		{
			const position = new Position();
			const dataUnit = this.getDataUnit(param1, param2);
			const _loc6_ = !isNaN(dataUnit.weeklyXPos) ? Number(dataUnit.weeklyXPos) : this.viewPoint.getXPos(dataUnit);
			const yPos = this.getYPos(param3, dataUnit);
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

		private getLastVisibleObject(param1: StockAssociatedObject[], param2: number, param3: Context): number
		{
			const lastMinute = param3.lastMinute;
			for (let _loc5_ = param1.length - 1; _loc5_ >= 0; _loc5_--)
			{
				if (notnull(param1[_loc5_].posInInterval)[param2])
				{
					const dataUnit = this.getDataUnit(param1[_loc5_], param2);
					if (dataUnit && dataUnit.relativeMinutes < lastMinute)
						return _loc5_;
				}
			}
			return -1;
		}

		private putObject(param1: StockAssociatedObject, param2: Position): SplitMovie
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
			_loc3_.x = param2.x;
			_loc3_.y = param2.y;
			_loc3_.setObject(param1);
			if (param1.originalObject._orientation)
			{
				switch (param1.originalObject._orientation)
				{
					case "down":
						param2.orientation = Orientations.DOWN;
						break;
					case "up":
						param2.orientation = Orientations.UP;
						break;
				}
			}
			_loc3_.setOrientation(param2.orientation);
			_loc3_.setSupportingLayer(this);
			_loc3_.setHighlightCanvas(this.highlightCanvas);
			if (this.activeMovies >= this.movies.length)
				this.movies.push(_loc3_);

			this.activeMovies++;
			return _loc3_;
		}

		private getFirstVisibleObject(param1: StockAssociatedObject[], param2: number, param3: Context): number
		{
			const _loc4_ = param3.lastMinute - param3.count;
			for (let _loc5_ = 0; _loc5_ < param1.length; _loc5_++)
			{
				if (notnull(param1[_loc5_].posInInterval)[param2])
				{
					const dataUnit = this.getDataUnit(param1[_loc5_], param2);
					if (dataUnit && dataUnit.relativeMinutes > _loc4_)
						return _loc5_;
				}
			}
			return -1;
		}
	}
}
