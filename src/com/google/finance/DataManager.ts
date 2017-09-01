namespace com.google.finance
{
	export class DataManager
	{
		//private intId: number;

		readonly dataSources: Map<DataSource> = {};

		constructor(public readonly mainManager: com.google.finance.MainManager, private startTime = NaN, private endTime = NaN)
		{
		}

		addObject(param1: any)
		{
			if (this.dataSources[param1._quote])
				this.dataSources[param1._quote].addObject(param1);
		}

		expectEvent(chartEvent: ChartEvent | null)
		{
			if (!chartEvent)
				return;
			this.checkDataSourceExistance(chartEvent.quote);
			this.dataSources[chartEvent.quote].markEvent(chartEvent, ChartEventPriorities.EXPECTED);
		}

		syncDataSources(dataSource: DataSource, displayManager: DisplayManager)
		{
			const otherDataSources: DataSource[] = [];
			for (const dataSourceName of Object.keys(this.dataSources))
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
				const unit = data.units[data.days[numDays]];
				const otherUnits = otherData.units[otherData.days[numOtherDays]];
				const _loc16_ = Utils.compareUtcDates(unit.exchangeDateInUTC, otherUnits.exchangeDateInUTC);
				if (_loc16_ < 0)
				{
					const _loc3_ = this.cloneDataUnitForTargetExchange(otherUnits, unit, Const.DAILY_INTERVAL);
					data.units.splice(data.days[numDays] + 1, 0, _loc3_);
					numOtherDays--;
					_loc12_ = true;
				}
				else if (_loc16_ > 0)
				{
					for (const otherDataSource of otherDataSources)
					{
						const data2 = otherDataSource.data;
						if (data2.days.length > otherData.days.length - numOtherDays)
						{
							const _loc18_ = data2.days.length - (otherData.days.length - numOtherDays);
							const day = data2.days[_loc18_];
							const _loc3_ = this.cloneDataUnitForTargetExchange(unit, data2.units[day], Const.DAILY_INTERVAL);
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
				displayManager.computeRelativeTimes(dataSource);
			}
			if (_loc11_)
			{
				for (const otherDataSource of otherDataSources)
				{
					otherDataSource.preCalculate(otherDataSource.data);
					displayManager.computeRelativeTimes(otherDataSource);
				}
			}
		}

		sortObjects(ticker: string, param2: string)
		{
			if (this.dataSources[ticker])
				this.dataSources[ticker].sortObjects(param2);
		}

		eventHandler(chartEvent: ChartEvent | null, param2 = true)
		{
			if (!chartEvent)
				return;

			this.checkDataSourceExistance(chartEvent.quote);
			if (chartEvent.type !== ChartEventTypes.GET_RT_DATA && chartEvent.type !== ChartEventTypes.GET_RT_AH_DATA && this.dataSources[chartEvent.quote].markEvent(chartEvent, chartEvent.priority) === false)
				return;

			switch (chartEvent.type)
			{
				case ChartEventTypes.GET_DATA:
				case ChartEventTypes.GET_AH_DATA:
				case ChartEventTypes.GET_MUTF_DATA:
				case ChartEventTypes.GET_RT_DATA:
				case ChartEventTypes.GET_RT_AH_DATA:
					this.getQuoteData(this.mainManager.url, this.mainManager.stickyArgs, chartEvent, param2);
			}
		}

		selectObject(ticker: string, param2: string, param3: number, param4?: string)
		{
			return this.dataSources[ticker].selectObject(param2, param3, param4);
		}

		private getQuoteData(param1: string, param2: string, chartEvent: ChartEvent, param4: boolean)
		{
			const quoteSymbol = Utils.getSymbolFromTicker(chartEvent.quote);
			if (com.google.finance.MainManager.paramsObj[quoteSymbol + "_data_" + chartEvent.period] === "javascript")
			{
				com.google.finance.MainManager.jsProxy.getData(chartEvent.quote, chartEvent.period);
				return;
			}
			if (!(Const.INDICATOR_ENABLED && param4))
			{
				if (com.google.finance.MainManager.paramsObj[quoteSymbol + "_data_" + chartEvent.period] !== undefined && chartEvent.type !== ChartEventTypes.GET_AH_DATA)
				{
					this.addData(chartEvent, decodeURIComponent(com.google.finance.MainManager.paramsObj[quoteSymbol + "_data_" + chartEvent.period]));
					return;
				}
				if (com.google.finance.MainManager.paramsObj[quoteSymbol + "_data_ah"] !== undefined && chartEvent.type === ChartEventTypes.GET_AH_DATA)
				{
					this.addData(chartEvent, decodeURIComponent(com.google.finance.MainManager.paramsObj[quoteSymbol + "_data_ah"]));
					return;
				}
			}
			const urlString = this.getUrlString(param1, param2, chartEvent);
			/*const _loc7_ =*/ new DataRequestHandler(this, urlString, chartEvent);
		}

		clearAllObjects(ticker: string, param2: string)
		{
			this.dataSources[ticker].clearAllObjects(param2);
		}

		removeObject(ticker: string, id: number, objectType: string)
		{
			// TODO: is param2 always a number?
			this.dataSources[ticker].removeObject(objectType, id);
		}

		private hasDataSource(ticker: string): boolean
		{
			return !!this.dataSources[ticker];
		}

		addData(chartEvent: ChartEvent, param2: string)
		{
			const result = this.dataSources[chartEvent.quote].addStream(param2, chartEvent);
			this.mainManager.dataIsHere(this.dataSources[chartEvent.quote], result);
		}

		dataUnavailableOnServer(ticker: string): boolean
		{
			const _loc2_ = this.dataSources[ticker];
			if (!_loc2_)
				return false;
			return _loc2_.dataUnavailableOnServer;
		}

		private getUrlString(param1: string, param2: string, chartEvent: ChartEvent): string
		{
			let symbolFromTicker = Utils.getSymbolFromTicker(chartEvent.quote);
			let exchangeFromTicker = Utils.getExchangeFromTicker(chartEvent.quote);
			let _loc6_ = "";
			if (symbolFromTicker.indexOf('@') !== -1)
			{
				const _loc8_ = symbolFromTicker.split('@');
				symbolFromTicker = _loc8_[0];
				_loc6_ = _loc8_[1];
			}
			exchangeFromTicker = exchangeFromTicker === "NASDAQ" ? "NASD" : exchangeFromTicker;
			let urlString = "";
			if (_loc6_ === "")
			{
				urlString = param1 + '?' + "q=" + symbolFromTicker;
				if (exchangeFromTicker !== "")
					urlString += "&x=" + exchangeFromTicker;

				urlString += "&i=" + chartEvent.interval;
				if (chartEvent.type === ChartEventTypes.GET_AH_DATA || chartEvent.type === ChartEventTypes.GET_RT_AH_DATA)
					urlString += "&sessions=ext_hours";

				if (!isNaN(this.startTime) && !isNaN(this.endTime))
					urlString += "&se=" + this.startTime + "&ee=" + this.endTime;
				else
					urlString += "&p=" + chartEvent.period;
			}
			else
			{
				urlString = param1.substr(0, param1.indexOf("getprices")) + "gettechnicals";
				urlString += "?symbol=" + symbolFromTicker;
				urlString += "&technicals=" + _loc6_;
				if (exchangeFromTicker !== "")
					urlString += "&exchange=" + exchangeFromTicker;

				urlString += "&interval=" + chartEvent.interval + "&period=" + chartEvent.period;
			}
			urlString += "&f=" + chartEvent.columns + "&df=cpct";
			urlString += "&auto=1";
			urlString += "&ts=" + new Date().getTime();
			urlString += param2;
			return urlString;
		}

		cloneDataUnitForTargetExchange(dataUnit1: DataUnit, dataUnit2: DataUnit, param3: number): DataUnit
		{
			const dataUnit = new DataUnit(dataUnit2.close, NaN, NaN, NaN);	// TODO
			const time = Date.UTC(dataUnit1.exchangeDateInUTC.fullYearUTC, dataUnit1.exchangeDateInUTC.monthUTC, dataUnit1.exchangeDateInUTC.dateUTC, dataUnit2.dayMinute / 60, dataUnit2.dayMinute % 60);
			dataUnit.setExchangeDateInUTC(time, dataUnit2.timezoneOffset);
			dataUnit.coveredDays = dataUnit1.coveredDays;
			dataUnit.volumes[param3] = 0;
			dataUnit.intervals[0] = param3;
			return dataUnit;
		}

		checkDataSourceExistance(ticker: string, displayName?: string)
		{
			if (!this.hasDataSource(ticker))
			{
				const _loc3_ = this.mainManager ? this.mainManager.weekdayBitmap : Const.DEFAULT_WEEKDAY_BITMAP;
				this.dataSources[ticker] = new DataSource(ticker, _loc3_, displayName);
			}
			else if (!this.dataSources[ticker].displayName && displayName)
			{
				this.dataSources[ticker].displayName = displayName;
			}
		}

		hasNonEmptyDataSource(ticker: string): boolean
		{
			return this.dataSources[ticker] && !this.dataSources[ticker].isEmpty();
		}
	}
}
