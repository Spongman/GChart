/// <reference path="Messages.ts"/>
namespace com.google.finance
{
	export class Const
	{
		static readonly FIRST_DATA = 1;
		static DEFAULT_DISPLAY_MINUTES = -1;
		static readonly HORIZONTAL_GRID_COLOR = 14211311;
		static DISPLAY_NEWS_PINS = false;
		static readonly MUTUAL_FUND = 1;
		static readonly CURRENCY = 2;
		static readonly LOG_VSCALE = "logarithmic";
		static SHRINK_BUTTON_ENABLED = false;
		static readonly MIN_FLAG_DISTANCE = 15;
		static readonly DYNAMIC = "dynamic";
		static readonly DEFAULT_WEEKDAY_BITMAP = 62;
		static readonly SIDEWAYS_UP = 2;
		static readonly WINDOW_LAYER = "WindowLayer";
		static readonly MIN_PER_DAY = 24 * 60;
		static readonly NEW_LOG_VSCALE = "Logarithmic";
		static readonly DEFAULT_FLAG_HEIGHT = 25;
		static readonly LINE_CHART = "IntervalBasedLineChartLayer";
		static readonly CANDLE_STICK = "CandleStickChartLayer";
		static readonly OHLC_CHART = "OhlcChartLayer";
		static readonly WilliamsPercentR = "WilliamsPercentR";
		static readonly KDJ = "KDJ";
		static readonly RSI = "RSI";
		static readonly PASSIVE_LINE_LAYER = "PassiveLineLayer";
		static readonly FastStochastic = "FastStochastic";
		static readonly SlowStochastic = "SlowStochastic";
		static readonly BollingerBands = "BollingerBands";
		static readonly VOLUME_CHART = "VolumeLinesChartLayer";
		static readonly VOLUME_INDICATOR_NAME = "Volume";
		static readonly MAIN_VIEW_POINT_NAME = "MainViewPoint";
		static readonly AFTER_HOURS_NAME = "AFTER_HOURS";
		static readonly REGULAR_MARKET_NAME = "REGULAR_MARKET_HOURS";
		static readonly PRE_MARKET_NAME = "PREMARKET";
		static readonly SPARKLINE_VIEW_POINT_NAME = "TopViewPoint";
		static readonly REGULAR_MARKET_DISPLAY_NAME = "";
		static readonly AFTER_HOURS_DISPLAY_NAME = "After Hours";
		static readonly PRE_MARKET_DISPLAY_NAME = "Premarket";
		static readonly BOTTOM_VIEW_POINT_NAME = "BottomViewPoint";
		static readonly CCI = "CCI";
		static readonly INTRADAY = 0;
		static readonly WEEKLY = 4;
		static readonly FIVE_MINUTES = 1;
		static readonly HALF_HOUR = 2;
		static readonly DAILY = 3;
		static readonly MACD = "MACD";
		static readonly SMA = "SMA";
		static readonly BIAS = "BIAS";


		static readonly GET_5Y_DATA = 3;
		static readonly DAILY_INTERVAL = 24 * 60 * 60;
		static readonly LOG_SCALE = 10;
		static readonly NORMAL_THEME = 1;
		static readonly SCALE_CUSTOM = 11;
		static readonly DAYS = 1;
		static readonly COMPANY = 0;
		static readonly GET_40Y_DATA = 7;
		static readonly BACKTESTING_PREFIX = "BACKTESTING:";
		static readonly SEC_PER_MINUTE = 60;
		static readonly ROLL_OUT = "onRollOut";
		static readonly MAX_RELOAD_TRIES = 1;
		static readonly SPARK_PADDING = 6;
		static readonly VMA = "VMA";
		static readonly HOUR_LINE_COLOR = 0xf5f5f5;
		static readonly GET_RT_AH_DATA = 11;
		static ENABLE_COMPACT_FLAGS = "false";
		static readonly INACTIVE = 0;
		static readonly LAST_DAY_CLOSE_LINE_COLOR = 0xaa0000;
		static readonly SCALE_BUTTON_HEIGHT = 15;
		static NEGATIVE_DIFFERENCE_COLOR = 0xaa0033;
		static readonly GET_10D_DATA = 8;
		static readonly BORDER_SHADOW_COLOR = 0xcccccc;
		static readonly EMA = "EMA";
		static readonly NO_BUTTON_TEXT = -1;
		static readonly TOP_VIEW_POINT = 0;
		static readonly DOWN = 1;
		static DOT_COLOR = 0x66dd;
		static readonly SCALE_MAX = 0;
		static VOLUME_HIGHLIGHT_COLOR = 0x3366ff;
		static readonly BOTTOM_TICK_COLOR = 0;
		static readonly GET_AH_DATA = 4;
		static readonly PAGE_LEFT_BUTTON = 6;
		static readonly LOADING_WIDTH = 60;
		static readonly HALF_HOUR_DAYS = 30;
		static INDICATOR_ENABLED = true;
		static readonly ZH_CN_LOCALE = "zh_CN";
		static readonly AH_VOLUME_LAYER = "AHVolumeLayer";
		static readonly MARKET_DAY_LENGTH = 391;
		static readonly LINEAR_VSCALE = "Linear";
		static readonly COLOR_YELLOW = 16228618;
		static readonly ECN_LINE_CHART_FILL_VISIBILITY = 0.6;
		static readonly COLOR_PINK = 0xff00ff;
		static SPARKLINE_HEIGHT = 58;
		static readonly QUERY_INDEX_PREFIX = "GOOGLEINDEX(_.*?)?:";
		static SPARK_ACTIVE_LINE_COLOR = 0x66dd;

		static readonly SIDEWAYS_DOWN = 3;
		static readonly PORTFOLIO = 4;
		static readonly BORDER_LINE_COLOR = 0x444444;
		static readonly TOP = 1;
		static MOVIE_HEIGHT = 0;

		static readonly SIDEWAYS = 2;
		static readonly ZH_HK_LOCALE = "zh_HK";
		static readonly VOLUME_SCALES = [100, 250, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000, 500000, 1000000, 2000000, 5000000, 10000000];
		static readonly WEEKDAY_PER_WEEK = 5;
		private static DETAIL_LEVEL_INFO: { [key: number]: number };
		static SPARK_INACTIVE_FILL_COLOR = 0xf8f8f8;
		static readonly LEFT_HANDLE = 3;
		static readonly SCALE_1D = 10;
		static readonly SCALE_10Y = 1;
		static readonly SCALE_1Y = 3;
		static readonly SCALE_YTD = 4;
		static readonly DATE_HIGHLIGHTED_BORDER_COLOR = 0;
		static readonly SHOW_SPARKLINE = "true";
		static readonly SCALE_1M = 7;
		static readonly COLOR_RED = 0xcc3300;
		static readonly MARKET_CLOSE_MINUTE = 16 * 60;
		static readonly SNAP_DAY = 0;
		static readonly PORTFOLIO_PREFIX = "PORTFOLIO:";
		static INFO_TEXT_ALIGN = "right";
		static LINE_CHART_FILL_COLOR = 14807807;
		static readonly FIVE_MINUTE_DAYS = 10;
		static readonly REALTIME_CHART_POLLING_INTERVAL = 6 * 1000;
		static readonly MAIN_VIEW_POINT = 1;
		static readonly MUTUAL_FUND_PREFIX = "MUTF(_.*?)?:";
		static readonly SCALE_3D = 9;
		static readonly SCALE_3M = 6;
		static readonly BOTTOM_VIEWPOINT_HEADER_HEIGHT = 20;
		static readonly DEFAULT_P = "5d";
		static readonly DEFAULT_Q = "NASD:GOOG";
		static readonly HALF_HOUR_INTERVAL = 30 * 60;
		static readonly SNAP_MONTH = 2;
		static readonly DEFAULT_MAX_RANGE = 10;
		static TEXT_BACKGROUND_COLOR = 12967159;
		static readonly BAR_WIDTH_RATIO = 0.7;
		static readonly RIGHT_HANDLE = 4;
		static readonly DAY_LINE_ALPHA = 0.5;
		static readonly FIXED_VSCALE = "fixed";
		static readonly ECN_LINE_CHART_LINE_VISIBILITY = 1;
		static readonly ERROR = -1;
		static readonly BOTTOM_VIEW_POINT = 2;
		static readonly SCALE_5D = 8;
		static readonly MAX_VSCALE = "maximized";
		static readonly YSCALE_INTERVALS = [0.00001, 0.000025, 0.00005, 0.0001, 0.00025, 0.0005, 0.001, 0.0025, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000, 500000, 1000000, 2000000, 5000000, 10000000, 20000000, 50000000, 100000000, 200000000, 500000000, 1000000000, 2000000000, 5000000000, 10000000000, 20000000000, 50000000000, 100000000000, 200000000000, 500000000000, 1000000000000, 2000000000000, 5000000000000, 10000000000000, 20000000000000, 50000000000000, 100000000000000, 200000000000000, 500000000000000, 1000000000000000, 2000000000000000, 5000000000000000, 10000000000000000, 20000000000000000, 50000000000000000, 100000000000000000, 200000000000000000, 500000000000000000, 1000000000000000000, 2000000000000000000, 5000000000000000000];
		static readonly SCALE_5Y = 2;
		static ECN_LINE_CHART_FILL_COLOR = 0xf8f8f8;
		static readonly DIF_MKT_COMPARISON_MIN_DISPLAY_DAYS = 30;
		static RANGE_TEXT_COLOR = 10275573;
		static readonly MUTF_5D_DATA = 6;
		static readonly SCALE_6M = 5;
		static readonly SELECTING_FILL_COLOR = 14082790;
		static readonly FORMAT_EPOCH = 1;
		static readonly MARKET_OPEN_MINUTE = 570;
		static readonly BOTTOM = 0;
		static APPLY_CHINESE_STYLE_MACD = false;
		static readonly HORIZONTAL_LINE_COLOR = 0x888888;
		static readonly TECHNICAL_INDICATOR_HEIGHT = 80;

		static readonly INDICATOR_PARAMETERS: { [key: string]: any[] } = {
			"BIAS": [{ "period": 14 }],
			"CCI": [{ "period": 20 }],
			"KDJ": [{ "period": 14 }],
			"MACD": [{
				"shortPeriod": 12,
				"longPeriod": 26,
				"emaPeriod": 9
			}],
			"RSI": [{ "period": 14 }],
			"SMA": [{ "period": 20 }],
			"EMA": [{ "period": 20 }],
			"VMA": [{ "period": 20 }],
			"WilliamsPercentR": [{ "period": 14 }],
			"BollingerBands": [{ "period": 20 }],
			"FastStochastic": [{
				"kPeriod": 14,
				"dPeriod": 3
			}],
			"SlowStochastic": [{
				"kPeriod": 14,
				"dPeriod": 3
			}]
		};

		static INFO_TEXT_TOP_PADDING = 0;
		static readonly GET_30D_DATA = 9;
		static readonly GET_3M_DATA = 5;
		static ENABLE_CUSTOM_DATE_ENTRY = "false";
		static readonly QUERY_INDEX = 3;
		static readonly STATIC = "static";
		static readonly DATE_HIGHLIGHTED_BACKGROUND_COLOR = 0xffffa0;
		static readonly LEFT_BUTTON = 1;
		static readonly HOUR_LINE_ALPHA = 100;
		static readonly GET_2Y_DATA = 2;
		static readonly CURRENCY_PREFIX = "CURRENCY:";
		static VOLUME_PLUS_ENABLED = false;
		static readonly PAGE_RIGHT_BUTTON = 7;
		static readonly ZERO_PERCENT_LINE_COLOR = 8015181;
		static readonly PRICE_SCALE = 0;
		static readonly AH_DOT_COLOR = 0x666666;
		static readonly UP = 0;
		static readonly FORWARD = -1;
		static readonly SPACE_HEIGHT = 25;
		static readonly DATE_DEFAULT_BORDER_COLOR = 0xe8e8e8;
		static readonly LINE_CHART_FILL_VISIBILITY = 0.6;
		static readonly WEEKLY_INTERVAL = 7 * 24 * 60 * 60;
		static readonly ECN_LINE_CHART_LINE_THICKNESS = 0;
		static MIN_DISPLAY_DAYS = 1;
		static readonly FORMAT_COMPACT = 0;
		static readonly REALTIME_CHART_POLLING_MARGIN = 60;
		static readonly LINE_CHART_LINE_THICKNESS = 0;
		static readonly SCROLL_HEIGHT = 12;
		static readonly RIGHT_BUTTON = 2;
		static readonly DAILY_DAYS = 270;
		static readonly COLOR_GREEN = 0x339933;
		static readonly SCROLL_BG = 5;
		static readonly FIVE_MINUTE_INTERVAL = 5 * 60;
		static readonly ACTIVE = 1;
		static SPARK_INACTIVE_LINE_COLOR = 0xdddddd;
		static readonly COWBELL_THEME = 0;
		static CHART_TYPE_BUTTONS_ENABLED = false;
		static readonly BACKTESTING = 5;
		static readonly GET_5D_DATA = 1;
		static DEFAULT_DISPLAY_DAYS = 3;
		static readonly LOG_SCALE_LOG = Math.LN10;
		static readonly GET_1Y_DATA = 0;
		static LINE_CHART_LINE_COLOR = 0x66dd;
		static POSITIVE_DIFFERENCE_COLOR = 0x8000;
		static readonly SNAP_WEEK = 1;
		static readonly SCALE_BUTTON_WIDTH = 21;

		static readonly DAY_PER_WEEK = 7;
		static SPARK_ACTIVE_FILL_COLOR = 15595519;
		static INTRADAY_INTERVAL = 2 * 60;
		static readonly TOP_TICK_COLOR = 7897737;
		static readonly ROLL_OVER = "onRollOver";
		static EXPAND_BUTTON_ENABLED = false;
		static readonly INTRADAY_DAYS = 5;
		static readonly GET_RT_DATA = 10;
		static readonly SCROLL_BAR = 0;
		static readonly YEAR_2000 = 946684800000;
		static readonly DATA_DELIMITER = ",";
		static readonly SNAP_YEAR = 3;
		static readonly MIN_DAY_WIDTH_FOR_INTRADAY = 30;
		static readonly MS_PER_DAY = 24 * 60 * 60 * 1000;
		static readonly ADDED_DATA = 2;
		static readonly NOTHING = 0;
		static readonly DEFAULT_LAST_MARKET_WEEKDAY = 5;
		static readonly LINE_CHART_LINE_VISIBILITY = 1;
		static ECN_LINE_CHART_LINE_COLOR = 0x666666;
		static MOVIE_WIDTH = 0;
		static readonly ZH_TW_LOCALE = "zh_TW";
		static readonly VOLUME_SCALE = 1;
		static readonly SELECTING_LINE_COLOR = 11125708;
		static readonly MS_PER_MINUTE = 60 * 1000;
		static readonly BORDER_LINE_OPACITY = 1;
		static readonly DAY_LINE_COLOR = 0xaabbaa;
		static readonly COLOR_BLUE = 0x66dd;
		static readonly MNTS = 0;
		static readonly BORDER_WIDTH = 2;
		static readonly BACKWARD = 1;
		static REALTIME_CHART_ENABLED = false;
		private static INTERVAL_INFO: { [key: number]: number };
		static DISPLAY_DIVIDENDS_UNITS = "true";



		static readonly SCALE_INTERVALS = [{
			"type": Const.SCALE_MAX,
			"days": 10000,
			"months": 480,
			"text": Messages.ZOOM_ALL,
			"logtext": "max",
			"width": 24
		}, {
			"type": Const.SCALE_10Y,
			"days": 3100,
			"months": 2 * 60,
			"text": Messages.ZOOM_10Y,
			"logtext": "10y",
			"width": 20
		}, {
			"type": Const.SCALE_5Y,
			"days": 1550,
			"months": 60,
			"text": Messages.ZOOM_5Y,
			"logtext": "5y",
			"width": 17
		}, {
			"type": Const.SCALE_1Y,
			"days": 250,
			"months": 12,
			"text": Messages.ZOOM_1Y,
			"logtext": "1y",
			"width": 17
		}, {
			"type": Const.SCALE_YTD,
			"days": 3 * 60,
			"months": 100,
			"text": Messages.ZOOM_YTD,
			"logtext": "ytd",
			"width": 24
		}, {
			"type": Const.SCALE_6M,
			"days": 2 * 60,
			"months": 6,
			"text": Messages.ZOOM_6M,
			"logtext": "6m",
			"width": 17
		}, {
			"type": Const.SCALE_3M,
			"days": 60,
			"months": 3,
			"text": Messages.ZOOM_3M,
			"logtext": "3m",
			"width": 17
		}, {
			"type": Const.SCALE_1M,
			"days": 20,
			"months": 1,
			"text": Messages.ZOOM_1M,
			"logtext": "1m",
			"width": 17
		}, {
			"type": Const.SCALE_5D,
			"days": 5,
			"months": 0,
			"text": Messages.ZOOM_5D,
			"logtext": "5d",
			"width": 15
		}, {
			"type": Const.SCALE_3D,
			"days": 3,
			"months": 0,
			"text": Const.NO_BUTTON_TEXT,
			"logtext": "3d",
			"width": 0
		}, {
			"type": Const.SCALE_1D,
			"days": 1,
			"months": 0,
			"text": Messages.ZOOM_1D,
			"logtext": "1d",
			"width": 15
		}];



		static readonly CHART_STYLE_NAMES = [
			Const.LINE_CHART,
			Const.CANDLE_STICK,
			Const.OHLC_CHART
		];
		static readonly OHLC_DEPENDENT_INDICATOR_NAMES = [
			Const.WilliamsPercentR,
			Const.KDJ,
			Const.FastStochastic,
			Const.SlowStochastic,
			Const.CCI
		];
		static readonly DETAIL_LEVELS = [
			Const.INTRADAY,
			Const.FIVE_MINUTES,
			Const.HALF_HOUR,
			Const.DAILY,
			Const.WEEKLY
		];
		static readonly INDEPENDENT_INDICATOR_NAMES = [
			Const.MACD,
			Const.RSI,
			Const.WilliamsPercentR,
			Const.KDJ,
			Const.BIAS,
			Const.FastStochastic,
			Const.SlowStochastic,
			Const.CCI
		];


		static readonly INTERVAL_PERIODS = [{
			"type": Const.INTRADAY,
			"days": 1,
			"maxdays": 1,
			"mindays": 0.2,
			"text": Messages.INTERVAL_2_MINUTES,
			"logtext": "2min"
		}, {
			"type": Const.FIVE_MINUTES,
			"days": 2,
			"maxdays": 3,
			"mindays": 0.4,
			"text": Messages.INTERVAL_5_MINUTES,
			"logtext": "5min"
		}, {
			"type": Const.HALF_HOUR,
			"days": 10,
			"maxdays": 15,
			"mindays": 2,
			"text": Messages.INTERVAL_30_MINUTES,
			"logtext": "30min"
		}, {
			"type": Const.DAILY,
			"days": 2 * 60,
			"maxdays": 200,
			"mindays": 24,
			"text": Messages.INTERVAL_DAILY,
			"logtext": "daily"
		}, {
			"type": Const.WEEKLY,
			"days": 10 * 60,
			"maxdays": 1000,
			"mindays": 2 * 60,
			"text": Messages.INTERVAL_WEEKLY,
			"logtext": "weekly"
		}];


		static DEFAULT_D = Const.DAILY;
		static readonly DEFAULT_I = "" + Const.INTRADAY_INTERVAL;
		static DEFAULT_CHART_STYLE_NAME = Const.LINE_CHART;
		static readonly VOLUME_DEPENDENT_INDICATOR_NAMES = [Const.VMA];
		static readonly DEPENDENT_INDICATOR_NAMES = [Const.SMA, Const.EMA, Const.BollingerBands];
		static readonly VOLUME_PLUS_CHART_TYPE = [Const.CANDLE_STICK, Const.OHLC_CHART];


		private static initIntervalInfo() 
		{
			Const.INTERVAL_INFO = {};
			Const.INTERVAL_INFO[Const.INTRADAY_INTERVAL] = Const.INTRADAY;
			Const.INTERVAL_INFO[Const.FIVE_MINUTE_INTERVAL] = Const.FIVE_MINUTES;
			Const.INTERVAL_INFO[Const.HALF_HOUR_INTERVAL] = Const.HALF_HOUR;
			Const.INTERVAL_INFO[Const.DAILY_INTERVAL] = Const.DAILY;
			Const.INTERVAL_INFO[Const.WEEKLY_INTERVAL] = Const.WEEKLY;
		}

		static getDetailLevelInterval(param1: number): number
		{
			if (!Const.DETAIL_LEVEL_INFO)
				Const.initDetailLevelInfo();

			return Const.DETAIL_LEVEL_INFO[param1];
		}

		static getIntervalDetailLevel(param1: number): number
		{
			if (!Const.INTERVAL_INFO)
				Const.initIntervalInfo();

			return Const.INTERVAL_INFO[param1];
		}

		static getZoomLevel(param1: number, param2: number): number
		{
			const _loc3_ = Const.SCALE_INTERVALS;
			let _loc4_ = _loc3_.length - 1;
			while (_loc3_[_loc4_].days * param2 < Math.floor(param1) && _loc4_ > 0)
			{
				_loc4_--;
			}
			return _loc4_;
		}

		static getQuoteType(param1: string): number
		{
			if (param1.indexOf(Const.CURRENCY_PREFIX) === 0)
				return Const.CURRENCY;

			if (param1.indexOf(Const.PORTFOLIO_PREFIX) === 0)
				return Const.PORTFOLIO;

			if (param1.indexOf(Const.BACKTESTING_PREFIX) === 0)
				return Const.BACKTESTING;

			if (param1.search(Const.MUTUAL_FUND_PREFIX) === 0)
				return Const.MUTUAL_FUND;

			if (param1.search(Const.QUERY_INDEX_PREFIX) === 0)
				return Const.QUERY_INDEX;

			return Const.COMPANY;
		}

		static getDefaultDisplayDays(param1 = false): number
		{
			if (Const.DEFAULT_DISPLAY_MINUTES !== -1)
			{
				const _loc2_ = !!param1 ? 1 : Const.MARKET_DAY_LENGTH;
				return Const.DEFAULT_DISPLAY_MINUTES / _loc2_;
			}
			return Const.DEFAULT_DISPLAY_DAYS;
		}

		private static initDetailLevelInfo() 
		{
			Const.DETAIL_LEVEL_INFO = {};
			Const.DETAIL_LEVEL_INFO[Const.INTRADAY] = Const.INTRADAY_INTERVAL;
			Const.DETAIL_LEVEL_INFO[Const.FIVE_MINUTES] = Const.FIVE_MINUTE_INTERVAL;
			Const.DETAIL_LEVEL_INFO[Const.HALF_HOUR] = Const.HALF_HOUR_INTERVAL;
			Const.DETAIL_LEVEL_INFO[Const.DAILY] = Const.DAILY_INTERVAL;
			Const.DETAIL_LEVEL_INFO[Const.WEEKLY] = Const.WEEKLY_INTERVAL;
		}

		static isZhLocale(param1: string): boolean
		{
			return param1 === Const.ZH_CN_LOCALE || param1 === Const.ZH_HK_LOCALE || param1 === Const.ZH_TW_LOCALE;
		}
	}
}
