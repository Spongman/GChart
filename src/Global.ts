
export interface Map<T> { [key: string]: T; }
export type Dictionary = Map<any>;

export interface Date {
	dateUTC: number;
	monthUTC: number;
	fullYearUTC: number;

	date: number;
	month: number;
	fullYear: number;
}

function addGetter<T extends { prototype: any }>(theType: T, name: string, getter: () => any) {
	Object.defineProperty(theType.prototype, name, {
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

/*
export interface Window {
	loaderInfo: LoaderInfo;
}
*/

export function cssColor(n: number, alpha = 1): string {

	const s = Math.floor(n).toString(16);
	if (alpha >= 1) {
		return "#" + "000000".substr(s.length) + s;
	}

	const a = Math.floor(alpha * 255).toString(16);
	return "#" + "00".substr(a.length) + "000000".substr(s.length) + s;
}

function assert(cond: boolean): void {
	if (!cond) {
		throw new Error("assertion failed");
	}
}

function getDefinitionByName(name: string): Function {

	let container: any = window;
	const parts = name.split(".");
	for (const part of parts) {
		container = container[part];
	}
	return container;
}

function getClassName(obj: any) {
	return obj.constructor.name;
}
/*
let funcNameRegex = /function (.{1,})\(/;
let results = (funcNameRegex).exec(obj["constructor"].toString());
return (results && results.length > 1) ? results[1] : "";
*/

function getTimer() {
	return Date.now();
}

function notnull<T>(value: T | null): T {
	if (!value) {
		throw new Error();
	}
	return value;
}

function parseQueryString(str: string) {
	const result: { [_: string]: string } = {};
	const pairs = str.split("&");
	for (const pair of pairs) {
		const parts = pair.split("=");
		result[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
	}
	return result;
}

function offsetOf(elt: HTMLElement) {
	let curleft = 0;
	let curtop = 0;

	do {
		curleft += elt.offsetLeft;
		curtop += elt.offsetTop;
		elt = elt.offsetParent as HTMLElement;
	} while (elt);

	return { left: curleft, top: curtop };
}
