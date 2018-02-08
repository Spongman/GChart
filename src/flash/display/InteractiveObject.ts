import { DisplayObject } from "DisplayObject";

export class InteractiveObject
		extends DisplayObject {
		get mouseEnabled() { return this.element.classList.contains("mouseEnabled"); }
		set mouseEnabled(value: boolean) { this.element.classList.toggle("mouseEnabled", value); }

		constructor(readonly element: HTMLElement, name?: string) {
			super(element, name);
			element.classList.add("mouseEnabled");
		}
	}
