import { IndependentIndicatorLayer } from "IndependentIndicatorLayer";
import { Messages } from "Messages";
import { DataSeries } from "../DataSeries";
import { DataUnit } from "../DataUnit";
import { Message } from "../Messages";
import { Utils } from "../Utils";
import { Context } from "../ViewPoint";
import { IndicatorLineStyle } from "./IndicatorLineStyle";
import { IndicatorPoint } from "./IndicatorPoint";

	// import com.google.finance.Messages;
	// import com.google.finance.DataUnit;
	// import com.google.finance.DataSeries;
	// import com.google.finance.Utils;
	// import com.google.finance.ViewPoint;
	// import com.google.finance.DataSource;

export class KDJIndicatorLayer extends IndependentIndicatorLayer {
		private static readonly PARAMETER_NAMES: ReadonlyArray<string> = ["period"];

		private period = 14;
		private alphaNumber = 0.3333333333333333;

		static getParameterNames() {
			return KDJIndicatorLayer.PARAMETER_NAMES;
		}

		protected getIndicatorValueText(param1: number, param2: number, param3: string, context: Context): string {
			switch (param1) {
				case 0:
					return Message.getMsg(Messages.K_KDJ, param2);
				case 1:
					return Message.getMsg(Messages.D_KDJ, param2);
				case 2:
					return Message.getMsg(Messages.J_KDJ, param2);
				default:
					return "";
			}
		}

		protected getLineStyle(param1: number): number {
			if (param1 >= 0 && param1 < 3) {
				return IndicatorLineStyle.SIMPLE_LINE;
			}

			return IndicatorLineStyle.NONE;
		}

		protected getIndicatorNameText(param1: string): string {
			return Message.getMsg(Messages.KDJ_INTERVAL, this.period, param1);
		}

		computeIntervalIndicator(interval: number) {
			if (this.indicator.hasInterval(interval)) {
				return;
			}

			const points = this.originalDataSeries.getPointsInIntervalArray(interval);
			if (!points) {
				return;
			}

			let _loc8_ = NaN;
			let _loc9_ = NaN;
			let _loc10_ = NaN;
			const dataSeries0 = new DataSeries();
			const dataSeries1 = new DataSeries();
			const dataSeries2 = new DataSeries();
			const dataUnits: DataUnit[] = [];
			for (const point of points) {
				if (!this.shouldSkip(point, dataSeries0, dataSeries1, dataSeries2)) {
					dataUnits.push(point);
					if (dataUnits.length < this.period) {
						const indicatorPoint = new IndicatorPoint(NaN, point);
						dataSeries0.points.push(indicatorPoint);
						dataSeries1.points.push(indicatorPoint);
						dataSeries2.points.push(indicatorPoint);
					} else {
						let _loc3_ = Number.NEGATIVE_INFINITY;
						let _loc4_ = Number.POSITIVE_INFINITY;
						for (let periodIndex = 0; periodIndex < this.period; periodIndex++) {
							_loc3_ = Utils.extendedMax(_loc3_, dataUnits[periodIndex].high);
							_loc4_ = Utils.extendedMin(_loc4_, dataUnits[periodIndex].low);
						}
						const _loc5_ = (point.close - _loc4_) / (_loc3_ - _loc4_) * 100;
						if (isNaN(_loc8_)) {
							const indicatorPoint = new IndicatorPoint(_loc5_, point);
							_loc8_ = _loc5_;
							_loc9_ = _loc5_;
							_loc10_ = _loc5_;	// not used?
							dataSeries0.points.push(indicatorPoint);
							dataSeries1.points.push(indicatorPoint);
							dataSeries2.points.push(indicatorPoint);
						} else if (_loc3_ === _loc4_) {
							this.copyLastIndicatorPoint(point, dataSeries0, dataSeries1, dataSeries2);
						} else {
							_loc8_ = _loc5_ * this.alphaNumber + _loc8_ * (1 - this.alphaNumber);
							_loc9_ = _loc8_ * this.alphaNumber + _loc9_ * (1 - this.alphaNumber);
							_loc10_ = 3 * _loc9_ - 2 * _loc8_;
							dataSeries0.points.push(new IndicatorPoint(_loc8_, point));
							dataSeries1.points.push(new IndicatorPoint(_loc9_, point));
							dataSeries2.points.push(new IndicatorPoint(_loc10_, point));
						}
						dataUnits.shift();
					}
				}
			}
			this.indicator.setDataSeries(interval, dataSeries0, 0);
			this.indicator.setDataSeries(interval, dataSeries1, 1);
			this.indicator.setDataSeries(interval, dataSeries2, 2);
		}

		isOhlcDataRequired(): boolean {
			return true;
		}

		setIndicatorInstanceArray(indicators: any[]) {
			if (!indicators || indicators.length !== 1) {
				return;
			}

			this.indicator.clear();
			this.period = (indicators[0] as any as KDJIndicatorLayer).period;
		}
	}
