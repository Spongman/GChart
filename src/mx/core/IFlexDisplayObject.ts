namespace mx.core
{
	// import flash.display.IBitmapDrawable;
	// import flash.events.IEventDispatcher;
	// import flash.geom.Point;
	// import flash.geom.Rectangle;
	// import flash.accessibility.AccessibilityProperties;
	// import flash.display.DisplayObjectContainer;
	// import flash.display.DisplayObject;
	// import flash.geom.Transform;
	// import flash.display.LoaderInfo;
	// import flash.display.Stage;

	//import DisplayObject = flash.display.DisplayObject;

	export interface IFlexDisplayObject
		extends flash.display.DisplayObject
		//implements IBitmapDrawable, IEventDispatcher
	{
		visible: boolean;

		rotation: number;

		localToGlobal(param1: flash.display.Point): flash.display.Point;

		name: string;

		measuredHeight: number;

		blendMode: string;

		scale9Grid: flash.display.Rectangle;

		measuredWidth: number;

		accessibilityProperties: AccessibilityProperties;

		cacheAsBitmap: boolean;

		globalToLocal(param1: flash.display.Point): flash.display.Point;

		height: number;

		parent: flash.display.DisplayObjectContainer;

		getBounds(param1: flash.display.DisplayObject): flash.display.Rectangle;

		//get opaqueBackground() ;

		setActualSize(param1: number, param2: number): void;

		width: number;

		hitTestPoint(param1: number, param2: number, param3: boolean): boolean;

		scaleX: number;

		scaleY: number;

		scrollRect: flash.display.Rectangle;

		mouseX: number;

		mouseY: number;

		getRect(param1: flash.display.DisplayObject): flash.display.Rectangle;

		alpha: number;

		move(param1: number, param2: number): void;

		//loaderInfo: LoaderInfo;

		root: flash.display.DisplayObject;

		hitTestObject(param1: flash.display.DisplayObject): boolean;

		mask: flash.display.DisplayObject;

		//transform: Transform;

		x: number;

		y: number;

		//filters: Array;

		stage: flash.display.Stage;
	}
}
