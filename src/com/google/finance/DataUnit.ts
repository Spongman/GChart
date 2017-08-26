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
			const exchangeDateInUTC = this.exchangeDateInUTC;
			let dateString = Utils.utcDateToString(exchangeDateInUTC);
			if (!isNaN(this.relativeMinutes))
				dateString += "[relMin:" + this.relativeMinutes + ']';

			return this.time + ' ' + this.dayMinute + ' ' + dateString + ' ' + close;
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

		addVolumeInfo(dataUnit: DataUnit)
		{
			for (const interval of dataUnit.intervals)
			{
				if (this.volumes[interval] === undefined)
				{
					this.volumes[interval] = dataUnit.volumes[interval];
					this.intervals.push(interval);
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
