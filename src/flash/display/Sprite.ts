/// <reference path="DisplayObjectContainer.ts"/>

namespace flash.display
{
	export class Point
	{
		constructor(public x: number, public y: number) { }
	}

	export class Rectangle
	{
	}

	export class Sprite extends DisplayObjectContainer
	{
		constructor(name?: string)
		{
			super(document.createElement("div"), name);
		}
		//mouseCursor: Sprite;
	}
}
