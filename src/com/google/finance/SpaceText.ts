/// <reference path="Messages.ts" />
/// <reference path="../../../flash/display/Sprite.ts" />

namespace com.google.finance
{
	// import flash.display.Sprite;
	// import com.google.i18n.locale.DateTimeLocale;
	// import flash.text.TextField;
	// import flash.text.TextFieldAutoSize;
	// import flash.text.TextFormat;
	// import flash.events.MouseEvent;
	// import flash.events.KeyboardEvent;
	// import flash.text.TextFieldType;
	// import flash.text.TextFormatAlign;

	export class SpaceText extends flash.display.Sprite
	{
		static readonly OHLC_INFO_FLAG_STR = "ohlcInfo";
		static readonly POINT_STR = "point";
		static readonly PRICE_TEXT = " " + Messages.getMsg(Messages.PRICE) + ": ";
		static readonly OPEN_TEXT = " " + Messages.getMsg(Messages.OPEN) + ": ";
		static readonly SETTER_STR = "setter";
		static readonly LOW_TEXT = " " + Messages.getMsg(Messages.LOW) + ": ";
		static readonly VOL_TEXT = " " + Messages.getMsg(Messages.VOLUME_SHORT) + ": ";
		static readonly OHLC_BASE_PRICE_STR = "basePrice";
		static readonly VOLUME_STR = "volume";
		static readonly HIGH_TEXT = " " + Messages.getMsg(Messages.HIGH) + ": ";
		static readonly CLOSE_TEXT = " " + Messages.getMsg(Messages.CLOSE) + ": ";
		static readonly POINTS_STR = "points";
		static readonly EXTRA_TEXT_STR = "extraText";
		
		private static readonly DISPLAY_DATES = 0;
		private static readonly INFO_DOT_PADDING = 7;
		private static readonly TEXT_HEIGHT = 15;
		private static readonly RIGHT_PADDING = 5;
		private static readonly EDIT_DATES = 1;
		private static readonly LEFT_PADDING = 5;

		private returnText = "";
		private displayManager: com.google.finance.DisplayManager;
		private dateEntryState: number;
		private readonly negativeTextFormat = new flash.text.TextFormat("Verdana", 9, Const.NEGATIVE_DIFFERENCE_COLOR);
		private infoDots: InfoDot[] = [];
		private datesTextFormats: { start: number, end: number, format: flash.text.TextFormat }[] = [];
		private readonly grayText = new flash.text.TextFormat("Verdana", 9, 0x777777);
		private bg = new flash.display.Sprite("bg");
		private readonly blackText = new flash.text.TextFormat("Verdana", 9, 0);
		private datesText = "";
		private readonly positiveTextFormat = new flash.text.TextFormat("Verdana", 9, Const.POSITIVE_DIFFERENCE_COLOR);
		private infoText: flash.text.TextField;
		private changeText: flash.text.TextField;

		endDate: com.google.finance.DateTextField;
		startDate: com.google.finance.DateTextField;


		constructor(param1: com.google.finance.DisplayManager)
		{
			super();
			this.displayManager = param1;

			this.bg.graphics.beginFill(0xffffff, 1);
			this.bg.graphics.drawRect(0, 0, Const.MOVIE_WIDTH, Const.SPACE_HEIGHT + Const.INFO_TEXT_TOP_PADDING);
			this.bg.graphics.endFill();
			this.addChild(this.bg);

			this.blackText.align = flash.text.TextFormatAlign.RIGHT;
			this.negativeTextFormat.align = flash.text.TextFormatAlign.RIGHT;
			this.positiveTextFormat.align = flash.text.TextFormatAlign.RIGHT;
			this.grayText.align = flash.text.TextFormatAlign.RIGHT;
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

		setReturnInfo(param1: ViewPoint) 
		{
			const _loc2_ = param1.getLastNotVisibleDataUnit();
			const _loc3_ = param1.getLastDataUnit();
			const _loc4_ = param1.getBaseDataSource();
			this.clearComparisonInfo();
			this.returnText = this.getReturnText(_loc2_, _loc3_, _loc4_);
			this.updateInfoText();
		}

		setSize(param1: number, param2: number) 
		{
			this.updateAlignAndPadding();
			this.positionInfoText();
			this.positionComparisonInfoDots();
			this.bg.width = param1;
			this.bg.height = param2 + Const.INFO_TEXT_TOP_PADDING;
		}

		private getHumanReadableVolume(param1: number): string
		{
			let _loc2_ = "";
			let _loc3_ = 1000;
			if (Const.isZhLocale(com.google.i18n.locale.DateTimeLocale.getLocale()))
				_loc3_ = 10000;

			if (param1 > 3 * _loc3_ * _loc3_)
			{
				_loc2_ = _loc2_ + Utils.numberToString(param1 / (_loc3_ * _loc3_), 2, 5);
				switch (_loc3_)
				{
					case 1000:
						_loc2_ = _loc2_ + Messages.getMsg(Messages.MILLION_ONE_LETTER);
						break;
					case 10000:
						_loc2_ = _loc2_ + Messages.getMsg(Messages.HUNDRED_MILLION_ONE_LETTER);
						break;
				}
			}
			else if (param1 > _loc3_)
			{
				_loc2_ = _loc2_ + Utils.numberToString(param1 / _loc3_, 2, 5);
				switch (_loc3_)
				{
					case 1000:
						_loc2_ = _loc2_ + Messages.getMsg(Messages.THOUSAND_ONE_LETTER);
						break;
					case 10000:
						_loc2_ = _loc2_ + Messages.getMsg(Messages.TEN_THOUSAND_ONE_LETTER);
						break;
				}
			}
			else
			{
				_loc2_ = _loc2_ + param1;
			}
			return _loc2_;
		}

		private setDateEntryState(param1: number) 
		{
			this.dateEntryState = param1;
			const _loc2_ = this.dateEntryState === SpaceText.EDIT_DATES;
			this.startDate.setHighlighted(_loc2_);
			this.endDate.setHighlighted(_loc2_);
		}

		private clearComparisonInfo() 
		{
			for (let _loc1_ = 0; _loc1_ < this.infoDots.length; _loc1_++)
			{
				const _loc2_ = this.infoDots[_loc1_];
				this.removeChild(_loc2_);
			}
			this.infoDots.splice(0);
		}

		private newTextField(param1: number, param2: number): flash.text.TextField
		{
			const _loc3_ = new flash.text.TextField();
			_loc3_.defaultTextFormat = this.blackText;
			_loc3_.selectable = false;
			_loc3_.autoSize = flash.text.TextFieldAutoSize.LEFT;
			_loc3_.x = param1;
			_loc3_.y = param2;
			return _loc3_;
		}

		private appendOhlcText(param1: string, param2: number, param3: number) 
		{
			this.datesText = this.datesText + param1;
			const _loc4_ = this.normalizePrice(param2);
			if (param3 !== -1)
			{
				if (param2 > param3)
				{
					this.datesTextFormats.push({
						"start": this.datesText.length,
						"end": this.datesText.length + _loc4_.length,
						"format": this.positiveTextFormat
					});
				}
				else if (param2 < param3)
				{
					this.datesTextFormats.push({
						"start": this.datesText.length,
						"end": this.datesText.length + _loc4_.length,
						"format": this.negativeTextFormat
					});
				}
			}
			this.datesText = this.datesText + _loc4_;
		}

		setPointInfo(param1: { [key: string]: any }) 
		{
			if (param1[SpaceText.POINT_STR] !== undefined)
				this.setSinglePointInfo(param1);
			else if (param1[SpaceText.POINTS_STR] !== undefined)
				this.setComparisonInfo(param1);
		}

		private updateAlignAndPadding() 
		{
			const _loc1_ = this.displayManager.mainController.getButtonsWidth();
			let _loc2_ = 0;
			_loc2_ = Number(_loc2_ + (!!this.startDate.visible ? this.startDate.width + 3 : 0));
			_loc2_ = Number(_loc2_ + (!!this.endDate.visible ? this.endDate.width + 3 : 0));
			_loc2_ = Number(_loc2_ + (this.infoText.width + 2));
			_loc2_ = Number(_loc2_ + (!!this.changeText.visible ? this.changeText.width : 0));
			if (Const.INDICATOR_ENABLED)
				_loc2_ = Number(_loc2_ + 160);

			if (Const.EXPAND_BUTTON_ENABLED || Const.SHRINK_BUTTON_ENABLED || _loc2_ + _loc1_ > Const.MOVIE_WIDTH)
			{
				Const.INFO_TEXT_ALIGN = "left";
				Const.INFO_TEXT_TOP_PADDING = 17;
			}
			else
			{
				Const.INFO_TEXT_ALIGN = "right";
				Const.INFO_TEXT_TOP_PADDING = 0;
			}
		}

		private processChangedDateFields() 
		{
			this.setDateEntryState(SpaceText.DISPLAY_DATES);
			if (this.startDate.parseUtcDate() && this.endDate.parseUtcDate() &&
				this.startDate.parsedDate && this.endDate.parsedDate)
			{
				this.endDate.parsedDate.setUTCHours(23, 59, 0, 0);
				if (this.needToAnimate())
					this.displayManager.mainController.animateToCustomLevel(this.startDate.parsedDate, this.endDate.parsedDate);
			}
			this.updateInfoText();
		}

		private setSinglePointInfo(param1: { [key: string]: any }) 
		{
			const _loc2_ = param1[SpaceText.POINT_STR];
			switch (param1["extraText"])
			{
				case Const.PRE_MARKET_DISPLAY_NAME:
					this.datesText = Messages.getMsg(Messages.PREMARKET) + ": ";
					break;
				case Const.AFTER_HOURS_DISPLAY_NAME:
					this.datesText = Messages.getMsg(Messages.AFTER_HOURS) + ": ";
					break;
				default:
					this.datesText = "";
					break;
			}
			this.datesTextFormats = [];
			const _loc4_ = this.getSinglePointDateFormat(_loc2_);
			const _loc5_ = _loc2_.exchangeDateInUTC;
			this.datesText = this.datesText + com.google.i18n.locale.DateTimeLocale.formatDateTime(_loc4_, _loc5_, true);
			if (param1[SpaceText.OHLC_INFO_FLAG_STR])
			{
				this.appendOhlcText(SpaceText.OPEN_TEXT, _loc2_.open, param1[SpaceText.OHLC_BASE_PRICE_STR]);
				this.appendOhlcText(SpaceText.HIGH_TEXT, _loc2_.high, param1[SpaceText.OHLC_BASE_PRICE_STR]);
				this.appendOhlcText(SpaceText.LOW_TEXT, _loc2_.low, param1[SpaceText.OHLC_BASE_PRICE_STR]);
				this.appendOhlcText(SpaceText.CLOSE_TEXT, _loc2_.close, param1[SpaceText.OHLC_BASE_PRICE_STR]);
			}
			else
			{
				this.datesText = this.datesText + SpaceText.PRICE_TEXT;
				if (param1[SpaceText.SETTER_STR] && param1[SpaceText.SETTER_STR].dataSource && param1[SpaceText.SETTER_STR].dataSource.tickerName && param1[SpaceText.SETTER_STR].dataSource.tickerName.indexOf("CURRENCY:") === 0)
					this.datesText = this.datesText + Math.round(_loc2_.close * 10000) / 10000;
				else
					this.datesText = this.datesText + this.normalizePrice(_loc2_.close);
			}
			if (!isNaN(param1[SpaceText.VOLUME_STR]))
			{
				this.datesText = this.datesText + (" " + Messages.getMsg(Messages.VOLUME_SHORT) + ": ");
				this.datesText = this.datesText + this.getHumanReadableVolume(param1["volume"]);
			}
			this.returnText = "";
			this.updateInfoText();
		}

		private onMouseRollOverInfoText(param1: MouseEvent) 
		{
			this.startDate.setHighlighted(true);
			this.endDate.setHighlighted(true);
		}

		normalizePrice(param1: number): string
		{
			if (Math.round(param1 * 1000) % 10 === 0)
				return param1.toFixed(2);

			return param1.toFixed(3);
		}

		private onKeyDown(param1: KeyboardEvent) 
		{
			switch (param1.charCode)
			{
				case 27:
					this.resetInfoText();
					break;
				case 13:
					this.processChangedDateFields();
					break;
			}
		}

		private registerDateTextFieldListeners(param1: com.google.finance.DateTextField) 
		{
			if (Const.ENABLE_CUSTOM_DATE_ENTRY !== "true")
				return;

			param1.addEventListener(MouseEvents.ROLL_OVER, flash.display.Stage.bind(this.onMouseRollOverInfoText, this));
			param1.addEventListener(MouseEvents.ROLL_OUT, flash.display.Stage.bind(this.onMouseRollOutInfoText, this));
			param1.addEventListener(MouseEvents.CLICK, flash.display.Stage.bind(this.onMouseClickDateField, this));
			param1.addEventListener(KeyboardEvents.KEY_DOWN, flash.display.Stage.bind(this.onKeyDown, this));
		}

		private positionInfoText(param1 = true) 
		{
			const _loc2_ = !!this.startDate.visible ? Number(this.startDate.width + 3) : 0;
			const _loc3_ = !!this.endDate.visible ? Number(this.endDate.width + 3) : 0;
			const _loc4_ = this.infoText.width + 2;
			switch (Const.INFO_TEXT_ALIGN)
			{
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
			if (param1)
			{
				const _loc5_ = Const.SPACE_HEIGHT / 2 - SpaceText.TEXT_HEIGHT / 2 + Const.INFO_TEXT_TOP_PADDING;
				this.infoText.y = _loc5_;
				this.changeText.y = _loc5_;
				this.startDate.y = _loc5_;
				this.endDate.y = _loc5_;
			}
		}

		private onMouseRollOutInfoText(param1: MouseEvent) 
		{
			if (this.dateEntryState === SpaceText.EDIT_DATES)
				return;

			this.startDate.setHighlighted(false);
			this.endDate.setHighlighted(false);
		}

		private positionComparisonInfoDots() 
		{
			let _loc1_ = NaN;
			if (Const.INFO_TEXT_ALIGN === "right")
				_loc1_ = this.stage.stageWidth;
			else if (Const.INFO_TEXT_ALIGN === "left")
				_loc1_ = SpaceText.LEFT_PADDING + SpaceText.INFO_DOT_PADDING;

			for (let _loc2_ = 0; _loc2_ < this.infoDots.length; _loc2_++)
			{
				const _loc3_ = this.infoDots[_loc2_];
				_loc3_.y = Const.SPACE_HEIGHT - SpaceText.TEXT_HEIGHT / 2 + 3 + Const.INFO_TEXT_TOP_PADDING;
				if (Const.INFO_TEXT_ALIGN === "right")
				{
					_loc3_.x = _loc1_ - _loc3_.width;
					_loc1_ = _loc1_ - _loc3_.width - 3;
				}
				else if (Const.INFO_TEXT_ALIGN === "left")
				{
					_loc3_.x = _loc1_;
					_loc1_ = _loc1_ + _loc3_.width + 3;
				}
			}
		}

		private getSinglePointDateFormat(param1: DataUnit): string
		{
			let _loc2_ = "MMM dd, yyyy";
			if (Const.isZhLocale(com.google.i18n.locale.DateTimeLocale.getLocale()))
				_loc2_ = "yyyy年M月d日";

			if (param1.dayMinute !== Const.MARKET_CLOSE_MINUTE)
				_loc2_ = _loc2_ + " HH:mm";

			return _loc2_;
		}

		private updateInfoText() 
		{
			if (this.dateEntryState === SpaceText.EDIT_DATES)
				return;

			if (this.datesText === "")
			{
				if (!this.startDate.date || !this.endDate.date)
					return;

				this.infoText.text = "-";
				this.startDate.visible = true;
				this.endDate.visible = true;
				this.startDate.displayDateInLocalizedFormat();
				this.endDate.displayDateInLocalizedFormat();
				if (this.returnText.length > 0)
				{
					let _loc1_ = this.negativeTextFormat;
					if (this.returnText.indexOf("+") !== -1)
						_loc1_ = this.positiveTextFormat;

					if (this.changeText.getTextFormat() !== _loc1_)
						this.changeText.defaultTextFormat = _loc1_;
				}
				this.changeText.text = this.returnText;
			}
			else
			{
				this.infoText.text = this.datesText;
				for (let _loc2_ = 0; _loc2_ < this.datesTextFormats.length; _loc2_++)
				{
					const _loc3_ = this.datesTextFormats[_loc2_];
					this.infoText.setTextFormat(_loc3_.format, _loc3_.start, _loc3_.end);
				}
				this.changeText.text = "";
				this.startDate.visible = false;
				this.endDate.visible = false;
			}
			this.positionInfoText(false);
		}

		isDateFieldClicked(param1: MouseEvent): boolean
		{
			return param1.target === this.startDate.element || param1.target === this.endDate.element;
		}

		private setComparisonInfo(param1: { [key: string]: any }) 
		{
			const _loc2_ = param1[SpaceText.POINTS_STR];
			this.returnText = "";
			this.updateInfoText();
			this.clearComparisonInfo();
			for (let _loc3_ = _loc2_.length - 1; _loc3_ >= 0; _loc3_--)
			{
				const _loc4_ = new InfoDot();
				this.addChild(_loc4_);
				_loc4_.setInfo(_loc2_[_loc3_]);
				this.infoDots.push(_loc4_);
			}
			this.positionComparisonInfoDots();
		}

		private onMouseClickDateField(param1: MouseEvent) 
		{
			if (this.dateEntryState === SpaceText.EDIT_DATES)
				return;
			this.setDateEntryState(SpaceText.EDIT_DATES);
			this.startDate.type = flash.text.TextFieldType.INPUT;
			this.startDate.displayDateInParseableFormat();
			this.endDate.type = flash.text.TextFieldType.INPUT;
			this.endDate.displayDateInParseableFormat();
			param1.target.setSelection(0, 10);
			this.positionInfoText();
		}

		setContextualStaticInfo(param1: { [key: string]: any }) 
		{
			if (!param1[SpaceText.SETTER_STR])
				return;

			if (param1[SpaceText.POINTS_STR])
			{
				this.returnText = "";
				this.setTimePeriod(param1[SpaceText.SETTER_STR].viewPoint);
				this.setComparisonInfo(param1);
			}
			else
			{
				this.setTimePeriod(param1[SpaceText.SETTER_STR].viewPoint);
				this.setReturnInfo(param1[SpaceText.SETTER_STR].viewPoint);
			}
		}

		needToAnimate(): boolean
		{
			if (!this.endDate.parsedDate)
				return false;
			// TODO: !this.startDate.parsedDate ?
			return (Utils.compareUtcDates(this.endDate.date, this.endDate.parsedDate) !== 0 || Utils.compareUtcDates(this.startDate.date, this.startDate.parsedDate) !== 0) && Utils.compareUtcDates(this.startDate.parsedDate, this.endDate.parsedDate) <= 0;
		}

		resetInfoText() 
		{
			if (this.dateEntryState === SpaceText.DISPLAY_DATES)
				return;

			this.setDateEntryState(SpaceText.DISPLAY_DATES);
			this.updateInfoText();
		}

		private getReturnText(param1: DataUnit | null, param2: DataUnit | null, param3: DataSource | null): string
		{
			if (!param1 || !param2)
				return "";

			let _loc4_ = "";
			let _loc5_ = param2.close - param1.close;
			const _loc6_ = Math.round(_loc5_ / param1.close * 10000) / 100;
			if (_loc5_ > 0)
				_loc4_ = _loc4_ + "+";

			if (param3 && param3.tickerName && param3.tickerName.indexOf("CURRENCY:") === 0)
				_loc5_ = Math.round(_loc5_ * 100000) / 100000;
			else
				_loc5_ = Math.round(_loc5_ * 100) / 100;

			_loc4_ = _loc4_ + (_loc5_ + " (" + _loc6_ + "%)");
			return _loc4_;
		}

		setTimePeriod(param1: IDataUnitContainer) 
		{
			let _loc2_ = param1.getFirstDataUnit();
			let _loc3_ = param1.getLastDataUnit();
			if (!_loc2_ || !_loc3_)
				return;

			if (_loc3_.time < _loc2_.time)
			{
				const _loc4_ = _loc3_;
				_loc3_ = _loc2_;
				_loc2_ = _loc4_;
			}
			this.datesText = "";
			this.datesTextFormats = [];
			this.startDate.date = _loc2_.exchangeDateInUTC;
			this.endDate.date = _loc3_.exchangeDateInUTC;
			this.updateInfoText();
		}

		private newDateTextField(param1: number, param2: number, param3: number): com.google.finance.DateTextField
		{
			const _loc4_ = new com.google.finance.DateTextField();
			_loc4_.autoSize = flash.text.TextFieldAutoSize.LEFT;
			_loc4_.backgroundColor = Const.DATE_HIGHLIGHTED_BACKGROUND_COLOR;
			_loc4_.border = Const.ENABLE_CUSTOM_DATE_ENTRY === "true";
			_loc4_.defaultTextFormat = this.blackText;
			_loc4_.focusRect = _loc4_;
			_loc4_.mouseEnabled = Const.ENABLE_CUSTOM_DATE_ENTRY === "true";
			_loc4_.selectable = Const.ENABLE_CUSTOM_DATE_ENTRY === "true";
			_loc4_.tabEnabled = Const.ENABLE_CUSTOM_DATE_ENTRY === "true";
			_loc4_.tabIndex = param3;
			_loc4_.x = param1;
			_loc4_.y = param2;
			return _loc4_;
		}
	}
}
