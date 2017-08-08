/// <reference path="VolumeLinesChartLayer.ts" />

namespace com.google.finance
{
	// import flash.display.Sprite;

	export class AHVolumeLayer extends VolumeLinesChartLayer
	{
		protected regionsXLimits: com.google.finance.IntervalSet;

		protected maxVolumeCache: { [key: string]: number };

		constructor(param1: ViewPoint, param2: DataSource)
		{
			super(param1, param2);
			this.maxVolumeCache = {};
		}

		private drawAfterHoursSession(param1: flash.display.Sprite, param2: DataSeries, param3: number, param4: number, param5: Context, param6: number) 
		{
			let _loc7_ = DataSource.getTimeIndex(param4, param2.units);
			let _loc8_ = DataSource.getTimeIndex(param3, param2.units);
			let _loc9_ = this.viewPoint;
			let _loc10_ = <indicator.VolumeIndicatorPoint[]>param2.points;
			let _loc11_ = _loc9_.getXPos(_loc10_[_loc7_].point);
			let _loc12_ = _loc11_;
			let _loc13_ = _loc9_.getIntervalLength(param6 / 60);
			let _loc14_ = _loc7_;
			const gr = param1.graphics;
			while (_loc14_ > _loc8_)
			{
				let _loc15_ = _loc9_.maxy - _loc10_[_loc14_].volume * this.verticalScale;
				if (_loc9_.maxy - _loc15_ < 1 && _loc9_.maxy - _loc15_ > 0)
					_loc15_ = _loc9_.maxy - 1;
				else if (_loc15_ < _loc9_.miny)
					_loc15_ = _loc9_.miny;

				gr.moveTo(_loc11_, _loc15_);
				gr.lineTo(_loc11_, _loc9_.maxy);
				_loc11_ = _loc11_ - _loc13_;
				_loc14_--;
			}
			this.regionsXLimits.addInterval(_loc11_, _loc12_);
		}

		private getMaxVolumeHashKey(param1: number, param2: number): string
		{
			return param1 + "-" + param2;
		}

		protected drawLines(param1: flash.display.Sprite, param2: DataSeries, param3: number, param4: number, param5: IViewPoint, param6: Context) 
		{
			let _loc7_ = (<ViewPoint>param5).getSkipInterval();
			let _loc8_ = _loc7_.skip;
			let _loc9_ = _loc7_.interval;
			this.verticalScale = (param5.maxy - param5.miny - 6) / param6.maxVolume;
			this.graphics.clear();
			this.graphics.lineStyle(0, this.lineColor, 1);
			let _loc10_ = this.dataSource.visibleExtendedHours;
			this.regionsXLimits = new com.google.finance.IntervalSet();
			
			for (let _loc11_ = 0; _loc11_ < _loc10_.length(); _loc11_++)
			{
				let _loc12_ = _loc10_.method_1(_loc11_);
				let _loc13_ = this.dataSource.afterHoursData.units[_loc12_.start];
				let _loc14_ = this.dataSource.afterHoursData.units[_loc12_.end];
				if (ViewPoint.sessionVisible(_loc13_, _loc14_, param6))
				{
					let _loc15_ = _loc13_.time;
					let _loc16_ = _loc14_.time;
					this.drawAfterHoursSession(this, param2, _loc15_, _loc16_, param6, _loc9_);
				}
			}
		}

		highlightPoint(context: Context, param2: number, param3: { [key: string]: any }) 
		{
			this.clearHighlight();
			let vp = this.viewPoint;
			let _loc4_ = vp.getSkipInterval(context.count, context.lastMinute);
			let _loc5_ = this.indicator.getDataSeries(_loc4_.interval);

			if (!_loc5_ || !this.regionsXLimits || !this.regionsXLimits.containsValue(param2))
				return;

			if (param3["volumesetter"])
				param3["volumesetter"].clearHighlight();

			let _loc6_ = <indicator.VolumeIndicatorPoint>this.getPoint(_loc5_, param2);
			let _loc7_ = vp.getXPos(_loc6_.point);
			let _loc8_ = this.getYPos(this.viewPoint, _loc6_);
			this.highlightCanvas.graphics.lineStyle(2, Const.VOLUME_HIGHLIGHT_COLOR, 1);
			this.drawOneLine(_loc7_, _loc8_, this.highlightCanvas, this.viewPoint);
			param3["volume"] = _loc6_.volume;
			param3["ahsetter"] = this;
		}

		protected getMaxVolume(param1: number, param2: number, param3: boolean): number
		{
			let _loc4_ = this.viewPoint.getSkipInterval(param2, param1).interval;
			if (_loc4_ >= Const.DAILY)
				return 0;

			let _loc5_ = this.dataSource.visibleExtendedHours;
			let _loc6_ = 0;
			let _loc7_ = notnull(this.indicator.getDataSeries(_loc4_));
			
			for (let _loc8_ = 0; _loc8_ < _loc5_.length(); _loc8_++)
			{
				let _loc9_ = _loc5_.method_1(_loc8_);
				let _loc10_ = this.dataSource.afterHoursData.units[_loc9_.start];
				let _loc11_ = this.dataSource.afterHoursData.units[_loc9_.end];
				let _loc12_ = this.getMaxVolumeHashKey(_loc10_.time, _loc4_);
				if (this.maxVolumeCache[_loc12_] === undefined)
				{
					let _loc13_ = DataSource.getTimeIndex(_loc11_.time, _loc7_.units);
					let _loc14_ = DataSource.getTimeIndex(_loc10_.time, _loc7_.units);
					let _loc15_ = 0;
					
					for (let _loc16_ = _loc14_; _loc16_ < _loc13_; _loc16_++)
					{
						_loc15_ = Math.max((<indicator.VolumeIndicatorPoint>_loc7_.points[_loc16_]).volume, _loc15_);
					}

					if (_loc13_ > _loc14_)
						this.maxVolumeCache[_loc12_] = _loc15_;
				}
				_loc6_ = Utils.extendedMax(_loc6_, this.maxVolumeCache[_loc12_]);
			}
			return _loc6_;
		}
	}
}
