namespace flash.net
{
	export class URLRequest
	{
		constructor(public readonly url: string) { }
	}

	export class URLLoader
		extends flash.events.EventDispatcherImpl
	{
		data: any;

		load(request: URLRequest): void
		{
			console.log("URLRequest", request.url);

			let xhr = new XMLHttpRequest();
			xhr.onreadystatechange = () =>
			{
				switch (xhr.readyState)
				{
					case XMLHttpRequest.DONE:
						this.data = xhr.response;
						if (xhr.status === 200)
							this.fire(Events.COMPLETE, xhr);

						break;
				}
			};
			xhr.onerror = (event) =>
			{
				this.fire(IOErrorEvents.IO_ERROR, event);
			};
			xhr.open("GET", request.url, true);
			xhr.send();
		}
	}
}