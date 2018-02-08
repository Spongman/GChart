
	export enum Messages {
		TYPE = 0,
		LINE = 1,
		CANDLESTICK = 2,
		OHLC = 3,
		LARGE_CHART = 4,
		SMALL_CHART = 5,
		ZOOM = 6,
		ZOOM_1D = 7,
		ZOOM_5D = 8,
		ZOOM_1M = 9,
		ZOOM_3M = 10,
		ZOOM_6M = 11,
		ZOOM_YTD = 12,
		ZOOM_1Y = 13,
		ZOOM_5Y = 14,
		ZOOM_10Y = 15,
		ZOOM_MAX = 16,
		ZOOM_ALL = 17,
		PRICE = 18,
		OPEN = 19,
		CLOSE = 20,
		HIGH = 21,
		LOW = 22,
		VOLUME_LONG = 23,
		VOLUME_SHORT = 24,
		THOUSAND_SHORT = 25,
		MILLION_SHORT = 26,
		THOUSAND_ONE_LETTER = 27,
		TEN_THOUSAND_ONE_LETTER = 28,
		MILLION_ONE_LETTER = 29,
		HUNDRED_MILLION_ONE_LETTER = 30,
		MINUTES_SHORT = 31,
		HOUR_SHORT = 32,
		DAY_SHORT = 33,
		WEEK_SHORT = 34,
		CURRENCY_SIGN = 35,
		SUBCURRENCY_SIGN = 36,
		DIVIDEND_TEXT_NO_PERCENT = 37,
		DIVIDEND_TEXT = 38,
		STOCK_DIVIDEND_TEXT = 39,
		STOCK_DIVIDEND_TEXT_WITH_TICKER = 40,
		ADJUSTMENT_FACTOR_TEXT = 41,
		SPLIT_TEXT = 42,
		LOADING_MESSAGE = 43,
		NO_DATA_AVAILABLE = 44,
		PREMARKET = 45,
		AFTER_HOURS = 46,
		INTERVAL = 47,
		INTERVAL_2_MINUTES = 48,
		INTERVAL_5_MINUTES = 49,
		INTERVAL_30_MINUTES = 50,
		INTERVAL_1_DAY = 51,
		INTERVAL_1_WEEK = 52,
		INTERVAL_DAILY = 53,
		INTERVAL_WEEKLY = 54,
		SMA = 55,
		EMA = 56,
		VMA = 57,
		RSI = 58,
		RSI_RSI = 59,
		BIAS = 60,
		BIAS_BIAS = 61,
		WPR = 62,
		PR_WPR = 63,
		MACD = 64,
		MACD_MACD = 65,
		EMA_MACD = 66,
		DIFF_MACD = 67,
		DEA_MACD = 68,
		DIVERGENCE_MACD = 69,
		KDJ = 70,
		K_KDJ = 71,
		D_KDJ = 72,
		J_KDJ = 73,
		BOLL = 74,
		MID_BOLL = 75,
		UPPER_BOLL = 76,
		LOWER_BOLL = 77,
		FSTO = 78,
		SSTO = 79,
		K_STOCHASTIC = 80,
		D_STOCHASTIC = 81,
		CCI = 82,
		CCI_CCI = 83,
		SMA_INTERVAL = 84,
		EMA_INTERVAL = 85,
		VMA_INTERVAL = 86,
		RSI_INTERVAL = 87,
		BIAS_INTERVAL = 88,
		WPR_INTERVAL = 89,
		MACD_INTERVAL = 90,
		KDJ_INTERVAL = 91,
		BOLL_INTERVAL = 92,
		FSTO_INTERVAL = 93,
		SSTO_INTERVAL = 94,
		CCI_INTERVAL = 95,
	}

	export class Message {

		private static readonly MESSAGES = ["Type", "Line", "Candlestick", "OHLC", "Large chart", "Small chart", "Zoom", "1d", "5d", "1m", "3m", "6m", "YTD", "1y", "5y", "10y", "Max", "All", "Price", "Open", "Close", "High", "Low", "Volume", "Vol", "thous", "mil", "k", "k", "m", "m", "min", "h", "d", "wk", "$", "\\u00A2", ["Dividend: ", 1, ""], ["Dividend: ", 1, " (", 2, ")"], "Stock Dividend", ["Stock Dividend: ", 1, ""], ["Adjustment Factor: ", 1, ""], ["Split: ", 1, ""], "Loading", "No data available", "Premarket", "After hours", "Interval", "2min", "5min", "30min", "1d", "1w", "daily", "weekly", ["SMA(", 1, "):", 2, ""], ["EMA(", 1, "):", 2, ""], ["VMA(", 1, "):", 2, ""], ["RSI(", 1, ")"], ["RSI:", 1, ""], ["BIAS(", 1, ")"], ["BIAS:", 1, ""], ["W%R(", 1, ")"], ["%R:", 1, ""], ["MACD(", 1, ",", 2, ",", 3, ")"], ["MACD:", 1, ""], ["EMA:", 1, ""], ["DIFF:", 1, ""], ["DEA:", 1, ""], ["Divergence:", 1, ""], ["KDJ(", 1, ")"], ["K:", 1, ""], ["D:", 1, ""], ["J:", 1, ""], ["BOLL(", 1, ")"], ["MID:", 1, ""], ["UPPER:", 1, ""], ["LOWER:", 1, ""], ["FSTO(", 1, ",", 2, ")"], ["SSTO(", 1, ",", 2, ")"], ["%K:", 1, ""], ["%D:", 1, ""], ["CCI(", 1, ")"], ["CCI:", 1, ""], ["SMA(", 1, ",", 2, "):", 3, ""], ["EMA(", 1, ",", 2, "):", 3, ""], ["VMA(", 1, ",", 2, "):", 3, ""], ["RSI(", 1, ",", 2, ")"], ["BIAS(", 1, ",", 2, ")"], ["W%R(", 1, ",", 2, ")"], ["MACD(", 1, ",", 2, ",", 3, ",", 4, ")"], ["KDJ(", 1, ",", 2, ")"], ["BOLL(", 1, ",", 2, ")"], ["FSTO(", 1, ",", 2, ",", 3, ")"], ["SSTO(", 1, ",", 2, ",", 3, ")"], ["CCI(", 1, ",", 2, ")"], ""];

		static getMsg(msg: Messages, ...rest: any[]): string {
			if (isNaN(msg as number)) {
				return "";
			}

			if (rest.length === 0) {
				return Message.MESSAGES[msg] as string;
			}

			const parts = ((Message.MESSAGES[msg]) as string[]).concat();
			const length = parts.length;

			for (let i = 1; i < length; i += 2) {
				parts[i] = rest[Number(parts[i]) - 1];
			}

			return parts.join("");
		}

		static getLocale(): string {
			return "en";
		}
	}
