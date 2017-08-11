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

		private getYPos(param1: number, param2: number, param3: DataUnit): number
		{
			let _loc4_ = Number(this.maxPriceLog - this.minPriceLog);
			if (_loc4_ === 0)
				_loc4_ = 0.01;

			return param1 - 2 - (this.LogPreserveSign(param3.close) - this.minPriceLog) * (param1 - param2 - 5) / _loc4_;
		}

		private drawBackground(param1: boolean) 
		{
			const _loc2_ = <SparklineViewPoint><any>this.viewPoint;
			if (this.hasBackground)
			{
				const gr = this.graphics;
				if (param1)
					gr.beginFill(this.bgColor, 1);

				const _loc3_ = notnull(this.getDataSeries());
				let _loc4_ = _loc2_.getMinuteXPos(_loc3_.getFirstRelativeMinute());
				let _loc5_ = _loc2_.getMinuteXPos(_loc3_.getLastRelativeMinute());
				if (_loc4_ < _loc2_.my_minx)
					_loc4_ = _loc2_.my_minx;

				if (_loc5_ > _loc2_.my_maxx)
					_loc5_ = _loc2_.my_maxx;

				gr.lineStyle(0, this.borderColor, 1);
				gr.drawRect(
					_loc4_, _loc2_.my_miny - 1,
					_loc5_ - _loc4_ - 1, _loc2_.my_maxy - _loc2_.my_miny
				)
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

		private drawLine(param1: flash.display.Sprite, param2: number, param3: number, param4: SparklineViewPoint, param5: number[]): number
		{
			const _loc8_ = notnull(this.getDataSeries());
			const _loc9_ = _loc8_.units;
			//const _loc10_ = _loc8_.days;
			//const _loc11_ = param3;
			const _loc12_ = this.getSkipInterval(param5, _loc8_.units);
			let _loc13_ = param5.length - 1;
			while (_loc13_ >= 0 && param5[_loc13_] > param3)
				_loc13_ = _loc13_ - _loc12_;

			_loc13_ = Math.min(_loc13_ + _loc12_, param5.length - 1);
			const _loc14_ = param4.maxy;
			const _loc15_ = param4.miny;
			const _loc16_ = param4.maxx;
			const _loc17_ = param4.minx;
			const _loc18_ = param4.getXPos(_loc16_, _loc17_, _loc9_[param3]);
			const _loc19_ = this.getYPos(_loc14_, _loc15_, _loc9_[param3]);
			const gr = param1.graphics;
			gr.moveTo(_loc18_, param4.maxy);
			gr.lineStyle(0, 0, 0);
			gr.lineTo(_loc18_, _loc19_);
			gr.lineStyle(Const.LINE_CHART_LINE_THICKNESS, this.lineColor, Const.LINE_CHART_LINE_VISIBILITY);
			while (_loc13_ >= 0 && param5[_loc13_] >= param2)
			{
				const _loc6_ = param4.getXPos(_loc16_, _loc17_, _loc9_[param5[_loc13_]]);
				const _loc7_ = this.getYPos(_loc14_, _loc15_, _loc9_[param5[_loc13_]]);
				gr.lineTo(_loc6_, _loc7_);
				_loc13_ = _loc13_ - _loc12_;
			}
			if (_loc13_ >= 0)
			{
				const _loc6_ = param4.getXPos(_loc16_, _loc17_, _loc9_[param5[_loc13_]]);
				const _loc7_ = this.getYPos(_loc14_, _loc15_, _loc9_[param5[_loc13_]]);
				gr.lineTo(_loc6_, _loc7_);
			}
			const _loc6_ = param4.getXPos(_loc16_, _loc17_, _loc9_[param2]);
			const _loc7_ = this.getYPos(_loc14_, _loc15_, _loc9_[param2]);
			gr.lineTo(_loc6_, _loc7_);
			return _loc6_;
		}

		renderLayer(param1?: Context) 
		{
			const _loc2_ = <SparklineViewPoint><any>this.viewPoint;
			const _loc3_ = notnull(this.getDataSeries());
			if (_loc3_.units.length === 0)
				return;

			let _loc4_ = _loc3_.fridays;
			if (_loc2_.sparkCount <= 20 * _loc3_.marketDayLength)
				_loc4_ = _loc3_.days;

			const gr = this.graphics;
			gr.clear();
			this.drawBackground(true);
			gr.beginFill(this.fillColor, 1);
			let _loc5_ = _loc3_.getRelativeMinuteIndex(_loc2_.getSparkLastMinute() + _loc2_.sparkButtonMinutes) + 1;
			let _loc6_ = _loc3_.getRelativeMinuteIndex(_loc2_.getSparkFirstMinute() - _loc2_.sparkButtonMinutes);
			_loc5_ = Math.min(_loc5_, _loc3_.units.length - 1);
			_loc6_ = Math.max(_loc6_, 0);
			this.getMaxRange(_loc6_, _loc5_, _loc4_);
			const _loc7_ = this.drawLine(this, _loc6_, _loc5_, _loc2_, _loc4_);
			gr.lineStyle(0, 0, 0);
			const _loc8_ = new flash.display.Point(_loc7_, _loc2_.my_maxy);
			//this.globalToLocal(_loc8_);	// TODO: ?
			gr.lineTo(_loc8_.x, _loc8_.y);
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
			const _loc4_ = notnull(this.getDataSeries());
			const _loc5_ = _loc4_.units;
			//const _loc6_ = param2;
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

			const _loc3_ = param1.length - 1;
			const _loc4_ = param2[param1[_loc3_]].relativeMinutes - param2[param1[_loc3_ - 1]].relativeMinutes;
			const _loc5_ = this.viewPoint.getIntervalLength(_loc4_);
			if (_loc5_ === 0)
				return 1;

			let _loc6_ = 1;
			while (_loc6_ * _loc5_ < this.viewPoint.POINTS_DISTANCE)
				_loc6_ = Number(_loc6_ * 2);

			return _loc6_;
		}
	}
}
