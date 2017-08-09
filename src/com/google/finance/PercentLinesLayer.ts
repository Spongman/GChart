/// <reference path="PriceLinesLayer.ts" />

namespace com.google.finance
{
	export class PercentLinesLayer extends PriceLinesLayer
	{
		private localYOffset: number;
		private localYScale: number;

		constructor(param1: ViewPoint, param2: DataSource)
		{
			super(param1, param2);
		}

		private computeLocalVars(param1: Context) 
		{
			this.localYOffset = this.viewPoint.miny + ViewPoint.MIN_EDGE_DISTANCE / 2;
			this.localYScale = (this.viewPoint.maxPriceRangeViewSize - 20) / param1.scaleVariation;
			this.distanceBetweenLines = this.getDistanceBetweenLines(param1);
		}

		protected drawZeroLine(param1: Context) 
		{
			const gr = this.graphics;
			gr.lineStyle(0, Const.ZERO_PERCENT_LINE_COLOR, 1);
			const _loc2_ = this.getYPos(0, param1);
			gr.moveTo(this.viewPoint.minx + 1, _loc2_);
			gr.lineTo(this.viewPoint.maxx - 1, _loc2_);
		}

		protected getMinLineValue(param1: Context): number
		{
			let _loc2_ = 0;
			const _loc3_ = (this.inverseLogTransform(param1.minusVariation, param1.verticalScaling) - 1) * 100;
			while (_loc2_ > _loc3_)
				_loc2_ = Number(_loc2_ - this.distanceBetweenLines);

			_loc2_ = Number(Math.floor(_loc2_ / this.distanceBetweenLines) * this.distanceBetweenLines);
			return _loc2_;
		}

		protected getMaxDisplayRange(param1: Context): number
		{
			return (this.inverseLogTransform(param1.plusVariation, param1.verticalScaling) - this.inverseLogTransform(param1.minusVariation, param1.verticalScaling)) * 100;
		}

		protected getMaxY(param1: Context, param2: number): number
		{
			let _loc3_ = (this.inverseLogTransform(param1.plusVariation, param1.verticalScaling) - 1) * 100;
			let _loc4_ = 0;
			do
			{
				_loc4_ = Number(this.getYPos(_loc3_, param1));
				_loc3_ = _loc3_ + param2;
			}
			while (_loc4_ > this.viewPoint.miny);

			return _loc3_;
		}

		protected getInitialLinesList(param1: Context)
		{
			return [this.getYPos(0, param1)];
		}

		protected getValueForYPos(param1: number, param2: Context): number
		{
			if (param2.verticalScaling === Const.LOG_VSCALE || param2.verticalScaling === Const.NEW_LOG_VSCALE)
			{
				const _loc3_ = param2.localYAdjustment - (param1 - this.localYOffset) / this.localYScale + Utils.logTransform(1);
				return (this.inverseLogTransform(_loc3_, param2.verticalScaling) - 1) * 100;
			}
			return (param2.localYAdjustment - (param1 - this.localYOffset) / this.localYScale) * 100;
		}

		protected getYPos(param1: number, param2: Context): number
		{
			let _loc3_ = 0;
			if (param2.verticalScaling === Const.LOG_VSCALE || param2.verticalScaling === Const.NEW_LOG_VSCALE)
			{
				if (1 + param1 / 100 < 0)
					return 2 * this.viewPoint.maxy;

				_loc3_ = Number(Utils.logTransform(1 + param1 / 100) - Utils.logTransform(1));
			}
			else
			{
				_loc3_ = Number(param1 / 100);
			}
			return this.localYOffset + (param2.localYAdjustment - _loc3_) * this.localYScale;
		}

		renderLayer(param1: Context) 
		{
			this.valueSuffix = "%";
			this.graphics.clear();
			this.computeLocalVars(param1);
			this.drawHorizontalLines(param1);
			this.drawZeroLine(param1);
		}
	}
}
