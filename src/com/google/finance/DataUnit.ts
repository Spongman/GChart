namespace com.google.finance
{
	export class DataUnit
	{
		logHigh: number;
		duplicate = false;
		time: number;
		readonly intervals: number[] = [];
		dayMinute: number;
		logClose: number;
		exchangeDateInUTC: Date;
		readonly volumes: { [key: number]: number } = {};
		fake = false;
		coveredDays: number = 0;
		timezoneOffset: number;
		logOpen: number;
		relativeMinutes: number;
		weeklyXPos: number;
		logLow: number;
		realtime = false;

		constructor(public close: number, public high: number, public low: number, public open: number)
		{
		}

		toString(): string
		{
			const _loc1_ = this.exchangeDateInUTC;
			let _loc2_ = Utils.utcDateToString(_loc1_);
			if (!isNaN(this.relativeMinutes))
				_loc2_ = _loc2_ + ("[relMin:" + this.relativeMinutes + "]");

			return this.time + " " + this.dayMinute + " " + _loc2_ + " " + close;
		}

		getHighLogValue(param1: string): number
		{
			if (param1 === Const.LOG_VSCALE || param1 === Const.NEW_LOG_VSCALE)
				return this.logHigh || (this.logHigh = Utils.logTransform(this.high));

			return this.high;
		}

		getLowLogValue(param1: string): number
		{
			if (param1 === Const.LOG_VSCALE || param1 === Const.NEW_LOG_VSCALE)
				return this.logLow || (this.logLow = Utils.logTransform(this.low));

			return this.low;
		}

		setExchangeDateInUTC(param1: number, param2: number) 
		{
			this.timezoneOffset = param2;
			this.time = param1 - param2 * Const.MS_PER_MINUTE;
			this.exchangeDateInUTC = new Date(param1);
			this.dayMinute = this.exchangeDateInUTC.getUTCHours() * 60 + this.exchangeDateInUTC.getUTCMinutes();
			assert(!isNaN(this.dayMinute));
		}

		addVolumeInfo(param1: DataUnit) 
		{
			let _loc3_ = 0;
			for (let _loc2_ = 0; _loc2_ < param1.intervals.length; _loc2_++)
			{
				_loc3_ = param1.intervals[_loc2_];
				if (this.volumes[_loc3_] === undefined)
				{
					this.volumes[_loc3_] = param1.volumes[_loc3_];
					this.intervals.push(_loc3_);
				}
			}
		}

		getOpenLogValue(param1: string): number
		{
			if (param1 === Const.LOG_VSCALE || param1 === Const.NEW_LOG_VSCALE)
				return this.logOpen || (this.logOpen = Utils.logTransform(this.open));

			return this.open;
		}

		setData(param1: string, param2: string): boolean
		{
			if (isNaN(Number(param2)))
				return false;

			(<any>this)[param1] = Number(param2);
			return true;
		}

		getCloseLogValue(param1: string): number
		{
			if (param1 === Const.LOG_VSCALE || param1 === Const.NEW_LOG_VSCALE)
				return this.logClose || (this.logClose = Utils.logTransform(this.close));

			return this.close;
		}

		setDate(param1: number, param2: number) 
		{
			this.timezoneOffset = param2;
			this.time = param1;
			this.exchangeDateInUTC = new Date(param1 + param2 * 60000);
			this.dayMinute = this.exchangeDateInUTC.getUTCHours() * 60 + this.exchangeDateInUTC.getUTCMinutes();
			assert(!isNaN(this.dayMinute));
		}
	}
}
