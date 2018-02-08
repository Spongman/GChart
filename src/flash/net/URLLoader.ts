import { EventDispatcherImpl } from '../events/EventDispatcher';

	export class URLRequest {
		constructor(readonly url: string) { }
	}

	export class URLLoader
		extends EventDispatcherImpl {
		data: any;

		load(request: URLRequest): void {
			// console.log("URLRequest", request.url);

			const xhr = new XMLHttpRequest();
			xhr.onreadystatechange = () => {
				switch (xhr.readyState) {
					case XMLHttpRequest.DONE:
						this.data = xhr.response;
						if (xhr.status === 200) {
							this.fire(Events.COMPLETE, xhr);
						}

						break;
				}
			};
			xhr.onerror = (event) => {
				this.fire(IOErrorEvents.IO_ERROR, event);
			};
			xhr.open("GET", request.url, true);
			xhr.send();
		}
	}
