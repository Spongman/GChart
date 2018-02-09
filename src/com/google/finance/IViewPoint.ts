import { Bounds } from './Bounds';
import { Directions } from './Const';
import { AbstractLayer } from './AbstractLayer';
import { Dictionary } from '../../../Global';
import { TextFormat } from '../../../flash/text/TextField';
import { Sprite } from '../../../flash/display/Sprite';
import { DataUnit } from './DataUnit';
import { DataSeries } from './DataSeries';
import { DataSource } from './DataSource';

export interface ViewPointState {
	count: number;
	lastMinute: number;
}

export class SkipInterval {
	constructor(readonly skip: number, readonly interval: number) { }
}

export interface IDataUnitContainer {
	getFirstDataUnit(): DataUnit | null;
	getLastDataUnit(dataSeries?: DataSeries): DataUnit | null;
}

export abstract class IViewPoint
	extends Sprite
	implements IDataUnitContainer {
	name: string;

	protected textCanvas: Sprite;
	protected windowMask: Sprite;
	bg: Sprite;
	dateTextFormat: TextFormat;

	minx: number;
	miny: number;
	maxx: number;
	maxy: number;

	hourTextFormat: TextFormat;
	lastMinute: number;

	priceTextFormat: TextFormat;

	minutesOffset = 0;

	count: number;

	minutePix: number;

	abstract getNewContext(lastMinute: number, count: number): Context;

	abstract highlightPoint(x: number, state: Dictionary): void;
	abstract getMinuteOfX(x: number): number;

	abstract getIntervalLength(param1: number): number;

	abstract getLayers(): Array<AbstractLayer<IViewPoint>>;
	abstract update(): void;
	abstract removeAllLayers(): void;

	abstract addLayer(param1: string, dataSource: DataSource, param3: string): AbstractLayer<IViewPoint> | null;
	abstract clearPointInformation(): void;

	abstract getFirstMinute(): number;
	abstract getLastMinute(): number;

	abstract getFirstDataUnit(): DataUnit | null;
	abstract getLastDataUnit(dataSeries: DataSeries): DataUnit | null;

	abstract getLastNotVisibleDataUnit(): DataUnit | null;

	abstract getMinuteXPos(param1: number): number;

	abstract HTMLnotify(param1?: boolean): void;

	abstract isAnimating(): boolean;

	abstract precomputeContexts(): void;

	abstract renderLayers(): void;

	abstract setNewCount(param1: number, param2?: boolean): void;

	abstract setNewSize(bounds: Bounds): void;

	abstract zoomIn_Handler(p1: number, p2: number): void;
	abstract zoomingAnimation_ticker(viewPoint: IViewPoint, param2: number, param3: boolean): void;
	abstract zoomChart_Handler(direction: Directions, p2: number): void;
	abstract moveChartBy_Handler(p1: number): void;
	abstract commitOffset_Handler(): void;
	abstract zoomInMinutes_Handler(p1: Context, p2: boolean): void;
	abstract zoomingAnimation_init(p1: Context): void;
	abstract newFinalAnimationState(viewPointState: ViewPointState): void;
}



export interface MinMaxMedPrice {
	maxPrice: number;
	minPrice: number;
	medPrice: number;
}

export class Context
	// extends ViewPoint
	implements MinMaxMedPrice {
	[key: string]: any;

	// lastMinute: number;
	// count: number;
	verticalScaling: string;

	maxPrice: number;
	minPrice: number;
	medPrice: number;

	maxPriceRange: number;

	maxValue: number;
	minValue: number;

	maxVolume: number;

	maxRangeLowerBound: number;
	maxRangeUpperBound: number;

	plusVariation: number;
	minusVariation: number;

	scaleVariation: number;
	localYAdjustment: number;
	plusSize: number;

	lastMinute: number;
	count: number;
}
