
export interface IRepeaterClient {
	instanceIndices: string[];

	isDocument: boolean;

	initializeRepeaterArrays(client: IRepeaterClient): void;

	//repeaters: Array;

	//repeaterIndices: Array;
}
