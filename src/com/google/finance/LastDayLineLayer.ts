namespace com.google.finance
{
	export class LastDayLineLayer extends AbstractLayer<ViewPoint>
	{
		private dashSize = 7;

		private drawLine(context: Context)
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
				const closeLogValue = _loc5_.getCloseLogValue(context.verticalScaling);
				if (closeLogValue > context.maxPrice || closeLogValue < context.minPrice)
					return;
			}
			let vp = this.viewPoint;
			const xPos1 = vp.getXPos(_loc5_);
			const xPos2 = vp.getXPos(_loc6_);
			const detailLevel = vp.getDetailLevel();
			if (xPos1 < this.viewPoint.maxx && detailLevel === Intervals.INTRADAY)
			{
				const yPos = this.getYPos(_loc5_, context);
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

		protected getYPos(dataUnit: DataUnit, context: Context): number
		{
			return this.viewPoint.miny + this.viewPoint.V_OFFSET + this.viewPoint.medPriceY - (dataUnit.getCloseLogValue(context.verticalScaling) - context.medPrice) * this.viewPoint.maxPriceRangeViewSize / context.maxPriceRange;
		}

		renderLayer(context: Context)
		{
			this.drawLine(context);
		}
	}
}
