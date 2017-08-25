
type Map<T> = { [key: string]: T };
type Dictionary = Map<any>;

interface Date
{
	dateUTC: number;
	monthUTC: number;
	fullYearUTC: number;

	date: number;
	month: number;
	fullYear: number;
}

function addGetter<T extends Function>(type: T, name: string, getter: () => any)
{
	Object.defineProperty(type.prototype, name, {
		get: getter,
		enumerable: true,
		configurable: true,
	});
}

addGetter(Date, "dateUTC", Date.prototype.getUTCDate);
addGetter(Date, "monthUTC", Date.prototype.getUTCMonth);
addGetter(Date, "fullYearUTC", Date.prototype.getUTCFullYear);
addGetter(Date, "date", Date.prototype.getDate);
addGetter(Date, "month", Date.prototype.getMonth);
addGetter(Date, "fullYear", Date.prototype.getFullYear);

interface Window
{
	loaderInfo: flash.display.LoaderInfo;
}

module Events
{
	export const COMPLETE = "complete";
	export const RESIZE = "resize";
}

module MouseEvents
{
	export const CLICK = "click";
	export const MOUSE_DOWN = "mousedown";
	export const MOUSE_MOVE = "mousemove";
	export const MOUSE_OUT = "mouseout";
	export const MOUSE_OVER = "mouseover";
	export const MOUSE_UP = "mouseup";
	export const ROLL_OUT = "rollout";
	export const ROLL_OVER = "rollover";
	export const MOUSE_WHEEL = "mousewheel";
	export const MOUSE_LEAVE = "mouseleave";
}

module KeyboardEvents
{
	export const KEY_DOWN = "keydown";
	export const KEY_UP = "keyup";
}

module TimerEvents
{
	export const TIMER = "timer";
}

module IOErrorEvents
{
	export const IO_ERROR = "io-error";
}

module SecurityErrorEvents
{
	export const SECURITY_ERROR = "security-error";
}

function cssColor(n: number, alpha = 1): string
{
	const s = Math.floor(n).toString(16);
	if (alpha >= 1)
		return "#" + "000000".substr(s.length) + s;

	const a = Math.floor(alpha * 255).toString(16);
	return "#" + "00".substr(a.length) + "000000".substr(s.length) + s;
}

function assert(cond: boolean)
{
	if (!cond)
		debugger;
}

function getDefinitionByName(name: string): Function
{
	let container: any = window;
	const parts = name.split(".");
	for (const part of parts)
		container = container[part];
	return container;
}

function getClassName(obj: any)
{
	return obj.constructor.name;
	/*
	let funcNameRegex = /function (.{1,})\(/;
	let results = (funcNameRegex).exec(obj["constructor"].toString());
	return (results && results.length > 1) ? results[1] : "";
	*/
}
function getTimer()
{
	return Date.now();
}

function notnull<T>(value: T | null): T
{
	if (!value)
		throw new Error();
	return value;
}

if (!Function.prototype.bind)
{
	Function.prototype.bind = function(oThis)
	{
		const aArgs = Array.prototype.slice.call(arguments, 1);
		const fToBind = this;
		const fNOP = () => { };
		const fBound = function()
		{
			return fToBind.apply(this instanceof fNOP
				? this
				: oThis,
				aArgs.concat(Array.prototype.slice.call(arguments)));
		};

		if (this.prototype)
		{
			// Function.prototype doesn't have a prototype property
			fNOP.prototype = this.prototype;
		}
		fBound.prototype = new (fNOP as any)();

		return fBound;
	};
}

function parseQueryString(str: string)
{
	const result: { [_: string]: string } = {};
	const pairs = str.split("&");
	for (const pair of pairs)
	{
		const p = pair.split("=");
		const key = decodeURIComponent(p[0]);
		const value = decodeURIComponent(p[1]);
		result[key] = value;
		//console.log("  " + key + " = " + value);
	}
	return result;
}

function offsetOf(elt: HTMLElement)
{
	let curleft = 0;
	let curtop = 0;

	do
	{
		curleft += elt.offsetLeft;
		curtop += elt.offsetTop;
		elt = elt.offsetParent as HTMLElement;
	} while (elt);

	return { left: curleft, top: curtop };
}
