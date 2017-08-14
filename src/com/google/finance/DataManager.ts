namespace com.google.finance
{
	export class DataManager
	{
		//private intId: number;

		readonly dataSources: { [key: string]: DataSource } = {};

		constructor(public readonly mainManager: com.google.finance.MainManager, private startTime = NaN, private endTime = NaN)
		{
		}

		addObject(param1: any) 
		{
			if (this.dataSources[param1._quote])
				this.dataSources[param1._quote].addObject(param1);
		}

		expectEvent(param1: ChartEvent | null)
		{
			if (!param1)
				return;
			this.checkDataSourceExistance(param1.quote);
			this.dataSources[param1.quote].markEvent(param1, ChartEventPriorities.EXPECTED);
		}

		syncDataSources(dataSource: DataSource, param2: DisplayManager) 
		{
			const otherDataSources: DataSource[] = [];
			for (let dataSourceName in this.dataSources)
			{
				const hasPendingEvents = this.dataSources[dataSourceName].hasPendingEvents();
				if (dataSourceName !== dataSource.quoteName && !hasPendingEvents)
					otherDataSources.push(this.dataSources[dataSourceName]);
			}
			if (otherDataSources.length === 0)
				return;

			const data = dataSource.data;
			const otherData = otherDataSources[0].data;
			let numDays = data.days.length - 1;
			let numOtherDays = otherData.days.length - 1;
			let _loc11_ = false;
			let _loc12_ = false;
			while (numDays > 0 && numOtherDays > 0)
			{
				const units = data.units[data.days[numDays]];
				const otherUnits = otherData.units[otherData.days[numOtherDays]];
				const _loc16_ = Utils.compareUtcDates(units.exchangeDateInUTC, otherUnits.exchangeDateInUTC);
				if (_loc16_ < 0)
				{
					const _loc3_ = this.cloneDataUnitForTargetExchange(otherUnits, units, Const.DAILY_INTERVAL);
					data.units.splice(data.days[numDays] + 1, 0, _loc3_);
					numOtherDays--;
					_loc12_ = true;
				}
				else if (_loc16_ > 0)
				{
					for (let dataSourceIndex = 0; dataSourceIndex < otherDataSources.length; dataSourceIndex++)
					{
						const data2 = otherDataSources[dataSourceIndex].data;
						if (data2.days.length > otherData.days.length - numOtherDays)
						{
							const _loc18_ = data2.days.length - (otherData.days.length - numOtherDays);
							const day = data2.days[_loc18_];
							const _loc3_ = this.cloneDataUnitForTargetExchange(units, data2.units[day], Const.DAILY_INTERVAL);
							data2.units.splice(day + 1, 0, _loc3_);
						}
					}
					_loc11_ = true;
					numDays--;
				}
				else
				{
					numDays--;
					numOtherDays--;
				}
			}
			if (_loc12_)
			{
				dataSource.preCalculate(dataSource.data);
				param2.computeRelativeTimes(dataSource);
			}
			if (_loc11_)
			{
				for (let dataSourceIndex = 0; dataSourceIndex < otherDataSources.length; dataSourceIndex++)
				{
					const _loc20_ = otherDataSources[dataSourceIndex];
					_loc20_.preCalculate(_loc20_.data);
					param2.computeRelativeTimes(_loc20_);
				}
			}
		}

		sortObjects(param1: string, param2: string) 
		{
			if (this.dataSources[param1])
				this.dataSources[param1].sortObjects(param2);
		}

		eventHandler(param1: ChartEvent | null, param2 = true) 
		{
			if (!param1)
				return;

			this.checkDataSourceExistance(param1.quote);
			if (param1.type !== ChartEventTypes.GET_RT_DATA && param1.type !== ChartEventTypes.GET_RT_AH_DATA && this.dataSources[param1.quote].markEvent(param1, param1.priority) === false)
				return;

			switch (param1.type)
			{
				case ChartEventTypes.GET_DATA:
				case ChartEventTypes.GET_AH_DATA:
				case ChartEventTypes.GET_MUTF_DATA:
				case ChartEventTypes.GET_RT_DATA:
				case ChartEventTypes.GET_RT_AH_DATA:
					this.getQuoteData(this.mainManager.url, this.mainManager.stickyArgs, param1, param2);
			}
		}

		selectObject(param1: string, param2: string, param3: number, param4?: string) 
		{
			return this.dataSources[param1].selectObject(param2, param3, param4);
		}

		private getQuoteData(param1: string, param2: string, param3: ChartEvent, param4: boolean) 
		{
			const symbol = Utils.getSymbolFromTicker(param3.quote);
			if (com.google.finance.MainManager.paramsObj[symbol + "_data_" + param3.period] === "javascript")
			{
				com.google.finance.MainManager.jsProxy.getData(param3.quote, param3.period);
				return;
			}
			if (!(Const.INDICATOR_ENABLED && param4))
			{
				if (com.google.finance.MainManager.paramsObj[symbol + "_data_" + param3.period] !== undefined && param3.type !== ChartEventTypes.GET_AH_DATA)
				{
					this.addData(param3, decodeURIComponent(com.google.finance.MainManager.paramsObj[symbol + "_data_" + param3.period]));
					return;
				}
				if (com.google.finance.MainManager.paramsObj[symbol + "_data_ah"] !== undefined && param3.type === ChartEventTypes.GET_AH_DATA)
				{
					this.addData(param3, decodeURIComponent(com.google.finance.MainManager.paramsObj[symbol + "_data_ah"]));
					return;
				}
			}
			const urlString = this.getUrlString(param1, param2, param3);
			/*const _loc7_ =*/ new DataRequestHandler(this, urlString, param3);
		}

		clearAllObjects(param1: string, param2: string) 
		{
			this.dataSources[param1].clearAllObjects(param2);
		}

		removeObject(param1: string, param2: string, param3: string) 
		{
			// TODO: is param2 always a number?
			this.dataSources[param1].removeObject(param3, Number(param2));
		}

		private hasDataSource(param1: string): boolean
		{
			return !!this.dataSources[param1];
		}

		addData(param1: ChartEvent, param2: string) 
		{
			const result = this.dataSources[param1.quote].addStream(param2, param1);
			this.mainManager.dataIsHere(this.dataSources[param1.quote], result);
		}

		dataUnavailableOnServer(param1: string): boolean
		{
			const _loc2_ = this.dataSources[param1];
			if (!_loc2_)
				return false;
			return _loc2_.dataUnavailableOnServer;
		}

		private getUrlString(param1: string, param2: string, param3: ChartEvent): string
		{
			let symbolFromTicker = Utils.getSymbolFromTicker(param3.quote);
			let exchangeFromTicker = Utils.getExchangeFromTicker(param3.quote);
			let _loc6_ = "";
			if (symbolFromTicker.indexOf("@") !== -1)
			{
				const _loc8_ = symbolFromTicker.split("@");
				symbolFromTicker = _loc8_[0];
				_loc6_ = _loc8_[1];
			}
			exchangeFromTicker = exchangeFromTicker === "NASDAQ" ? "NASD" : exchangeFromTicker;
			let _loc7_ = "";
			if (_loc6_ === "")
			{
				_loc7_ = param1 + "?" + "q=" + symbolFromTicker;
				if (exchangeFromTicker !== "")
					_loc7_ = _loc7_ + ("&x=" + exchangeFromTicker);

				_loc7_ = _loc7_ + ("&i=" + param3.interval);
				if (param3.type === ChartEventTypes.GET_AH_DATA || param3.type === ChartEventTypes.GET_RT_AH_DATA)
					_loc7_ = _loc7_ + "&sessions=ext_hours";

				if (!isNaN(this.startTime) && !isNaN(this.endTime))
					_loc7_ = _loc7_ + ("&se=" + this.startTime + "&ee=" + this.endTime);
				else
					_loc7_ = _loc7_ + ("&p=" + param3.period);
			}
			else
			{
				_loc7_ = param1.substr(0, param1.indexOf("getprices")) + "gettechnicals";
				_loc7_ = _loc7_ + ("?symbol=" + symbolFromTicker);
				_loc7_ = _loc7_ + ("&technicals=" + _loc6_);
				if (exchangeFromTicker !== "")
					_loc7_ = _loc7_ + ("&exchange=" + exchangeFromTicker);

				_loc7_ = _loc7_ + ("&interval=" + param3.interval + "&period=" + param3.period);
			}
			_loc7_ = _loc7_ + ("&f=" + param3.columns + "&df=cpct");
			_loc7_ = _loc7_ + "&auto=1";
			_loc7_ = _loc7_ + ("&ts=" + new Date().getTime());
			_loc7_ += param2;
			return _loc7_;
		}

		cloneDataUnitForTargetExchange(param1: DataUnit, param2: DataUnit, param3: number): DataUnit
		{
			const dataUnit = new DataUnit(param2.close, NaN, NaN, NaN);	// TODO
			const time = Date.UTC(param1.exchangeDateInUTC.fullYearUTC, param1.exchangeDateInUTC.monthUTC, param1.exchangeDateInUTC.dateUTC, param2.dayMinute / 60, param2.dayMinute % 60);
			dataUnit.setExchangeDateInUTC(time, param2.timezoneOffset);
			dataUnit.coveredDays = param1.coveredDays;
			dataUnit.volumes[param3] = 0;
			dataUnit.intervals[0] = param3;
			return dataUnit;
		}

		checkDataSourceExistance(param1: string, param2?: string)
		{
			let _loc3_ = 0;
			if (!this.hasDataSource(param1))
			{
				_loc3_ = this.mainManager ? this.mainManager.weekdayBitmap : Const.DEFAULT_WEEKDAY_BITMAP;
				this.dataSources[param1] = new DataSource(param1, _loc3_, param2);
			}
			else if (!this.dataSources[param1].displayName && param2)
			{
				this.dataSources[param1].displayName = param2;
			}
		}

		hasNonEmptyDataSource(param1: string): boolean
		{
			return this.dataSources[param1] && !this.dataSources[param1].isEmpty();
		}
	}
}
