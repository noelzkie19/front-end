import { SegmentConditionType } from './../../../../constants/Constants';
export interface SegmentConditionModel {
	segmentConditionId: number;
	segmentConditionType: SegmentConditionType;
	segmentConditionLogicOperator: string;
	segmentConditionFieldId?: number;
	segmentConditionSourceId?: number;
	fieldValue: string;
	relationalOperatorId?: number;
	relationalOperatorValue: string;
	segmentConditionValue: string;
	segmentConditionValue2: string;
	key: string;
	parentKey?: string;
	createdBy?: number;
	updatedBy?: number;
	queryForm?: string;
	fieldLocked?: boolean;
	operatorLocked?: boolean;
	removable?: boolean;
}
