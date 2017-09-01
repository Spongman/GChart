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

	export enum PinOrientations
	{
		RIGHT_ORIENTATION = 0,
		LEFT_ORIENTATION = 1,
	}

	export class PinPointMovie extends flash.display.Sprite
	{
		static readonly MAX_SHOWN_GROUP_COUNT = 7;

		private static letterTextFormat = new flash.text.TextFormat("Arial", 12, 0, true);

		static passiveTextFormat = new flash.text.TextFormat();
		static activeTextFormat = new flash.text.TextFormat();
		static overPassiveTextFormat = new flash.text.TextFormat();
		static overActiveTextFormat = new flash.text.TextFormat();

		private borders: flash.display.Bitmap[];

		private pinPointContentMovie: PinPointContentMovie;

		private flagline: flash.display.Bitmap;
		FlagImg: typeof flash.display.Bitmap;
		FlagPoleImg: typeof flash.display.Bitmap;
		FlagOverImg: typeof flash.display.Bitmap;
		FlagActiveImg: typeof flash.display.Bitmap;
		ExtraFlagBorder: typeof flash.display.Bitmap;

		private letter: flash.text.TextField;
		private pinButton: flash.display.SimpleButton;
		private activeOverlay: flash.display.Bitmap;
		private object: PinPoint | null;

		constructor()
		{
			super();
			this.initImageClasses();
			this.initFlagComponents();
			PinPointMovie.activeTextFormat.color = 0xffffff;
			PinPointMovie.passiveTextFormat.color = 0x444444;
			PinPointMovie.overPassiveTextFormat.color = 0;
			PinPointMovie.overActiveTextFormat.color = 0xeeeeee;
			this.pinButton.addEventListener(MouseEvents.MOUSE_DOWN, (event: Event) =>
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
			this.pinButton.addEventListener(MouseEvents.MOUSE_OVER, (event: Event) =>
			{
				MainManager.mouseCursor.setCursor(MouseCursors.CLASSIC);
				MainManager.mouseCursor.lockOnDisplayObject(this.pinButton);
				this.letter.defaultTextFormat = this.object && this.object.active ? PinPointMovie.overActiveTextFormat : PinPointMovie.overPassiveTextFormat;
			});
			this.pinButton.addEventListener(MouseEvents.MOUSE_OUT, (event: Event) =>
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
					const newBorder: flash.display.Bitmap = new this.ExtraFlagBorder();
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
			const flagImg = new this.FlagImg();
			const flagOverImg = new this.FlagOverImg();
			this.pinButton.overState = flagOverImg;
			this.pinButton.downState = flagOverImg;
			this.pinButton.hitTestState = flagImg;
			this.pinButton.upState = flagImg;
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

		setPinPointContentMovie(pinPointContentMovie: PinPointContentMovie)
		{
			this.pinPointContentMovie = pinPointContentMovie;
		}

		setOrientation(pinOrientation: PinOrientations)
		{
			if (pinOrientation === PinOrientations.LEFT_ORIENTATION)
			{
				this.activeOverlay.scaleX = -1;
				this.activeOverlay.x = 1;
				this.pinButton.scaleX = -1;
				this.pinButton.x = 1;
				this.flagline.x = -2;
				this.letter.x = -14;
				for (const border of this.borders)
					border.scaleX = -1;
			}
			else
			{
				this.activeOverlay.scaleX = 1;
				this.activeOverlay.x = -1;
				this.pinButton.scaleX = 1;
				this.pinButton.x = -1;
				this.flagline.x = -1;
				this.letter.x = 3;
				for (const border of this.borders)
					border.scaleX = 1;
			}
		}

		setHeight(height: number)
		{
			this.flagline.height = height - 2;
			this.flagline.y = -height + 2;
			this.letter.y = -height;
			this.pinButton.y = -height;
			this.activeOverlay.y = -height;
			for (let borderIndex = 0; borderIndex < this.borders.length; borderIndex++)
			{
				this.borders[borderIndex].y = this.pinButton.y + this.pinButton.height - 4 + borderIndex * 2;
				this.borders[borderIndex].y = Math.min(-this.borders[borderIndex].height, this.borders[borderIndex].y);
			}
		}

		getHeight(): number
		{
			return -this.pinButton.y;
		}

		setObj(pinPoint: PinPoint)
		{
			this.object = pinPoint;
			if (this.letter.text !== pinPoint.letter)
				this.letter.text = pinPoint.letter;

			if (pinPoint.active)
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
