namespace com.google.finance.indicator
{
	// import com.google.finance.DataUnit;
	// import com.google.finance.Const;
	// import com.google.finance.Utils;

	export class IndicatorPoint
	{
		private logValue: number;

		constructor(public readonly value: number = 0, public readonly point: DataUnit)
		{
		}

		getValue(): number
		{
			return this.value;
		}

		getPoint(): DataUnit
		{
			return this.point;
		}

		getLogValue(scaleType: string): number
		{
			if (scaleType === Const.LOG_VSCALE || scaleType === Const.NEW_LOG_VSCALE)
			{
				if (isNaN(this.logValue))
					this.logValue = Utils.logTransform(this.value);

				return this.logValue;
			}
			return this.value;
		}
	}

	export class VolumeIndicatorPoint
		extends IndicatorPoint
	{
		get volume() { return this.value; }

		constructor(
			volume: number,
			relativeMinutes: number,
			point: DataUnit,
			time: number
		)
		{
			super(volume, point);
		}
	}
}
