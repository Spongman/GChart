import { Const } from "./Const";
import { PriceLinesLayer } from "./PriceLinesLayer";
import { Utils } from "./Utils";
import { Context } from "./ViewPoint";
import { ViewPoint } from "./ViewPoint";

export class PercentLinesLayer extends PriceLinesLayer {
	private localYOffset: number;
	private localYScale: number;

	private computeLocalVars(context: Context) {
		this.localYOffset = this.viewPoint.miny + ViewPoint.MIN_EDGE_DISTANCE / 2;
		this.localYScale = (this.viewPoint.maxPriceRangeViewSize - 20) / context.scaleVariation;
		this.distanceBetweenLines = this.getDistanceBetweenLines(context);
	}

	protected drawZeroLine(context: Context) {
		const gr = this.graphics;
		gr.lineStyle(0, Const.ZERO_PERCENT_LINE_COLOR, 1);
		const y = this.getYPos(0, context);
		gr.moveTo(this.viewPoint.minx + 1, y);
		gr.lineTo(this.viewPoint.maxx - 1, y);
	}

	protected getMinLineValue(context: Context): number {
		let _loc2_ = 0;
		const _loc3_ = (this.inverseLogTransform(context.minusVariation, context.verticalScaling) - 1) * 100;
		while (_loc2_ > _loc3_) {
			_loc2_ = Number(_loc2_ - this.distanceBetweenLines);
		}

		_loc2_ = Number(Math.floor(_loc2_ / this.distanceBetweenLines) * this.distanceBetweenLines);
		return _loc2_;
	}

	protected getMaxDisplayRange(context: Context): number {
		return (this.inverseLogTransform(context.plusVariation, context.verticalScaling) - this.inverseLogTransform(context.minusVariation, context.verticalScaling)) * 100;
	}

	protected getMaxY(context: Context, param2: number): number {
		let _loc3_ = (this.inverseLogTransform(context.plusVariation, context.verticalScaling) - 1) * 100;
		let _loc4_ = 0;
		do {
			_loc4_ = Number(this.getYPos(_loc3_, context));
			_loc3_ += param2;
		}
		while (_loc4_ > this.viewPoint.miny);

		return _loc3_;
	}

	protected getInitialLinesList(context: Context) {
		return [this.getYPos(0, context)];
	}

	protected getValueForYPos(param1: number, context: Context): number {
		if (context.verticalScaling === Const.LOG_VSCALE || context.verticalScaling === Const.NEW_LOG_VSCALE) {
			const _loc3_ = context.localYAdjustment - (param1 - this.localYOffset) / this.localYScale + Utils.logTransform(1);
			return (this.inverseLogTransform(_loc3_, context.verticalScaling) - 1) * 100;
		}
		return (context.localYAdjustment - (param1 - this.localYOffset) / this.localYScale) * 100;
	}

	protected getYPos(param1: number, context: Context): number {
		let _loc3_ = 0;
		if (context.verticalScaling === Const.LOG_VSCALE || context.verticalScaling === Const.NEW_LOG_VSCALE) {
			if (1 + param1 / 100 < 0) {
				return 2 * this.viewPoint.maxy;
			}

			_loc3_ = Number(Utils.logTransform(1 + param1 / 100) - Utils.logTransform(1));
		} else {
			_loc3_ = Number(param1 / 100);
		}
		return this.localYOffset + (context.localYAdjustment - _loc3_) * this.localYScale;
	}

	renderLayer(context: Context) {
		this.valueSuffix = "%";
		this.graphics.clear();
		this.computeLocalVars(context);
		this.drawHorizontalLines(context);
		this.drawZeroLine(context);
	}
}
