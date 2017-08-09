/// <reference path="../../../flash/display/Sprite.ts" />

namespace com.google.finance
{
	// import flash.display.Sprite;
	// import flash.events.Event;
	// import flash.display.DisplayObject;
	// import flash.events.MouseEvent;
	// import flash.display.Bitmap;
	// import flash.ui.Mouse;

	export class MouseCursor extends flash.display.Sprite
	{
		static readonly H_ARROWS = 4;
		static readonly OPENED_HAND = 2;
		static readonly DRAGGABLE_CURSOR = MouseCursor.OPENED_HAND;
		static readonly HIDDEN = 0;
		static readonly CLASSIC = 1;
		static readonly V_ARROWS = 5;
		static readonly CLOSED_HAND = 3;

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
			this.currentType = MouseCursor.CLASSIC;
			this.mouseEnabled = false;
			//this.cursor = new this.CursorOpenedHand();
			this.setCursor(MouseCursor.OPENED_HAND);
		}

		onMouseLeave(param1: Event) 
		{
			this.setCursor(MouseCursor.CLASSIC);
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

		lockOnDisplayObject(param1: flash.display.DisplayObject) 
		{
			this.displayObjectLockedOn = param1;
		}

		setCursor(param1: number) 
		{
			switch (param1)
			{
				default:
				case MouseCursor.CLASSIC:
					this.element.style.cursor = "auto";
					break;
				case MouseCursor.HIDDEN:
					this.element.style.cursor = "none";
					break;
				case MouseCursor.OPENED_HAND:
					this.element.style.cursor = "grab";
					break;
				case MouseCursor.CLOSED_HAND:
					this.element.style.cursor = "grabbing";
					break;
				case MouseCursor.H_ARROWS:
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
				case MouseCursor.CLASSIC:
					Mouse.show();
					return;
				case MouseCursor.HIDDEN:
					return;
				case MouseCursor.OPENED_HAND:
					this.cursor = new MouseCursor.CursorOpenedHand();
					break;
				case MouseCursor.CLOSED_HAND:
					this.cursor = new MouseCursor.CursorClosedHand();
					break;
				case MouseCursor.H_ARROWS:
					this.cursor = new MouseCursor.CursorHorizontalArrows();
			}
			this.addChild(this.cursor);
			this.onMouseMove(null);
			*/
		}

		unlock() 
		{
			this.displayObjectLockedOn = null;
		}

		onMouseMove(param1: MouseEvent) 
		{
			this.cursor.x = this.mouseX - this.cursor.width / 2;
			this.cursor.y = this.mouseY - this.cursor.height / 2;
		}
	}
}
