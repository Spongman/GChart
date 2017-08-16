/// <reference path="../../../flash/display/Sprite.ts" />

namespace com.google.finance
{
	// import flash.display.Sprite;
	// import flash.events.Event;
	// import flash.display.DisplayObject;
	// import flash.events.MouseEvent;
	// import flash.display.Bitmap;
	// import flash.ui.Mouse;

	export enum MouseCursors
	{
		H_ARROWS = 4,
		OPENED_HAND = 2,
		HIDDEN = 0,
		CLASSIC = 1,
		V_ARROWS = 5,
		CLOSED_HAND = 3,
	}

	export class MouseCursor extends flash.display.Sprite
	{
		static readonly DRAGGABLE_CURSOR = MouseCursors.OPENED_HAND;
		
		/*
		private static readonly CursorHorizontalArrows = MouseCursor_CursorHorizontalArrows;
		private static readonly CursorOpenedHand = MouseCursor_CursorOpenedHand;
		private static readonly CursorClosedHand = MouseCursor_CursorClosedHand;
		*/

		private displayObjectLockedOn: flash.display.DisplayObject | null;
		
		currentType: number;
		cursor: flash.display.Bitmap;

		constructor()
		{
			super();
			this.currentType = MouseCursors.CLASSIC;
			this.mouseEnabled = false;
			//this.cursor = new this.CursorOpenedHand();
			this.setCursor(MouseCursors.OPENED_HAND);
		}

		onMouseLeave(event: Event) 
		{
			this.setCursor(MouseCursors.CLASSIC);
		}

		initListeners() 
		{
			return;
			/*TODO
			if (this.stage)
			{
				this.stage.addEventListener(MouseEvents.MOUSE_MOVE, flash.display.Stage.bind(this.onMouseMove, this));
				this.stage.addEventListener(MouseEvents.MOUSE_LEAVE, flash.display.Stage.bind(this.onMouseLeave, this));
			}
			*/
		}

		lockOnDisplayObject(displayObject: flash.display.DisplayObject) 
		{
			this.displayObjectLockedOn = displayObject;
		}

		setCursor(param1: number) 
		{
			switch (param1)
			{
				default:
				case MouseCursors.CLASSIC:
					this.element.style.cursor = "auto";
					break;
				case MouseCursors.HIDDEN:
					this.element.style.cursor = "none";
					break;
				case MouseCursors.OPENED_HAND:
					this.element.style.cursor = "grab";
					break;
				case MouseCursors.CLOSED_HAND:
					this.element.style.cursor = "grabbing";
					break;
				case MouseCursors.H_ARROWS:
					this.element.style.cursor = "ew-resize";
					break;
			}
			/*

			let type: number = param1;
			if (this.currentType === type)
				return;

			if (this.displayObjectLockedOn)
			{
				if (this.displayObjectLockedOn.hitTestPoint(this.stage.mouseX, this.stage.mouseY))
					return;

				this.unlock();
			}
			this.currentType = type;
			Mouse.hide();
			try
			{
				this.removeChild(this.cursor);
			}
			catch (ae)
			{
			}
			switch (type)
			{
				case MouseCursors.CLASSIC:
					Mouse.show();
					return;
				case MouseCursors.HIDDEN:
					return;
				case MouseCursors.OPENED_HAND:
					this.cursor = new MouseCursors.CursorOpenedHand();
					break;
				case MouseCursors.CLOSED_HAND:
					this.cursor = new MouseCursors.CursorClosedHand();
					break;
				case MouseCursors.H_ARROWS:
					this.cursor = new MouseCursors.CursorHorizontalArrows();
			}
			this.addChild(this.cursor);
			this.onMouseMove(null);
			*/
		}

		unlock() 
		{
			this.displayObjectLockedOn = null;
		}

		onMouseMove(mouseEvent: MouseEvent) 
		{
			this.cursor.x = this.mouseX - this.cursor.width / 2;
			this.cursor.y = this.mouseY - this.cursor.height / 2;
		}
	}
}
