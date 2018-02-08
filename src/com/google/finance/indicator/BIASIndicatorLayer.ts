import { IndependentIndicatorLayer } from "IndependentIndicatorLayer";
import { DataSeries } from "../DataSeries";
import { Message, Messages } from "../Messages";
import { Context } from "./../ViewPoint";
import { IndicatorLineStyle } from "./IndicatorLineStyle";
import { IndicatorPoint } from "./IndicatorPoint";

	// import com.google.finance.Messages;
	// import com.google.finance.DataUnit;
	// import com.google.finance.DataSeries;
	// import com.google.finance.ViewPoint;
	// import com.google.finance.DataSource;

export class BIASIndicatorLayer extends IndependentIndicatorLayer {
		private static readonly PARAMETER_NAMES: ReadonlyArray<string> = ["period"];

		private period = 20;

		static getParameterNames() {
			return BIASIndicatorLayer.PARAMETER_NAMES;
		}

		protected getIndicatorValueText(param1: number, param2: number, param3: string, context: Context): string {
			if (param1 === 0) {
				return Message.getMsg(Messages.BIAS_BIAS, param2);
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
			return Message.getMsg(Messages.BIAS_INTERVAL, this.period, param1);
		}

		computeIntervalIndicator(interval: number) {
			if (this.indicator.hasInterval(interval)) {
				return;
			}

			const points = this.originalDataSeries.getPointsInIntervalArray(interval);
			if (!points) {
				return;
			}

			const dataSeries = new DataSeries();
			let _loc5_ = 0;
			let _loc6_ = 0;
			const _loc8_: number[] = [];
			for (const point of points) {
				if (!this.shouldSkip(point, dataSeries)) {
					_loc5_ = Number(_loc5_ + point.close);
					_loc8_.push(point.close);
					let _loc4_: number;
					if (_loc8_.length < this.period) {
						_loc4_ = NaN;
					} else {
						_loc6_ = Number(_loc5_ / this.period);
						_loc4_ = (point.close - _loc6_) / _loc6_ * 100;
						_loc5_ = Number(_loc5_ - _loc8_.shift()!);
					}
					dataSeries.points.push(new IndicatorPoint(_loc4_, point));
				}
			}
			this.indicator.setDataSeries(interval, dataSeries, 0);
		}

		setIndicatorInstanceArray(indicators: any[]) {
			if (!indicators || indicators.length !== 1) {
				return;
			}

			this.indicator.clear();
			this.period = (indicators[0] as any as BIASIndicatorLayer).period;
		}
	}
