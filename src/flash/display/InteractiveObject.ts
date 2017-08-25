/// <reference path="DisplayObject.ts"/>

namespace flash.display
{
	export class InteractiveObject
		extends DisplayObject
	{
		get mouseEnabled() { return this.element.classList.contains("mouseEnabled"); }
		set mouseEnabled(value: boolean) { this.element.classList.toggle("mouseEnabled", value); }

		constructor(public readonly element: HTMLElement, name?: string)
		{
			super(element, name);
			element.classList.add("mouseEnabled");
		}
	}
}
