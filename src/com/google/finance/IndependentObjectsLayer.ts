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
			(<ViewPoint><any>viewPoint).addChildToTopCanvas(this.highlightCanvas);
		}

		private resetCanvas() 
		{
			for (let _loc1_ = 0; _loc1_ < this.movies.length; _loc1_++)
			{
				this.removeChild(this.movies[_loc1_]);
			}
			this.movies.splice(0);
		}

		getYPos(context: Context, param2: DataUnit): number
		{
			const _loc4_ = this.viewPoint;
			return _loc4_.miny + _loc4_.V_OFFSET + _loc4_.medPriceY - (param2.close - context.medPrice) * _loc4_.maxPriceRangeViewSize / context.maxPriceRange;
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
			const _loc3_ = this.dataSource.data.units;
			const _loc4_ = this.viewPoint.getDetailLevel();
			this.activeMovies = 0;
			const _loc5_ = this.getFirstVisibleObject(_loc2_, _loc3_, context);
			if (_loc5_ === -1)
			{
				this.resetCanvas();
				return;
			}
			const _loc6_ = this.getLastVisibleObject(_loc2_, _loc3_, context);
			const _loc7_ = this.viewPoint.count / this.dataSource.data.marketDayLength;
			context[this.renderObj] = [];
			let _loc8_ = 0;
			for (let _loc9_ = _loc5_; _loc9_ <= _loc6_; _loc9_++)
			{
				const _loc10_ = this.getPosition(_loc2_[_loc9_], _loc3_, _loc4_, context);
				const _loc11_ = this.putObject(_loc2_[_loc9_], _loc10_);
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
							_loc12_.setOrientation(Const.SIDEWAYS + _loc10_.orientation);
							_loc11_.setOrientation(Const.SIDEWAYS + _loc10_.orientation);
						}
					}
				}
			}
			for (let _loc9_ = this.activeMovies; _loc9_ < this.movies.length; _loc9_++)
			{
				this.removeChild(this.movies[_loc9_]);
			}
			this.movies.splice(this.activeMovies);
		}

		private getPosition(param1: SeriesPosition, param2: DataUnit[], param3: number, param4: Context): Position
		{
			const _loc5_ = new Position();
			let dataSeries = notnull(param1.refDataSeries);
			const _loc6_ = this.viewPoint.getXPos(dataSeries.units[param1.pos]);
			const _loc7_ = this.getYPos(param4, dataSeries.units[param1.pos]);
			//const _loc8_ = (this.viewPoint.maxy + this.viewPoint.miny) / 2;
			if (this.positioning === IndependentObjectsLayer.POSITION_CHART)
			{
				if (_loc7_ > this.viewPoint.miny + 40)
				{
					_loc5_.y = _loc7_ - IndependentObjectsLayer.OBJECT_DISTANCE;
					_loc5_.orientation = Const.DOWN;
				}
				else
				{
					_loc5_.y = _loc7_ + IndependentObjectsLayer.OBJECT_DISTANCE;
					_loc5_.orientation = Const.UP;
				}
			}
			else if (this.positioning === IndependentObjectsLayer.POSITION_BOTTOM)
			{
				const _loc9_ = this.viewPoint.getLayer("BottomBarLayer") as BottomBarLayer;
				let _loc10_ = 0;
				if (_loc9_)
					_loc10_ = Number(_loc9_.bottomTextHeight);

				_loc5_.y = this.viewPoint.maxy - _loc10_;
				_loc5_.orientation = Const.DOWN;
			}
			_loc5_.x = _loc6_;
			return _loc5_;
		}

		private getLastVisibleObject(param1: SeriesPosition[], param2: DataUnit[], param3: Context): number
		{
			const _loc4_ = param3.lastMinute;
			for (let _loc5_ = param1.length - 1; _loc5_ >= 0; _loc5_--)
			{
				const _loc6_ = param1[_loc5_];
				const _loc7_ = notnull(_loc6_.refDataSeries).units[_loc6_.pos].relativeMinutes;
				if (_loc7_ < _loc4_)
					return _loc5_;

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
						param2.orientation = Const.DOWN;
						break;
					case "up":
						param2.orientation = Const.UP;
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

		private getFirstVisibleObject(param1: SeriesPosition[], param2: DataUnit[], param3: Context): number
		{
			const _loc4_ = param3.lastMinute - param3.count;
			for (let _loc5_ = 0; _loc5_ < param1.length; _loc5_++)
			{
				const _loc6_ = param1[_loc5_];
				const _loc7_ = notnull(_loc6_.refDataSeries).units[_loc6_.pos].relativeMinutes;
				if (_loc7_ > _loc4_ && _loc6_.pos > 0)
					return _loc5_;
			}
			return -1;
		}
	}
}
