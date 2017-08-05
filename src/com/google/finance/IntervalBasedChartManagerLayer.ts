namespace com.google.finance
{
	// import flash.utils.getDefinitionByName;

	export class IntervalBasedChartManagerLayer extends AbstractDrawingLayer<ViewPoint>
	{
		private static enabledChartLayerName: string | null;


		private chartLayers: IntervalBasedChartLayer[];

		private enabledChartLayer: com.google.finance.IntervalBasedChartLayer | null;

		constructor(param1: ViewPoint, param2: DataSource)
		{
			super(param1, param2);
			if (!IntervalBasedChartManagerLayer.enabledChartLayerName)
				IntervalBasedChartManagerLayer.enabledChartLayerName = Const.DEFAULT_CHART_STYLE_NAME;

			this.chartLayers = [];
			for (let _loc3_ = 0; _loc3_ < Const.CHART_STYLE_NAMES.length; _loc3_++)
			{
				let _loc4_ = Const.CHART_STYLE_NAMES[_loc3_];
				let _loc5_ = getDefinitionByName("com.google.finance." + _loc4_) as typeof IntervalBasedChartLayer;
				let _loc6_ = new _loc5_(param1, param2);
				_loc6_.name = _loc4_;
				_loc6_.layerId = _loc4_;
				_loc6_.setLayerName(_loc4_);
				this.chartLayers.push(_loc6_);
				if (_loc4_ === IntervalBasedChartManagerLayer.enabledChartLayerName)
				{
					_loc6_.setEnabled(true);
					this.enabledChartLayer = _loc6_;
				}
				this.addChild(_loc6_);
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
			for (let _loc2_ = 0; _loc2_ < this.chartLayers.length; _loc2_++)
			{
				let _loc3_ = this.chartLayers[_loc2_];
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
