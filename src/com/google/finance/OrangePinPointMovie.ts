import { PinPointMovie } from "PinPointMovie";
import { OrangePinPointMovie_LocalExtraFlagBorder } from "./OrangePinPointMovie_LocalExtraFlagBorder";
import { OrangePinPointMovie_LocalFlagActiveImg } from "./OrangePinPointMovie_LocalFlagActiveImg";
import { OrangePinPointMovie_LocalFlagImg } from "./OrangePinPointMovie_LocalFlagImg";
import { OrangePinPointMovie_LocalFlagOverImg } from "./OrangePinPointMovie_LocalFlagOverImg";
import { OrangePinPointMovie_LocalFlagPoleImg } from "./OrangePinPointMovie_LocalFlagPoleImg";

export class OrangePinPointMovie extends PinPointMovie {
		protected getPinPointType(): string {
			return "feedpin";
		}

		initImageClasses() {
			this.FlagImg = OrangePinPointMovie_LocalFlagImg;
			this.FlagOverImg = OrangePinPointMovie_LocalFlagOverImg;
			this.FlagActiveImg = OrangePinPointMovie_LocalFlagActiveImg;
			this.FlagPoleImg = OrangePinPointMovie_LocalFlagPoleImg;
			this.ExtraFlagBorder = OrangePinPointMovie_LocalExtraFlagBorder;
		}
	}
