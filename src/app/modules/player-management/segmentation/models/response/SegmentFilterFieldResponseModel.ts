export interface SegmentFilterFieldResponseModel {
	id: number;
	value: string;
	label: string;
	dataType: string;
	segmentConditionTypeId: number;
	segmentConditionSourceId: number;
	relationalOperatorIds: string;
	segmentConditionValueTypeIds: string;
	partOfSetCount: number;
	fieldSourceTable: string;
	isMulti: boolean;
	lookupSource: string;
	dependentLookupSource: string;
	isFieldDynamic: boolean;
	fieldLookupSource: string;
}
