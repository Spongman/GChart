namespace flash.events
{
	export abstract class EventDispatcher
	{
		abstract addEventListener(type: string, listener: Function, useCapture?: boolean, priority?: number, useWeakReference?: boolean): void;
	}

	export class EventDispatcherImpl
	{
		private _events: { [key: string]: Function[] } = {};

		addEventListener(type: string, listener: Function, useCapture?: boolean, priority?: number, useWeakReference?: boolean): void
		{
			let listeners = this._events[type] || (this._events[type] = []);
			listeners.push(listener);
		}

		protected fire(name: string, ...rest: any[])
		{
			let listeners = this._events[name];
			if (listeners)
			{
				for (let i = 0; i < listeners.length; i++)
				{
					listeners[i].apply(null, rest);
				}
			}

			flash.display.Graphics.cleanupPending();
		}
	}
}