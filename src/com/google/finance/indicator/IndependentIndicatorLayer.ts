/// <reference path="IndicatorLayer.ts" />

namespace com.google.finance.indicator
{
	// import com.google.finance.ViewPoint;
	// import com.google.finance.Const;
	// import com.google.finance.DataSeries;
	// import com.google.finance.Utils;
	// import com.google.finance.DataSource;
	// import flash.text.TextField;
	// import flash.text.TextFormat;

	export class IndependentIndicatorLayer extends IndicatorLayer
	{
		private static readonly LEVEL_CNT= 3;

		private static readonly NAME_TEXT_BLOCK_HEIGHT= 20;

		private static readonly MARGIN_HEIGHT= 2;

		private static readonly LEVEL_TEXT_WIDTH= 70;


		protected levelTextArray: flash.text.TextField[];

		constructor(viewPoint: ViewPoint, dataSource: DataSource)
		{
			super(viewPoint, dataSource);
			this.levelTextArray = [];
			this.levelTextArray = [];
			let _loc3_ = new flash.text.TextFormat("Verdana", 9);
			_loc3_.align = "right";
			let _loc4_= 0;
			while (_loc4_ < IndependentIndicatorLayer.LEVEL_CNT)
			{
				let _loc5_ = new flash.text.TextField();
				_loc5_.width = IndependentIndicatorLayer.LEVEL_TEXT_WIDTH;
				_loc5_.defaultTextFormat = _loc3_;
				_loc5_.text = "";
				_loc5_.selectable = false;
				_loc5_.x = viewPoint.maxx - IndependentIndicatorLayer.LEVEL_TEXT_WIDTH;
				_loc5_.y = viewPoint.miny + (viewPoint.maxy - viewPoint.miny - 15) * (IndependentIndicatorLayer.LEVEL_CNT - 1 - _loc4_) / (IndependentIndicatorLayer.LEVEL_CNT - 1);
				this.textOutCanvas.addChild(_loc5_);
				this.levelTextArray.push(_loc5_);
				_loc4_++;
			}
		}

		protected getYPos(context: Context, param2: IndicatorPoint): number
		{
			return this.localYOffset - (param2.getValue() - this.localMedianValue) * this.localYScale;
		}

		renderLayer(context: Context) 
		{
			super.renderLayer(context);
			this.drawHorizontalLine(this.viewPoint.miny + IndependentIndicatorLayer.NAME_TEXT_BLOCK_HEIGHT);
			this.updateLevelTexts(context.maxValue, context.minValue);
		}

		getContext(context: Context, param2 = false) 
		{
			if (!this._enabled)
				return context;

			let _loc3_ = this.viewPoint;
			let _loc4_ = _loc3_.getDetailLevelForTechnicalStyle(context.lastMinute, context.count);
			let _loc5_ = Const.getDetailLevelInterval(_loc4_);
			let _loc6_ = this.originalDataSeries;
			let _loc7_ = _loc6_.getPointsInIntervalArray(_loc5_);
			if (!_loc7_)
				return context;

			let _loc8_ = this.getDataSeriesArray(_loc4_, context);
			if (!_loc8_)
				return context;

			let _loc9_ = Number.NEGATIVE_INFINITY;
			let _loc10_ = Number.POSITIVE_INFINITY;
			let _loc11_ = _loc6_.getRelativeMinuteIndex(context.lastMinute, _loc7_);
			if (_loc11_ < _loc7_.length - 1)
				_loc11_ = _loc11_ + 1;

			let _loc12_ = _loc6_.getRelativeMinuteIndex(context.lastMinute - context.count, _loc7_) - 1;
			if (_loc12_ < 0)
				_loc12_ = 0;
			
			for (let _loc13_= 0; _loc13_ < _loc8_.length; _loc13_++)
			{
				if (this.getLineStyle(_loc13_) === IndicatorLineStyle.NONE)
					continue;

				for (let _loc14_ = _loc11_; _loc14_ >= _loc12_; _loc14_--)
				{
					let points = _loc8_[_loc13_].points[_loc14_];
					if (!points)
						continue;	// TODO: this shouldn't happen

					let _loc15_ = points.getValue();
					if (!isNaN(_loc15_))
					{
						_loc9_ = Math.max(_loc9_, _loc15_);
						_loc10_ = Math.min(_loc10_, _loc15_);
					}
				}
			}
			if (_loc9_ !== Number.NEGATIVE_INFINITY && _loc10_ !== Number.POSITIVE_INFINITY)
			{
				context.maxValue = Utils.extendedMax(_loc9_, context.maxValue);
				context.minValue = Utils.extendedMin(_loc10_, context.minValue);
			}
			return context;
		}

		private updateLevelTexts(param1: number, param2: number) 
		{
			let _loc3_= 0;
			while (_loc3_ < this.levelTextArray.length)
			{
				let _loc4_ = param2 + (param1 - param2) * _loc3_ / (this.levelTextArray.length - 1);
				_loc4_ = Math.round(_loc4_ * 100) / 100;
				this.levelTextArray[_loc3_].text = !!isNaN(_loc4_) ? "" : "" + _loc4_;
				this.levelTextArray[_loc3_].x = this.viewPoint.maxx - IndependentIndicatorLayer.LEVEL_TEXT_WIDTH;
				this.levelTextArray[_loc3_].y = this.viewPoint.miny + IndependentIndicatorLayer.NAME_TEXT_BLOCK_HEIGHT + (this.viewPoint.maxy - this.viewPoint.miny - 15 - IndependentIndicatorLayer.NAME_TEXT_BLOCK_HEIGHT) * (this.levelTextArray.length - 1 - _loc3_) / (this.levelTextArray.length - 1);
				_loc3_++;
			}
		}

		private drawHorizontalLine(param1: number) 
		{
			const gr = this.graphics;
			gr.lineStyle(0, Const.HORIZONTAL_GRID_COLOR, 1);
			gr.moveTo(this.viewPoint.minx + 1, param1);
			gr.lineTo(this.viewPoint.maxx - 1, param1);
		}

		protected calculateLocalScaleMeters(context: Context) 
		{
			let _loc2_ = this.viewPoint;
			this.localYOffset = _loc2_.miny + _loc2_.medPriceY + IndependentIndicatorLayer.NAME_TEXT_BLOCK_HEIGHT / 2;
			this.localYScale = (_loc2_.maxy - _loc2_.miny - IndependentIndicatorLayer.NAME_TEXT_BLOCK_HEIGHT - IndependentIndicatorLayer.MARGIN_HEIGHT * 2) / (context.maxValue - context.minValue);
			this.localMedianValue = (context.maxValue + context.minValue) / 2;
		}
	}
}
