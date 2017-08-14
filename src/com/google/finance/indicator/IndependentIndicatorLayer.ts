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

		protected levelTextArray: flash.text.TextField[] = [];

		constructor(viewPoint: ViewPoint, dataSource: DataSource)
		{
			super(viewPoint, dataSource);
			const textFormat = new flash.text.TextFormat("Verdana", 9);
			textFormat.align = "right";
			for (let _loc4_= 0; _loc4_ < IndependentIndicatorLayer.LEVEL_CNT; _loc4_++)
			{
				const layerTextFormat = new flash.text.TextField();
				layerTextFormat.width = IndependentIndicatorLayer.LEVEL_TEXT_WIDTH;
				layerTextFormat.defaultTextFormat = textFormat;
				layerTextFormat.text = "";
				layerTextFormat.selectable = false;
				layerTextFormat.x = viewPoint.maxx - IndependentIndicatorLayer.LEVEL_TEXT_WIDTH;
				layerTextFormat.y = viewPoint.miny + (viewPoint.maxy - viewPoint.miny - 15) * (IndependentIndicatorLayer.LEVEL_CNT - 1 - _loc4_) / (IndependentIndicatorLayer.LEVEL_CNT - 1);
				this.textOutCanvas.addChild(layerTextFormat);
				this.levelTextArray.push(layerTextFormat);
			}
		}

		protected getYPos(context: Context, point: IndicatorPoint): number
		{
			return this.localYOffset - (point.getValue() - this.localMedianValue) * this.localYScale;
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

			const viewPoint = this.viewPoint;
			const detailLevel = viewPoint.getDetailLevelForTechnicalStyle(context.lastMinute, context.count);
			const detailLevelInterval = Const.getDetailLevelInterval(detailLevel);
			const originalDataSeries = this.originalDataSeries;
			const points = originalDataSeries.getPointsInIntervalArray(detailLevelInterval);
			if (!points)
				return context;

			const dataSeries = this.getDataSeriesArray(detailLevel, context);
			if (!dataSeries)
				return context;

			let _loc9_ = Number.NEGATIVE_INFINITY;
			let _loc10_ = Number.POSITIVE_INFINITY;
			let _loc11_ = originalDataSeries.getRelativeMinuteIndex(context.lastMinute, points);
			if (_loc11_ < points.length - 1)
				_loc11_++;

			let _loc12_ = originalDataSeries.getRelativeMinuteIndex(context.lastMinute - context.count, points) - 1;
			if (_loc12_ < 0)
				_loc12_ = 0;
			
			for (let _loc13_= 0; _loc13_ < dataSeries.length; _loc13_++)
			{
				if (this.getLineStyle(_loc13_) === IndicatorLineStyle.NONE)
					continue;

				for (let _loc14_ = _loc11_; _loc14_ >= _loc12_; _loc14_--)
				{
					let points = dataSeries[_loc13_].points[_loc14_];
					if (!points)
						continue;	// TODO: this shouldn't happen

					const value = points.getValue();
					if (!isNaN(value))
					{
						_loc9_ = Math.max(_loc9_, value);
						_loc10_ = Math.min(_loc10_, value);
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
			for (let _loc3_= 0; _loc3_ < this.levelTextArray.length; _loc3_++)
			{
				let _loc4_ = param2 + (param1 - param2) * _loc3_ / (this.levelTextArray.length - 1);
				_loc4_ = Math.round(_loc4_ * 100) / 100;
				this.levelTextArray[_loc3_].text = !!isNaN(_loc4_) ? "" : "" + _loc4_;
				this.levelTextArray[_loc3_].x = this.viewPoint.maxx - IndependentIndicatorLayer.LEVEL_TEXT_WIDTH;
				this.levelTextArray[_loc3_].y = this.viewPoint.miny + IndependentIndicatorLayer.NAME_TEXT_BLOCK_HEIGHT + (this.viewPoint.maxy - this.viewPoint.miny - 15 - IndependentIndicatorLayer.NAME_TEXT_BLOCK_HEIGHT) * (this.levelTextArray.length - 1 - _loc3_) / (this.levelTextArray.length - 1);
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
			const viewPoint = this.viewPoint;
			this.localYOffset = viewPoint.miny + viewPoint.medPriceY + IndependentIndicatorLayer.NAME_TEXT_BLOCK_HEIGHT / 2;
			this.localYScale = (viewPoint.maxy - viewPoint.miny - IndependentIndicatorLayer.NAME_TEXT_BLOCK_HEIGHT - IndependentIndicatorLayer.MARGIN_HEIGHT * 2) / (context.maxValue - context.minValue);
			this.localMedianValue = (context.maxValue + context.minValue) / 2;
		}
	}
}
