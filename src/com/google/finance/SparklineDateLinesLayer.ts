namespace com.google.finance
{
	// import flash.display.Sprite;
	// import flash.text.TextField;
	export class SparklineDateLinesLayer extends AbstractLayer<SparklineViewPoint>
	{
		tickPosition: number;

		private static readonly MIN_YEAR_WIDTH = 50;

		private static readonly DATE_LINES_COLOR = 13426124;

		private static readonly SHORT_YEAR_LINE_HEIGHT = 5;

		constructor(viewPoint: SparklineViewPoint, dataSource: com.google.finance.DataSource)
		{
			super(viewPoint, dataSource);
			this.tickPosition = Const.TOP;
		}

		private drawQuarterStarts(param1: flash.display.Sprite) 
		{
			let _loc10_ = NaN;
			let _loc2_ = this.dataSource.data;
			if (!_loc2_.units || _loc2_.firsts.length === 0)
				return;

			let _loc3_ = this.viewPoint;
			let _loc4_ = _loc3_.maxx;
			let _loc5_ = _loc3_.maxy;
			let _loc6_ = _loc3_.minx;
			let _loc7_ = _loc6_ + 1;
			let _loc8_ = _loc2_.firsts.length - 1;
			while (_loc7_ > _loc6_ && _loc8_ >= 0)
			{
				let _loc9_ = _loc2_.units[_loc2_.firsts[_loc8_]];
				_loc10_ = _loc9_.exchangeDateInUTC.getUTCMonth();
				if (_loc10_ % 3 === 0)
				{
					_loc7_ = _loc3_.getXPos(_loc4_, _loc6_, _loc9_);
					param1.graphics.lineStyle(0, SparklineDateLinesLayer.DATE_LINES_COLOR, 1);
					param1.graphics.moveTo(_loc7_, _loc5_);
					param1.graphics.lineTo(_loc7_, _loc5_ - 4);
				}
				_loc8_--;
			}
		}

		private drawYearStarts(param1: flash.display.Sprite) 
		{
			let _loc2_ = this.dataSource.data;
			if (!_loc2_.units || _loc2_.years.length === 0)
				return;

			let _loc3_ = 1;
			if (this.getOneYearWidth() < SparklineDateLinesLayer.MIN_YEAR_WIDTH)
				_loc3_ = 5;

			param1.graphics.lineStyle(0, SparklineDateLinesLayer.DATE_LINES_COLOR, 1);
			let _loc4_ = _loc2_.years.length - 1;
			let _loc5_ = this.viewPoint as SparklineViewPoint;
			let _loc6_ = _loc5_.maxx;
			let _loc7_ = _loc5_.minx;
			let _loc8_ = _loc5_.maxy;
			let _loc9_ = _loc5_.miny;
			let _loc11_: number;

			let numTextFields = 0;
			do
			{
				let _loc10_ = _loc2_.units[_loc2_.years[_loc4_]];
				_loc11_ = _loc5_.getXPos(_loc6_, _loc7_, _loc10_);
				let _loc12_ = _loc10_.exchangeDateInUTC;
				if (_loc12_.getUTCFullYear() % _loc3_ === 0)
				{
					param1.graphics.moveTo(_loc11_, _loc9_);
					param1.graphics.lineTo(_loc11_, _loc8_);
					let _loc13_ = _loc11_ + ViewPoint.TEXT_HORIZONTAL_OFFSET;
					let _loc14_ = _loc8_ - 15;

					let _loc15_: flash.text.TextField;

					if (numTextFields >= param1.numChildren)
					{
						_loc15_ = new flash.text.TextField();
						_loc15_.autoSize = "left";
						_loc15_.selectable = false;
						param1.addChild(_loc15_);
					}
					else
					{
						_loc15_ = param1.getChildAt(numTextFields) as flash.text.TextField;
					}
					numTextFields++;

					_loc15_.x = _loc13_;
					_loc15_.y = _loc14_;
					_loc15_.defaultTextFormat = _loc5_.dateTextFormat;
					_loc15_.text = "" + _loc12_.getUTCFullYear();
					let _loc16_ = _loc15_.width;
					let _loc17_ = _loc15_.height;
					param1.graphics.lineStyle(0, 0, 0);
					param1.graphics.moveTo(_loc13_ + 2, _loc14_ + 2);
					param1.graphics.beginFill(0xffffff, 80);
					param1.graphics.lineTo(_loc13_ + 2, _loc14_ + _loc17_ - 2);
					param1.graphics.lineTo(_loc13_ + _loc16_ - 2, _loc14_ + _loc17_ - 2);
					param1.graphics.lineTo(_loc13_ + _loc16_ - 2, _loc14_ + 2);
					param1.graphics.endFill();
					param1.graphics.lineStyle(0, SparklineDateLinesLayer.DATE_LINES_COLOR, 1);
				}
				else
				{
					param1.graphics.moveTo(_loc11_, _loc8_ - SparklineDateLinesLayer.SHORT_YEAR_LINE_HEIGHT);
					param1.graphics.lineTo(_loc11_, _loc8_);
				}
				_loc4_--;
			}
			while (_loc11_ > this.viewPoint.minx && _loc4_ >= 0);

			while (param1.numChildren > numTextFields)
				param1.removeChildAt(numTextFields);
		}

		private drawVerticalLines() 
		{
			this.textCanvas.graphics.clear();
			//Utils.removeAllChildren(this.textCanvas);
			this.drawYearStarts(this.textCanvas);
			if (this.getOneYearWidth() > SparklineDateLinesLayer.MIN_YEAR_WIDTH)
				this.drawQuarterStarts(this.textCanvas);
		}

		private getOneYearWidth(): number
		{
			let _loc1_ = this.dataSource.data;
			if (_loc1_.years.length > 1)
			{
				let _loc2_ = _loc1_.units;
				let _loc3_ = _loc1_.years.length - 1;
				let _loc4_ = _loc2_[_loc1_.years[_loc3_]].relativeMinutes - _loc2_[_loc1_.years[_loc3_ - 1]].relativeMinutes;
				return this.viewPoint.getIntervalLength(_loc4_);
			}
			return 250 * _loc1_.marketDayLength;
		}

		renderLayer(param1: Context) 
		{
			this.drawVerticalLines();
		}
	}
}
