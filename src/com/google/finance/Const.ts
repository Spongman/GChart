/// <reference path="Messages.ts"/>
namespace com.google.finance
{
	export enum Intervals
	{
		INTRADAY = 0,
		FIVE_MINUTES,
		HALF_HOUR,
		DAILY,
		WEEKLY,
	}

	export enum QuoteTypes
	{
		COMPANY = 0,
		MUTUAL_FUND = 1,
		CURRENCY = 2,
		QUERY_INDEX = 3,
		PORTFOLIO = 4,
		BACKTESTING = 5,
	}

	export enum ScaleTypes
	{
		SCALE_MAX = 0,
		SCALE_10Y = 1,
		SCALE_5Y = 2,
		SCALE_1Y = 3,
		SCALE_YTD = 4,
		SCALE_6M = 5,
		SCALE_3M = 6,
		SCALE_1M = 7,
		SCALE_5D = 8,
		SCALE_3D = 9,
		SCALE_1D = 10,
	}

	export enum AddStreamResults
	{
		ERROR = -1,
		NOTHING = 0,
		FIRST_DATA = 1,
		ADDED_DATA = 2,
	}

	export enum Orientations
	{
		UP = 0,
		DOWN = 1,
		SIDEWAYS = 2,
		SIDEWAYS_UP = 2,
		SIDEWAYS_DOWN = 3,
	}

	export enum Directions
	{
		BACKWARD = 1,
		FORWARD = -1,
	}

	export enum ChartEventStyles
	{
		GET_1Y_DATA = 0,
		GET_5D_DATA = 1,
		GET_2Y_DATA = 2,
		GET_5Y_DATA = 3,
		GET_AH_DATA = 4,
		GET_3M_DATA = 5,
		MUTF_5D_DATA = 6,
		GET_40Y_DATA = 7,
		GET_10D_DATA = 8,
		GET_30D_DATA = 9,
		GET_RT_DATA = 10,
		GET_RT_AH_DATA = 11,
	}

	export enum ControllerComponents
	{
		SCROLL_BAR = 0,
		LEFT_BUTTON = 1,
		RIGHT_BUTTON = 2,
		LEFT_HANDLE = 3,
		RIGHT_HANDLE = 4,
		SCROLL_BG = 5,
	}

	export enum Snaps
	{
		SNAP_DAY = 0,
		SNAP_WEEK = 1,
		SNAP_MONTH = 2,
		SNAP_YEAR = 3,
	}

	export enum TickPositions
	{
		BOTTOM = 0,
		TOP = 1,
	}

	export class IntervalPeriod
	{
		constructor(
			public type: Intervals,
			public days: number,
			public maxdays: number,
			public mindays: number,
			public text: number, //TODO Messages,
			public logtext: string)
		{
		}
	}

	export class ScaleInterval
	{
		constructor(
			public type: ScaleTypes,
			public days: number,
			public months: number,
			public text: number,	// TODO: enum
			public logtext: string,
			public width: number
		)
		{
		}
	}

	export class Const
	{
		private static DETAIL_LEVEL_INFO: { [key: number]: number };
		private static INTERVAL_INFO: { [key: number]: Intervals };
		static APPLY_CHINESE_STYLE_MACD = false;
		static CHART_TYPE_BUTTONS_ENABLED = false;
		static DEFAULT_DISPLAY_DAYS = 3;
		static DEFAULT_DISPLAY_MINUTES = -1;
		static DISPLAY_DIVIDENDS_UNITS = "true";
		static DISPLAY_NEWS_PINS = false;
		static DOT_COLOR = 0x66dd;
		static ECN_LINE_CHART_FILL_COLOR = 0xf8f8f8;
		static ECN_LINE_CHART_LINE_COLOR = 0x666666;
		static ENABLE_COMPACT_FLAGS = "false";
		static ENABLE_CUSTOM_DATE_ENTRY = "false";
		static EXPAND_BUTTON_ENABLED = false;
		static INDICATOR_ENABLED = true;
		static INFO_TEXT_ALIGN = "right";
		static INFO_TEXT_TOP_PADDING = 0;
		static INTRADAY_INTERVAL = 2 * 60;
		static LINE_CHART_FILL_COLOR = 14807807;
		static LINE_CHART_LINE_COLOR = 0x66dd;
		static MIN_DISPLAY_DAYS = 1;
		static MOVIE_HEIGHT = 0;
		static MOVIE_WIDTH = 0;
		static NEGATIVE_DIFFERENCE_COLOR = 0xaa0033;
		static POSITIVE_DIFFERENCE_COLOR = 0x8000;
		static RANGE_TEXT_COLOR = 10275573;
		static readonly ACTIVE = 1;
		static readonly AFTER_HOURS_DISPLAY_NAME = "After Hours";
		static readonly AFTER_HOURS_NAME = "AFTER_HOURS";
		static readonly AH_DOT_COLOR = 0x666666;
		static readonly AH_VOLUME_LAYER = "AHVolumeLayer";
		static readonly BACKTESTING_PREFIX = "BACKTESTING:";
		static readonly BAR_WIDTH_RATIO = 0.7;
		static readonly BIAS = "BIAS";
		static readonly BollingerBands = "BollingerBands";
		static readonly BORDER_LINE_COLOR = 0x444444;
		static readonly BORDER_LINE_OPACITY = 1;
		static readonly BORDER_SHADOW_COLOR = 0xcccccc;
		static readonly BORDER_WIDTH = 2;
		static readonly BOTTOM_TICK_COLOR = 0;
		static readonly BOTTOM_VIEW_POINT = 2;
		static readonly BOTTOM_VIEW_POINT_NAME = "BottomViewPoint";
		static readonly BOTTOM_VIEWPOINT_HEADER_HEIGHT = 20;
		static readonly CANDLE_STICK = "CandleStickChartLayer";
		static readonly CCI = "CCI";
		static readonly COLOR_BLUE = 0x66dd;
		static readonly COLOR_GREEN = 0x339933;
		static readonly COLOR_PINK = 0xff00ff;
		static readonly COLOR_RED = 0xcc3300;
		static readonly COLOR_YELLOW = 16228618;
		static readonly COWBELL_THEME = 0;
		static readonly CURRENCY_PREFIX = "CURRENCY:";
		static readonly DAILY_DAYS = 270;
		static readonly DAILY_INTERVAL = 24 * 60 * 60;
		static readonly DATA_DELIMITER = ",";
		static readonly DATE_DEFAULT_BORDER_COLOR = 0xe8e8e8;
		static readonly DATE_HIGHLIGHTED_BACKGROUND_COLOR = 0xffffa0;
		static readonly DATE_HIGHLIGHTED_BORDER_COLOR = 0;
		static readonly DAY_LINE_ALPHA = 0.5;
		static readonly DAY_LINE_COLOR = 0xaabbaa;
		static readonly DAY_PER_WEEK = 7;
		static readonly DAYS = 1;
		static readonly DEFAULT_FLAG_HEIGHT = 25;
		static readonly DEFAULT_LAST_MARKET_WEEKDAY = 5;
		static readonly DEFAULT_MAX_RANGE = 10;
		static readonly DEFAULT_P = "5d";
		static readonly DEFAULT_Q = "NASD:GOOG";
		static readonly DEFAULT_WEEKDAY_BITMAP = 62;
		static readonly DIF_MKT_COMPARISON_MIN_DISPLAY_DAYS = 30;
		static readonly DYNAMIC = "dynamic";
		static readonly ECN_LINE_CHART_FILL_VISIBILITY = 0.6;
		static readonly ECN_LINE_CHART_LINE_THICKNESS = 0;
		static readonly ECN_LINE_CHART_LINE_VISIBILITY = 1;
		static readonly EMA = "EMA";
		static readonly FastStochastic = "FastStochastic";
		static readonly FIVE_MINUTE_DAYS = 10;
		static readonly FIVE_MINUTE_INTERVAL = 5 * 60;
		static readonly FIXED_VSCALE = "fixed";
		static readonly FORMAT_COMPACT = 0;
		static readonly FORMAT_EPOCH = 1;

		static readonly HALF_HOUR_DAYS = 30;
		static readonly HALF_HOUR_INTERVAL = 30 * 60;
		static readonly HORIZONTAL_GRID_COLOR = 14211311;
		static readonly HORIZONTAL_LINE_COLOR = 0x888888;
		static readonly HOUR_LINE_ALPHA = 100;
		static readonly HOUR_LINE_COLOR = 0xf5f5f5;
		static readonly INACTIVE = 0;
		static readonly INTRADAY_DAYS = 5;
		static readonly KDJ = "KDJ";
		static readonly LAST_DAY_CLOSE_LINE_COLOR = 0xaa0000;
		static readonly LINE_CHART = "IntervalBasedLineChartLayer";
		static readonly LINE_CHART_FILL_VISIBILITY = 0.6;
		static readonly LINE_CHART_LINE_THICKNESS = 0;
		static readonly LINE_CHART_LINE_VISIBILITY = 1;
		static readonly LINEAR_VSCALE = "Linear";
		static readonly LOADING_WIDTH = 60;
		static readonly LOG_SCALE = 10;
		static readonly LOG_SCALE_LOG = Math.LN10;
		static readonly LOG_VSCALE = "logarithmic";
		static readonly MACD = "MACD";
		static readonly MAIN_VIEW_POINT = 1;
		static readonly MAIN_VIEW_POINT_NAME = "MainViewPoint";
		static readonly MARKET_CLOSE_MINUTE = 16 * 60;
		static readonly MARKET_DAY_LENGTH = 391;
		static readonly MARKET_OPEN_MINUTE = 570;
		static readonly MAX_RELOAD_TRIES = 1;
		static readonly MAX_VSCALE = "maximized";
		static readonly MIN_DAY_WIDTH_FOR_INTRADAY = 30;
		static readonly MIN_FLAG_DISTANCE = 15;
		static readonly MIN_PER_DAY = 24 * 60;
		static readonly MNTS = 0;
		static readonly MS_PER_DAY = 24 * 60 * 60 * 1000;
		static readonly MS_PER_MINUTE = 60 * 1000;
		static readonly MUTUAL_FUND_PREFIX = "MUTF(_.*?)?:";
		static readonly NEW_LOG_VSCALE = "Logarithmic";
		static readonly NO_BUTTON_TEXT = -1;
		static readonly NORMAL_THEME = 1;
		static readonly OHLC_CHART = "OhlcChartLayer";
		static readonly PAGE_LEFT_BUTTON = 6;
		static readonly PAGE_RIGHT_BUTTON = 7;
		static readonly PASSIVE_LINE_LAYER = "PassiveLineLayer";
		static readonly PORTFOLIO_PREFIX = "PORTFOLIO:";
		static readonly PRE_MARKET_DISPLAY_NAME = "Premarket";
		static readonly PRE_MARKET_NAME = "PREMARKET";
		static readonly PRICE_SCALE = 0;
		static readonly QUERY_INDEX_PREFIX = "GOOGLEINDEX(_.*?)?:";
		static readonly REALTIME_CHART_POLLING_INTERVAL = 6 * 1000;
		static readonly REALTIME_CHART_POLLING_MARGIN = 60;
		static readonly REGULAR_MARKET_DISPLAY_NAME = "";
		static readonly REGULAR_MARKET_NAME = "REGULAR_MARKET_HOURS";
		static readonly ROLL_OUT = "onRollOut";
		static readonly ROLL_OVER = "onRollOver";
		static readonly RSI = "RSI";
		static readonly SCALE_BUTTON_HEIGHT = 15;
		static readonly SCALE_BUTTON_WIDTH = 21;
		static readonly SCALE_CUSTOM = 11;
		static readonly SCROLL_HEIGHT = 12;
		static readonly SEC_PER_MINUTE = 60;
		static readonly SELECTING_FILL_COLOR = 14082790;
		static readonly SELECTING_LINE_COLOR = 11125708;
		static readonly SHOW_SPARKLINE = "true";
		static readonly SlowStochastic = "SlowStochastic";
		static readonly SMA = "SMA";
		static readonly SPACE_HEIGHT = 25;
		static readonly SPARK_PADDING = 6;
		static readonly SPARKLINE_VIEW_POINT_NAME = "TopViewPoint";
		static readonly STATIC = "static";
		static readonly TECHNICAL_INDICATOR_HEIGHT = 80;
		static readonly TOP_TICK_COLOR = 7897737;
		static readonly TOP_VIEW_POINT = 0;
		static readonly VMA = "VMA";
		static readonly VOLUME_CHART = "VolumeLinesChartLayer";
		static readonly VOLUME_INDICATOR_NAME = "Volume";
		static readonly VOLUME_SCALE = 1;
		static readonly VOLUME_SCALES = [100, 250, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000, 500000, 1000000, 2000000, 5000000, 10000000];
		static readonly WEEKDAY_PER_WEEK = 5;
		static readonly WEEKLY_INTERVAL = 7 * 24 * 60 * 60;
		static readonly WilliamsPercentR = "WilliamsPercentR";
		static readonly WINDOW_LAYER = "WindowLayer";
		static readonly YEAR_2000 = 946684800000;
		static readonly YSCALE_INTERVALS = [0.00001, 0.000025, 0.00005, 0.0001, 0.00025, 0.0005, 0.001, 0.0025, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000, 500000, 1000000, 2000000, 5000000, 10000000, 20000000, 50000000, 100000000, 200000000, 500000000, 1000000000, 2000000000, 5000000000, 10000000000, 20000000000, 50000000000, 100000000000, 200000000000, 500000000000, 1000000000000, 2000000000000, 5000000000000, 10000000000000, 20000000000000, 50000000000000, 100000000000000, 200000000000000, 500000000000000, 1000000000000000, 2000000000000000, 5000000000000000, 10000000000000000, 20000000000000000, 50000000000000000, 100000000000000000, 200000000000000000, 500000000000000000, 1000000000000000000, 2000000000000000000, 5000000000000000000];
		static readonly ZERO_PERCENT_LINE_COLOR = 8015181;
		static readonly ZH_CN_LOCALE = "zh_CN";
		static readonly ZH_HK_LOCALE = "zh_HK";
		static readonly ZH_TW_LOCALE = "zh_TW";
		static REALTIME_CHART_ENABLED = false;
		static SHRINK_BUTTON_ENABLED = false;
		static SPARK_ACTIVE_FILL_COLOR = 15595519;
		static SPARK_ACTIVE_LINE_COLOR = 0x66dd;
		static SPARK_INACTIVE_FILL_COLOR = 0xf8f8f8;
		static SPARK_INACTIVE_LINE_COLOR = 0xdddddd;
		static SPARKLINE_HEIGHT = 58;
		static TEXT_BACKGROUND_COLOR = 12967159;
		static VOLUME_HIGHLIGHT_COLOR = 0x3366ff;
		static VOLUME_PLUS_ENABLED = false;

		static readonly INDICATOR_PARAMETERS: Map<any[]> = {
			BIAS: [{ period: 14 }],
			CCI: [{ period: 20 }],
			KDJ: [{ period: 14 }],
			MACD: [{
				shortPeriod: 12,
				longPeriod: 26,
				emaPeriod: 9
			}],
			RSI: [{ period: 14 }],
			SMA: [{ period: 20 }],
			EMA: [{ period: 20 }],
			VMA: [{ period: 20 }],
			WilliamsPercentR: [{ period: 14 }],
			BollingerBands: [{ period: 20 }],
			FastStochastic: [{
				kPeriod: 14,
				dPeriod: 3
			}],
			SlowStochastic: [{
				kPeriod: 14,
				dPeriod: 3
			}]
		};

		static readonly SCALE_INTERVALS = [
			new ScaleInterval(ScaleTypes.SCALE_MAX, 10000, 480, Messages.ZOOM_ALL, "max", 24),
			new ScaleInterval(ScaleTypes.SCALE_10Y, 3100, 2 * 60, Messages.ZOOM_10Y, "10y", 20),
			new ScaleInterval(ScaleTypes.SCALE_5Y, 1550, 60, Messages.ZOOM_5Y, "5y", 17),
			new ScaleInterval(ScaleTypes.SCALE_1Y, 250, 12, Messages.ZOOM_1Y, "1y", 17),
			new ScaleInterval(ScaleTypes.SCALE_YTD, 3 * 60, 100, Messages.ZOOM_YTD, "ytd", 24),
			new ScaleInterval(ScaleTypes.SCALE_6M, 2 * 60, 6, Messages.ZOOM_6M, "6m", 17),
			new ScaleInterval(ScaleTypes.SCALE_3M, 60, 3, Messages.ZOOM_3M, "3m", 17),
			new ScaleInterval(ScaleTypes.SCALE_1M, 20, 1, Messages.ZOOM_1M, "1m", 17),
			new ScaleInterval(ScaleTypes.SCALE_5D, 5, 0, Messages.ZOOM_5D, "5d", 15),
			new ScaleInterval(ScaleTypes.SCALE_3D, 3, 0, Const.NO_BUTTON_TEXT, "3d", 0),
			new ScaleInterval(ScaleTypes.SCALE_1D, 1, 0, Messages.ZOOM_1D, "1d", 15)
		];

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
			Intervals.INTRADAY,
			Intervals.FIVE_MINUTES,
			Intervals.HALF_HOUR,
			Intervals.DAILY,
			Intervals.WEEKLY
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
		static readonly VOLUME_DEPENDENT_INDICATOR_NAMES = [
			Const.VMA
		];
		static readonly DEPENDENT_INDICATOR_NAMES = [
			Const.SMA,
			Const.EMA,
			Const.BollingerBands
		];
		static readonly VOLUME_PLUS_CHART_TYPE = [
			Const.CANDLE_STICK,
			Const.OHLC_CHART
		];

		static readonly INTERVAL_PERIODS = [
			new IntervalPeriod(Intervals.INTRADAY, 1, 1, 0.2, Messages.INTERVAL_2_MINUTES, "2min"),
			new IntervalPeriod(Intervals.FIVE_MINUTES, 2, 3, 0.4, Messages.INTERVAL_5_MINUTES, "5min"),
			new IntervalPeriod(Intervals.HALF_HOUR, 10, 15, 2, Messages.INTERVAL_30_MINUTES, "30min"),
			new IntervalPeriod(Intervals.DAILY, 2 * 60, 200, 24, Messages.INTERVAL_DAILY, "daily"),
			new IntervalPeriod(Intervals.WEEKLY, 10 * 60, 1000, 2 * 60, Messages.INTERVAL_WEEKLY, "weekly"),
		];

		static DEFAULT_D = Intervals.DAILY;
		static readonly DEFAULT_I = "" + Const.INTRADAY_INTERVAL;
		static DEFAULT_CHART_STYLE_NAME = Const.LINE_CHART;

		private static _staticConstructor = (() =>
		{
			Const.INTERVAL_INFO = {};
			Const.INTERVAL_INFO[Const.INTRADAY_INTERVAL] = Intervals.INTRADAY;
			Const.INTERVAL_INFO[Const.FIVE_MINUTE_INTERVAL] = Intervals.FIVE_MINUTES;
			Const.INTERVAL_INFO[Const.HALF_HOUR_INTERVAL] = Intervals.HALF_HOUR;
			Const.INTERVAL_INFO[Const.DAILY_INTERVAL] = Intervals.DAILY;
			Const.INTERVAL_INFO[Const.WEEKLY_INTERVAL] = Intervals.WEEKLY;

			Const.DETAIL_LEVEL_INFO = {};
			Const.DETAIL_LEVEL_INFO[Intervals.INTRADAY] = Const.INTRADAY_INTERVAL;
			Const.DETAIL_LEVEL_INFO[Intervals.FIVE_MINUTES] = Const.FIVE_MINUTE_INTERVAL;
			Const.DETAIL_LEVEL_INFO[Intervals.HALF_HOUR] = Const.HALF_HOUR_INTERVAL;
			Const.DETAIL_LEVEL_INFO[Intervals.DAILY] = Const.DAILY_INTERVAL;
			Const.DETAIL_LEVEL_INFO[Intervals.WEEKLY] = Const.WEEKLY_INTERVAL;
		})();

		static getDetailLevelInterval(interval: Intervals): number
		{
			return Const.DETAIL_LEVEL_INFO[interval];
		}

		static getIntervalDetailLevel(param1: number): Intervals
		{
			return Const.INTERVAL_INFO[param1];
		}

		static getZoomLevel(param1: number, param2: number): number
		{
			const scaleIntervals = Const.SCALE_INTERVALS;
			let scaleIntervalIndex = scaleIntervals.length - 1;
			while (scaleIntervals[scaleIntervalIndex].days * param2 < Math.floor(param1) && scaleIntervalIndex > 0)
				scaleIntervalIndex--;

			return scaleIntervalIndex;
		}

		static getQuoteType(param1: string): QuoteTypes
		{
			if (param1.indexOf(Const.CURRENCY_PREFIX) === 0)
				return QuoteTypes.CURRENCY;

			if (param1.indexOf(Const.PORTFOLIO_PREFIX) === 0)
				return QuoteTypes.PORTFOLIO;

			if (param1.indexOf(Const.BACKTESTING_PREFIX) === 0)
				return QuoteTypes.BACKTESTING;

			if (param1.search(Const.MUTUAL_FUND_PREFIX) === 0)
				return QuoteTypes.MUTUAL_FUND;

			if (param1.search(Const.QUERY_INDEX_PREFIX) === 0)
				return QuoteTypes.QUERY_INDEX;

			return QuoteTypes.COMPANY;
		}

		static getDefaultDisplayDays(param1 = false): number
		{
			if (Const.DEFAULT_DISPLAY_MINUTES !== -1)
			{
				const dayLength = !!param1 ? 1 : Const.MARKET_DAY_LENGTH;
				return Const.DEFAULT_DISPLAY_MINUTES / dayLength;
			}
			return Const.DEFAULT_DISPLAY_DAYS;
		}

		static isZhLocale(param1: string): boolean
		{
			return param1 === Const.ZH_CN_LOCALE || param1 === Const.ZH_HK_LOCALE || param1 === Const.ZH_TW_LOCALE;
		}
	}
}
