/// <reference path="PinPointMovie.ts" />

namespace com.google.finance
{
	export class OrangePinPointMovie extends PinPointMovie
	{
		protected getPinPointType(): string
		{
			return "feedpin";
		}

		initImageClasses() 
		{
			this.FlagImg = OrangePinPointMovie_LocalFlagImg;
			this.FlagOverImg = OrangePinPointMovie_LocalFlagOverImg;
			this.FlagActiveImg = OrangePinPointMovie_LocalFlagActiveImg;
			this.FlagPoleImg = OrangePinPointMovie_LocalFlagPoleImg;
			this.ExtraFlagBorder = OrangePinPointMovie_LocalExtraFlagBorder;
		}
	}
}
