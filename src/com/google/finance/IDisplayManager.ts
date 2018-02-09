import { IDisplayObjectContainer } from '../../../flash/display/DisplayObject';
import { AbstractLayer } from './AbstractLayer';
import { BorderLayer } from './BorderLayer';
import { Intervals } from './Const';
import { Controller } from './Controller';
import { DataSource } from './DataSource';
import { IViewPoint } from './IViewPoint';
import { LayersManager } from './LayersManager';
import { MainManager } from './MainManager';
import { SpaceText } from './SpaceText';
import { SparklineViewPoint } from './SparklineViewPoint';
import { ViewPoint } from './ViewPoint';

export interface IDisplayManager
	extends IDisplayObjectContainer {

	layersManager: LayersManager;
	mainController: Controller;
	spaceText: SpaceText;
	topBorderLayer: BorderLayer;

	toggleAllAfterHoursSessions(param1: boolean, dataSource?: DataSource);
	mainManager: MainManager;

	hasOhlcRequiredIndicator(): boolean;
	showContextualStaticInfo();


	HTMLnotify(viewpointName: string, param2?: boolean);

	setLastMinute(lastMinute: number);

	getViewPoints(): IViewPoint[];
	getDetailLevel(): Intervals;
	computeRelativeTimes(dataSource: DataSource);
	computeRelativeTimesForDiffSessionComparison();

	addLayer(param1: string, param2: string, dataSource: DataSource, param4: string): AbstractLayer<IViewPoint> | null;
	removeLayer(layerId: string, viewPointName: string, dataSource?: DataSource);
	makeBorderLayerTop();
	getEnabledChartLayer(): string;

	addViewPoint(viewPointTypeName: string, viewPointName: string, width: number, height: number, top: number, param6: number, param7: number, mainViewPoint?: IViewPoint): number;
	removeViewPoint(param1: string);
	getViewPoint(name: string): IViewPoint | null;
	
	getMainViewPoint(): ViewPoint;
	getSparklineViewPoint(): SparklineViewPoint;

	setDifferentMarketSessionComparison(isDifferentMarketSessionComparison: boolean);
	isDifferentMarketSessionComparison(): boolean;

	update(param1?: boolean);

	windowResized(param1: number, param2: number);


}