/// <reference path="../../../flash/display/Sprite.ts" />
/// <reference path="SplitMovie_SplitArrowClass.ts" />
/// <reference path="SplitMovie_SplitArrowSidewaysClass.ts" />
/// <reference path="SplitMovie_SplitArrowSidewaysOverClass.ts" />
/// <reference path="SplitMovie_SplitArrowOnOverClass.ts" />

namespace com.google.finance
{
	//import flash.display.Sprite;
	//import flash.text.TextFormat;
	//import flash.display.Graphics;
	//import flash.display.Bitmap;
	//import com.google.i18n.locale.DateTimeLocale;
	//import flash.text.TextField;
	//import flash.text.TextFieldAutoSize;
	//import flash.display.SimpleButton;
	//import flash.events.MouseEvent;
	//import flash.events.Event;

	//import { MainManager } from "./com/google/*";

	export class SplitMovie extends flash.display.Sprite
	{
		private static readonly SplitArrowClass = SplitMovie_SplitArrowClass;
		private static readonly SplitArrowSidewaysClass = SplitMovie_SplitArrowSidewaysClass;
		private static readonly SplitArrowSidewaysOverClass = SplitMovie_SplitArrowSidewaysOverClass;
		private static readonly SplitArrowOnOverClass = SplitMovie_SplitArrowOnOverClass;

		private associatedSplit: com.google.finance.Split;
		private persistentHide: boolean;
		
		protected textFormat = new flash.text.TextFormat("Verdana", 9, this.getTextColor(), true, false, false);
		protected arrowOrientation = Const.DOWN;
		protected arrow: flash.display.Bitmap;
		protected readonly detailsTextField = new flash.text.TextField();
		protected highlightCanvas: flash.display.Sprite;
		protected text: flash.text.TextField;
		protected textColor: number;
		protected arrowOnOver: flash.display.Bitmap;
		protected previousText: string;
		protected currentVisibleButton: flash.display.SimpleButton;
		protected sidewaysButton: flash.display.SimpleButton;
		protected arrowSidewaysOver: flash.display.Bitmap;
		protected supportingLayer: AbstractLayer<ViewPoint>;
		protected arrowSideways: flash.display.Bitmap;
		protected readonly detailsTextFormat = new flash.text.TextFormat("Arial", 11, 0, false, false, false);
		protected regularButton: flash.display.SimpleButton;

		constructor()
		{
			super();
			this.initArrows();
			this.createButtons();
			this.currentVisibleButton = this.attachRegularArrow();
			this.regularButton.x = -this.regularButton.width / 2;
			this.detailsTextField.defaultTextFormat = this.detailsTextFormat;
			this.detailsTextField.autoSize = flash.text.TextFieldAutoSize.LEFT;
			this.text = this.initTextField();
			this.addChild(this.text);
			this.attachArrowListeners();
			this.highlightCanvas = this;
		}

		protected getTextColor(): number
		{
			return 2210891;
		}

		showDetails() 
		{
			this.hideText();
			this.highlightCanvas.addChild(this.detailsTextField);
			this.detailsTextField.x = this.x + this.currentVisibleButton.x;
			this.detailsTextField.y = this.y - this.currentVisibleButton.height;
			this.detailsTextField.text = this.getDetailedText();
			this.detailsTextField.appendText("\n" + this.getDateText());
			if (this.currentVisibleButton.scaleY === -1)
				this.detailsTextField.y = this.y + this.currentVisibleButton.height - this.detailsTextField.height;
			else
				this.detailsTextField.y = this.y - this.currentVisibleButton.height - this.detailsTextField.height;

			const _loc2_ = this.detailsTextField.x - 2;
			const _loc3_ = this.detailsTextField.y - 2;
			const _loc4_ = this.detailsTextField.x + this.detailsTextField.width + 2;
			const _loc5_ = this.detailsTextField.y + this.detailsTextField.height + 2;
			let _loc6_ = -2;
			const _loc7_ = this.supportingLayer.viewPoint.minx;
			const _loc8_ = this.supportingLayer.viewPoint.maxx;
			if (_loc2_ < _loc7_)
				_loc6_ = Number(_loc7_ - _loc2_ - 2);
			else if (_loc4_ > _loc8_)
				_loc6_ = Number(_loc8_ - _loc4_ - 2);

			this.detailsTextField.x = this.detailsTextField.x + _loc6_;
			const _loc9_ = this.highlightCanvas.graphics;
			_loc9_.lineStyle(0, this.textColor, 1);
			_loc9_.beginFill(0xffffff, 1);
			_loc9_.drawRect(
				_loc2_ + _loc6_, _loc3_,
				_loc4_ - _loc2_, _loc5_ - _loc3_
			);
			/*
			_loc9_.moveTo(_loc2_ + _loc6_, _loc3_);
			_loc9_.lineTo(_loc4_ + _loc6_, _loc3_);
			_loc9_.lineTo(_loc4_ + _loc6_, _loc5_);
			_loc9_.lineTo(_loc2_ + _loc6_, _loc5_);
			_loc9_.lineTo(_loc2_ + _loc6_, _loc3_);
			*/
			_loc9_.endFill();
		}

		getShortText(param1 = false): string
		{
			return this.associatedSplit.newShares + ":" + this.associatedSplit.oldShares;
		}

		setOrientation(param1: number) 
		{
			this.checkArrowChange(param1);
			if (this.currentVisibleButton)
			{
				switch (param1)
				{
					case Const.UP:
					case Const.SIDEWAYS_UP:
						this.currentVisibleButton.scaleY = -1;
						this.text.y = this.arrow.height - 3;
						break;
					case Const.DOWN:
					case Const.SIDEWAYS_DOWN:
						this.currentVisibleButton.scaleY = 1;
						this.currentVisibleButton.y = -this.arrow.height;
						this.text.y = -this.arrow.height + 2 - this.text.height;
						break;
				}
			}
			this.arrowOrientation = param1;
		}

		getDateText(): string
		{
			const _loc1_ = this.associatedSplit.exchangeDateInUTC;
			if (Const.isZhLocale(com.google.i18n.locale.DateTimeLocale.getLocale()))
				return com.google.i18n.locale.DateTimeLocale.standardFormatDateTime(com.google.i18n.locale.DateTimeLocale.LONG_DATE_FORMAT, _loc1_, true);

			return com.google.i18n.locale.DateTimeLocale.standardFormatDateTime(com.google.i18n.locale.DateTimeLocale.MEDIUM_DATE_FORMAT, _loc1_, true);
		}

		hideDetails() 
		{
			this.showText();
			try
			{
				this.highlightCanvas.removeChild(this.detailsTextField);
			}
			catch (ae /*:ArgumentError*/)
			{
			}
			this.highlightCanvas.graphics.clear(true);
		}

		setSupportingLayer(param1: AbstractLayer<ViewPoint>) 
		{
			this.supportingLayer = param1;
		}

		private initTextField(): flash.text.TextField
		{
			const _loc1_ = new flash.text.TextField();
			_loc1_.autoSize = flash.text.TextFieldAutoSize.CENTER;
			_loc1_.x = 0;
			_loc1_.selectable = false;
			_loc1_.cacheAsBitmap = false;
			_loc1_.defaultTextFormat = this.textFormat;
			return _loc1_;
		}

		private positionRegularArrow() 
		{
			this.currentVisibleButton.x = -this.currentVisibleButton.width / 2;
			this.text.x = -this.text.width / 2;
		}

		hideText() 
		{
			try
			{
				this.removeChild(this.text);
				return;
			}
			catch (ae /*:ArgumentError*/)
			{
				return;
			}
		}

		private attachRegularArrow(): flash.display.SimpleButton
		{
			if (this.currentVisibleButton)
				this.removeChild(this.currentVisibleButton);

			this.addChild(this.regularButton);
			return this.regularButton;
		}

		protected initArrows() 
		{
			this.arrow = new SplitMovie.SplitArrowClass();
			this.arrowOnOver = new SplitMovie.SplitArrowOnOverClass();
			this.arrowSideways = new SplitMovie.SplitArrowSidewaysClass();
			this.arrowSidewaysOver = new SplitMovie.SplitArrowSidewaysOverClass();
		}

		setObject(param1: StockAssociatedObject) 
		{
			this.associatedSplit = param1 as com.google.finance.Split;
			this.showText();
		}

		private attachSidewaysArrow(): flash.display.SimpleButton
		{
			if (this.currentVisibleButton)
				this.removeChild(this.currentVisibleButton);
			this.addChild(this.sidewaysButton);
			return this.sidewaysButton;
		}

		showText(param1?: string) 
		{
			if (this.persistentHide)
				return;

			this.addChild(this.text);
			const _loc2_ = param1 ? param1 : this.getShortText();
			if (this.text.text !== _loc2_)
				this.text.text = _loc2_;
		}

		private attachArrowListeners() 
		{
			this.currentVisibleButton.addEventListener(MouseEvents.MOUSE_OVER, (param1: Event) =>
			{
				MainManager.mouseCursor.setCursor(MouseCursor.CLASSIC);
				MainManager.mouseCursor.lockOnDisplayObject(this.currentVisibleButton);
				this.showDetails();
			});
			this.currentVisibleButton.addEventListener(MouseEvents.MOUSE_OUT, (param1: Event) =>
			{
				MainManager.mouseCursor.unlock();
				this.hideDetails();
			});
		}

		private createButtons() 
		{
			this.regularButton = new flash.display.SimpleButton("regularButton");
			this.regularButton.overState = this.arrowOnOver;
			this.regularButton.downState = this.arrowOnOver;
			this.regularButton.hitTestState = this.arrow;
			this.regularButton.upState = this.arrow;
			this.arrowOnOver.y = this.arrow.y + this.arrow.height - this.arrowOnOver.height;
			this.arrowOnOver.x = this.arrow.x;
			this.sidewaysButton = new flash.display.SimpleButton("sidewaysButton");
			this.sidewaysButton.overState = this.arrowSidewaysOver;
			this.sidewaysButton.downState = this.arrowSidewaysOver;
			this.sidewaysButton.hitTestState = this.arrowSideways;
			this.sidewaysButton.upState = this.arrowSideways;
			this.arrowSidewaysOver.y = this.arrowSideways.y + this.arrowSideways.height - this.arrowSidewaysOver.height;
			this.arrowSidewaysOver.x = this.arrowSideways.x;
		}

		setHighlightCanvas(param1: flash.display.Sprite) 
		{
			this.highlightCanvas = param1;
		}

		private checkArrowChange(param1: number) 
		{
			if ((this.arrowOrientation === Const.UP || this.arrowOrientation === Const.DOWN) && (param1 === Const.SIDEWAYS_UP || param1 === Const.SIDEWAYS_DOWN))
			{
				this.currentVisibleButton = this.attachSidewaysArrow();
				this.positionSidewaysArrow();
			}
			if ((this.arrowOrientation === Const.SIDEWAYS_UP || this.arrowOrientation === Const.SIDEWAYS_DOWN) && (param1 === Const.UP || param1 === Const.DOWN))
			{
				this.currentVisibleButton = this.attachRegularArrow();
				this.positionRegularArrow();
			}
			this.attachArrowListeners();
		}

		protected positionSidewaysArrow() 
		{
			this.currentVisibleButton.x = -this.currentVisibleButton.width + 1;
			this.text.autoSize = flash.text.TextFieldAutoSize.LEFT;
			this.text.x = -this.text.width + 1;
		}

		getDetailedText(): string
		{
			return Messages.getMsg(Messages.SPLIT_TEXT, this.getShortText());
		}

		setPersistentHide(param1: boolean) 
		{
			this.persistentHide = param1;
		}
	}
}
