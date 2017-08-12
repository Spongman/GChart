namespace com.google.finance
{
	// import flash.text.TextField;
	// import flash.text.TextFormat;
	// import flash.text.TextFieldAutoSize;

	export class VolumeScaleLayer extends AbstractLayer<ViewPoint>
	{
		private static readonly LABEL_PADDING = 2;

		//private maxPriceRange: number;
		//private priceSkip: number;
		//private averagePrice: number;
		private midScaleTextField: flash.text.TextField;
		private topScaleTextField: flash.text.TextField;
		private volumeLabel = new flash.text.TextField();

		constructor(viewPoint: ViewPoint, dataSource: DataSource)
		{
			super(viewPoint, dataSource);
			this.volumeLabel.defaultTextFormat = new flash.text.TextFormat("Verdana", 9, 0x999999);
			this.volumeLabel.autoSize = flash.text.TextFieldAutoSize.LEFT;
			this.volumeLabel.selectable = false;
			this.addChild(this.volumeLabel);
			this.initTextFields(viewPoint);
		}

		private drawVolumeLines(param1: Context) 
		{
			let _loc2_ = 1000;
			const viewPoint = this.viewPoint;
			if (param1 && param1.maxVolume / 1000000 > 0.5)
			{
				this.volumeLabel.text = Messages.getMsg(Messages.VOLUME_LONG) + " (" + Messages.getMsg(Messages.MILLION_SHORT) + " / ";
				_loc2_ = 1000000;
			}
			else
			{
				this.volumeLabel.text = Messages.getMsg(Messages.VOLUME_LONG) + " (" + Messages.getMsg(Messages.THOUSAND_SHORT) + " / ";
				_loc2_ = 1000;
			}
			const _loc4_ = !!Const.INDICATOR_ENABLED ? Number(viewPoint.getDetailLevelForTechnicalStyle()) : viewPoint.getDetailLevel();
			const _loc5_ = !!Const.INDICATOR_ENABLED ? 1 : viewPoint.getSkipInterval().skip;
			switch (_loc4_)
			{
				case Intervals.INTRADAY:
					this.volumeLabel.appendText(_loc5_ * (Const.INTRADAY_INTERVAL / 60) + Messages.getMsg(Messages.MINUTES_SHORT) + ")");
					break;
				case Intervals.FIVE_MINUTES:
					this.volumeLabel.appendText(_loc5_ * (Const.FIVE_MINUTE_INTERVAL / 60) + Messages.getMsg(Messages.MINUTES_SHORT) + ")");
					break;
				case Intervals.HALF_HOUR:
					this.volumeLabel.appendText(_loc5_ * (Const.HALF_HOUR_INTERVAL / 60) + Messages.getMsg(Messages.MINUTES_SHORT) + ")");
					break;
				case Intervals.DAILY:
					this.volumeLabel.appendText(_loc5_ + Messages.getMsg(Messages.DAY_SHORT) + ")");
					break;
				case Intervals.WEEKLY:
					this.volumeLabel.appendText(_loc5_ + Messages.getMsg(Messages.WEEK_SHORT) + ")");
					break;
			}
			const gr = this.graphics;
			gr.clear();
			if (!param1.maxVolume)
			{
				this.topScaleTextField.text = "";
				this.midScaleTextField.text = "";
				return;
			}
			gr.lineStyle(0, 0x666666, 1);
			const _loc6_ = !!Const.INDICATOR_ENABLED ? Number(viewPoint.miny + Const.BOTTOM_VIEWPOINT_HEADER_HEIGHT) : viewPoint.miny;
			if (Const.INDICATOR_ENABLED)
			{
				gr.moveTo(viewPoint.maxx, _loc6_ + 1);
				gr.lineTo(viewPoint.maxx - 5, _loc6_ + 1);
			}
			else
			{
				gr.moveTo(viewPoint.maxx, _loc6_ + 3);
				gr.lineTo(viewPoint.maxx - 5, _loc6_ + 3);
			}
			gr.moveTo(viewPoint.maxx, (_loc6_ + viewPoint.maxy) / 2);
			gr.lineTo(viewPoint.maxx - 5, (_loc6_ + viewPoint.maxy) / 2);
			this.topScaleTextField.x = viewPoint.maxx - ViewPoint.TEXT_FIELD_WIDTH - 4;
			this.topScaleTextField.y = _loc6_ + ViewPoint.TEXT_VERTICAL_OFFSET - 4;
			this.midScaleTextField.x = viewPoint.maxx - ViewPoint.TEXT_FIELD_WIDTH - 4;
			this.midScaleTextField.y = (_loc6_ + viewPoint.maxy) / 2 - ViewPoint.TEXT_FIELD_HEIGHT / 2 - 1;
			this.topScaleTextField.text = String(Math.floor(param1.maxVolume) / _loc2_);
			this.midScaleTextField.text = String(Math.floor(param1.maxVolume / 2) / _loc2_);
		}

		private positionVolumeLabel() 
		{
			this.volumeLabel.x = this.viewPoint.minx + VolumeScaleLayer.LABEL_PADDING;
			this.volumeLabel.y = this.viewPoint.miny + VolumeScaleLayer.LABEL_PADDING;
		}

		renderLayer(param1: Context) 
		{
			this.drawVolumeLines(param1);
			this.positionVolumeLabel();
		}

		private initTextFields(param1: IViewPoint) 
		{
			this.topScaleTextField = new flash.text.TextField();
			this.topScaleTextField.width = ViewPoint.TEXT_FIELD_WIDTH;
			this.topScaleTextField.height = ViewPoint.TEXT_FIELD_HEIGHT;
			this.topScaleTextField.defaultTextFormat = param1.priceTextFormat;
			this.topScaleTextField.selectable = false;
			this.addChild(this.topScaleTextField);
			this.midScaleTextField = new flash.text.TextField();
			this.midScaleTextField.width = ViewPoint.TEXT_FIELD_WIDTH;
			this.midScaleTextField.height = ViewPoint.TEXT_FIELD_HEIGHT;
			this.midScaleTextField.defaultTextFormat = param1.priceTextFormat;
			this.midScaleTextField.selectable = false;
			this.addChild(this.midScaleTextField);
		}
	}
}
