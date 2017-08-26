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
		private static readonly TEXT_FIELD_PADDING = 8;
		private static readonly MIN_CONTENT_WIDTH = 140;
		private static readonly MAX_CONTENT_WIDTH = 250;

		private movieLeftX: number;
		private activePinPoint: com.google.finance.PinPoint | null;
		private closeButton = new flash.display.SimpleButton("closeButton");
		private viewPoint: com.google.finance.ViewPoint;
		private content = new flash.text.TextField();
		private movieBottomY: number;

		constructor(viewPoint: ViewPoint)
		{
			super();
			this.viewPoint = viewPoint;
			this.content.defaultTextFormat = new flash.text.TextFormat("Arial", 11);
			this.content.selectable = false;
			this.content.addEventListener(MouseEvents.MOUSE_OVER, (event: Event) =>
			{
				MainManager.mouseCursor.setCursor(MouseCursors.CLASSIC);
				MainManager.mouseCursor.lockOnDisplayObject(this.content);
			});
			this.content.addEventListener(MouseEvents.MOUSE_OUT, (event: Event) =>
			{
				MainManager.mouseCursor.unlock();
			});
			/* TODO
			let filter: DropShadowFilter = new DropShadowFilter();
			filter.color = 0x666666;
			this.filters = [filter];
			*/
			const BubbleCloseButton: { new (): any } = PinPointContentMovie_BubbleCloseButton;
			const closeButtonBitmap = new BubbleCloseButton();
			this.closeButton.overState = closeButtonBitmap;
			this.closeButton.downState = closeButtonBitmap;
			this.closeButton.hitTestState = closeButtonBitmap;
			this.closeButton.upState = closeButtonBitmap;
			this.closeButton.useHandCursor = true;
			this.closeButton.addEventListener(MouseEvents.MOUSE_OVER, (event: Event) =>
			{
				MainManager.mouseCursor.setCursor(MouseCursors.CLASSIC);
				MainManager.mouseCursor.lockOnDisplayObject(this.closeButton);
			});
			this.closeButton.addEventListener(MouseEvents.MOUSE_OUT, (event: Event) =>
			{
				MainManager.mouseCursor.unlock();
			});
			this.closeButton.addEventListener(MouseEvents.CLICK, (event: Event) =>
			{
				const activePinPoint = notnull(this.activePinPoint);
				activePinPoint.active = false;
				activePinPoint.forceExpandInGroup = true;
				this.clearMovie();
				if (this.viewPoint)
					this.viewPoint.updateObjectLayers();
			});
		}

		setActivePinPoint(pinPoint: com.google.finance.PinPoint, param2: number, param3: number)
		{
			this.activePinPoint = pinPoint;
			this.movieLeftX = param2;
			this.movieBottomY = param3;
		}

		private renderBackground()
		{
			const gr = this.graphics;
			gr.lineStyle(2, 0x666666, 1);
			gr.beginFill(0xffffff, 1);
			gr.drawRoundRect(this.content.x - PinPointContentMovie.TEXT_FIELD_PADDING, this.content.y - PinPointContentMovie.TEXT_FIELD_PADDING, this.content.width + 2 * PinPointContentMovie.TEXT_FIELD_PADDING, this.content.height + 2 * PinPointContentMovie.TEXT_FIELD_PADDING, 10, 10);
			gr.endFill();
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
			const _loc1_ = this.movieLeftX + this.content.width + 2 * PinPointContentMovie.TEXT_FIELD_PADDING - Const.MOVIE_WIDTH;
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
			let titleHtml = "";
			if (param3)
			{
				const _loc5_ = "_GF_click(\'\', \'n-cn-\', \'" + encodeURIComponent(param1) + "\', \'\');";
				const _loc6_ = "self.location=\'" + encodeURIComponent(param3) + "\';";
				titleHtml += "<a href=\"javascript:" + _loc5_ + _loc6_ + "\'>";
				titleHtml += "<u><font color=\'#0000CC\' size=\'12\'>";
			}
			else
			{
				titleHtml += "<font size=\'12\'>";
			}
			titleHtml += this.escapeHtml(param2);
			if (param3)
				titleHtml += "</font></u></a>";
			else
				titleHtml += "</font>";

			return titleHtml;
		}

		protected escapeHtml(param1: string): string
		{
			throw new Error("not implemented");
			//TODO: return XML(new XMLNode(XMLNodeType.TEXT_NODE, param1)).toXMLString();
		}

		protected getDateHtml(date: Date): string
		{
			const _loc2_ = !!Const.isZhLocale(com.google.i18n.locale.DateTimeLocale.getLocale()) ? "yyyy-MM-dd HH:mm" : "MMM dd, yyyy h:mma";
			return "<font color=\'#0B6CDE\'>" + com.google.i18n.locale.DateTimeLocale.formatDateTime(_loc2_, date, true) + "</font>";
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
			const activePinPoint = notnull(this.activePinPoint);
			const originalObject = activePinPoint.originalObject;
			let letterHtml = this.getLetterHtml(activePinPoint.letter);
			if (activePinPoint.exchangeDateInUTC)
				letterHtml += ' ' + this.getDateHtml(activePinPoint.exchangeDateInUTC);

			if (originalObject._title && originalObject._title !== "")
				letterHtml += "\n" + this.getTitleHtml(activePinPoint.letter, originalObject._title, originalObject._url);

			if (originalObject._author && originalObject._author !== "")
				letterHtml += "\n" + this.getAuthorHtml(originalObject._author);
			else if (originalObject._snippet && originalObject._snippet !== "")
				letterHtml += "\n" + this.getAuthorHtml(originalObject._snippet);

			return letterHtml;
		}

		protected getSnippetHtml(param1: string): string
		{
			return "<font color=\'#6B6B6B\' size=\'12\'>" + this.escapeHtml(param1) + "</font>";
		}
	}
}
