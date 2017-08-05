/// <reference path="../../../flash/display/Sprite.ts" />

namespace com.google.finance
{
	// import flash.display.Sprite;
	// import flash.text.TextFieldAutoSize;
	// import flash.display.SimpleButton;
	// import flash.xml.XMLNode;
	// import flash.xml.XMLNodeType;
	// import com.google.i18n.locale.DateTimeLocale;
	// import flash.text.TextField;
	// import flash.filters.DropShadowFilter;
	// import flash.display.Bitmap;
	// import flash.text.TextFormat;
	// import flash.events.MouseEvent;
	// import flash.events.Event;

	export class PinPointContentMovie extends flash.display.Sprite
	{
		private static readonly TEXT_FIELD_PADDING= 8;

		private static readonly MIN_CONTENT_WIDTH= 140;

		private static readonly MAX_CONTENT_WIDTH= 250;


		private movieLeftX: number;

		private activePinPoint: com.google.finance.PinPoint | null;

		private closeButton: flash.display.SimpleButton;

		private viewPoint: com.google.finance.ViewPoint;

		private content: flash.text.TextField;

		private movieBottomY: number;

		constructor(param1: ViewPoint)
		{
			let opt_vp = <ViewPoint>param1;
			super();
			this.viewPoint = opt_vp;
			this.content = new flash.text.TextField();
			this.content.defaultTextFormat = new flash.text.TextFormat("Arial", 11);
			this.content.selectable = false;
			this.content.addEventListener(MouseEvents.MOUSE_OVER, (param1: Event) =>
			{
				MainManager.mouseCursor.setCursor(MouseCursor.CLASSIC);
				MainManager.mouseCursor.lockOnDisplayObject(this.content);
			});
			this.content.addEventListener(MouseEvents.MOUSE_OUT, (param1: Event) =>
			{
				MainManager.mouseCursor.unlock();
			});
			/* TODO
			let filter: DropShadowFilter = new DropShadowFilter();
			filter.color = 0x666666;
			this.filters = [filter];
			*/
			let BubbleCloseButton: { new (): any } = PinPointContentMovie_BubbleCloseButton;
			let closeButtonBitmap = new BubbleCloseButton();
			this.closeButton = new flash.display.SimpleButton("closeButton");
			this.closeButton.overState = closeButtonBitmap;
			this.closeButton.downState = closeButtonBitmap;
			this.closeButton.hitTestState = closeButtonBitmap;
			this.closeButton.upState = closeButtonBitmap;
			this.closeButton.useHandCursor = true;
			this.closeButton.addEventListener(MouseEvents.MOUSE_OVER, (param1: Event) =>
			{
				MainManager.mouseCursor.setCursor(MouseCursor.CLASSIC);
				MainManager.mouseCursor.lockOnDisplayObject(this.closeButton);
			});
			this.closeButton.addEventListener(MouseEvents.MOUSE_OUT, (param1: Event) =>
			{
				MainManager.mouseCursor.unlock();
			});
			this.closeButton.addEventListener(MouseEvents.CLICK, (param1: Event) =>
			{
				let activePinPoint = notnull(this.activePinPoint);
				activePinPoint.active = false;
				activePinPoint.forceExpandInGroup = true;
				this.clearMovie();
				if (this.viewPoint)
					this.viewPoint.updateObjectLayers();
			});
		}

		setActivePinPoint(param1: com.google.finance.PinPoint, param2: number, param3: number) 
		{
			this.activePinPoint = param1;
			this.movieLeftX = param2;
			this.movieBottomY = param3;
		}

		private renderBackground() 
		{
			this.graphics.lineStyle(2, 0x666666, 1);
			this.graphics.beginFill(0xffffff, 1);
			this.graphics.drawRoundRect(this.content.x - PinPointContentMovie.TEXT_FIELD_PADDING, this.content.y - PinPointContentMovie.TEXT_FIELD_PADDING, this.content.width + 2 * PinPointContentMovie.TEXT_FIELD_PADDING, this.content.height + 2 * PinPointContentMovie.TEXT_FIELD_PADDING, 10, 10);
			this.graphics.endFill();
		}

		private renderContent() 
		{
			this.content.wordWrap = false;
			this.content.autoSize = flash.text.TextFieldAutoSize.LEFT;
			this.content.htmlText = this.getContentHtmlText();
			if (this.content.width > PinPointContentMovie.MAX_CONTENT_WIDTH)
			{
				this.content.width = PinPointContentMovie.MAX_CONTENT_WIDTH;
				this.content.wordWrap = true;
			}
			else if (this.content.width < PinPointContentMovie.MIN_CONTENT_WIDTH)
			{
				this.content.width = PinPointContentMovie.MIN_CONTENT_WIDTH;
				this.content.wordWrap = true;
			}
			let _loc1_ = this.movieLeftX + this.content.width + 2 * PinPointContentMovie.TEXT_FIELD_PADDING - Const.MOVIE_WIDTH;
			this.content.x = this.movieLeftX - Math.max(0, _loc1_);
			this.content.y = Math.max(this.viewPoint.miny + PinPointContentMovie.TEXT_FIELD_PADDING + 2, this.movieBottomY - this.content.textHeight - 2 * PinPointContentMovie.TEXT_FIELD_PADDING);
			this.addChild(this.content);
			this.closeButton.x = this.content.x + this.content.width - this.closeButton.width - PinPointContentMovie.TEXT_FIELD_PADDING / 2;
			this.closeButton.y = this.content.y + PinPointContentMovie.TEXT_FIELD_PADDING / 2;
			this.addChild(this.closeButton);
		}

		protected getLetterHtml(param1: string): string
		{
			return "<b>" + this.escapeHtml(param1) + "</b>";
		}

		protected getAuthorHtml(param1: string): string
		{
			return "<font color=\'#6B6B6B\' size=\'12\'>" + this.escapeHtml(param1) + "</font>";
		}

		protected getTitleHtml(param1: string, param2: string, param3: string): string
		{
			let _loc4_ = "";
			if (param3)
			{
				let _loc5_ = "_GF_click(\'\', \'n-cn-\', \'" + encodeURIComponent(param1) + "\', \'\');";
				let _loc6_ = "self.location=\'" + encodeURIComponent(param3) + "\';";
				_loc4_ = _loc4_ + ("<a href=\"javascript:" + _loc5_ + _loc6_ + "\">");
				_loc4_ = _loc4_ + "<u><font color=\'#0000CC\' size=\'12\'>";
			}
			else
			{
				_loc4_ = _loc4_ + "<font size=\'12\'>";
			}
			_loc4_ = _loc4_ + this.escapeHtml(param2);
			if (param3)
				_loc4_ = _loc4_ + "</font></u></a>";
			else
				_loc4_ = _loc4_ + "</font>";

			return _loc4_;
		}

		protected escapeHtml(param1: string): string
		{
			return XML(new XMLNode(XMLNodeType.TEXT_NODE, param1)).toXMLString();
		}

		protected getDateHtml(param1: Date): string
		{
			let _loc2_ = !!Const.isZhLocale(com.google.i18n.locale.DateTimeLocale.getLocale()) ? "yyyy-MM-dd HH:mm" : "MMM dd, yyyy h:mma";
			return "<font color=\'#0B6CDE\'>" + com.google.i18n.locale.DateTimeLocale.formatDateTime(_loc2_, param1, true) + "</font>";
		}

		renderMovie() 
		{
			if (!this.activePinPoint)
				return;

			this.renderContent();
			this.renderBackground();
		}

		clearMovie() 
		{
			this.activePinPoint = null;
			if (this.contains(this.content))
				this.removeChild(this.content);

			if (this.contains(this.closeButton))
				this.removeChild(this.closeButton);

			this.graphics.clear();
		}

		private getContentHtmlText(): string
		{
			let activePinPoint = notnull(this.activePinPoint);
			let _loc1_ = activePinPoint.originalObject;
			let _loc2_ = this.getLetterHtml(activePinPoint.letter);
			if (activePinPoint.exchangeDateInUTC)
				_loc2_ = _loc2_ + (" " + this.getDateHtml(activePinPoint.exchangeDateInUTC));

			if (_loc1_._title && _loc1_._title !== "")
				_loc2_ = _loc2_ + ("\n" + this.getTitleHtml(activePinPoint.letter, _loc1_._title, _loc1_._url));

			if (_loc1_._author && _loc1_._author !== "")
				_loc2_ = _loc2_ + ("\n" + this.getAuthorHtml(_loc1_._author));
			else if (_loc1_._snippet && _loc1_._snippet !== "")
				_loc2_ = _loc2_ + ("\n" + this.getAuthorHtml(_loc1_._snippet));

			return _loc2_;
		}

		protected getSnippetHtml(param1: string): string
		{
			return "<font color=\'#6B6B6B\' size=\'12\'>" + this.escapeHtml(param1) + "</font>";
		}
	}
}
