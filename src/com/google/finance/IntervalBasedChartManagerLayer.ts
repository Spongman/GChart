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

			for (const styleName of Const.CHART_STYLE_NAMES)
			{
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

		setEnabledLayer(enabledLayerName: string)
		{
			if (this.getEnabledLayerName() === enabledLayerName)
				return;

			if (this.enabledChartLayer)
			{
				this.enabledChartLayer.setEnabled(false);
				this.enabledChartLayer = null;
				IntervalBasedChartManagerLayer.enabledChartLayerName = null;
			}
			for (const layer of this.chartLayers)
			{
				if (layer.getLayerName() === enabledLayerName)
				{
					layer.setEnabled(true);
					this.enabledChartLayer = layer;
					IntervalBasedChartManagerLayer.enabledChartLayerName = enabledLayerName;
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

		highlightPoint(context: Context, param2: number, state: Dictionary)
		{
			if (this.enabledChartLayer)
				this.enabledChartLayer.highlightPoint(context, param2, state);
		}

		clearHighlight()
		{
			if (this.enabledChartLayer)
				this.enabledChartLayer.clearHighlight();
		}
	}
}
