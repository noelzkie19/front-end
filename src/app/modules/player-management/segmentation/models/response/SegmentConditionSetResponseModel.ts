export interface SegmentConditionSetResponseModel {
	segmentConditionSetId: number;
	segmentConditionFieldId: number;
	parentSegmentConditionFieldId: number;
	relationalOperatorId?: number;
	conditionalOperator: string;
	locked: boolean;
	operatorLocked: boolean;
	removable: boolean;
	createdBy: number;
	createdDate: string;
}
