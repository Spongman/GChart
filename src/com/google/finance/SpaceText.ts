import { Messages } from "Messages";
import { Sprite } from "../../../flash/display/Sprite";
import { Message } from './Messages';
import { TextFormat, TextField, TextFormatAlign, TextFieldAutoSize, TextFieldType } from '../../../flash/text/TextField';
import { Const } from './Const';
import { DateTextField } from './DateTextField';
import { DisplayManager } from './DisplayManager';
import { ViewPoint } from 'ViewPoint';
import { DateTimeLocale } from '../i18n/locale/DateTimeLocale';
import { Utils } from './Utils';
import { Stage } from '../../../flash/display/Stage';
import { DataUnit } from './DataUnit';
import { InfoDot } from './InfoDot';
import { IDataUnitContainer } from './ViewPoint';
import { Dictionary } from '../../../Global';
import { DataSource } from './DataSource';

	// import flash.display.Sprite;
	// import com.google.i18n.locale.DateTimeLocale;
	// import flash.text.TextField;
	// import flash.text.TextFieldAutoSize;
	// import flash.text.TextFormat;
	// import flash.events.MouseEvent;
	// import flash.events.KeyboardEvent;
	// import flash.text.TextFieldType;
	// import flash.text.TextFormatAlign;

export class SpaceText extends Sprite {
		static readonly OHLC_INFO_FLAG_STR = "ohlcInfo";
		static readonly POINT_STR = "point";
		static readonly PRICE_TEXT = " " + Message.getMsg(Messages.PRICE) + ": ";
		static readonly OPEN_TEXT = " " + Message.getMsg(Messages.OPEN) + ": ";
		static readonly SETTER_STR = "setter";
		static readonly LOW_TEXT = " " + Message.getMsg(Messages.LOW) + ": ";
		static readonly VOL_TEXT = " " + Message.getMsg(Messages.VOLUME_SHORT) + ": ";
		static readonly OHLC_BASE_PRICE_STR = "basePrice";
		static readonly VOLUME_STR = "volume";
		static readonly HIGH_TEXT = " " + Message.getMsg(Messages.HIGH) + ": ";
		static readonly CLOSE_TEXT = " " + Message.getMsg(Messages.CLOSE) + ": ";
		static readonly POINTS_STR = "points";
		static readonly EXTRA_TEXT_STR = "extraText";

		private static readonly DISPLAY_DATES = 0;
		private static readonly INFO_DOT_PADDING = 7;
		private static readonly TEXT_HEIGHT = 15;
		private static readonly RIGHT_PADDING = 5;
		private static readonly EDIT_DATES = 1;
		private static readonly LEFT_PADDING = 5;

		private returnText = "";
		private dateEntryState: number;
		private readonly negativeTextFormat = new TextFormat("Verdana", 9, Const.NEGATIVE_DIFFERENCE_COLOR);
		private infoDots: InfoDot[] = [];
		private datesTextFormats: Array<{ start: number, end: number, format: TextFormat }> = [];
		private readonly grayText = new TextFormat("Verdana", 9, 0x777777);
		private bg = new Sprite("bg");
		private readonly blackText = new TextFormat("Verdana", 9, 0);
		private datesText = "";
		private readonly positiveTextFormat = new TextFormat("Verdana", 9, Const.POSITIVE_DIFFERENCE_COLOR);
		private infoText: TextField;
		private changeText: TextField;

		endDate: DateTextField;
		startDate: DateTextField;

		constructor(private readonly displayManager: DisplayManager) {
			super();

			this.bg.graphics.beginFill(0xffffff, 1);
			this.bg.graphics.drawRect(0, 0, Const.MOVIE_WIDTH, Const.SPACE_HEIGHT + Const.INFO_TEXT_TOP_PADDING);
			this.bg.graphics.endFill();
			this.addChild(this.bg);

			this.blackText.align = TextFormatAlign.RIGHT;
			this.negativeTextFormat.align = TextFormatAlign.RIGHT;
			this.positiveTextFormat.align = TextFormatAlign.RIGHT;
			this.grayText.align = TextFormatAlign.RIGHT;
			const _loc2_ = Const.MOVIE_WIDTH - SpaceText.RIGHT_PADDING;
			const _loc3_ = Const.SPACE_HEIGHT / 2 - SpaceText.TEXT_HEIGHT / 2 + Const.INFO_TEXT_TOP_PADDING;
			this.infoText = this.newTextField(_loc2_, _loc3_);
			this.addChild(this.infoText);
			this.changeText = this.newTextField(_loc2_, _loc3_);
			this.addChild(this.changeText);
			this.startDate = this.newDateTextField(_loc2_, _loc3_, 0);
			this.addChild(this.startDate);
			this.registerDateTextFieldListeners(this.startDate);
			this.endDate = this.newDateTextField(_loc2_, _loc3_, 1);
			this.addChild(this.endDate);
			this.registerDateTextFieldListeners(this.endDate);
			this.setDateEntryState(SpaceText.DISPLAY_DATES);
		}

		setReturnInfo(viewPoint: ViewPoint) {
			const lastNotVisibleDataUnit = viewPoint.getLastNotVisibleDataUnit();
			const lastDataUnit = viewPoint.getLastDataUnit();
			const baseDataSource = viewPoint.getBaseDataSource();
			this.clearComparisonInfo();
			this.returnText = this.getReturnText(lastNotVisibleDataUnit, lastDataUnit, baseDataSource);
			this.updateInfoText();
		}

		setSize(width: number, height: number) {
			this.updateAlignAndPadding();
			this.positionInfoText();
			this.positionComparisonInfoDots();
			this.bg.width = width;
			this.bg.height = height + Const.INFO_TEXT_TOP_PADDING;
		}

		private getHumanReadableVolume(value: number): string {
			let text = "";
			let scale = 1000;
			if (Const.isZhLocale(DateTimeLocale.getLocale())) {
				scale = 10000;
			}

			if (value > 3 * scale * scale) {
				text += Utils.numberToString(value / (scale * scale), 2, 5);
				switch (scale) {
					case 1000:
						text += Message.getMsg(Messages.MILLION_ONE_LETTER);
						break;
					case 10000:
						text += Message.getMsg(Messages.HUNDRED_MILLION_ONE_LETTER);
						break;
				}
			} else if (value > scale) {
				text += Utils.numberToString(value / scale, 2, 5);
				switch (scale) {
					case 1000:
						text += Message.getMsg(Messages.THOUSAND_ONE_LETTER);
						break;
					case 10000:
						text += Message.getMsg(Messages.TEN_THOUSAND_ONE_LETTER);
						break;
				}
			} else {
				text += value;
			}
			return text;
		}

		private setDateEntryState(dateEntryState: number) {
			this.dateEntryState = dateEntryState;
			const highlighted = this.dateEntryState === SpaceText.EDIT_DATES;
			this.startDate.setHighlighted(highlighted);
			this.endDate.setHighlighted(highlighted);
		}

		private clearComparisonInfo() {
			for (const infoDot of this.infoDots) {
				this.removeChild(infoDot);
			}

			this.infoDots.splice(0);
		}

		private newTextField(x: number, y: number): TextField {
			const textField = new TextField();
			textField.defaultTextFormat = this.blackText;
			textField.selectable = false;
			textField.autoSize = TextFieldAutoSize.LEFT;
			textField.x = x;
			textField.y = y;
			return textField;
		}

		private appendOhlcText(param1: string, param2: number, param3: number) {
			this.datesText += param1;
			const _loc4_ = this.normalizePrice(param2);
			if (param3 !== -1) {
				if (param2 > param3) {
					this.datesTextFormats.push({
						start: this.datesText.length,
						end: this.datesText.length + _loc4_.length,
						format: this.positiveTextFormat,
					});
				} else if (param2 < param3) {
					this.datesTextFormats.push({
						start: this.datesText.length,
						end: this.datesText.length + _loc4_.length,
						format: this.negativeTextFormat,
					});
				}
			}
			this.datesText += _loc4_;
		}

		setPointInfo(pointInfo: Dictionary) {
			if (pointInfo[SpaceText.POINT_STR] !== undefined) {
				this.setSinglePointInfo(pointInfo);
			} else if (pointInfo[SpaceText.POINTS_STR] !== undefined) {
				this.setComparisonInfo(pointInfo);
								}
		}

		private updateAlignAndPadding() {
			const buttonsWidth = this.displayManager.mainController.getButtonsWidth();
			let _loc2_ = 0;
			_loc2_ = Number(_loc2_ + (this.startDate.visible ? this.startDate.width + 3 : 0));
			_loc2_ = Number(_loc2_ + (this.endDate.visible ? this.endDate.width + 3 : 0));
			_loc2_ = Number(_loc2_ + (this.infoText.width + 2));
			_loc2_ = Number(_loc2_ + (this.changeText.visible ? this.changeText.width : 0));
			if (Const.INDICATOR_ENABLED) {
				_loc2_ = Number(_loc2_ + 160);
			}

			if (Const.EXPAND_BUTTON_ENABLED || Const.SHRINK_BUTTON_ENABLED || _loc2_ + buttonsWidth > Const.MOVIE_WIDTH) {
				Const.INFO_TEXT_ALIGN = "left";
				Const.INFO_TEXT_TOP_PADDING = 17;
			} else {
				Const.INFO_TEXT_ALIGN = "right";
				Const.INFO_TEXT_TOP_PADDING = 0;
			}
		}

		private processChangedDateFields() {
			this.setDateEntryState(SpaceText.DISPLAY_DATES);
			if (this.startDate.parseUtcDate() && this.endDate.parseUtcDate() &&
				this.startDate.parsedDate && this.endDate.parsedDate) {
				this.endDate.parsedDate.setUTCHours(23, 59, 0, 0);
				if (this.needToAnimate()) {
					this.displayManager.mainController.animateToCustomLevel(this.startDate.parsedDate, this.endDate.parsedDate);
				}
			}
			this.updateInfoText();
		}

		private setSinglePointInfo(state: Dictionary) {
			const unit = state[SpaceText.POINT_STR];
			switch (state["extraText"]) {
				case Const.PRE_MARKET_DISPLAY_NAME:
					this.datesText = Message.getMsg(Messages.PREMARKET) + ": ";
					break;
				case Const.AFTER_HOURS_DISPLAY_NAME:
					this.datesText = Message.getMsg(Messages.AFTER_HOURS) + ": ";
					break;
				default:
					this.datesText = "";
					break;
			}
			this.datesTextFormats = [];
			const singlePointDateFormat = this.getSinglePointDateFormat(unit);
			const exchangeDateInUTC = unit.exchangeDateInUTC;
			this.datesText += DateTimeLocale.formatDateTime(singlePointDateFormat, exchangeDateInUTC, true);
			if (state[SpaceText.OHLC_INFO_FLAG_STR]) {
				this.appendOhlcText(SpaceText.OPEN_TEXT, unit.open, state[SpaceText.OHLC_BASE_PRICE_STR]);
				this.appendOhlcText(SpaceText.HIGH_TEXT, unit.high, state[SpaceText.OHLC_BASE_PRICE_STR]);
				this.appendOhlcText(SpaceText.LOW_TEXT, unit.low, state[SpaceText.OHLC_BASE_PRICE_STR]);
				this.appendOhlcText(SpaceText.CLOSE_TEXT, unit.close, state[SpaceText.OHLC_BASE_PRICE_STR]);
			} else {
				this.datesText += SpaceText.PRICE_TEXT;
				if (state[SpaceText.SETTER_STR] && state[SpaceText.SETTER_STR].dataSource && state[SpaceText.SETTER_STR].dataSource.tickerName && state[SpaceText.SETTER_STR].dataSource.tickerName.indexOf("CURRENCY:") === 0) {
					this.datesText += Math.round(unit.close * 10000) / 10000;
				} else {
					this.datesText += this.normalizePrice(unit.close);
				}
			}
			if (!isNaN(state[SpaceText.VOLUME_STR])) {
				this.datesText += " " + Message.getMsg(Messages.VOLUME_SHORT) + ": ";
				this.datesText += this.getHumanReadableVolume(state["volume"]);
			}
			this.returnText = "";
			this.updateInfoText();
		}

		private onMouseRollOverInfoText(mouseEvent: MouseEvent) {
			this.startDate.setHighlighted(true);
			this.endDate.setHighlighted(true);
		}

		normalizePrice(param1: number): string {
			if (Math.round(param1 * 1000) % 10 === 0) {
				return param1.toFixed(2);
			}

			return param1.toFixed(3);
		}

		private onKeyDown(keyboardEvent: KeyboardEvent) {
			switch (keyboardEvent.charCode) {
				case 27:
					this.resetInfoText();
					break;
				case 13:
					this.processChangedDateFields();
					break;
			}
		}

		private registerDateTextFieldListeners(dateTextField: DateTextField) {
			if (Const.ENABLE_CUSTOM_DATE_ENTRY !== "true") {
				return;
			}

			dateTextField.addEventListener(MouseEvents.ROLL_OVER, Stage.bind(this.onMouseRollOverInfoText, this));
			dateTextField.addEventListener(MouseEvents.ROLL_OUT, Stage.bind(this.onMouseRollOutInfoText, this));
			dateTextField.addEventListener(MouseEvents.CLICK, Stage.bind(this.onMouseClickDateField, this));
			dateTextField.addEventListener(KeyboardEvents.KEY_DOWN, Stage.bind(this.onKeyDown, this));
		}

		private positionInfoText(param1 = true) {
			const _loc2_ = this.startDate.visible ? Number(this.startDate.width + 3) : 0;
			const _loc3_ = this.endDate.visible ? Number(this.endDate.width + 3) : 0;
			const _loc4_ = this.infoText.width + 2;
			switch (Const.INFO_TEXT_ALIGN) {
				case "left":
					this.startDate.x = SpaceText.LEFT_PADDING;
					this.infoText.x = this.startDate.x + _loc2_;
					this.endDate.x = this.infoText.x + _loc4_;
					this.changeText.x = this.endDate.x + _loc3_;
					break;
				case "right":
					this.changeText.x = Const.MOVIE_WIDTH - this.changeText.width - SpaceText.RIGHT_PADDING;
					this.endDate.x = this.changeText.x - _loc3_;
					this.infoText.x = this.endDate.x - _loc4_;
					this.startDate.x = this.infoText.x - _loc2_;
					break;
			}
			if (param1) {
				const _loc5_ = Const.SPACE_HEIGHT / 2 - SpaceText.TEXT_HEIGHT / 2 + Const.INFO_TEXT_TOP_PADDING;
				this.infoText.y = _loc5_;
				this.changeText.y = _loc5_;
				this.startDate.y = _loc5_;
				this.endDate.y = _loc5_;
			}
		}

		private onMouseRollOutInfoText(mouseEvent: MouseEvent) {
			if (this.dateEntryState === SpaceText.EDIT_DATES) {
				return;
			}

			this.startDate.setHighlighted(false);
			this.endDate.setHighlighted(false);
		}

		private positionComparisonInfoDots() {
			let _loc1_ = NaN;
			if (Const.INFO_TEXT_ALIGN === "right") {
				_loc1_ = this.stage.stageWidth;
			} else if (Const.INFO_TEXT_ALIGN === "left") {
				_loc1_ = SpaceText.LEFT_PADDING + SpaceText.INFO_DOT_PADDING;
								}

			for (const infoDot of this.infoDots) {
				infoDot.y = Const.SPACE_HEIGHT - SpaceText.TEXT_HEIGHT / 2 + 3 + Const.INFO_TEXT_TOP_PADDING;
				if (Const.INFO_TEXT_ALIGN === "right") {
					infoDot.x = _loc1_ - infoDot.width;
					_loc1_ -= infoDot.width - 3;
				} else if (Const.INFO_TEXT_ALIGN === "left") {
					infoDot.x = _loc1_;
					_loc1_ += infoDot.width + 3;
				}
			}
		}

		private getSinglePointDateFormat(dataUnit: DataUnit): string {
			let _loc2_ = "MMM dd, yyyy";
			if (Const.isZhLocale(DateTimeLocale.getLocale())) {
				_loc2_ = "yyyy年M月d日";
			}

			if (dataUnit.dayMinute !== Const.MARKET_CLOSE_MINUTE) {
				_loc2_ += " HH:mm";
			}

			return _loc2_;
		}

		private updateInfoText() {
			if (this.dateEntryState === SpaceText.EDIT_DATES) {
				return;
			}

			if (this.datesText === "") {
				if (!this.startDate.date || !this.endDate.date) {
					return;
				}

				this.infoText.text = "-";
				this.startDate.visible = true;
				this.endDate.visible = true;
				this.startDate.displayDateInLocalizedFormat();
				this.endDate.displayDateInLocalizedFormat();
				if (this.returnText.length > 0) {
					let _loc1_ = this.negativeTextFormat;
					if (this.returnText.indexOf("+") !== -1) {
						_loc1_ = this.positiveTextFormat;
					}

					if (this.changeText.getTextFormat() !== _loc1_) {
						this.changeText.defaultTextFormat = _loc1_;
					}
				}
				this.changeText.text = this.returnText;
			} else {
				this.infoText.text = this.datesText;
				for (const textFormat of this.datesTextFormats) {
					this.infoText.setTextFormat(textFormat.format, textFormat.start, textFormat.end);
				}

				this.changeText.text = "";
				this.startDate.visible = false;
				this.endDate.visible = false;
			}
			this.positionInfoText(false);
		}

		isDateFieldClicked(mouseEvent: MouseEvent): boolean {
			return mouseEvent.target === this.startDate.element || mouseEvent.target === this.endDate.element;
		}

		private setComparisonInfo(state: Dictionary) {
			const infos = state[SpaceText.POINTS_STR];
			this.returnText = "";
			this.updateInfoText();
			this.clearComparisonInfo();
			for (let infoIndex = infos.length - 1; infoIndex >= 0; infoIndex--) {
				const infoDot = new InfoDot();
				this.addChild(infoDot);
				infoDot.setInfo(infos[infoIndex]);
				this.infoDots.push(infoDot);
			}
			this.positionComparisonInfoDots();
		}

		private onMouseClickDateField(mouseEvent: MouseEvent) {
			if (this.dateEntryState === SpaceText.EDIT_DATES) {
				return;
			}
			this.setDateEntryState(SpaceText.EDIT_DATES);
			this.startDate.type = TextFieldType.INPUT;
			this.startDate.displayDateInParseableFormat();
			this.endDate.type = TextFieldType.INPUT;
			this.endDate.displayDateInParseableFormat();
			// param1.target.setSelection(0, 10);	// TODO
			(mouseEvent.target as HTMLInputElement).setSelectionRange(0, 10);
			this.positionInfoText();
		}

		setContextualStaticInfo(state: Dictionary) {
			if (!state[SpaceText.SETTER_STR]) {
				return;
			}

			if (state[SpaceText.POINTS_STR]) {
				this.returnText = "";
				this.setTimePeriod(state[SpaceText.SETTER_STR].viewPoint);
				this.setComparisonInfo(state);
			} else {
				this.setTimePeriod(state[SpaceText.SETTER_STR].viewPoint);
				this.setReturnInfo(state[SpaceText.SETTER_STR].viewPoint);
			}
		}

		needToAnimate(): boolean {
			if (!this.endDate.parsedDate) {
				return false;
			}
			// TODO: !this.startDate.parsedDate ?
			return (Utils.compareUtcDates(this.endDate.date, this.endDate.parsedDate) !== 0 || Utils.compareUtcDates(this.startDate.date, notnull(this.startDate.parsedDate)) !== 0) && Utils.compareUtcDates(notnull(this.startDate.parsedDate), this.endDate.parsedDate) <= 0;
		}

		resetInfoText() {
			if (this.dateEntryState === SpaceText.DISPLAY_DATES) {
				return;
			}

			this.setDateEntryState(SpaceText.DISPLAY_DATES);
			this.updateInfoText();
		}

		private getReturnText(unit1: DataUnit | null, unit2: DataUnit | null, unit3: DataSource | null): string {
			if (!unit1 || !unit2) {
				return "";
			}

			let text = "";
			let rise = unit2.close - unit1.close;
			const _loc6_ = Math.round(rise / unit1.close * 10000) / 100;
			if (rise > 0) {
				text += "+";
			}

			if (unit3 && unit3.tickerName && unit3.tickerName.indexOf("CURRENCY:") === 0) {
				rise = Math.round(rise * 100000) / 100000;
			} else {
				rise = Math.round(rise * 100) / 100;
			}

			text += rise + " (" + _loc6_ + "%)";
			return text;
		}

		setTimePeriod(dataUnitContainer: IDataUnitContainer) {
			let firstDataUnit = dataUnitContainer.getFirstDataUnit();
			let lastDataUnit = dataUnitContainer.getLastDataUnit();
			if (!firstDataUnit || !lastDataUnit) {
				return;
			}

			if (lastDataUnit.time < firstDataUnit.time) {
				const tmp = lastDataUnit;
				lastDataUnit = firstDataUnit;
				firstDataUnit = tmp;
			}
			this.datesText = "";
			this.datesTextFormats = [];
			this.startDate.date = firstDataUnit.exchangeDateInUTC;
			this.endDate.date = lastDataUnit.exchangeDateInUTC;
			this.updateInfoText();
		}

		private newDateTextField(x: number, y: number, tabIndex: number): DateTextField {
			const dateTextField = new DateTextField();
			dateTextField.autoSize = TextFieldAutoSize.LEFT;
			dateTextField.backgroundColor = Const.DATE_HIGHLIGHTED_BACKGROUND_COLOR;
			dateTextField.border = Boolean(Const.ENABLE_CUSTOM_DATE_ENTRY);
			dateTextField.defaultTextFormat = this.blackText;
			dateTextField.focusRect = dateTextField;
			dateTextField.mouseEnabled = Boolean(Const.ENABLE_CUSTOM_DATE_ENTRY);
			dateTextField.selectable = Boolean(Const.ENABLE_CUSTOM_DATE_ENTRY);
			dateTextField.tabEnabled = Boolean(Const.ENABLE_CUSTOM_DATE_ENTRY);
			dateTextField.tabIndex = tabIndex;
			dateTextField.x = x;
			dateTextField.y = y;
			return dateTextField;
		}
	}
