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
			let _loc13_ = false;
			let _loc18_ = 0;
			let _loc19_ = 0;
			const _loc5_: DataSource[] = [];
			for (let _loc6_ in this.dataSources)
			{
				_loc13_ = this.dataSources[_loc6_].hasPendingEvents();
				if (_loc6_ !== dataSource.quoteName && !_loc13_)
					_loc5_.push(this.dataSources[_loc6_]);
			}
			if (_loc5_.length === 0)
				return;

			const _loc7_ = dataSource.data;
			const _loc8_ = _loc5_[0].data;
			let _loc9_ = _loc7_.days.length - 1;
			let _loc10_ = _loc8_.days.length - 1;
			let _loc11_ = false;
			let _loc12_ = false;
			while (_loc9_ > 0 && _loc10_ > 0)
			{
				const _loc14_ = _loc7_.units[_loc7_.days[_loc9_]];
				const _loc15_ = _loc8_.units[_loc8_.days[_loc10_]];
				const _loc16_ = Utils.compareUtcDates(_loc14_.exchangeDateInUTC, _loc15_.exchangeDateInUTC);
				if (_loc16_ < 0)
				{
					const _loc3_ = this.cloneDataUnitForTargetExchange(_loc15_, _loc14_, Const.DAILY_INTERVAL);
					_loc7_.units.splice(_loc7_.days[_loc9_] + 1, 0, _loc3_);
					_loc10_--;
					_loc12_ = true;
				}
				else if (_loc16_ > 0)
				{
					for (let _loc4_ = 0; _loc4_ < _loc5_.length; _loc4_++)
					{
						const _loc17_ = _loc5_[_loc4_].data;
						if (_loc17_.days.length > _loc8_.days.length - _loc10_)
						{
							_loc18_ = _loc17_.days.length - (_loc8_.days.length - _loc10_);
							_loc19_ = _loc17_.days[_loc18_];
							const _loc3_ = this.cloneDataUnitForTargetExchange(_loc14_, _loc17_.units[_loc19_], Const.DAILY_INTERVAL);
							_loc17_.units.splice(_loc19_ + 1, 0, _loc3_);
						}
					}
					_loc11_ = true;
					_loc9_--;
				}
				else
				{
					_loc9_--;
					_loc10_--;
				}
			}
			if (_loc12_)
			{
				dataSource.preCalculate(dataSource.data);
				param2.computeRelativeTimes(dataSource);
			}
			if (_loc11_)
			{
				for (let _loc4_ = 0; _loc4_ < _loc5_.length; _loc4_++)
				{
					const _loc20_ = _loc5_[_loc4_];
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
			const _loc5_ = Utils.getSymbolFromTicker(param3.quote);
			if (com.google.finance.MainManager.paramsObj[_loc5_ + "_data_" + param3.period] === "javascript")
			{
				com.google.finance.MainManager.jsProxy.getData(param3.quote, param3.period);
				return;
			}
			if (!(Const.INDICATOR_ENABLED && param4))
			{
				if (com.google.finance.MainManager.paramsObj[_loc5_ + "_data_" + param3.period] !== undefined && param3.type !== ChartEventTypes.GET_AH_DATA)
				{
					this.addData(param3, decodeURIComponent(com.google.finance.MainManager.paramsObj[_loc5_ + "_data_" + param3.period]));
					return;
				}
				if (com.google.finance.MainManager.paramsObj[_loc5_ + "_data_ah"] !== undefined && param3.type === ChartEventTypes.GET_AH_DATA)
				{
					this.addData(param3, decodeURIComponent(com.google.finance.MainManager.paramsObj[_loc5_ + "_data_ah"]));
					return;
				}
			}
			const _loc6_ = this.getUrlString(param1, param2, param3);
			/*const _loc7_ =*/ new DataRequestHandler(this, _loc6_, param3);
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
			const _loc3_ = this.dataSources[param1.quote].addStream(param2, param1);
			this.mainManager.dataIsHere(this.dataSources[param1.quote], _loc3_);
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
			let _loc4_ = Utils.getSymbolFromTicker(param3.quote);
			let _loc5_ = Utils.getExchangeFromTicker(param3.quote);
			let _loc6_ = "";
			if (_loc4_.indexOf("@") !== -1)
			{
				const _loc8_ = _loc4_.split("@");
				_loc4_ = _loc8_[0];
				_loc6_ = _loc8_[1];
			}
			_loc5_ = _loc5_ === "NASDAQ" ? "NASD" : _loc5_;
			let _loc7_ = "";
			if (_loc6_ === "")
			{
				_loc7_ = param1 + "?" + "q=" + _loc4_;
				if (_loc5_ !== "")
					_loc7_ = _loc7_ + ("&x=" + _loc5_);

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
				_loc7_ = _loc7_ + ("?symbol=" + _loc4_);
				_loc7_ = _loc7_ + ("&technicals=" + _loc6_);
				if (_loc5_ !== "")
					_loc7_ = _loc7_ + ("&exchange=" + _loc5_);

				_loc7_ = _loc7_ + ("&interval=" + param3.interval + "&period=" + param3.period);
			}
			_loc7_ = _loc7_ + ("&f=" + param3.columns + "&df=cpct");
			_loc7_ = _loc7_ + "&auto=1";
			_loc7_ = _loc7_ + ("&ts=" + new Date().getTime());
			_loc7_ = _loc7_ + param2;
			return _loc7_;
		}

		cloneDataUnitForTargetExchange(param1: DataUnit, param2: DataUnit, param3: number): DataUnit
		{
			const _loc4_ = new DataUnit(param2.close, NaN, NaN, NaN);	// TODO
			const _loc5_ = Date.UTC(param1.exchangeDateInUTC.fullYearUTC, param1.exchangeDateInUTC.monthUTC, param1.exchangeDateInUTC.dateUTC, param2.dayMinute / 60, param2.dayMinute % 60);
			_loc4_.setExchangeDateInUTC(_loc5_, param2.timezoneOffset);
			_loc4_.coveredDays = param1.coveredDays;
			_loc4_.volumes[param3] = 0;
			_loc4_.intervals[0] = param3;
			return _loc4_;
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
