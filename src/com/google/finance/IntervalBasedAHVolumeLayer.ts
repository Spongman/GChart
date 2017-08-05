/// <reference path="IntervalBasedVolumeLayer.ts" />

namespace com.google.finance
{
	export class IntervalBasedAHVolumeLayer extends IntervalBasedVolumeLayer
	{
		private regionsXLimits: com.google.finance.IntervalSet;

		constructor(param1: ViewPoint, param2: DataSource)
		{
			super(param1, param2);
		}

		highlightPoint(context: Context, param2: number, param3: { [key: string]: any }) 
		{
			this.clearHighlight();
			if (!this.regionsXLimits || !this.regionsXLimits.containsValue(param2))
				return;

			if (param3["volumesetter"])
				param3["volumesetter"].clearHighlight();

			let _loc4_ = this.getDataSeries();
			let _loc5_ = this.viewPoint;
			let _loc6_ = this.findPointIndex(param2);
			let _loc7_ = _loc5_.getDetailLevelForTechnicalStyle();
			let _loc8_ = Const.getDetailLevelInterval(_loc7_);
			let _loc9_ = _loc4_.getPointsInIntervalArray(_loc8_);
			if (!_loc9_ || _loc6_ === -1)
				return;

			let _loc10_ = _loc9_[_loc6_];
			let _loc11_ = _loc5_.getXPos(_loc10_);
			let _loc12_ = this.getYPos(_loc10_.volumes[_loc8_], _loc5_);
			this.highlightCanvas.graphics.lineStyle(2, Const.VOLUME_HIGHLIGHT_COLOR, 1);
			this.drawOneLine(_loc11_, _loc12_, _loc5_, this.highlightCanvas);
			param3[SpaceText.VOLUME_STR] = _loc10_.volumes[_loc8_];
			param3["ahsetter"] = this;
		}

		renderLayer(context: Context) 
		{
			let _loc8_ = NaN;
			let _loc9_ = NaN;
			this.graphics.clear();
			let vp = this.viewPoint;
			if (vp.getDetailLevelForTechnicalStyle() !== Const.INTRADAY)
				return;

			let _loc2_ = this.getDataSeries().getPointsInIntervalArray(Const.INTRADAY_INTERVAL);
			if (!_loc2_)
				return;

			let _loc3_ = this.dataSource.visibleExtendedHours;
			if (_loc3_.length() === 0)
				return;

			this.regionsXLimits = new com.google.finance.IntervalSet();
			
			for (let _loc4_ = 0; _loc4_ < _loc3_.length(); _loc4_++)
			{
				let _loc5_ = _loc3_.method_1(_loc4_);
				let _loc6_ = _loc2_[_loc5_.start];
				let _loc7_ = _loc2_[_loc5_.end];
				if (ViewPoint.sessionVisible(_loc6_, _loc7_, context))
				{
					_loc8_ = vp.getXPos(_loc6_);
					_loc9_ = vp.getXPos(_loc7_);
					this.regionsXLimits.addInterval(_loc8_, _loc9_);
				}
			}
			super.renderLayer(context);
		}

		getDataSeries(context?: Context): DataSeries
		{
			return this.dataSource.afterHoursData;
		}
	}
}
