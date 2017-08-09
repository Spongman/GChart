namespace com.google.finance
{
	export class StartEndPair
	{
		start: number;
		end: number;

		constructor(param1: number, param2: number)
		{
			this.start = param1;
			this.end = param2;
		}

		toString(): string
		{
			return "[" + this.start + ", " + this.end + "]";
		}

		equals(param1: StartEndPair): boolean
		{
			if (!(param1 instanceof StartEndPair))
				return false;

			return this.start === param1.start && this.end === param1.end;
		}
	}
}
