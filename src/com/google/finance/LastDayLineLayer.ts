import { AbstractLayer } from "./AbstractLayer";
import { Const, Intervals } from "./Const";
import { DataUnit } from "./DataUnit";
import { Context, ViewPoint } from "./ViewPoint";

export class LastDayLineLayer extends AbstractLayer<ViewPoint> {
	private dashSize = 7;

	private drawLine(context: Context) {
		// const _loc2_ = this.dataSource.data;
		const gr = this.graphics;
		gr.clear();
		gr.lineStyle(0, Const.LAST_DAY_CLOSE_LINE_COLOR, 1);
		const units = this.dataSource.data.units;
		const days = this.dataSource.data.days;
		const unit = units[days[days.length - 2]];
		const lastUnit = units[units.length - 1];
		if (Const.INDICATOR_ENABLED) {
			const closeLogValue = unit.getCloseLogValue(context.verticalScaling);
			if (closeLogValue > context.maxPrice || closeLogValue < context.minPrice) {
				return;
			}
		}
		const vp = this.viewPoint;
		const xPos1 = vp.getXPos(unit);
		const xPos2 = vp.getXPos(lastUnit);
		const detailLevel = vp.getDetailLevel();
		if (xPos1 < this.viewPoint.maxx && detailLevel === Intervals.INTRADAY) {
			const y = this.getYPos(unit, context);
			let _loc12_ = 0;
			do {
				gr.moveTo(xPos1 + _loc12_ * this.dashSize, y);
				gr.lineTo(xPos1 + (_loc12_ + 1) * this.dashSize, y);
				_loc12_ = Number(_loc12_ + 2);
			}
			while (xPos1 + _loc12_ * this.dashSize < xPos2);
		}
	}

	protected getYPos(dataUnit: DataUnit, context: Context): number {
		return this.viewPoint.miny + this.viewPoint.V_OFFSET + this.viewPoint.medPriceY - (dataUnit.getCloseLogValue(context.verticalScaling) - context.medPrice) * this.viewPoint.maxPriceRangeViewSize / context.maxPriceRange;
	}

	renderLayer(context: Context) {
		this.drawLine(context);
	}
}
