namespace com.google.finance
{
	export class LastDayLineLayer extends AbstractLayer<ViewPoint>
	{
		private dashSize = 7;

		constructor(param1: ViewPoint, param2: DataSource)
		{
			super(param1, param2);
		}

		private drawLine(param1: Context) 
		{
			let _loc10_ = NaN;
			let _loc11_ = NaN;
			let _loc12_ = NaN;
			let _loc2_ = this.dataSource.data;
			const gr = this.graphics;
			gr.clear();
			gr.lineStyle(0, Const.LAST_DAY_CLOSE_LINE_COLOR, 1);
			let _loc3_ = this.dataSource.data.units;
			let _loc4_ = this.dataSource.data.days;
			let _loc5_ = _loc3_[_loc4_[_loc4_.length - 2]];
			let _loc6_ = _loc3_[_loc3_.length - 1];
			if (Const.INDICATOR_ENABLED)
			{
				_loc10_ = _loc5_.getCloseLogValue(param1.verticalScaling);
				if (_loc10_ > param1.maxPrice || _loc10_ < param1.minPrice)
					return;
			}
			let vp = this.viewPoint;
			let _loc7_ = vp.getXPos(_loc5_);
			let _loc8_ = vp.getXPos(_loc6_);
			let _loc9_ = vp.getDetailLevel();
			if (_loc7_ < this.viewPoint.maxx && _loc9_ === Const.INTRADAY)
			{
				_loc11_ = this.getYPos(_loc5_, param1);
				_loc12_ = 0;
				do
				{
					gr.moveTo(_loc7_ + _loc12_ * this.dashSize, _loc11_);
					gr.lineTo(_loc7_ + (_loc12_ + 1) * this.dashSize, _loc11_);
					_loc12_ = Number(_loc12_ + 2);
				}
				while (_loc7_ + _loc12_ * this.dashSize < _loc8_);
			}
		}

		protected getYPos(param1: DataUnit, param2: Context): number
		{
			return this.viewPoint.miny + this.viewPoint.V_OFFSET + this.viewPoint.medPriceY - (param1.getCloseLogValue(param2.verticalScaling) - param2.medPrice) * this.viewPoint.maxPriceRangeViewSize / param2.maxPriceRange;
		}

		renderLayer(param1: Context) 
		{
			this.drawLine(param1);
		}
	}
}
