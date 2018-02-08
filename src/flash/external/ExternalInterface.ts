
	export class ExternalInterface {
		static available = true;

		/*
		private static readonly callbacks: Map<Function> = {};
		static addCallback(name: string, callback: Function)
		{
			console.log("ExternalInterface.addCallback", name);
			ExternalInterface.callbacks[name] = callback;
		}
		*/

		static call(name: string, ...rest: any[]) {
			console.log.apply(console, arguments);
		}
	}
