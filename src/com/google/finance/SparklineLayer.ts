namespace com.google.finance
{
	// import flash.display.Sprite;
	// import flash.geom.Point;

	export class SparklineLayer extends AbstractLayer<SparklineViewPoint>
	{
		//private realLIndex: number;
		//private realRIndex: number;

		borderColor = 11184810;
		hasShadow: boolean;
		bgColor: number;
		fillColor: number;
		hasBackground: boolean;

		private minPriceLog: number;
		private maxPriceLog: number;

		constructor(viewPoint: SparklineViewPoint, dataSource: DataSource)
		{
			super(viewPoint, dataSource);
			this.lineColor = Const.LINE_CHART_LINE_COLOR;
		}

		private getYPos(param1: number, param2: number, dataUnit: DataUnit): number
		{
			let _loc4_ = Number(this.maxPriceLog - this.minPriceLog);
			if (_loc4_ === 0)
				_loc4_ = 0.01;

			return param1 - 2 - (this.LogPreserveSign(dataUnit.close) - this.minPriceLog) * (param1 - param2 - 5) / _loc4_;
		}

		private drawBackground(param1: boolean)
		{
			const sparklineViewPoint = <SparklineViewPoint><any>this.viewPoint;
			if (this.hasBackground)
			{
				const gr = this.graphics;
				if (param1)
					gr.beginFill(this.bgColor, 1);

				const dataSeries = notnull(this.getDataSeries());
				let firstRelativeMinuteXPos = sparklineViewPoint.getMinuteXPos(dataSeries.getFirstRelativeMinute());
				let lastRelativeMinuteXPos = sparklineViewPoint.getMinuteXPos(dataSeries.getLastRelativeMinute());
				if (firstRelativeMinuteXPos < sparklineViewPoint.my_minx)
					firstRelativeMinuteXPos = sparklineViewPoint.my_minx;

				if (lastRelativeMinuteXPos > sparklineViewPoint.my_maxx)
					lastRelativeMinuteXPos = sparklineViewPoint.my_maxx;

				gr.lineStyle(0, this.borderColor, 1);
				gr.drawRect(
					firstRelativeMinuteXPos, sparklineViewPoint.my_miny - 1,
					lastRelativeMinuteXPos - firstRelativeMinuteXPos - 1, sparklineViewPoint.my_maxy - sparklineViewPoint.my_miny
				);
				/*
				gr.moveTo(_loc4_, _loc2_.my_miny - 1);
				gr.lineTo(_loc4_, _loc2_.my_maxy - 1);
				gr.lineTo(_loc5_ - 1, _loc2_.my_maxy - 1);
				gr.lineTo(_loc5_ - 1, _loc2_.my_miny - 1);
				*/
				if (param1)
					gr.endFill();
			}
		}

		private drawLine(sprite: flash.display.Sprite, param2: number, param3: number, sparklineViewPoint: SparklineViewPoint, param5: number[]): number
		{
			const dataSeries = notnull(this.getDataSeries());
			const units = dataSeries.units;
			//const _loc10_ = _loc8_.days;
			//const _loc11_ = param3;
			const skipInterval = this.getSkipInterval(param5, dataSeries.units);
			let _loc13_ = param5.length - 1;
			while (_loc13_ >= 0 && param5[_loc13_] > param3)
				_loc13_ -= skipInterval;

			_loc13_ = Math.min(_loc13_ + skipInterval, param5.length - 1);
			const maxy = sparklineViewPoint.maxy;
			const miny = sparklineViewPoint.miny;
			const maxx = sparklineViewPoint.maxx;
			const minx = sparklineViewPoint.minx;
			const x = sparklineViewPoint.getXPos(maxx, minx, units[param3]);
			const y = this.getYPos(maxy, miny, units[param3]);
			const gr = sprite.graphics;
			gr.moveTo(x, sparklineViewPoint.maxy);
			gr.lineStyle(0, 0, 0);
			gr.lineTo(x, y);
			gr.lineStyle(Const.LINE_CHART_LINE_THICKNESS, this.lineColor, Const.LINE_CHART_LINE_VISIBILITY);
			while (_loc13_ >= 0 && param5[_loc13_] >= param2)
			{
				const xPos2 = sparklineViewPoint.getXPos(maxx, minx, units[param5[_loc13_]]);
				const yPos2 = this.getYPos(maxy, miny, units[param5[_loc13_]]);
				gr.lineTo(xPos2, yPos2);
				_loc13_ -= skipInterval;
			}
			if (_loc13_ >= 0)
			{
				const xPos3 = sparklineViewPoint.getXPos(maxx, minx, units[param5[_loc13_]]);
				const yPos3 = this.getYPos(maxy, miny, units[param5[_loc13_]]);
				gr.lineTo(xPos3, yPos3);
			}
			const xPos4 = sparklineViewPoint.getXPos(maxx, minx, units[param2]);
			const yPos4 = this.getYPos(maxy, miny, units[param2]);
			gr.lineTo(xPos4, yPos4);
			return xPos4;
		}

		renderLayer(context?: Context)
		{
			const sparklineViewPoint = <SparklineViewPoint><any>this.viewPoint;
			const dataSeries = notnull(this.getDataSeries());
			if (dataSeries.units.length === 0)
				return;

			let fridays = dataSeries.fridays;
			if (sparklineViewPoint.sparkCount <= 20 * dataSeries.marketDayLength)
				fridays = dataSeries.days;

			const gr = this.graphics;
			gr.clear();
			this.drawBackground(true);
			gr.beginFill(this.fillColor, 1);
			let sparkLastMinuteIndex = dataSeries.getRelativeMinuteIndex(sparklineViewPoint.getSparkLastMinute() + sparklineViewPoint.sparkButtonMinutes) + 1;
			let sparkFirstMinuteIndex = dataSeries.getRelativeMinuteIndex(sparklineViewPoint.getSparkFirstMinute() - sparklineViewPoint.sparkButtonMinutes);
			sparkLastMinuteIndex = Math.min(sparkLastMinuteIndex, dataSeries.units.length - 1);
			sparkFirstMinuteIndex = Math.max(sparkFirstMinuteIndex, 0);
			this.getMaxRange(sparkFirstMinuteIndex, sparkLastMinuteIndex, fridays);
			const _loc7_ = this.drawLine(this, sparkFirstMinuteIndex, sparkLastMinuteIndex, sparklineViewPoint, fridays);
			gr.lineStyle(0, 0, 0);
			const point = new flash.display.Point(_loc7_, sparklineViewPoint.my_maxy);
			//this.globalToLocal(_loc8_);	// TODO: ?
			gr.lineTo(point.x, point.y);
			gr.endFill();
			this.drawBackground(false);
		}

		private checkMinMax(param1: number)
		{
			const _loc2_ = this.LogPreserveSign(param1);
			if (_loc2_ < this.minPriceLog)
				this.minPriceLog = _loc2_;
			else if (_loc2_ > this.maxPriceLog)
				this.maxPriceLog = _loc2_;
		}

		private LogPreserveSign(param1: number): number
		{
			if (param1 > 0)
				return Math.log(param1);

			if (param1 < 0)
				return -Math.log(-param1);

			return 0;
		}

		private getMaxRange(param1: number, param2: number, param3: number[])
		{
			const dataSeries = notnull(this.getDataSeries());
			const units = dataSeries.units;
			//const _loc6_ = param2;
			this.minPriceLog = Number.POSITIVE_INFINITY;
			this.maxPriceLog = Number.NEGATIVE_INFINITY;
			let _loc7_ = param3.length - 1;
			while (_loc7_ >= 0 && param3[_loc7_] > param2)
				_loc7_--;

			_loc7_ = Math.min(_loc7_ + 1, param3.length - 1);
			while (_loc7_ >= 0 && param3[_loc7_] >= param1)
			{
				this.checkMinMax(units[param3[_loc7_]].close);
				_loc7_--;
			}
			this.checkMinMax(units[param2].close);
			this.checkMinMax(units[param1].close);
		}

		private getSkipInterval(param1: number[], dataUnits: DataUnit[]): number
		{
			if (param1.length < 2 || dataUnits.length < 2)
				return 1;

			const _loc3_ = param1.length - 1;
			const _loc4_ = dataUnits[param1[_loc3_]].relativeMinutes - dataUnits[param1[_loc3_ - 1]].relativeMinutes;
			const intervalLength = this.viewPoint.getIntervalLength(_loc4_);
			if (intervalLength === 0)
				return 1;

			let _loc6_ = 1;
			while (_loc6_ * intervalLength < this.viewPoint.POINTS_DISTANCE)
				_loc6_ = Number(_loc6_ * 2);

			return _loc6_;
		}
	}
}
