import { EventDispatcherImpl } from "../events/EventDispatcher";

export class TimerEvent {
}

export class Timer
	extends EventDispatcherImpl {
	private handle?: number;

	constructor(readonly period: number) {
		super();
	}

	start() {
		if (!this.handle) {
			this.handle = setInterval(() => {
				const evt = new TimerEvent();
				this.fire(TimerEvents.TIMER, evt);
			}, this.period);
		}
	}
	stop() {
		if (this.handle) {
			clearInterval(this.handle);
			delete this.handle;
		}
	}
}
