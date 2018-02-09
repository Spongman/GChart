import { Const } from "./Const";
import { Utils } from "./Utils";

export class DataUnit {
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


	static compare(dataUnit1: DataUnit, dataUnit2: DataUnit): number {
		return dataUnit1.exchangeDateInUTC.getTime() - dataUnit2.exchangeDateInUTC.getTime();
	}


	static getLastRealPointIndex(dataUnits: DataUnit[]): number {
		if (!dataUnits || dataUnits.length === 0) {
			return -1;
		}

		let unitIndex = dataUnits.length - 1;
		while (unitIndex >= 0 && dataUnits[unitIndex].fake) {
			unitIndex--;
		}

		return unitIndex;
	}

	constructor(public close: number, public high: number, public low: number, public open: number) {
	}

	toString(): string {
		const exchangeDateInUTC = this.exchangeDateInUTC;
		let dateString = Utils.utcDateToString(exchangeDateInUTC);
		if (!isNaN(this.relativeMinutes)) {
			dateString += "[relMin:" + this.relativeMinutes + "]";
		}

		return this.time + " " + this.dayMinute + " " + dateString + " " + close;
	}

	getHighLogValue(scaleType: string): number {
		if (scaleType === Const.LOG_VSCALE || scaleType === Const.NEW_LOG_VSCALE) {
			return this.logHigh || (this.logHigh = Utils.logTransform(this.high));
		}

		return this.high;
	}

	getLowLogValue(scaleType: string): number {
		if (scaleType === Const.LOG_VSCALE || scaleType === Const.NEW_LOG_VSCALE) {
			return this.logLow || (this.logLow = Utils.logTransform(this.low));
		}

		return this.low;
	}

	setExchangeDateInUTC(time: number, timezoneOffset: number) {
		this.timezoneOffset = timezoneOffset;
		this.time = time - timezoneOffset * Const.MS_PER_MINUTE;
		this.exchangeDateInUTC = new Date(time);
		this.dayMinute = this.exchangeDateInUTC.getUTCHours() * 60 + this.exchangeDateInUTC.getUTCMinutes();
		assert(!isNaN(this.dayMinute));
	}

	addVolumeInfo(dataUnit: DataUnit) {
		for (const interval of dataUnit.intervals) {
			if (this.volumes[interval] === undefined) {
				this.volumes[interval] = dataUnit.volumes[interval];
				this.intervals.push(interval);
			}
		}
	}

	getOpenLogValue(scaleType: string): number {
		if (scaleType === Const.LOG_VSCALE || scaleType === Const.NEW_LOG_VSCALE) {
			return this.logOpen || (this.logOpen = Utils.logTransform(this.open));
		}

		return this.open;
	}

	setData(param1: string, param2: string): boolean {
		if (isNaN(Number(param2))) {
			return false;
		}

		(this as any)[param1] = Number(param2);
		return true;
	}

	getCloseLogValue(scaleType: string): number {
		if (scaleType === Const.LOG_VSCALE || scaleType === Const.NEW_LOG_VSCALE) {
			return this.logClose || (this.logClose = Utils.logTransform(this.close));
		}

		return this.close;
	}

	setDate(time: number, timezoneOffset: number) {
		this.timezoneOffset = timezoneOffset;
		this.time = time;
		this.exchangeDateInUTC = new Date(time + timezoneOffset * 60000);
		this.dayMinute = this.exchangeDateInUTC.getUTCHours() * 60 + this.exchangeDateInUTC.getUTCMinutes();
		assert(!isNaN(this.dayMinute));
	}
}
