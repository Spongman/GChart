namespace com.google.finance
{
	export class StartEndPair
	{
		constructor(public start: number, public end: number)
		{
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
