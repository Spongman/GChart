namespace mx.utils
{
	// import mx.core.mx_internal;
	// import flash.display.DisplayObject;
	// import mx.core.IRepeaterClient;
	// import flash.utils.getQualifiedClassName;

	export class NameUtil
	{
		static displayObjectToString(param1: flash.display.DisplayObject): string|null
		{
			let result: string|null = null;
			let displayObject = param1;
			try
			{
				let o: flash.display.DisplayObject | null = displayObject;
				while (o)
				{
					if (o.parent && o.stage && o.parent === o.stage)
						break;

					let s = o.name;
					/*	TODO
					if (o instanceof mx.core.IRepeaterClient)	// TODO: instanceof interfaces
					{
						let indices = (<mx.core.IRepeaterClient><any>o).instanceIndices;
						if (indices)
							s = s + ("[" + indices.join("][") + "]");
					}
					*/
					result = !result ? s : s + "." + result;
					o = o.parent;
				}
			}
			catch (e /*:SecurityError*/)
			{
			}
			return result;
		}

		/*
		private static counter = 0;
		
		static createUniqueName(param1): string
		{
			if (!param1)
			{
				return null;
			}
			const _loc2_ = this.getQualifiedClassName(param1);
			const _loc3_ = _loc2_.indexOf("::");
			if (_loc3_ !== -1)
			{
				_loc2_ = _loc2_.substr(_loc3_ + 2);
			}
			const _loc4_ = _loc2_.charCodeAt(_loc2_.length - 1);
			if (_loc4_ >= 48 && _loc4_ <= 57)
			{
				_loc2_ = _loc2_ + "_";
			}
			return _loc2_ + NameUtil.counter++;
		}
		*/
	}
}
