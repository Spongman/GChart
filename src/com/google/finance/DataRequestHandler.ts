namespace com.google.finance
{
	// import flash.net.URLLoader;
	// import flash.events.IOErrorEvent;
	// import flash.events.Event;
	// import flash.utils.clearInterval;
	// import flash.net.URLRequest;
	// import flash.utils.setInterval;
	// import flash.events.SecurityErrorEvent;

	export class DataRequestHandler
	{
		private intervalId: number;
		private readonly urlLoader = new flash.net.URLLoader();
		private dataManager: com.google.finance.DataManager;
		private url: string;
		private tries: number = 0;
		private event: com.google.finance.ChartEvent;

		constructor(param1: com.google.finance.DataManager, param2: string, param3: com.google.finance.ChartEvent)
		{
			this.dataManager = param1;
			this.event = param3;
			this.url = param2;
			this.initListeners();
			if (param2)
			{
				MainManager.console.dataLoading();
				this.urlLoader.load(new flash.net.URLRequest(/*"https://finance.google.com" +*/ param2));
			}
		}

		private ioErrorHandler(param1: Event) 
		{
			this.setUpDataReload();
			console.log("ioErrorHandler: " + param1);
		}

		private securityErrorHandler(param1: Event) 
		{
			this.setUpDataReload();
			console.log("security error: " + param1);
		}

		private dataReload() 
		{
			if (this.tries === 0)
				MainManager.console.dataLoading();

			clearInterval(this.intervalId);
			this.urlLoader.load(new flash.net.URLRequest(this.url));
		}

		protected configReloadInterval(param1: Function, param2: number) 
		{
			this.intervalId = setInterval(param1, param2);
		}

		private completeHandler(event: Event) 
		{
			//const _loc2_ = this.event.target as flash.net.URLLoader;
			clearInterval(this.intervalId);
			const _loc3_ = this.dataManager.dataSources;
			const _loc4_ = _loc3_[this.event.quote].addStream(decodeURIComponent(this.urlLoader.data), this.event);
			switch (_loc4_)
			{
				case Const.ERROR:
					this.setUpDataReload();
					break;
				case Const.NOTHING:
					MainManager.console.dataLoaded();
					_loc3_[this.event.quote].dataUnavailableOnServer = true;
					break;
				case Const.FIRST_DATA:
				case Const.ADDED_DATA:
					MainManager.console.dataLoaded();
					this.dataManager.mainManager.dataIsHere(_loc3_[this.event.quote], _loc4_);
					if (this.event.callbacks)
					{
						for (let _loc5_ = 0; _loc5_ < this.event.callbacks.length; _loc5_++)
						{
							const _loc6_: { (p1: any): void } = this.event.callbacks[_loc5_].func;
							const _loc7_ = this.event.callbacks[_loc5_].param;
							_loc6_.apply(this, _loc7_);
						}
					}
					flash.display.Graphics.cleanupPending()
					break;
			}
		}

		private initListeners() 
		{
			this.urlLoader.addEventListener(Events.COMPLETE, this.completeHandler.bind(this));
			this.urlLoader.addEventListener(SecurityErrorEvents.SECURITY_ERROR, this.securityErrorHandler.bind(this));
			this.urlLoader.addEventListener(IOErrorEvents.IO_ERROR, this.ioErrorHandler.bind(this));
		}

		protected setUpDataReload() 
		{
			if (this.event.type == com.google.finance.ChartEventTypes.GET_RT_DATA || this.event.type == com.google.finance.ChartEventTypes.GET_RT_AH_DATA)
				return;

			if (this.tries < Const.MAX_RELOAD_TRIES)
			{
				this.configReloadInterval(this.dataReload.bind(this), 5000);
				this.tries++;
			}
			else
			{
				MainManager.console.dataLoaded();
				this.configReloadInterval(this.dataReload.bind(this), 50000);
				this.tries = 0;
			}
		}
	}
}
