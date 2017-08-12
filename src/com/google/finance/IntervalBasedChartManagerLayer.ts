namespace com.google.finance
{
	// import flash.utils.getDefinitionByName;

	export class IntervalBasedChartManagerLayer extends AbstractDrawingLayer<ViewPoint>
	{
		private static enabledChartLayerName: string | null;

		private chartLayers: IntervalBasedChartLayer[] = [];
		private enabledChartLayer: com.google.finance.IntervalBasedChartLayer | null;

		constructor(viewPoint: ViewPoint, dataSource: DataSource)
		{
			super(viewPoint, dataSource);
			if (!IntervalBasedChartManagerLayer.enabledChartLayerName)
				IntervalBasedChartManagerLayer.enabledChartLayerName = Const.DEFAULT_CHART_STYLE_NAME;

			for (let index = 0; index < Const.CHART_STYLE_NAMES.length; index++)
			{
				const styleName = Const.CHART_STYLE_NAMES[index];
				const className = getDefinitionByName("com.google.finance." + styleName) as typeof IntervalBasedChartLayer;
				const chartLayer = new className(viewPoint, dataSource);
				chartLayer.name = styleName;
				chartLayer.layerId = styleName;
				chartLayer.setLayerName(styleName);
				this.chartLayers.push(chartLayer);
				if (styleName === IntervalBasedChartManagerLayer.enabledChartLayerName)
				{
					chartLayer.setEnabled(true);
					this.enabledChartLayer = chartLayer;
				}
				this.addChild(chartLayer);
			}
		}

		static getEnabledChartLayerName()
		{
			return IntervalBasedChartManagerLayer.enabledChartLayerName;
		}

		getEnabledLayerName(): string
		{
			return this.enabledChartLayer ? this.enabledChartLayer.getLayerName() : "";
		}

		setEnabledLayer(param1: string) 
		{
			if (this.getEnabledLayerName() === param1)
				return;

			if (this.enabledChartLayer)
			{
				this.enabledChartLayer.setEnabled(false);
				this.enabledChartLayer = null;
				IntervalBasedChartManagerLayer.enabledChartLayerName = null;
			}
			for (let layerIndex = 0; layerIndex < this.chartLayers.length; layerIndex++)
			{
				const _loc3_ = this.chartLayers[layerIndex];
				if (_loc3_.getLayerName() === param1)
				{
					_loc3_.setEnabled(true);
					this.enabledChartLayer = _loc3_;
					IntervalBasedChartManagerLayer.enabledChartLayerName = param1;
					break;
				}
			}
		}

		getContext(context: Context, param2 = false) 
		{
			return this.enabledChartLayer ? this.enabledChartLayer.getContext(context, param2) : context;
		}

		renderLayer(context: Context) 
		{
			if (this.enabledChartLayer)
				this.enabledChartLayer.renderLayer(context);
		}

		highlightPoint(context: Context, param2: number, param3: { [key: string]: any }) 
		{
			if (this.enabledChartLayer)
				this.enabledChartLayer.highlightPoint(context, param2, param3);
		}

		clearHighlight() 
		{
			if (this.enabledChartLayer)
				this.enabledChartLayer.clearHighlight();
		}
	}
}
