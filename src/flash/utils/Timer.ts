namespace flash.utils
{
	export class TimerEvent
	//extends Event
	{
	}

	export class Timer
		extends events.EventDispatcherImpl
	{
		private handle?: number;

		constructor(public readonly period: number)
		{
			super();
		}

		start()
		{
			if (!this.handle)
			{
				this.handle = setInterval(() =>
				{
					const evt = new TimerEvent();
					this.fire(TimerEvents.TIMER, evt);
				}, this.period);
			}
		}
		stop()
		{
			if (this.handle)
			{
				clearInterval(this.handle);
				delete this.handle;
			}
		}
	}
}
