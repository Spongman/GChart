namespace com.google.finance
{
	export class Messages
	{
		static readonly VMA_INTERVAL = 86;
		static readonly INTERVAL_1_WEEK = 52;
		static readonly TEN_THOUSAND_ONE_LETTER = 28;
		static readonly FSTO = 78;
		static readonly SUBCURRENCY_SIGN = 36;
		static readonly DEA_MACD = 68;
		static readonly MACD_MACD = 65;
		static readonly OHLC = 3;
		static readonly KDJ = 70;
		static readonly MILLION_ONE_LETTER = 29;
		static readonly RSI_INTERVAL = 87;
		static readonly ZOOM_ALL = 17;
		static readonly FSTO_INTERVAL = 93;
		static readonly ZOOM_YTD = 12;
		static readonly ZOOM_1D = 7;
		static readonly SMA = 55;
		static readonly ZOOM_1M = 9;
		static readonly PRICE = 18;
		static readonly CURRENCY_SIGN = 35;
		static readonly K_KDJ = 71;
		static readonly RSI = 58;
		static readonly ZOOM_1Y = 13;
		static readonly THOUSAND_ONE_LETTER = 27;
		static readonly TYPE = 0;
		static readonly INTERVAL_WEEKLY = 54;
		static readonly LOW = 22;
		static readonly BOLL_INTERVAL = 92;
		static readonly HOUR_SHORT = 32;
		static readonly OPEN = 19;
		static readonly ADJUSTMENT_FACTOR_TEXT = 41;
		static readonly UPPER_BOLL = 76;
		static readonly LOWER_BOLL = 77;
		static readonly WEEK_SHORT = 34;
		static readonly MID_BOLL = 75;
		static readonly KDJ_INTERVAL = 91;
		static readonly CCI_INTERVAL = 95;
		static readonly K_STOCHASTIC = 80;
		static readonly ZOOM_3M = 10;
		static readonly SPLIT_TEXT = 42;
		static readonly SMALL_CHART = 5;
		static readonly VMA = 57;
		static readonly INTERVAL_1_DAY = 51;
		static readonly PREMARKET = 45;
		static readonly VOLUME_LONG = 23;
		static readonly CANDLESTICK = 2;
		static readonly DIVIDEND_TEXT = 38;
		static readonly BIAS_INTERVAL = 88;
		static readonly BOLL = 74;
		static readonly BIAS_BIAS = 61;
		static readonly RSI_RSI = 59;
		static readonly NO_DATA_AVAILABLE = 44;
		static readonly CCI_CCI = 83;
		static readonly INTERVAL_30_MINUTES = 50;
		static readonly EMA = 56;
		static readonly LARGE_CHART = 4;
		static readonly ZOOM_5D = 8;
		static readonly J_KDJ = 73;
		static readonly D_KDJ = 72;
		static readonly WPR = 62;
		static readonly HIGH = 21;
		static readonly MILLION_SHORT = 26;
		static readonly EMA_INTERVAL = 85;
		static readonly AFTER_HOURS = 46;
		static readonly ZOOM_10Y = 15;
		static readonly ZOOM_5Y = 14;
		static readonly BIAS = 60;
		static readonly INTERVAL_5_MINUTES = 49;
		static readonly DIVIDEND_TEXT_NO_PERCENT = 37;
		static readonly THOUSAND_SHORT = 25;
		static readonly ZOOM_6M = 11;
		static readonly LOADING_MESSAGE = 43;
		static readonly INTERVAL = 47;
		static readonly INTERVAL_2_MINUTES = 48;
		static readonly D_STOCHASTIC = 81;
		static readonly WPR_INTERVAL = 89;
		static readonly MACD_INTERVAL = 90;
		static readonly ZOOM = 6;
		static readonly SSTO_INTERVAL = 94;
		static readonly CLOSE = 20;
		static readonly DAY_SHORT = 33;
		static readonly MINUTES_SHORT = 31;
		static readonly SMA_INTERVAL = 84;
		static readonly ZOOM_MAX = 16;
		static readonly DIVERGENCE_MACD = 69;
		static readonly EMA_MACD = 66;
		static readonly HUNDRED_MILLION_ONE_LETTER = 30;
		static readonly STOCK_DIVIDEND_TEXT_WITH_TICKER = 40;
		static readonly CCI = 82;
		static readonly PR_WPR = 63;
		static readonly SSTO = 79;
		static readonly STOCK_DIVIDEND_TEXT = 39;
		static readonly MACD = 64;
		static readonly DIFF_MACD = 67;
		static readonly VOLUME_SHORT = 24;
		static readonly LINE = 1;
		static readonly INTERVAL_DAILY = 53;
		private static readonly MESSAGES = ["Type", "Line", "Candlestick", "OHLC", "Large chart", "Small chart", "Zoom", "1d", "5d", "1m", "3m", "6m", "YTD", "1y", "5y", "10y", "Max", "All", "Price", "Open", "Close", "High", "Low", "Volume", "Vol", "thous", "mil", 'k', 'k', 'm', 'm', "min", 'h', 'd', "wk", '$', "\\u00A2", ["Dividend: ", 1, ""], ["Dividend: ", 1, " (", 2, ')'], "Stock Dividend", ["Stock Dividend: ", 1, ""], ["Adjustment Factor: ", 1, ""], ["Split: ", 1, ""], "Loading", "No data available", "Premarket", "After hours", "Interval", "2min", "5min", "30min", "1d", "1w", "daily", "weekly", ["SMA(", 1, "):", 2, ""], ["EMA(", 1, "):", 2, ""], ["VMA(", 1, "):", 2, ""], ["RSI(", 1, ')'], ["RSI:", 1, ""], ["BIAS(", 1, ')'], ["BIAS:", 1, ""], ["W%R(", 1, ')'], ["%R:", 1, ""], ["MACD(", 1, ',', 2, ',', 3, ')'], ["MACD:", 1, ""], ["EMA:", 1, ""], ["DIFF:", 1, ""], ["DEA:", 1, ""], ["Divergence:", 1, ""], ["KDJ(", 1, ')'], ["K:", 1, ""], ["D:", 1, ""], ["J:", 1, ""], ["BOLL(", 1, ')'], ["MID:", 1, ""], ["UPPER:", 1, ""], ["LOWER:", 1, ""], ["FSTO(", 1, ',', 2, ')'], ["SSTO(", 1, ',', 2, ')'], ["%K:", 1, ""], ["%D:", 1, ""], ["CCI(", 1, ')'], ["CCI:", 1, ""], ["SMA(", 1, ',', 2, "):", 3, ""], ["EMA(", 1, ',', 2, "):", 3, ""], ["VMA(", 1, ',', 2, "):", 3, ""], ["RSI(", 1, ',', 2, ')'], ["BIAS(", 1, ',', 2, ')'], ["W%R(", 1, ',', 2, ')'], ["MACD(", 1, ',', 2, ',', 3, ',', 4, ')'], ["KDJ(", 1, ',', 2, ')'], ["BOLL(", 1, ',', 2, ')'], ["FSTO(", 1, ',', 2, ',', 3, ')'], ["SSTO(", 1, ',', 2, ',', 3, ')'], ["CCI(", 1, ',', 2, ')'], ""];

		static getMsg(msg: number, ...rest: any[]): string
		{
			if (isNaN(msg))
				return "";

			if (rest.length === 0)
				return <string>Messages.MESSAGES[msg];

			const parts = (<string[]>(Messages.MESSAGES[msg])).concat();
			const length = parts.length;

			for (let i = 1; i < length; i += 2)
				parts[i] = rest[Number(parts[i]) - 1];

			return parts.join("");
		}

		static getLocale(): string
		{
			return "en";
		}
	}
}
