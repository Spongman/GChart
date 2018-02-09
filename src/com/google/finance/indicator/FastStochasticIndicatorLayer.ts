import { DataSeries } from "../DataSeries";
import { DataUnit } from "../DataUnit";
import { Message, Messages } from "../Messages";
import { Utils } from "../Utils";
import { AbstractStochasticIndicatorLayer } from "./AbstractStochasticIndicatorLayer";
import { IndicatorPoint } from "./IndicatorPoint";

// import com.google.finance.Messages;
// import com.google.finance.DataUnit;
// import com.google.finance.DataSeries;
// import com.google.finance.Utils;
// import com.google.finance.ViewPoint;
// import com.google.finance.DataSource;

export class FastStochasticIndicatorLayer extends AbstractStochasticIndicatorLayer {
	static getParameterNames() {
		return AbstractStochasticIndicatorLayer.getParameterNames();
	}

	protected getIndicatorNameText(param1: string): string {
		return Message.getMsg(Messages.FSTO_INTERVAL, this.kPeriod, this.dPeriod, param1);
	}

	computeIntervalIndicator(interval: number) {
		if (this.indicator.hasInterval(interval)) {
			return;
		}

		const points = this.originalDataSeries.getPointsInIntervalArray(interval);
		if (!points) {
			return;
		}

		let _loc5_ = 0;
		const dataSeries0 = new DataSeries();
		const dataSeries1 = new DataSeries();
		const dataUnits: DataUnit[] = [];
		const _loc13_: number[] = [];
		for (const point of points) {
			if (!this.shouldSkip(point, dataSeries0, dataSeries1)) {
				dataUnits.push(point);
				if (dataUnits.length < this.kPeriod) {
					const indicatorPoint = new IndicatorPoint(NaN, point);
					dataSeries0.points.push(indicatorPoint);
					dataSeries1.points.push(indicatorPoint);
				} else {
					let _loc3_ = Number.NEGATIVE_INFINITY;
					let _loc4_ = Number.POSITIVE_INFINITY;
					for (let _loc7_ = 0; _loc7_ < this.kPeriod; _loc7_++) {
						_loc3_ = Utils.extendedMax(_loc3_, dataUnits[_loc7_].high);
						_loc4_ = Utils.extendedMin(_loc4_, dataUnits[_loc7_].low);
					}
					if (_loc3_ === _loc4_) {
						this.copyLastIndicatorPoint(point, dataSeries0, dataSeries1);
					} else {
						const _loc8_ = (point.close - _loc4_) / (_loc3_ - _loc4_) * 100;
						dataSeries0.points.push(new IndicatorPoint(_loc8_, point));
						_loc5_ = Number(_loc5_ + _loc8_);
						_loc13_.push(_loc8_);
						if (_loc13_.length < this.dPeriod) {
							this.copyLastIndicatorPoint(point, dataSeries1);
						} else {
							dataSeries1.points.push(new IndicatorPoint(_loc5_ / this.dPeriod, point));
							_loc5_ = Number(_loc5_ - _loc13_.shift()!);
						}
					}
					dataUnits.shift();
				}
			}
		}
		this.indicator.setDataSeries(interval, dataSeries0, 0);
		this.indicator.setDataSeries(interval, dataSeries1, 1);
	}
}
