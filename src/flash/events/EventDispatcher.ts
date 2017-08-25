namespace flash.events
{
	export abstract class EventDispatcher
	{
		abstract addEventListener(type: string, listener: Function, useCapture?: boolean, priority?: number, useWeakReference?: boolean): void;
	}

	export class EventDispatcherImpl
	{
		private _events: Map<Function[]> = {};

		addEventListener(type: string, listener: Function, useCapture?: boolean, priority?: number, useWeakReference?: boolean): void
		{
			const listeners = this._events[type] || (this._events[type] = []);
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

			flash.display.Graphics.cleanupPending();
		}
	}
}
