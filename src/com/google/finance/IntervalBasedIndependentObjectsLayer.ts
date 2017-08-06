namespace com.google.finance
{
	// import flash.display.Sprite;

	export class IntervalBasedIndependentObjectsLayer extends AbstractLayer<ViewPoint>
	{
		static readonly POSITION_BOTTOM = "bottom";

		static readonly HIDE_TEXT_THRESHOLD = 1500;

		static readonly POSITION_CHART = "chart";


		renderObj: string;

		avoidObj: string;

		private movies: SplitMovie[];

		static readonly TOP_DEPTH = 16000;

		positioning: string;

		static readonly MIN_PADDING = 20;

		private activeMovies: number;

		highlightCanvas: flash.display.Sprite;

		static readonly OBJECT_DISTANCE = 6;

		constructor(param1: ViewPoint, param2: DataSource)
		{
			super(param1, param2);
			this.movies = [];
			this.activeMovies = 0;
			this.positioning = IntervalBasedIndependentObjectsLayer.POSITION_CHART;
			this.highlightCanvas = new flash.display.Sprite("highlightCanvas");
			(<ViewPoint><any>this.viewPoint).addChildToTopCanvas(this.highlightCanvas);
		}

		private resetCanvas() 
		{
			for (let _loc1_ = 0; _loc1_ < this.movies.length; _loc1_++)
			{
				this.removeChild(this.movies[_loc1_]);
			}
			this.movies.splice(0);
		}

		private getDataUnit(param1: StockAssociatedObject, param2: number): DataUnit
		{
			let posInInterval = notnull(param1.posInInterval);
			let _loc3_ = notnull(posInInterval[param2].refDataSeries);
			let _loc4_ = _loc3_.getPointsInIntervalArray(param2);
			return _loc4_[posInInterval[param2].position];
		}

		getYPos(context: Context, param2: DataUnit): number
		{
			let _loc3_ = NaN;
			let _loc4_ = this.viewPoint;
			_loc3_ = _loc4_.miny + _loc4_.V_OFFSET + _loc4_.medPriceY - (param2.close - context.medPrice) * _loc4_.maxPriceRangeViewSize / context.maxPriceRange;
			return _loc3_;
		}

		renderLayer(context: Context) 
		{
			if (isNaN(context.lastMinute) || isNaN(context.count) || context.count === 0)
				return;

			let _loc2_ = this.dataSource.objects[this.renderObj];
			if (!_loc2_ || _loc2_.length === 0)
			{
				this.resetCanvas();
				return;
			}
			let _loc3_ = this.viewPoint.getDetailLevelForTechnicalStyle();
			let _loc4_ = Const.getDetailLevelInterval(_loc3_);
			this.activeMovies = 0;
			let _loc5_ = this.getFirstVisibleObject(_loc2_, _loc4_, context);
			if (_loc5_ === -1)
			{
				this.resetCanvas();
				return;
			}
			let _loc6_ = this.getLastVisibleObject(_loc2_, _loc4_, context);
			let _loc7_ = this.viewPoint.count / this.dataSource.data.marketDayLength;
			context[this.renderObj] = [];
			let _loc8_ = 0;
			let _loc9_ = _loc5_;
			while (_loc9_ <= _loc6_)
			{
				let _loc10_ = _loc2_[_loc9_];
				if (notnull(_loc10_.posInInterval)[_loc4_])
				{
					let _loc11_ = this.getPosition(_loc10_, _loc4_, context);
					let _loc12_ = this.putObject(_loc10_, _loc11_);
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
							let _loc13_ = context[this.avoidObj][_loc8_];
							if (_loc13_.x === _loc12_.x)
							{
								_loc13_.setOrientation(Const.SIDEWAYS + _loc11_.orientation);
								_loc12_.setOrientation(Const.SIDEWAYS + _loc11_.orientation);
							}
						}
					}
				}
				_loc9_++;
			}
			_loc9_ = this.activeMovies;
			while (_loc9_ < this.movies.length)
			{
				this.removeChild(this.movies[_loc9_]);
				_loc9_++;
			}
			this.movies.splice(this.activeMovies);
		}

		private getPosition(param1: StockAssociatedObject, param2: number, param3: Context): Position
		{
			let _loc10_ = NaN;
			let _loc4_ = new Position();
			let _loc5_ = this.getDataUnit(param1, param2);
			let _loc6_ = !isNaN(_loc5_.weeklyXPos) ? Number(_loc5_.weeklyXPos) : this.viewPoint.getXPos(_loc5_);
			let _loc7_ = this.getYPos(param3, _loc5_);
			let _loc8_ = (this.viewPoint.maxy + this.viewPoint.miny) / 2;
			if (this.positioning === IntervalBasedIndependentObjectsLayer.POSITION_CHART)
			{
				if (_loc7_ > this.viewPoint.miny + 40)
				{
					_loc4_.y = _loc7_ - IntervalBasedIndependentObjectsLayer.OBJECT_DISTANCE;
					_loc4_.orientation = Const.DOWN;
				}
				else
				{
					_loc4_.y = _loc7_ + IntervalBasedIndependentObjectsLayer.OBJECT_DISTANCE;
					_loc4_.orientation = Const.UP;
				}
			}
			else if (this.positioning === IntervalBasedIndependentObjectsLayer.POSITION_BOTTOM)
			{
				let _loc9_ = this.viewPoint.getLayer("BottomBarLayer") as BottomBarLayer;
				_loc10_ = 0;
				if (_loc9_)
					_loc10_ = Number(_loc9_.bottomTextHeight);

				_loc4_.y = this.viewPoint.maxy - _loc10_;
				_loc4_.orientation = Const.DOWN;
			}
			_loc4_.x = _loc6_;
			return _loc4_;
		}

		private getLastVisibleObject(param1: StockAssociatedObject[], param2: number, param3: Context): number
		{
			let _loc4_ = param3.lastMinute;
			let _loc5_ = param1.length - 1;
			while (_loc5_ >= 0)
			{
				if (notnull(param1[_loc5_].posInInterval)[param2])
				{
					let _loc6_ = this.getDataUnit(param1[_loc5_], param2);
					if (_loc6_ && _loc6_.relativeMinutes < _loc4_)
						return _loc5_;
				}
				_loc5_--;
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
			let _loc4_ = param3.lastMinute - param3.count;
			for (let _loc5_ = 0; _loc5_ < param1.length; _loc5_++)
			{
				if (notnull(param1[_loc5_].posInInterval)[param2])
				{
					let _loc6_ = this.getDataUnit(param1[_loc5_], param2);
					if (_loc6_ && _loc6_.relativeMinutes > _loc4_)
						return _loc5_;
				}
			}
			return -1;
		}
	}
}
