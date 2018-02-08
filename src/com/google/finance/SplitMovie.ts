import { SplitMovie_SplitArrowClass } from "SplitMovie_SplitArrowClass";
import { SplitMovie_SplitArrowOnOverClass } from "SplitMovie_SplitArrowOnOverClass";
import { SplitMovie_SplitArrowSidewaysClass } from "SplitMovie_SplitArrowSidewaysClass";
import { SplitMovie_SplitArrowSidewaysOverClass } from "SplitMovie_SplitArrowSidewaysOverClass";
import { Sprite } from "../../../flash/display/Sprite";

	//import flash.display.Sprite;
	//import flash.text.TextFormat;
	//import flash.display.Graphics;
	//import Bitmap;
	//import com.google.i18n.locale.DateTimeLocale;
	//import flash.text.TextField;
	//import flash.text.TextFieldAutoSize;
	//import flash.display.SimpleButton;
	//import flash.events.MouseEvent;
	//import flash.events.Event;

	//import { MainManager } from "./com/google/*";
import { Split } from './Split';
import { TextFormat, TextField, TextFieldAutoSize } from '../../../flash/text/TextField';
import { Orientations, Const } from './Const';
import { Bitmap } from '../../../flash/display/Bitmap';
import { SimpleButton } from '../../../flash/display/SimpleButton';
import { AbstractLayer } from 'AbstractLayer';
import { ViewPoint } from './ViewPoint';
import { DateTimeLocale, DateTimeFormats } from '../i18n/locale/DateTimeLocale';
import { StockAssociatedObject } from './StockAssociatedObject';
import { MouseCursors } from './MouseCursor';
import { MainManager } from './MainManager';
import { Message } from './Messages';
import { Messages } from 'Messages';

export class SplitMovie extends Sprite {
		private static readonly SplitArrowClass = SplitMovie_SplitArrowClass;
		private static readonly SplitArrowSidewaysClass = SplitMovie_SplitArrowSidewaysClass;
		private static readonly SplitArrowSidewaysOverClass = SplitMovie_SplitArrowSidewaysOverClass;
		private static readonly SplitArrowOnOverClass = SplitMovie_SplitArrowOnOverClass;

		private associatedSplit: Split;
		private persistentHide: boolean;

		protected textFormat = new TextFormat("Verdana", 9, this.getTextColor(), true, false, false);
		protected arrowOrientation = Orientations.DOWN;
		protected arrow: Bitmap;
		protected readonly detailsTextField = new TextField();
		protected highlightCanvas: Sprite;
		protected text: TextField;
		protected textColor: number;
		protected arrowOnOver: Bitmap;
		protected previousText: string;
		protected currentVisibleButton: SimpleButton;
		protected sidewaysButton: SimpleButton;
		protected arrowSidewaysOver: Bitmap;
		protected supportingLayer: AbstractLayer<ViewPoint>;
		protected arrowSideways: Bitmap;
		protected readonly detailsTextFormat = new TextFormat("Arial", 11, 0, false, false, false);
		protected regularButton: SimpleButton;

		constructor() {
			super();
			this.initArrows();
			this.createButtons();
			this.currentVisibleButton = this.attachRegularArrow();
			this.regularButton.x = -this.regularButton.width / 2;
			this.detailsTextField.defaultTextFormat = this.detailsTextFormat;
			this.detailsTextField.autoSize = TextFieldAutoSize.LEFT;
			this.text = this.initTextField();
			this.addChild(this.text);
			this.attachArrowListeners();
			this.highlightCanvas = this;
		}

		protected getTextColor(): number {
			return 2210891;
		}

		showDetails() {
			this.hideText();
			this.highlightCanvas.addChild(this.detailsTextField);
			this.detailsTextField.x = this.x + this.currentVisibleButton.x;
			this.detailsTextField.y = this.y - this.currentVisibleButton.height;
			this.detailsTextField.text = this.getDetailedText();
			this.detailsTextField.appendText("\n" + this.getDateText());
			if (this.currentVisibleButton.scaleY === -1) {
				this.detailsTextField.y = this.y + this.currentVisibleButton.height - this.detailsTextField.height;
			} else {
				this.detailsTextField.y = this.y - this.currentVisibleButton.height - this.detailsTextField.height;
			}

			const left = this.detailsTextField.x - 2;
			const top = this.detailsTextField.y - 2;
			const right = this.detailsTextField.x + this.detailsTextField.width + 2;
			const bottom = this.detailsTextField.y + this.detailsTextField.height + 2;
			let leftMargin = -2;
			const minx = this.supportingLayer.viewPoint.minx;
			const maxx = this.supportingLayer.viewPoint.maxx;
			if (left < minx) {
				leftMargin = Number(minx - left - 2);
			} else if (right > maxx) {
				leftMargin = Number(maxx - right - 2);
								}

			this.detailsTextField.x += leftMargin;
			const graphics = this.highlightCanvas.graphics;
			graphics.lineStyle(0, this.textColor, 1);
			graphics.beginFill(0xffffff, 1);
			graphics.drawRect(
				left + leftMargin, top,
				right - left, bottom - top,
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

		getShortText(param1 = false): string {
			return this.associatedSplit.newShares + ":" + this.associatedSplit.oldShares;
		}

		setOrientation(orientation: Orientations) {
			this.checkArrowChange(orientation);
			if (this.currentVisibleButton) {
				switch (orientation) {
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

		getDateText(): string {
			const exchangeDateInUTC = this.associatedSplit.exchangeDateInUTC;
			if (Const.isZhLocale(DateTimeLocale.getLocale())) {
				return DateTimeLocale.standardFormatDateTime(DateTimeFormats.LONG_DATE_FORMAT, exchangeDateInUTC, true);
			}

			return DateTimeLocale.standardFormatDateTime(DateTimeFormats.MEDIUM_DATE_FORMAT, exchangeDateInUTC, true);
		}

		hideDetails() {
			this.showText();
			try {
				this.highlightCanvas.removeChild(this.detailsTextField);
			} catch (ae /*:ArgumentError*/) {
			}
			this.highlightCanvas.graphics.clear();
		}

		setSupportingLayer(abstractLayer: AbstractLayer<ViewPoint>) {
			this.supportingLayer = abstractLayer;
		}

		private initTextField(): TextField {
			const textField = new TextField();
			textField.autoSize = TextFieldAutoSize.CENTER;
			textField.x = 0;
			textField.selectable = false;
			textField.cacheAsBitmap = false;
			textField.defaultTextFormat = this.textFormat;
			return textField;
		}

		private positionRegularArrow() {
			this.currentVisibleButton.x = -this.currentVisibleButton.width / 2;
			this.text.x = -this.text.width / 2;
		}

		hideText() {
			try {
				this.removeChild(this.text);
				return;
			} catch (ae /*:ArgumentError*/) {
				return;
			}
		}

		private attachRegularArrow(): SimpleButton {
			if (this.currentVisibleButton) {
				this.removeChild(this.currentVisibleButton);
			}

			this.addChild(this.regularButton);
			return this.regularButton;
		}

		protected initArrows() {
			this.arrow = new SplitMovie.SplitArrowClass();
			this.arrowOnOver = new SplitMovie.SplitArrowOnOverClass();
			this.arrowSideways = new SplitMovie.SplitArrowSidewaysClass();
			this.arrowSidewaysOver = new SplitMovie.SplitArrowSidewaysOverClass();
		}

		setObject(stockAssociatedObject: StockAssociatedObject) {
			this.associatedSplit = stockAssociatedObject as Split;
			this.showText();
		}

		private attachSidewaysArrow(): SimpleButton {
			if (this.currentVisibleButton) {
				this.removeChild(this.currentVisibleButton);
			}
			this.addChild(this.sidewaysButton);
			return this.sidewaysButton;
		}

		showText(param1?: string) {
			if (this.persistentHide) {
				return;
			}

			this.addChild(this.text);
			param1 = param1 || this.getShortText();
			if (this.text.text !== param1) {
				this.text.text = param1;
			}
		}

		private attachArrowListeners() {
			this.currentVisibleButton.addEventListener(MouseEvents.MOUSE_OVER, (event: Event) => {
				MainManager.mouseCursor.setCursor(MouseCursors.CLASSIC);
				MainManager.mouseCursor.lockOnDisplayObject(this.currentVisibleButton);
				this.showDetails();
			});
			this.currentVisibleButton.addEventListener(MouseEvents.MOUSE_OUT, (event: Event) => {
				MainManager.mouseCursor.unlock();
				this.hideDetails();
			});
		}

		private createButtons() {
			this.regularButton = new SimpleButton("regularButton");
			this.regularButton.overState = this.arrowOnOver;
			this.regularButton.downState = this.arrowOnOver;
			this.regularButton.hitTestState = this.arrow;
			this.regularButton.upState = this.arrow;
			this.arrowOnOver.y = this.arrow.y + this.arrow.height - this.arrowOnOver.height;
			this.arrowOnOver.x = this.arrow.x;
			this.sidewaysButton = new SimpleButton("sidewaysButton");
			this.sidewaysButton.overState = this.arrowSidewaysOver;
			this.sidewaysButton.downState = this.arrowSidewaysOver;
			this.sidewaysButton.hitTestState = this.arrowSideways;
			this.sidewaysButton.upState = this.arrowSideways;
			this.arrowSidewaysOver.y = this.arrowSideways.y + this.arrowSideways.height - this.arrowSidewaysOver.height;
			this.arrowSidewaysOver.x = this.arrowSideways.x;
		}

		setHighlightCanvas(sprite: Sprite) {
			this.highlightCanvas = sprite;
		}

		private checkArrowChange(orientation: Orientations) {
			if ((this.arrowOrientation === Orientations.UP || this.arrowOrientation === Orientations.DOWN) && (orientation === Orientations.SIDEWAYS_UP || orientation === Orientations.SIDEWAYS_DOWN)) {
				this.currentVisibleButton = this.attachSidewaysArrow();
				this.positionSidewaysArrow();
			}
			if ((this.arrowOrientation === Orientations.SIDEWAYS_UP || this.arrowOrientation === Orientations.SIDEWAYS_DOWN) && (orientation === Orientations.UP || orientation === Orientations.DOWN)) {
				this.currentVisibleButton = this.attachRegularArrow();
				this.positionRegularArrow();
			}
			this.attachArrowListeners();
		}

		protected positionSidewaysArrow() {
			this.currentVisibleButton.x = -this.currentVisibleButton.width + 1;
			this.text.autoSize = TextFieldAutoSize.LEFT;
			this.text.x = -this.text.width + 1;
		}

		getDetailedText(): string {
			return Message.getMsg(Messages.SPLIT_TEXT, this.getShortText());
		}

		setPersistentHide(persistentHide: boolean) {
			this.persistentHide = persistentHide;
		}
	}
