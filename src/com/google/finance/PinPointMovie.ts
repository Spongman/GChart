/// <reference path="../../../flash/display/Sprite.ts" />

namespace com.google.finance
{
	// import flash.display.Sprite;
	// import flash.text.TextFormat;
	// import flash.display.Bitmap;
	// import flash.display.SimpleButton;
	// import flash.text.TextField;
	// import flash.events.MouseEvent;
	// import flash.events.Event;

	export class PinPointMovie extends flash.display.Sprite
	{
		static readonly MAX_SHOWN_GROUP_COUNT = 7;

		private static letterTextFormat = new flash.text.TextFormat("Arial", 12, 0, true);

		static passiveTextFormat = new flash.text.TextFormat();
		static activeTextFormat = new flash.text.TextFormat();
		static overPassiveTextFormat = new flash.text.TextFormat();
		static overActiveTextFormat = new flash.text.TextFormat();

		private borders: flash.display.Bitmap[];

		private pinPointContentMovie: com.google.finance.PinPointContentMovie;

		private flagline: flash.display.Bitmap;
		FlagImg: typeof flash.display.Bitmap;
		FlagPoleImg: typeof flash.display.Bitmap;
		FlagOverImg: typeof flash.display.Bitmap;
		FlagActiveImg: typeof flash.display.Bitmap;
		ExtraFlagBorder: typeof flash.display.Bitmap;

		private letter: flash.text.TextField;
		private pinButton: flash.display.SimpleButton;
		private activeOverlay: flash.display.Bitmap;
		private object: com.google.finance.PinPoint | null;

		constructor()
		{
			super();
			this.initImageClasses();
			this.initFlagComponents();
			PinPointMovie.activeTextFormat.color = 0xffffff;
			PinPointMovie.passiveTextFormat.color = 0x444444;
			PinPointMovie.overPassiveTextFormat.color = 0;
			PinPointMovie.overActiveTextFormat.color = 0xeeeeee;
			this.pinButton.addEventListener(MouseEvents.MOUSE_DOWN, (param1: Event) =>
			{
				if (!this.object)
					throw new Error();

				if (this.object.active)
				{
					this.object.active = false;
					this.object.forceExpandInGroup = true;
					this.pinPointContentMovie.clearMovie();
				}
				else
				{
					MainManager.jsProxy.iClicked(this.object.qname, this.getPinPointType(), this.object.id, this.object.letter);
				}
			});
			this.pinButton.addEventListener(MouseEvents.MOUSE_OVER, (param1: Event) =>
			{
				MainManager.mouseCursor.setCursor(MouseCursor.CLASSIC);
				MainManager.mouseCursor.lockOnDisplayObject(this.pinButton);
				this.letter.defaultTextFormat = this.object && this.object.active ? PinPointMovie.overActiveTextFormat : PinPointMovie.overPassiveTextFormat;
			});
			this.pinButton.addEventListener(MouseEvents.MOUSE_OUT, (param1: Event) =>
			{
				MainManager.mouseCursor.unlock();
				this.letter.defaultTextFormat = this.object && this.object.active ? PinPointMovie.activeTextFormat : PinPointMovie.passiveTextFormat;
			});
		}

		protected getPinPointType(): string
		{
			return "newspin";
		}

		setCount(param1: number) 
		{
			let i = 0;
			let count = param1;
			count = Math.min(count, PinPointMovie.MAX_SHOWN_GROUP_COUNT);
			if (this.borders.length > count - 1)
			{
				i = count - 1;
				while (i < this.borders.length)
				{
					try
					{
						this.removeChild(this.borders[i]);
					}
					catch (e /*:Error*/)
					{
					}
					i++;
				}
				this.borders.splice(count - 1, this.borders.length - count + 1);
			}
			else if (this.borders.length < count - 1)
			{
				i = this.borders.length;
				while (i < count - 1)
				{
					let newBorder: flash.display.Bitmap = new this.ExtraFlagBorder();
					newBorder.x = 0;
					this.borders.push(newBorder);
					this.addChild(newBorder);
					i++;
				}
			}
		}

		private initFlagComponents() 
		{
			this.pinButton = new flash.display.SimpleButton("pinButton");
			const _loc1_ = new this.FlagImg();
			const _loc2_ = new this.FlagOverImg();
			this.pinButton.overState = _loc2_;
			this.pinButton.downState = _loc2_;
			this.pinButton.hitTestState = _loc1_;
			this.pinButton.upState = _loc1_;
			this.pinButton.useHandCursor = true;
			this.addChild(this.pinButton);
			this.flagline = new this.FlagPoleImg();
			this.flagline.x = -1;
			this.addChildAt(this.flagline, 0);
			this.letter = new flash.text.TextField();
			this.letter.autoSize = "left";
			this.letter.selectable = false;
			this.letter.defaultTextFormat = PinPointMovie.letterTextFormat;
			this.letter.mouseEnabled = false;
			this.addChild(this.letter);
			this.activeOverlay = new this.FlagActiveImg();
			this.borders = [];
		}

		setPinPointContentMovie(param1: com.google.finance.PinPointContentMovie) 
		{
			this.pinPointContentMovie = param1;
		}

		setOrientation(param1: number) 
		{
			if (param1 === 1)
			{
				this.activeOverlay.scaleX = -1;
				this.activeOverlay.x = 1;
				this.pinButton.scaleX = -1;
				this.pinButton.x = 1;
				this.flagline.x = -2;
				this.letter.x = -14;
				for (let _loc2_ = 0; _loc2_ < this.borders.length; _loc2_++)
				{
					this.borders[_loc2_].scaleX = -1;
				}
			}
			else
			{
				this.activeOverlay.scaleX = 1;
				this.activeOverlay.x = -1;
				this.pinButton.scaleX = 1;
				this.pinButton.x = -1;
				this.flagline.x = -1;
				this.letter.x = 3;
				for (let _loc2_ = 0; _loc2_ < this.borders.length; _loc2_++)
				{
					this.borders[_loc2_].scaleX = 1;
				}
			}
		}

		setHeight(param1: number) 
		{
			this.flagline.height = param1 - 2;
			this.flagline.y = -param1 + 2;
			this.letter.y = -param1;
			this.pinButton.y = -param1;
			this.activeOverlay.y = -param1;
			for (let _loc2_ = 0; _loc2_ < this.borders.length; _loc2_++)
			{
				this.borders[_loc2_].y = this.pinButton.y + this.pinButton.height - 4 + _loc2_ * 2;
				this.borders[_loc2_].y = Math.min(-this.borders[_loc2_].height, this.borders[_loc2_].y);
			}
		}

		getHeight(): number
		{
			return -this.pinButton.y;
		}

		setObj(param1: com.google.finance.PinPoint) 
		{
			this.object = param1;
			if (this.letter.text !== param1.letter)
				this.letter.text = param1.letter;

			if (param1.active)
			{
				if (!this.contains(this.activeOverlay))
				{
					this.activeOverlay.x = this.pinButton.x;
					this.activeOverlay.y = this.pinButton.y;
					this.addChildAt(this.activeOverlay, this.numChildren - 1);
				}
				this.letter.setTextFormat(PinPointMovie.activeTextFormat);
			}
			else
			{
				if (this.contains(this.activeOverlay))
					this.removeChild(this.activeOverlay);

				this.letter.setTextFormat(PinPointMovie.passiveTextFormat);
			}
		}

		initImageClasses() 
		{
			this.FlagImg = PinPointMovie_LocalFlagImg;
			this.FlagOverImg = PinPointMovie_LocalFlagOverImg;
			this.FlagActiveImg = PinPointMovie_LocalFlagActiveImg;
			this.FlagPoleImg = PinPointMovie_LocalFlagPoleImg;
			this.ExtraFlagBorder = PinPointMovie_LocalExtraFlagBorder;
		}

		clearReferences() 
		{
			this.object = null;
		}
	}
}
