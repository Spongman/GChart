// import { LoaderInfo } from './flash/display/LoaderInfo';

declare function notnull<T>(value: T | null): T;
declare function assert(cond: boolean): void;
declare function cssColor(n: number, alpha?: number): string;
declare function getDefinitionByName(name: string): Function;
declare function getClassName(obj: any): string;
declare function getTimer(): number;
declare function parseQueryString(str: string): { [_: string]: string };
declare function offsetOf(elt: HTMLElement): { left: number, top: number };


declare enum MouseEvents {
	CLICK = "click",
	MOUSE_DOWN = "mousedown",
	MOUSE_MOVE = "mousemove",
	MOUSE_OUT = "mouseout",
	MOUSE_OVER = "mouseover",
	MOUSE_UP = "mouseup",
	ROLL_OUT = "rollout",
	ROLL_OVER = "rollover",
	MOUSE_WHEEL = "wheel", // mousewheel";
	MOUSE_LEAVE = "mouseleave",
}

declare enum KeyboardEvents {
	KEY_DOWN = "keydown",
	KEY_UP = "keyup",
}

declare enum TimerEvents {
	TIMER = "timer",
}

declare enum Events {
	COMPLETE = "complete",
	RESIZE = "resize",
}


declare enum SecurityErrorEvents {
	SECURITY_ERROR = "security-error",
}

declare enum IOErrorEvents {
	IO_ERROR = "io-error",
}


declare interface ILoaderInfo {
	url: string;
	parameters: any;
}

interface Window {
	//[index: string]: any;
	loaderInfo: ILoaderInfo
}

