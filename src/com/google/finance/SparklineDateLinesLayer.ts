namespace com.google.finance
{
	// import flash.display.Sprite;
	// import flash.text.TextField;
	export class SparklineDateLinesLayer extends AbstractLayer<SparklineViewPoint>
	{
		private static readonly MIN_YEAR_WIDTH = 50;
		private static readonly DATE_LINES_COLOR = 13426124;
		private static readonly SHORT_YEAR_LINE_HEIGHT = 5;

		tickPosition = TickPositions.TOP;
		
		private drawQuarterStarts(param1: flash.display.Sprite) 
		{
			const data = this.dataSource.data;
			if (!data.units || data.firsts.length === 0)
				return;

			const viewPoint = this.viewPoint;
			const maxx = viewPoint.maxx;
			const maxy = viewPoint.maxy;
			const minx = viewPoint.minx;
			let _loc7_ = minx + 1;
			const gr = param1.graphics;
			for (let _loc8_ = data.firsts.length - 1; _loc7_ > minx && _loc8_ >= 0; _loc8_--)
			{
				const _loc9_ = data.units[data.firsts[_loc8_]];
				const month = _loc9_.exchangeDateInUTC.getUTCMonth();
				if (month % 3 === 0)
				{
					_loc7_ = viewPoint.getXPos(maxx, minx, _loc9_);
					gr.lineStyle(0, SparklineDateLinesLayer.DATE_LINES_COLOR, 1);
					gr.moveTo(_loc7_, maxy);
					gr.lineTo(_loc7_, maxy - 4);
				}
			}
		}

		private drawYearStarts(param1: flash.display.Sprite) 
		{
			const data = this.dataSource.data;
			if (!data.units || data.years.length === 0)
				return;

			let _loc3_ = 1;
			if (this.getOneYearWidth() < SparklineDateLinesLayer.MIN_YEAR_WIDTH)
				_loc3_ = 5;

			const gr = param1.graphics;
			gr.lineStyle(0, SparklineDateLinesLayer.DATE_LINES_COLOR, 1);
			let _loc4_ = data.years.length - 1;
			const _loc5_ = this.viewPoint as SparklineViewPoint;
			const maxx = _loc5_.maxx;
			const minx = _loc5_.minx;
			const maxy = _loc5_.maxy;
			const miny = _loc5_.miny;
			let _loc11_: number;

			let numTextFields = 0;
			do
			{
				const _loc10_ = data.units[data.years[_loc4_]];
				_loc11_ = _loc5_.getXPos(maxx, minx, _loc10_);
				const exchangeDateInUTC = _loc10_.exchangeDateInUTC;
				if (exchangeDateInUTC.getUTCFullYear() % _loc3_ === 0)
				{
					gr.moveTo(_loc11_, miny);
					gr.lineTo(_loc11_, maxy);
					const _loc13_ = _loc11_ + ViewPoint.TEXT_HORIZONTAL_OFFSET;
					const _loc14_ = maxy - 15;

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
					_loc15_.text = "" + exchangeDateInUTC.getUTCFullYear();
					const width = _loc15_.width;
					const height = _loc15_.height;
					gr.lineStyle(0, 0, 0);
					gr.moveTo(_loc13_ + 2, _loc14_ + 2);
					gr.beginFill(0xffffff, 80);
					gr.lineTo(_loc13_ + 2, _loc14_ + height - 2);
					gr.lineTo(_loc13_ + width - 2, _loc14_ + height - 2);
					gr.lineTo(_loc13_ + width - 2, _loc14_ + 2);
					gr.endFill();
					gr.lineStyle(0, SparklineDateLinesLayer.DATE_LINES_COLOR, 1);
				}
				else
				{
					gr.moveTo(_loc11_, maxy - SparklineDateLinesLayer.SHORT_YEAR_LINE_HEIGHT);
					gr.lineTo(_loc11_, maxy);
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
			const data = this.dataSource.data;
			if (data.years.length > 1)
			{
				const units = data.units;
				const _loc3_ = data.years.length - 1;
				const _loc4_ = units[data.years[_loc3_]].relativeMinutes - units[data.years[_loc3_ - 1]].relativeMinutes;
				return this.viewPoint.getIntervalLength(_loc4_);
			}
			return 250 * data.marketDayLength;
		}

		renderLayer(param1: Context) 
		{
			this.drawVerticalLines();
		}
	}
}
