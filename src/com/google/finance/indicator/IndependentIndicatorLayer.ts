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
			for (let levelIndex = 0; levelIndex < IndependentIndicatorLayer.LEVEL_CNT; levelIndex++)
			{
				const layerTextFormat = new flash.text.TextField();
				layerTextFormat.width = IndependentIndicatorLayer.LEVEL_TEXT_WIDTH;
				layerTextFormat.defaultTextFormat = textFormat;
				layerTextFormat.text = "";
				layerTextFormat.selectable = false;
				layerTextFormat.x = viewPoint.maxx - IndependentIndicatorLayer.LEVEL_TEXT_WIDTH;
				layerTextFormat.y = viewPoint.miny + (viewPoint.maxy - viewPoint.miny - 15) * (IndependentIndicatorLayer.LEVEL_CNT - 1 - levelIndex) / (IndependentIndicatorLayer.LEVEL_CNT - 1);
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

			for (let dataSeriesIndex = 0; dataSeriesIndex < dataSeries.length; dataSeriesIndex++)
			{
				if (this.getLineStyle(dataSeriesIndex) === IndicatorLineStyle.NONE)
					continue;

				for (const point of dataSeries[dataSeriesIndex].points)
				{
					if (!point)
						continue;	// TODO: this shouldn't happen

					const value = point.getValue();
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
			for (let levelTextIndex = 0; levelTextIndex < this.levelTextArray.length; levelTextIndex++)
			{
				let _loc4_ = param2 + (param1 - param2) * levelTextIndex / (this.levelTextArray.length - 1);
				_loc4_ = Math.round(_loc4_ * 100) / 100;
				this.levelTextArray[levelTextIndex].text = isNaN(_loc4_) ? "" : "" + _loc4_;
				this.levelTextArray[levelTextIndex].x = this.viewPoint.maxx - IndependentIndicatorLayer.LEVEL_TEXT_WIDTH;
				this.levelTextArray[levelTextIndex].y = this.viewPoint.miny + IndependentIndicatorLayer.NAME_TEXT_BLOCK_HEIGHT + (this.viewPoint.maxy - this.viewPoint.miny - 15 - IndependentIndicatorLayer.NAME_TEXT_BLOCK_HEIGHT) * (this.levelTextArray.length - 1 - levelTextIndex) / (this.levelTextArray.length - 1);
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
