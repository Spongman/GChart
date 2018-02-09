import { Bitmap } from "../../../flash/display/Bitmap";
import { DisplayObject } from "../../../flash/display/DisplayObject";
import { Sprite } from "../../../flash/display/Sprite";
import { AbstractDrawingLayer } from "./AbstractDrawingLayer";
import { ControllerComponents } from "./Const";
import { ControllerStates } from "./Controller";
import { DataSource } from "./DataSource";
import { DataUnit } from "./DataUnit";
import { DraggableHandle } from "./DraggableHandle";
import { MainManager } from "./MainManager";
import { MouseCursors } from "./MouseCursor";
import { ScrollSlider } from "./ScrollSlider";
import { SparklineViewPoint } from "./SparklineViewPoint";
import { Context } from "./IViewPoint";
import { WindowLayer_ScrollBarBg } from "./WindowLayer_ScrollBarBg";
import { WindowLayer_SparkHandle } from "./WindowLayer_SparkHandle";
import { WindowLayer_SparkHandleActive } from "./WindowLayer_SparkHandleActive";

// import Bitmap;
// import flash.display.Sprite;
// import flash.display.DisplayObject;
// import flash.events.MouseEvent;

export class WindowLayer extends AbstractDrawingLayer<SparklineViewPoint> {
	private static readonly SparkHandle = WindowLayer_SparkHandle;
	private static readonly ScrollBarBg = WindowLayer_ScrollBarBg;
	private static readonly SparkHandleActive = WindowLayer_SparkHandleActive;

	private static MIN_WINDOW_WIDTH = 6;

	private currentHandlesVisibility: boolean = true;
	private sliderBg = new Sprite("sliderBg");
	private leftX: number;
	private rightX: number;

	scrollSlider = new ScrollSlider("scrollSlider");
	initialX: number;
	leftHandle: DraggableHandle;
	rightHandle: DraggableHandle;
	leftHandleXOffset = 0;
	rightHandleXOffset = 0;

	constructor(viewPoint: SparklineViewPoint, dataSource: DataSource) {
		super(viewPoint, dataSource);

		const sliderBgBitmap = new WindowLayer.ScrollBarBg();
		sliderBgBitmap.y = viewPoint.maxy - 1;
		sliderBgBitmap.x = viewPoint.minx;
		sliderBgBitmap.width = viewPoint.maxx - viewPoint.minx;
		this.sliderBg.addChild(sliderBgBitmap);
		this.addChild(this.sliderBg);
		this.sliderBg.addEventListener(MouseEvents.CLICK, () => {
			viewPoint.myController.mouseDownAction(ControllerComponents.SCROLL_BG);
		});
		this.addChild(this.scrollSlider);
		this.scrollSlider.y = viewPoint.maxy - 1;
		this.scrollSlider.x = viewPoint.minx;
		this.rightHandle = new DraggableHandle(WindowLayer.SparkHandle, WindowLayer.SparkHandleActive);
		this.rightHandle.y = Math.floor((viewPoint.maxy + viewPoint.miny) / 2 - this.rightHandle.height / 2);
		this.rightHandle.x = viewPoint.minx;
		this.addChild(this.rightHandle);
		this.leftHandle = new DraggableHandle(WindowLayer.SparkHandle, WindowLayer.SparkHandleActive);
		this.leftHandle.y = Math.floor((viewPoint.maxy + viewPoint.miny) / 2 - this.leftHandle.height / 2);
		this.leftHandle.x = viewPoint.minx;
		this.addChild(this.leftHandle);
		this.scrollSlider.addEventListener(MouseEvents.MOUSE_DOWN, () => {
			viewPoint.myController.mouseDownAction(ControllerComponents.SCROLL_BAR);
		});
		const controller = viewPoint.myController;
		this.leftHandle.addEventListener(MouseEvents.ROLL_OVER, () => {
			MainManager.mouseCursor.setCursor(MouseCursors.H_ARROWS);
		});
		this.leftHandle.addEventListener(MouseEvents.ROLL_OUT, () => {
			if (controller.getState() !== ControllerStates.DRAGGING_LEFT_HANDLE) {
				MainManager.mouseCursor.setCursor(MouseCursors.CLASSIC);
			}
		});
		this.leftHandle.addEventListener(MouseEvents.MOUSE_DOWN, () => {
			viewPoint.myController.mouseDownAction(ControllerComponents.LEFT_HANDLE);
		});
		this.rightHandle.addEventListener(MouseEvents.ROLL_OVER, () => {
			MainManager.mouseCursor.setCursor(MouseCursors.H_ARROWS);
		});
		this.rightHandle.addEventListener(MouseEvents.ROLL_OUT, () => {
			if (controller.getState() !== ControllerStates.DRAGGING_RIGHT_HANDLE) {
				MainManager.mouseCursor.setCursor(MouseCursors.CLASSIC);
			}
		});
		this.rightHandle.addEventListener(MouseEvents.MOUSE_DOWN, () => {
			viewPoint.myController.mouseDownAction(ControllerComponents.RIGHT_HANDLE);
		});
		this.toggleHandles(false);
	}

	getLastDataUnit(): DataUnit {
		const handleRightX = this.getHandleRightX();
		const data = this.viewPoint.dataSource.data;
		const minute = this.viewPoint.getMinuteOfX(handleRightX);
		return data.units[data.getRelativeMinuteIndex(minute)];
	}

	updateFixedElements() {
		const bitmap = this.sliderBg.getChildAt(0) as Bitmap;
		bitmap.y = this.viewPoint.maxy - 1;
		bitmap.width = this.viewPoint.maxx - this.viewPoint.minx;
		this.scrollSlider.y = this.viewPoint.maxy - 1;
		this.rightHandle.y = Math.floor((this.viewPoint.maxy + this.viewPoint.miny) / 2 - this.rightHandle.height / 2);
		this.leftHandle.y = Math.floor((this.viewPoint.maxy + this.viewPoint.miny) / 2 - this.leftHandle.height / 2);
	}

	getHandleRightX(): number {
		return this.rightHandle.x + this.rightHandle.width / 2;
	}

	private checkHandlePosition(displayObject: DisplayObject) {
		if (displayObject.x < this.viewPoint.minx - displayObject.width / 2) {
			displayObject.x = this.viewPoint.minx - displayObject.width / 2;
		}

		if (displayObject.x > this.viewPoint.maxx - displayObject.width / 2) {
			displayObject.x = this.viewPoint.maxx - displayObject.width / 2;
		}
	}

	renderLayer(context?: Context) {
		if (this.stage.stageWidth === 0) {
			return;
		}

		if (!this.dataSource || this.dataSource.isEmpty()) {
			return;
		}

		const data = this.dataSource.data;
		const sparklineViewPoint = this.viewPoint as any as SparklineViewPoint;
		this.graphics.clear();
		// const _loc4_ = _loc2_.getRelativeMinuteIndex(_loc3_.getLastMinute());
		let firstMinuteIndex = Number(data.getRelativeMinuteIndex(sparklineViewPoint.getFirstMinute()) - 1);
		if (firstMinuteIndex < 0) {
			firstMinuteIndex = 0;
		}

		this.rightX = sparklineViewPoint.getMinuteXPos(sparklineViewPoint.getLastMinute());
		this.leftX = sparklineViewPoint.getMinuteXPos(sparklineViewPoint.getFirstMinute());
		let rightX = this.rightX;
		let leftX = this.leftX;
		if (rightX > sparklineViewPoint.maxx) {
			rightX = sparklineViewPoint.maxx;
		}

		if (rightX < sparklineViewPoint.minx + WindowLayer.MIN_WINDOW_WIDTH - 1) {
			rightX = sparklineViewPoint.minx + WindowLayer.MIN_WINDOW_WIDTH - 1;
		}

		if (rightX - leftX <= WindowLayer.MIN_WINDOW_WIDTH) {
			rightX = (leftX + rightX) / 2;
			if (rightX > sparklineViewPoint.maxx - (this.rightHandle.width - 2) / 2 + 2) {
				rightX = sparklineViewPoint.maxx - (this.rightHandle.width - 2) / 2 + 2;
			}

			leftX = rightX;
		}
		this.rightHandle.x = rightX - this.rightHandle.width / 2 - this.rightHandleXOffset;
		this.checkHandlePosition(this.rightHandle);
		this.leftHandle.x = leftX - this.leftHandle.width / 2 - this.leftHandleXOffset;
		this.checkHandlePosition(this.leftHandle);
		this.scrollSlider.x = Math.round(leftX) - 2;
		this.scrollSlider.setWidth(Math.round(rightX - leftX) + 2);
		if (this.scrollSlider.width + 2 > rightX - leftX) {
			this.scrollSlider.x = (rightX + leftX) / 2 - this.scrollSlider.width / 2;
		}

		if (this.scrollSlider.x + this.scrollSlider.width > this.viewPoint.maxx) {
			this.scrollSlider.x = this.viewPoint.maxx - this.scrollSlider.width;
		}

		if (this.scrollSlider.x < this.viewPoint.minx) {
			this.scrollSlider.x = this.viewPoint.minx;
		}
	}

	getHandleLeftX(): number {
		return this.leftHandle.x + this.leftHandle.width / 2;
	}

	toggleHandles(visibility: boolean) {
		// return false;	// TODO (hitTestPoint)
		if (visibility === this.currentHandlesVisibility) {
			return;
		}

		this.currentHandlesVisibility = visibility;
		if (visibility === true) {
			this.addChild(this.leftHandle);
			this.addChild(this.rightHandle);
		} else {
			try {
				this.removeChild(this.leftHandle);
				this.removeChild(this.rightHandle);
				return;
			} catch (ae /*:ArgumentError*/) {
				return;
			}
		}
	}

	getFirstDataUnit(): DataUnit {
		const handleLeftX = this.getHandleLeftX();
		const data = this.viewPoint.dataSource.data;
		const minute = this.viewPoint.getMinuteOfX(handleLeftX);
		return data.units[data.getRelativeMinuteIndex(minute) + 1];
	}

	handleReleased(draggableHandle: DraggableHandle) {
		let _loc7_ = NaN;
		const _loc2_ = this.rightHandle.x + this.rightHandle.width / 2;
		let _loc3_ = this.leftHandle.x + this.leftHandle.width / 2;
		if (_loc2_ === _loc3_) {
			_loc3_ = _loc2_ - WindowLayer.MIN_WINDOW_WIDTH;
		}

		// const _loc4_ = this.dataSource.data;
		const sparklineViewPoint = this.viewPoint as any as SparklineViewPoint;
		const _loc6_ = sparklineViewPoint.sparkCount * Math.abs(_loc2_ - _loc3_) / (sparklineViewPoint.maxx - sparklineViewPoint.minx);
		switch (draggableHandle) {
			case this.leftHandle:
				if (_loc3_ < _loc2_) {
					_loc7_ = Number(sparklineViewPoint.getLastMinute());
				} else {
					_loc7_ = Number(sparklineViewPoint.getLastMinute() + _loc6_);
				}
				break;
			case this.rightHandle:
				if (_loc3_ < _loc2_) {
					_loc7_ = Number(sparklineViewPoint.getFirstMinute() + _loc6_);
				} else {
					_loc7_ = Number(sparklineViewPoint.getFirstMinute());
				}
				break;
		}
		if (_loc7_ > 0) {
			_loc7_ = 0;
		}

		sparklineViewPoint.myController.clearCurrentZoom();
		sparklineViewPoint.myController.animateTo(_loc7_, _loc6_);
		draggableHandle.x = this.initialX;
		this.leftHandleXOffset = 0;
		this.rightHandleXOffset = 0;
	}

	getRightX(): number {
		return this.rightX;
	}

	getLeftX(): number {
		return this.leftX;
	}
}
