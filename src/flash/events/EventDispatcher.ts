namespace flash.events
{
	export abstract class EventDispatcher
	{
		abstract addEventListener(eventType: string, listener: Function, useCapture?: boolean, priority?: number, useWeakReference?: boolean): void;
	}

	export class EventDispatcherImpl
	{
		private _events: Map<((event: Event) => void)[]> = {};

		addEventListener(eventType: string, listener: (event: Event) => void, useCapture?: boolean, priority?: number, useWeakReference?: boolean): void
		{
			const listeners = this._events[eventType] || (this._events[eventType] = []);
			listeners.push(listener);
		}

		protected fire(name: string, ...rest: any[])
		{
			const listeners = this._events[name];
			if (listeners)
			{
				for (const listener of listeners)
					listener.apply(null, rest);
			}

			display.Graphics.cleanupPending();
		}
	}
}
