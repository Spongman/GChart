namespace com.google.finance
{
	// import flash.display.Sprite;
	// import flash.geom.Point;

	export class SparklineLayer extends AbstractLayer<SparklineViewPoint>
	{
		private realLIndex: number;

		private realRIndex: number;

		borderColor = 11184810;

		hasShadow: boolean;

		bgColor: number;

		fillColor: number;

		hasBackground: boolean;

		private minPriceLog: number;

		private maxPriceLog: number;

		constructor(param1: SparklineViewPoint, param2: DataSource)
		{
			super(param1, param2);
			this.lineColor = Const.LINE_CHART_LINE_COLOR;
		}

		private getYPos(param1: number, param2: number, param3: DataUnit): number
		{
			let _loc4_ = Number(this.maxPriceLog - this.minPriceLog);
			if (_loc4_ === 0)
				_loc4_ = 0.01;

			return param1 - 2 - (this.LogPreserveSign(param3.close) - this.minPriceLog) * (param1 - param2 - 5) / _loc4_;
		}

		private drawBackground(param1: boolean) 
		{
			let _loc4_ = NaN;
			let _loc5_ = NaN;
			let _loc2_ = <SparklineViewPoint><any>this.viewPoint;
			if (this.hasBackground)
			{
				if (param1)
					this.graphics.beginFill(this.bgColor, 1);

				let _loc3_ = notnull(this.getDataSeries());
				_loc4_ = _loc2_.getMinuteXPos(_loc3_.getFirstRelativeMinute());
				_loc5_ = _loc2_.getMinuteXPos(_loc3_.getLastRelativeMinute());
				if (_loc4_ < _loc2_.my_minx)
					_loc4_ = _loc2_.my_minx;

				if (_loc5_ > _loc2_.my_maxx)
					_loc5_ = _loc2_.my_maxx;

				this.graphics.lineStyle(0, this.borderColor, 1);
				this.graphics.moveTo(_loc4_, _loc2_.my_miny - 1);
				this.graphics.lineTo(_loc4_, _loc2_.my_maxy - 1);
				this.graphics.lineTo(_loc5_ - 1, _loc2_.my_maxy - 1);
				this.graphics.lineTo(_loc5_ - 1, _loc2_.my_miny - 1);
				if (param1)
					this.graphics.endFill();
			}
		}

		private drawLine(param1: flash.display.Sprite, param2: number, param3: number, param4: SparklineViewPoint, param5: number[]): number
		{
			let _loc6_ = NaN;
			let _loc7_ = NaN;
			let _loc8_ = notnull(this.getDataSeries());
			let _loc9_ = _loc8_.units;
			let _loc10_ = _loc8_.days;
			let _loc11_ = param3;
			let _loc12_ = this.getSkipInterval(param5, _loc8_.units);
			let _loc13_ = param5.length - 1;
			while (_loc13_ >= 0 && param5[_loc13_] > param3)
				_loc13_ = _loc13_ - _loc12_;

			_loc13_ = Math.min(_loc13_ + _loc12_, param5.length - 1);
			let _loc14_ = param4.maxy;
			let _loc15_ = param4.miny;
			let _loc16_ = param4.maxx;
			let _loc17_ = param4.minx;
			let _loc18_ = param4.getXPos(_loc16_, _loc17_, _loc9_[param3]);
			let _loc19_ = this.getYPos(_loc14_, _loc15_, _loc9_[param3]);
			param1.graphics.moveTo(_loc18_, param4.maxy);
			param1.graphics.lineStyle(0, 0, 0);
			param1.graphics.lineTo(_loc18_, _loc19_);
			param1.graphics.lineStyle(Const.LINE_CHART_LINE_THICKNESS, this.lineColor, Const.LINE_CHART_LINE_VISIBILITY);
			while (_loc13_ >= 0 && param5[_loc13_] >= param2)
			{
				_loc6_ = param4.getXPos(_loc16_, _loc17_, _loc9_[param5[_loc13_]]);
				_loc7_ = this.getYPos(_loc14_, _loc15_, _loc9_[param5[_loc13_]]);
				param1.graphics.lineTo(_loc6_, _loc7_);
				_loc13_ = _loc13_ - _loc12_;
			}
			if (_loc13_ >= 0)
			{
				_loc6_ = param4.getXPos(_loc16_, _loc17_, _loc9_[param5[_loc13_]]);
				_loc7_ = this.getYPos(_loc14_, _loc15_, _loc9_[param5[_loc13_]]);
				param1.graphics.lineTo(_loc6_, _loc7_);
			}
			_loc6_ = param4.getXPos(_loc16_, _loc17_, _loc9_[param2]);
			_loc7_ = this.getYPos(_loc14_, _loc15_, _loc9_[param2]);
			param1.graphics.lineTo(_loc6_, _loc7_);
			return _loc6_;
		}

		renderLayer(param1?: Context) 
		{
			let _loc2_ = <SparklineViewPoint><any>this.viewPoint;
			let _loc3_ = notnull(this.getDataSeries());
			if (_loc3_.units.length === 0)
				return;

			let _loc4_ = _loc3_.fridays;
			if (_loc2_.sparkCount <= 20 * _loc3_.marketDayLength)
				_loc4_ = _loc3_.days;

			this.graphics.clear();
			this.drawBackground(true);
			this.graphics.beginFill(this.fillColor, 1);
			let _loc5_ = _loc3_.getRelativeMinuteIndex(_loc2_.getSparkLastMinute() + _loc2_.sparkButtonMinutes) + 1;
			let _loc6_ = _loc3_.getRelativeMinuteIndex(_loc2_.getSparkFirstMinute() - _loc2_.sparkButtonMinutes);
			_loc5_ = Math.min(_loc5_, _loc3_.units.length - 1);
			_loc6_ = Math.max(_loc6_, 0);
			this.getMaxRange(_loc6_, _loc5_, _loc4_);
			let _loc7_ = this.drawLine(this, _loc6_, _loc5_, _loc2_, _loc4_);
			this.graphics.lineStyle(0, 0, 0);
			let _loc8_ = new flash.display.Point(_loc7_, _loc2_.my_maxy);
			//this.globalToLocal(_loc8_);	// TODO: ?
			this.graphics.lineTo(_loc8_.x, _loc8_.y);
			this.graphics.endFill();
			this.drawBackground(false);
		}

		private checkMinMax(param1: number) 
		{
			let _loc2_ = this.LogPreserveSign(param1);
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
			let _loc4_ = notnull(this.getDataSeries());
			let _loc5_ = _loc4_.units;
			let _loc6_ = param2;
			this.minPriceLog = Number.POSITIVE_INFINITY;
			this.maxPriceLog = Number.NEGATIVE_INFINITY;
			let _loc7_ = param3.length - 1;
			while (_loc7_ >= 0 && param3[_loc7_] > param2)
				_loc7_--;

			_loc7_ = Math.min(_loc7_ + 1, param3.length - 1);
			while (_loc7_ >= 0 && param3[_loc7_] >= param1)
			{
				this.checkMinMax(_loc5_[param3[_loc7_]].close);
				_loc7_--;
			}
			this.checkMinMax(_loc5_[param2].close);
			this.checkMinMax(_loc5_[param1].close);
		}

		private getSkipInterval(param1: number[], param2: DataUnit[]): number
		{
			if (param1.length < 2 || param2.length < 2)
				return 1;

			let _loc3_ = param1.length - 1;
			let _loc4_ = param2[param1[_loc3_]].relativeMinutes - param2[param1[_loc3_ - 1]].relativeMinutes;
			let _loc5_ = this.viewPoint.getIntervalLength(_loc4_);
			if (_loc5_ === 0)
				return 1;

			let _loc6_ = 1;
			while (_loc6_ * _loc5_ < this.viewPoint.POINTS_DISTANCE)
				_loc6_ = Number(_loc6_ * 2);

			return _loc6_;
		}
	}
}
