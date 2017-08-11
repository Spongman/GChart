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
		private tries: number = 0;

		constructor(private readonly dataManager: com.google.finance.DataManager, private readonly url: string, private readonly event: com.google.finance.ChartEvent)
		{
			this.initListeners();
			if (url)
			{
				MainManager.console.dataLoading();
				this.urlLoader.load(new flash.net.URLRequest(/*"https://finance.google.com" +*/ url));
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
				case AddStreamResults.ERROR:
					this.setUpDataReload();
					break;
				case AddStreamResults.NOTHING:
					MainManager.console.dataLoaded();
					_loc3_[this.event.quote].dataUnavailableOnServer = true;
					break;
				case AddStreamResults.FIRST_DATA:
				case AddStreamResults.ADDED_DATA:
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
