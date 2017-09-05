namespace com.google.finance
{
	// import flash.text.TextFieldAutoSize;

	interface LabelPos
	{
		yPos: number;
		label: number;
	}

	export class PriceLinesLayer extends AbstractLayer<ViewPoint>
	{
		protected valueSuffix: string;
		protected distanceBetweenLines: number;

		private additionalDistanceBetweenLines: number;

		private getLinePosAndLabelToFillGap(param1: number, context: Context, param3: number): LabelPos
		{
			const value = this.getValueForYPos(param1, context);
			const increaseInterval = this.getIncreaseInterval(value);
			const _loc6_ = increaseInterval * Math.ceil(value / increaseInterval);
			const y = this.getYPos(_loc6_, context);
			return {
				yPos: y,
				label: _loc6_
			};
		}

		protected getMinLineValue(context: Context): number
		{
			const _loc2_ = this.inverseLogTransform(context.medPrice - context.maxPriceRange / 2, context.verticalScaling);
			return Math.floor(_loc2_ / this.distanceBetweenLines) * this.distanceBetweenLines;
		}

		protected getDistanceBetweenLines(context: Context): number
		{
			let _loc5_: number;
			let _loc2_ = Const.YSCALE_INTERVALS.length - 1;
			const maxDisplayRange = this.getMaxDisplayRange(context);
			const _loc4_ = this.viewPoint.maxy - this.viewPoint.miny - ViewPoint.MIN_EDGE_DISTANCE - ViewPoint.MAX_EDGE_DISTANCE;
			do
			{
				_loc5_ = Const.YSCALE_INTERVALS[_loc2_] * _loc4_ / maxDisplayRange;
				_loc2_--;
			}
			while (_loc5_ > ViewPoint.MIN_DISTANCE_BETWEEN_H_LINES && _loc2_ >= 0);

			return this.adjustDistanceBetweenLines(context, _loc2_);
		}

		private adjustDistanceBetweenLines(context: Context, param2: number): number
		{
			let scale = Const.YSCALE_INTERVALS[param2 + 1];
			if (context.verticalScaling === Const.LOG_VSCALE || context.verticalScaling === Const.NEW_LOG_VSCALE)
			{
				let _loc6_: number;
				let _loc7_ = 0;
				const maxY = this.getMaxY(context, scale);
				do
				{
					_loc6_ = Math.floor(maxY / scale);
					if (_loc6_ > 2)
					{
						const _loc9_ = (_loc6_ - 1) * scale;
						const _loc10_ = (_loc6_ - 2) * scale;
						const _loc4_ = Number(this.getYPos(_loc9_, context));
						const _loc5_ = Number(this.getYPos(_loc10_, context));
						_loc7_ = Number(Math.abs(_loc4_ - _loc5_));
						if (_loc7_ < ViewPoint.MIN_DISTANCE_BETWEEN_LOG_H_LINES)
						{
							this.additionalDistanceBetweenLines = this.getIncreaseInterval(Const.YSCALE_INTERVALS[param2 + 1]);
							scale += this.additionalDistanceBetweenLines;
							if (param2 < Const.YSCALE_INTERVALS.length - 1 && scale === Const.YSCALE_INTERVALS[param2 + 2])
								param2++;
						}
					}
				}
				while (_loc6_ > 2 && param2 < Const.YSCALE_INTERVALS.length && _loc7_ < ViewPoint.MIN_DISTANCE_BETWEEN_LOG_H_LINES);
			}
			return scale;
		}

		private getTextForValue(value: number): string
		{
			let text = "";
			let prefix = "";
			if (value < 0)
			{
				prefix = '-';
				value = Math.abs(value);
			}
			let _loc4_ = 1;
			while (this.distanceBetweenLines * _loc4_ % 1 !== 0)
				_loc4_ = Number(_loc4_ * 10);

			value = Math.round(value * _loc4_);
			while (_loc4_ > 1)
			{
				text = String(value - Math.floor(value / 10) * 10) + text;
				value = Math.floor(value / 10);
				_loc4_ = Number(Math.floor(_loc4_ / 10));
			}
			if (text !== "")
				text = prefix + String(Math.floor(value)) + '.' + text;
			else
				text = prefix + String(Math.floor(value));

			return text;
		}

		private getInitialLinesList_(context: Context)
		{
			const bottomLayer = this.viewPoint.getLayer("BottomBarLayer") as BottomBarLayer;
			const bottomTextHeight = bottomLayer.bottomTextHeight;
			return [this.viewPoint.maxy - bottomTextHeight - 1];
		}

		protected getMaxDisplayRange(context: Context): number
		{
			if (context.verticalScaling === Const.LOG_VSCALE || context.verticalScaling === Const.NEW_LOG_VSCALE)
				return this.inverseLogTransform(context.maxRangeUpperBound, context.verticalScaling) - this.inverseLogTransform(context.maxRangeLowerBound, context.verticalScaling);

			return context.maxPriceRange;
		}

		protected getYPos(value: number, context: Context): number
		{
			return this.viewPoint.miny + this.viewPoint.V_OFFSET + this.viewPoint.medPriceY - (Utils.getLogScaledValue(value, context.verticalScaling) - context.medPrice) * this.viewPoint.maxPriceRangeViewSize / context.maxPriceRange;
		}

		protected getMaxY(context: Context, param2: number): number
		{
			const _loc3_ = (this.viewPoint.V_OFFSET + this.viewPoint.medPriceY) * context.maxPriceRange / this.viewPoint.maxPriceRangeViewSize + context.medPrice;
			return this.inverseLogTransform(_loc3_, context.verticalScaling);
		}

		private drawHorizontalMidLine(param1: number, param2: number, param3: number, param4: number, context: Context)
		{
			const _loc6_ = Math.floor(param1 / param2);
			let _loc7_ = Math.ceil(_loc6_ / 2);
			_loc7_ = _loc7_ === _loc6_ / 2 ? Number(_loc7_ * 1.2) : _loc7_;
			const labelPos = this.getLinePosAndLabelToFillGap(param3 - _loc7_ * param2, context, param4);
			const _loc9_ = param3 - labelPos.yPos;
			const _loc10_ = param1 - _loc9_;
			if (param2 < 0.95 * _loc10_ && _loc10_ < 0.95 * _loc9_)
				this.drawSingleHorizontalLine(labelPos, param4);
		}

		protected getValueForYPos(y: number, context: Context): number
		{
			return this.inverseLogTransform(context.medPrice - (y - this.viewPoint.miny - this.viewPoint.V_OFFSET - this.viewPoint.medPriceY) * context.maxPriceRange / this.viewPoint.maxPriceRangeViewSize, context.verticalScaling);
		}

		protected drawHorizontalLines(context: Context)
		{
			let _loc7_: number;
			this.graphics.lineStyle(0, Const.HORIZONTAL_GRID_COLOR, 1);
			const _loc2_ = this.viewPoint.maxx - Const.BORDER_WIDTH;
			let _loc3_ = this.getMinLineValue(context);
			const bottomBarLayer = this.viewPoint.getLayer("BottomBarLayer") as BottomBarLayer;
			const bottomTextHeight = bottomBarLayer.bottomTextHeight;
			const lines = this.getInitialLinesList_(context);
			do
			{
				_loc7_ = this.getYPos(_loc3_, context);
				if (_loc7_ > this.viewPoint.miny && _loc7_ < this.viewPoint.maxy - bottomTextHeight)
				{
					this.drawSingleHorizontalLine(
						{
							yPos: _loc7_,
							label: _loc3_
						},
						_loc2_
					);
					if (_loc3_ >= 0)
						lines[lines.length] = _loc7_;
				}
				_loc3_ += this.distanceBetweenLines;
			}
			while (_loc7_ > this.viewPoint.miny);

			lines[lines.length] = this.viewPoint.miny;
			if ((context.verticalScaling === Const.LOG_VSCALE || context.verticalScaling === Const.NEW_LOG_VSCALE) && lines.length > 4)
			{
				const _loc8_ = lines[0] - lines[lines.length - 1];
				let _loc9_ = lines[0] - lines[1];
				const _loc10_ = lines[1] - lines[2];
				const _loc11_ = lines[2] - lines[3];
				if (_loc9_ / _loc8_ > 0.4)
				{
					const _loc12_ = this.getLinePosAndLabelToFillGap(lines[0], context, _loc2_);
					this.drawSingleHorizontalLine(_loc12_, _loc2_);
					_loc9_ = _loc12_.yPos - lines[1];
					this.drawHorizontalMidLine(_loc9_, _loc10_, _loc12_.yPos, _loc2_, context);
				}
				else if (_loc10_ / _loc8_ > 0.4)
				{
					this.drawHorizontalMidLine(_loc10_, _loc11_, lines[1], _loc2_, context);
				}
			}
		}

		renderLayer(context: Context)
		{
			this.valueSuffix = "";
			this.additionalDistanceBetweenLines = 0;
			this.graphics.clear();
			this.distanceBetweenLines = this.getDistanceBetweenLines(context);
			this.drawHorizontalLines(context);
		}

		private drawSingleHorizontalLine(labelPos: LabelPos, param2: number)
		{
			this.graphics.moveTo(this.viewPoint.minx + 1, labelPos.yPos);
			this.graphics.lineTo(this.viewPoint.maxx - 1, labelPos.yPos);
			const text = this.getTextForValue(labelPos.label) + this.valueSuffix;
			const _loc4_ = labelPos.yPos - ViewPoint.TEXT_VERTICAL_OFFSET + ViewPoint.GRID_TEXT_VERTICAL_OFFSET - ViewPoint.TEXT_FIELD_HEIGHT;
			ViewPoint.addTextField(this.textCanvas, text, param2, _loc4_, 0, ViewPoint.TEXT_FIELD_HEIGHT, "right", this.viewPoint.priceTextFormat, flash.text.TextFieldAutoSize.RIGHT);
		}

		private getIncreaseInterval(param1: number): number
		{
			const _loc2_ = Math.log(param1) / Math.LN10;
			return Math.pow(10, Math.floor(_loc2_));
		}

		inverseLogTransform(value: number, scaleType: string): number
		{
			if (scaleType === Const.LOG_VSCALE || scaleType === Const.NEW_LOG_VSCALE)
			{
				let logValue = Math.pow(Const.LOG_SCALE, value);
				if (value < 1)
					logValue = 10 * (logValue - 1) / 9;

				return logValue;
			}
			return value;
		}
	}
}
