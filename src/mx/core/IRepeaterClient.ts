namespace mx.core
{
	export interface IRepeaterClient
	{
		instanceIndices: string[];

		isDocument: boolean;

		initializeRepeaterArrays(param1: IRepeaterClient): void;

		//repeaters: Array;

		//repeaterIndices: Array;
	}
}
