import { IndependentIndicatorLayer } from "IndependentIndicatorLayer";
import { Messages } from 'Messages';
import { Message } from '../Messages';
import { IndicatorLineStyle } from "./IndicatorLineStyle";
import { DataSeries } from '../DataSeries';
import { IndicatorPoint } from './IndicatorPoint';
import { Context } from '../ViewPoint';

	// import com.google.finance.Messages;
	// import com.google.finance.DataUnit;
	// import com.google.finance.DataSeries;
	// import com.google.finance.ViewPoint;
	// import com.google.finance.DataSource;

export class CCIIndicatorLayer extends IndependentIndicatorLayer {
		private static readonly PARAMETER_NAMES: ReadonlyArray<string> = ["period"];

		private period = 20;

		static getParameterNames() {
			return CCIIndicatorLayer.PARAMETER_NAMES;
		}

		protected getIndicatorValueText(param1: number, param2: number, param3: string, context: Context): string {
			if (param1 === 0) {
				return Message.getMsg(Messages.CCI_CCI, param2);
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
			return Message.getMsg(Messages.CCI_INTERVAL, this.period, param1);
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
			let _loc4_ = 0;
			const _loc5_: number[] = [];
			for (const point of points) {
				if (!this.shouldSkip(point, dataSeries)) {
					const _loc8_ = (point.close + point.high + point.low) / 3;
					_loc5_.push(_loc8_);
					_loc4_ = Number(_loc4_ + _loc8_);
					if (_loc5_.length < this.period) {
						dataSeries.points.push(new IndicatorPoint(NaN, point));
					} else {
						const _loc9_ = _loc4_ / this.period;
						let _loc10_ = 0;
						for (let periodIndex = 0; periodIndex < this.period; periodIndex++) {
							_loc10_ = Number(_loc10_ + Math.abs(_loc5_[periodIndex] - _loc9_));
						}

						_loc10_ = Number(_loc10_ / this.period);
						if (_loc10_ !== 0) {
							dataSeries.points.push(new IndicatorPoint((_loc8_ - _loc9_) / (0.015 * _loc10_), point));
						} else {
							dataSeries.points.push(new IndicatorPoint(0, point));
						}

						_loc4_ = Number(_loc4_ - _loc5_.shift()!);
					}
				}
			}
			this.indicator.setDataSeries(interval, dataSeries, 0);
		}

		isOhlcDataRequired(): boolean {
			return true;
		}

		setIndicatorInstanceArray(indicators: any[]) {
			if (!indicators || indicators.length !== 1) {
				return;
			}

			this.indicator.clear();
			this.period = (indicators[0] as any as CCIIndicatorLayer).period;
		}
	}
