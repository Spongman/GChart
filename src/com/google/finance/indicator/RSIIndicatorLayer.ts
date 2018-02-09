import { DataSeries } from "../DataSeries";
import { Message, Messages } from "../Messages";
import { Context } from "../IViewPoint";
import { IndependentIndicatorLayer } from "./IndependentIndicatorLayer";
import { IndicatorLineStyle } from "./IndicatorLineStyle";
import { IndicatorPoint } from "./IndicatorPoint";

	// import com.google.finance.Messages;
	// import com.google.finance.DataUnit;
	// import com.google.finance.DataSeries;
	// import com.google.finance.ViewPoint;
	// import com.google.finance.DataSource;

export class RSIIndicatorLayer extends IndependentIndicatorLayer {
		private static readonly PARAMETER_NAMES: ReadonlyArray<string> = ["period"];

		private period = 9;

		static getParameterNames() {
			return RSIIndicatorLayer.PARAMETER_NAMES;
		}

		protected getIndicatorValueText(param1: number, param2: number, param3: string, context: Context): string {
			if (param1 === 0) {
				return Message.getMsg(Messages.RSI_RSI, param2);
			}

			return "";
		}

		protected getLineStyle(param1: number): number {
			if (param1 === 0) {
				return IndicatorLineStyle.SIMPLE_LINE;
			}

			return IndicatorLineStyle.NONE;
		}

		protected getIndicatorNameText(param1: string): string {
			return Message.getMsg(Messages.RSI_INTERVAL, this.period, param1);
		}

		computeIntervalIndicator(interval: number) {
			if (this.indicator.hasInterval(interval)) {
				return;
			}

			const points = this.originalDataSeries.getPointsInIntervalArray(interval);
			if (!points || points.length === 0) {
				return;
			}

			const dataSeries = new DataSeries();
			let _loc5_ = 0;
			let _loc6_ = 0;
			const _loc9_: number[] = [];
			let close = points[0].close;
			const indicatorPoint = new IndicatorPoint(NaN, points[0]);
			dataSeries.points.push(indicatorPoint);
			for (let pointIndex = 1; pointIndex < points.length; pointIndex++) {
				const unit = points[pointIndex];
				if (!this.shouldSkip(unit, dataSeries)) {
					let diff = unit.close - close;
					close = unit.close;
					_loc9_.push(diff);
					if (diff > 0) {
						_loc5_ = Number(_loc5_ + diff);
					} else {
						_loc6_ = Number(_loc6_ - diff);
					}

					if (_loc9_.length < this.period) {
						dataSeries.points.push(new IndicatorPoint(NaN, unit));
					} else {
						if (_loc5_ + _loc6_ !== 0) {
							const value = _loc5_ / (_loc5_ + _loc6_) * 100;
							dataSeries.points.push(new IndicatorPoint(value, unit));
						} else {
							this.copyLastIndicatorPoint(unit, dataSeries);
						}
						diff = Number(_loc9_.shift());
						if (diff > 0) {
							_loc5_ -= diff;
						} else {
							_loc6_ += diff;
						}
					}
				}
			}
			this.indicator.setDataSeries(interval, dataSeries, 0);
		}

		setIndicatorInstanceArray(indicators: any[]) {
			if (!indicators || indicators.length !== 1) {
				return;
			}

			this.indicator.clear();
			this.period = (indicators[0] as any as RSIIndicatorLayer).period;
		}
	}
