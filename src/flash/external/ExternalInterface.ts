namespace flash.external
{
	export class ExternalInterface
	{
		static available = true;

		/*
		private static readonly callbacks: { [key: string]: Function } = {};
		static addCallback(name: string, callback: Function)
		{
			console.log("ExternalInterface.addCallbac", name);
			ExternalInterface.callbacks[name] = callback;
		}
		*/

		static call(name:string, ...rest:any[])
		{
			console.log.apply(null, arguments);
		}
	}
}
