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
		protected arrowOrientation = Orientations.DOWN;
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
			const minx = this.supportingLayer.viewPoint.minx;
			const maxx = this.supportingLayer.viewPoint.maxx;
			if (_loc2_ < minx)
				_loc6_ = Number(minx - _loc2_ - 2);
			else if (_loc4_ > maxx)
				_loc6_ = Number(maxx - _loc4_ - 2);

			this.detailsTextField.x += _loc6_;
			const graphics = this.highlightCanvas.graphics;
			graphics.lineStyle(0, this.textColor, 1);
			graphics.beginFill(0xffffff, 1);
			graphics.drawRect(
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
			graphics.endFill();
		}

		getShortText(param1 = false): string
		{
			return this.associatedSplit.newShares + ":" + this.associatedSplit.oldShares;
		}

		setOrientation(orientation: Orientations) 
		{
			this.checkArrowChange(orientation);
			if (this.currentVisibleButton)
			{
				switch (orientation)
				{
					case Orientations.UP:
					case Orientations.SIDEWAYS_UP:
						this.currentVisibleButton.scaleY = -1;
						this.text.y = this.arrow.height - 3;
						break;
					case Orientations.DOWN:
					case Orientations.SIDEWAYS_DOWN:
						this.currentVisibleButton.scaleY = 1;
						this.currentVisibleButton.y = -this.arrow.height;
						this.text.y = -this.arrow.height + 2 - this.text.height;
						break;
				}
			}
			this.arrowOrientation = orientation;
		}

		getDateText(): string
		{
			const exchangeDateInUTC = this.associatedSplit.exchangeDateInUTC;
			if (Const.isZhLocale(com.google.i18n.locale.DateTimeLocale.getLocale()))
				return com.google.i18n.locale.DateTimeLocale.standardFormatDateTime(com.google.i18n.locale.DateTimeFormats.LONG_DATE_FORMAT, exchangeDateInUTC, true);

			return com.google.i18n.locale.DateTimeLocale.standardFormatDateTime(com.google.i18n.locale.DateTimeFormats.MEDIUM_DATE_FORMAT, exchangeDateInUTC, true);
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
			this.highlightCanvas.graphics.clear();
		}

		setSupportingLayer(abstractLayer: AbstractLayer<ViewPoint>) 
		{
			this.supportingLayer = abstractLayer;
		}

		private initTextField(): flash.text.TextField
		{
			const textField = new flash.text.TextField();
			textField.autoSize = flash.text.TextFieldAutoSize.CENTER;
			textField.x = 0;
			textField.selectable = false;
			textField.cacheAsBitmap = false;
			textField.defaultTextFormat = this.textFormat;
			return textField;
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

		setObject(stockAssociatedObject: StockAssociatedObject) 
		{
			this.associatedSplit = stockAssociatedObject as com.google.finance.Split;
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
			this.currentVisibleButton.addEventListener(MouseEvents.MOUSE_OVER, (event: Event) =>
			{
				MainManager.mouseCursor.setCursor(MouseCursors.CLASSIC);
				MainManager.mouseCursor.lockOnDisplayObject(this.currentVisibleButton);
				this.showDetails();
			});
			this.currentVisibleButton.addEventListener(MouseEvents.MOUSE_OUT, (event: Event) =>
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

		setHighlightCanvas(sprite: flash.display.Sprite) 
		{
			this.highlightCanvas = sprite;
		}

		private checkArrowChange(param1: number) 
		{
			if ((this.arrowOrientation === Orientations.UP || this.arrowOrientation === Orientations.DOWN) && (param1 === Orientations.SIDEWAYS_UP || param1 === Orientations.SIDEWAYS_DOWN))
			{
				this.currentVisibleButton = this.attachSidewaysArrow();
				this.positionSidewaysArrow();
			}
			if ((this.arrowOrientation === Orientations.SIDEWAYS_UP || this.arrowOrientation === Orientations.SIDEWAYS_DOWN) && (param1 === Orientations.UP || param1 === Orientations.DOWN))
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
