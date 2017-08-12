namespace com.google.finance
{
	export class LastDayLineLayer extends AbstractLayer<ViewPoint>
	{
		private dashSize = 7;

		private drawLine(param1: Context) 
		{
			//const _loc2_ = this.dataSource.data;
			const gr = this.graphics;
			gr.clear();
			gr.lineStyle(0, Const.LAST_DAY_CLOSE_LINE_COLOR, 1);
			const units = this.dataSource.data.units;
			const days = this.dataSource.data.days;
			const _loc5_ = units[days[days.length - 2]];
			const _loc6_ = units[units.length - 1];
			if (Const.INDICATOR_ENABLED)
			{
				const closeLogValue = _loc5_.getCloseLogValue(param1.verticalScaling);
				if (closeLogValue > param1.maxPrice || closeLogValue < param1.minPrice)
					return;
			}
			let vp = this.viewPoint;
			const xPos1 = vp.getXPos(_loc5_);
			const xPos2 = vp.getXPos(_loc6_);
			const detailLevel = vp.getDetailLevel();
			if (xPos1 < this.viewPoint.maxx && detailLevel === Intervals.INTRADAY)
			{
				const yPos = this.getYPos(_loc5_, param1);
				let _loc12_ = 0;
				do
				{
					gr.moveTo(xPos1 + _loc12_ * this.dashSize, yPos);
					gr.lineTo(xPos1 + (_loc12_ + 1) * this.dashSize, yPos);
					_loc12_ = Number(_loc12_ + 2);
				}
				while (xPos1 + _loc12_ * this.dashSize < xPos2);
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
