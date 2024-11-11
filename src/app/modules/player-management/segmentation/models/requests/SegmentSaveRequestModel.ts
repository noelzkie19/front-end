import {SegmentConditionSaveRequestModel} from '..';
import {InFileSegmentPlayerModel} from '../InFileSegmentPlayerModel';
import {SegmentVarianceModel} from '../SegmentVarianceModel';
import {RequestModel} from './../../../../system/models/RequestModel';
export interface SegmentSaveRequestModel extends RequestModel {
	segmentId: number;
	segmentName: string;
	segmentDescription: string;
	isActive: boolean;
	isStatic: boolean;
	staticParentId?: number;
	queryForm: string;
	segmentConditions: Array<SegmentConditionSaveRequestModel>;
	segmentTypeId?: number;
	segmentVariances?: Array<SegmentVarianceModel>;
	InFileSegmentPlayer?: Array<InFileSegmentPlayerModel>;
	queryJoins?: string;
	isReactivated?: boolean;
	queryFormTableau: string;
	inputTypeId: number;
}
