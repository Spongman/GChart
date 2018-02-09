import { ChartDetailTypes } from "./Const";
import { EventCallback } from "./EventCallback";
import { ChartEventPriorities } from './ChartEventPriorities';
import { ChartEventTypes } from './ChartEventTypes';

export class ChartEvent {
		quote: string;
		interval: string;
		period: string;
		priority: ChartEventPriorities;
		startTime: string;
		detailType: ChartDetailTypes|null;
		columns: string;
		callbacks?: EventCallback[];

		constructor(readonly type = ChartEventTypes.GENERIC) {
		}

		getEventName(period?: string): string {
			let eventName = "";
			if (this.quote) {
				eventName = eventName + ("" + this.quote);
			}

			if (this.type) {
				eventName = eventName + ("-t:" + this.type);
			}

			if (this.interval) {
				eventName = eventName + ("-i:" + this.interval);
			}

			if (period) {
				eventName = eventName + ("-p:" + period);
			} else if (this.period) {
				eventName = eventName + ("-p:" + this.period);
								}

			if (this.startTime) {
				eventName = eventName + ("-st:" + this.startTime);
			}

			return eventName;
		}
	}
