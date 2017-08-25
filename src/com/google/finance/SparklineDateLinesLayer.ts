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

		private drawQuarterStarts(sprite: flash.display.Sprite)
		{
			const data = this.dataSource.data;
			if (!data.units || data.firsts.length === 0)
				return;

			const viewPoint = this.viewPoint;
			const maxx = viewPoint.maxx;
			const maxy = viewPoint.maxy;
			const minx = viewPoint.minx;
			let _loc7_ = minx + 1;
			const gr = sprite.graphics;
			for (let index = data.firsts.length - 1; _loc7_ > minx && index >= 0; index--)
			{
				const _loc9_ = data.units[data.firsts[index]];
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

		private drawYearStarts(sprite: flash.display.Sprite)
		{
			const data = this.dataSource.data;
			if (!data.units || data.years.length === 0)
				return;

			let _loc3_ = 1;
			if (this.getOneYearWidth() < SparklineDateLinesLayer.MIN_YEAR_WIDTH)
				_loc3_ = 5;

			const gr = sprite.graphics;
			gr.lineStyle(0, SparklineDateLinesLayer.DATE_LINES_COLOR, 1);
			let yearIndex = data.years.length - 1;
			const sparklineViewPoint = this.viewPoint as SparklineViewPoint;
			const maxx = sparklineViewPoint.maxx;
			const minx = sparklineViewPoint.minx;
			const maxy = sparklineViewPoint.maxy;
			const miny = sparklineViewPoint.miny;
			let unitXPos: number;

			let numTextFields = 0;
			do
			{
				const unit = data.units[data.years[yearIndex]];
				unitXPos = sparklineViewPoint.getXPos(maxx, minx, unit);
				const exchangeDateInUTC = unit.exchangeDateInUTC;
				if (exchangeDateInUTC.getUTCFullYear() % _loc3_ === 0)
				{
					gr.moveTo(unitXPos, miny);
					gr.lineTo(unitXPos, maxy);
					const x = unitXPos + ViewPoint.TEXT_HORIZONTAL_OFFSET;
					const y = maxy - 15;

					let textField: flash.text.TextField;

					if (numTextFields >= sprite.numChildren)
					{
						textField = new flash.text.TextField();
						textField.autoSize = "left";
						textField.selectable = false;
						sprite.addChild(textField);
					}
					else
					{
						textField = sprite.getChildAt(numTextFields) as flash.text.TextField;
					}
					numTextFields++;

					textField.x = x;
					textField.y = y;
					textField.defaultTextFormat = sparklineViewPoint.dateTextFormat;
					textField.text = "" + exchangeDateInUTC.getUTCFullYear();
					const width = textField.width;
					const height = textField.height;
					gr.lineStyle(0, 0, 0);
					gr.moveTo(x + 2, y + 2);
					gr.beginFill(0xffffff, 80);
					gr.lineTo(x + 2, y + height - 2);
					gr.lineTo(x + width - 2, y + height - 2);
					gr.lineTo(x + width - 2, y + 2);
					gr.endFill();
					gr.lineStyle(0, SparklineDateLinesLayer.DATE_LINES_COLOR, 1);
				}
				else
				{
					gr.moveTo(unitXPos, maxy - SparklineDateLinesLayer.SHORT_YEAR_LINE_HEIGHT);
					gr.lineTo(unitXPos, maxy);
				}
				yearIndex--;
			}
			while (unitXPos > this.viewPoint.minx && yearIndex >= 0);

			while (sprite.numChildren > numTextFields)
				sprite.removeChildAt(numTextFields);
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
				const yearIndex = data.years.length - 1;
				const duration = units[data.years[yearIndex]].relativeMinutes - units[data.years[yearIndex - 1]].relativeMinutes;
				return this.viewPoint.getIntervalLength(duration);
			}
			return 250 * data.marketDayLength;
		}

		renderLayer(context: Context)
		{
			this.drawVerticalLines();
		}
	}
}
