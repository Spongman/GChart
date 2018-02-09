import { Const } from "../Const";
import { DataSeries } from "../DataSeries";
import { Message, Messages } from "../Messages";
import { Utils } from "../Utils";
import { Context } from "../ViewPoint";
import { IndependentIndicatorLayer } from "./IndependentIndicatorLayer";
import { IndicatorLineStyle } from "./IndicatorLineStyle";
import { IndicatorPoint } from "./IndicatorPoint";

	// import com.google.finance.Messages;
	// import com.google.finance.Const;
	// import com.google.finance.DataUnit;
	// import com.google.finance.DataSeries;
	// import com.google.finance.Utils;
	// import com.google.finance.ViewPoint;
	// import com.google.finance.DataSource;

export class MACDIndicatorLayer extends IndependentIndicatorLayer {
		private static readonly PARAMETER_NAMES: ReadonlyArray<string> = ["shortPeriod", "longPeriod", "emaPeriod"];

		private emaPeriod = 9;
		private longPeriod = 26;
		private shortPeriod = 12;

		static getParameterNames() {
			return MACDIndicatorLayer.PARAMETER_NAMES;
		}

		protected getIndicatorValueText(param1: number, param2: number, param3: string, context: Context): string {
			switch (param1) {
				case 0:
					return Message.getMsg(Const.APPLY_CHINESE_STYLE_MACD ? Messages.DIFF_MACD : Messages.MACD_MACD, param2);
				case 1:
					return Message.getMsg(Const.APPLY_CHINESE_STYLE_MACD ? Messages.DEA_MACD : Messages.EMA_MACD, param2);
				case 2:
					return Message.getMsg(Const.APPLY_CHINESE_STYLE_MACD ? Messages.MACD_MACD : Messages.DIVERGENCE_MACD, param2);
				default:
					return "";
			}
		}

		protected getLineStyle(param1: number): number {
			switch (param1) {
				case 0:
				case 1:
					return IndicatorLineStyle.SIMPLE_LINE;
				case 2:
					return IndicatorLineStyle.HISTOGRAM_LINE;
				default:
					return IndicatorLineStyle.NONE;
			}
		}

		protected getColor(param1: number, param2 = NaN): number {
			switch (param1) {
				case 0:
					return Const.COLOR_BLUE;
				case 1:
					return Const.APPLY_CHINESE_STYLE_MACD ? Const.COLOR_YELLOW : Const.COLOR_RED;
				case 2:
					return Const.APPLY_CHINESE_STYLE_MACD && param2 > 0 ? Const.COLOR_RED : Const.COLOR_GREEN;
				default:
					return 0;
			}
		}

		protected getIndicatorNameText(param1: string): string {
			return Message.getMsg(Messages.MACD_INTERVAL, this.shortPeriod, this.longPeriod, this.emaPeriod, param1);
		}

		computeIntervalIndicator(interval: number) {
			if (this.indicator.hasInterval(interval)) {
				return;
			}

			const points = this.originalDataSeries.getPointsInIntervalArray(interval);
			if (!points || points.length === 0) {
				return;
			}

			const dataSeries0 = new DataSeries();
			const dataSeries1 = new DataSeries();
			const dataSeries2 = new DataSeries();
			let close = points[0].close;
			let _loc4_ = close;
			let value0 = close - _loc4_;
			let value1 = value0;
			const indicatorPoint = new IndicatorPoint(0, points[0]);
			dataSeries0.points.push(indicatorPoint);
			dataSeries1.points.push(indicatorPoint);
			dataSeries2.points.push(indicatorPoint);
			for (let pointIndex = 1; pointIndex < points.length; pointIndex++) {
				const unit = points[pointIndex];
				if (!this.shouldSkip(unit, dataSeries0, dataSeries1, dataSeries2)) {
					close = (close * (this.shortPeriod - 1) + unit.close * 2) / (this.shortPeriod + 1);
					_loc4_ = (_loc4_ * (this.longPeriod - 1) + unit.close * 2) / (this.longPeriod + 1);
					value0 = close - _loc4_;
					value1 = (value1 * (this.emaPeriod - 1) + value0 * 2) / (this.emaPeriod + 1);
					const value2 = (Const.APPLY_CHINESE_STYLE_MACD ? 2 : 1) * (value0 - value1);
					dataSeries0.points.push(new IndicatorPoint(value0, unit));
					dataSeries1.points.push(new IndicatorPoint(value1, unit));
					dataSeries2.points.push(new IndicatorPoint(value2, unit));
				}
			}
			this.indicator.setDataSeries(interval, dataSeries0, 0);
			this.indicator.setDataSeries(interval, dataSeries1, 1);
			this.indicator.setDataSeries(interval, dataSeries2, 2);
		}

		setIndicatorInstanceArray(indicators: MACDIndicatorLayer[]) {
			if (!indicators || indicators.length !== 1) {
				return;
			}

			this.indicator.clear();
			this.shortPeriod = indicators[0].shortPeriod;
			this.longPeriod = indicators[0].longPeriod;
			this.emaPeriod = indicators[0].emaPeriod;
		}

		getContext(context: Context, param2 = false) {
			context = super.getContext(context, param2);
			context.maxValue = Utils.extendedMax(0, context.maxValue);
			context.minValue = Utils.extendedMin(0, context.minValue);
			return context;
		}
	}
