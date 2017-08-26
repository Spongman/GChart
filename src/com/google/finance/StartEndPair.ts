namespace com.google.finance
{
	export class StartEndPair
	{
		constructor(public start: number, public end: number)
		{
		}

		toString(): string
		{
			return '[' + this.start + ", " + this.end + ']';
		}

		equals(pair: StartEndPair): boolean
		{
			if (!(pair instanceof StartEndPair))
				return false;

			return this.start === pair.start && this.end === pair.end;
		}
	}
}
