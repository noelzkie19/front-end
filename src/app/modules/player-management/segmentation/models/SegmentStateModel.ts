import {InFileSegmentPlayerModel} from './InFileSegmentPlayerModel';
import {SegmentConditionModel} from './SegmentConditionModel';
import {SegmentVarianceModel} from './SegmentVarianceModel';

export interface SegmentState {
	segmentId: number;
	segmentTypeId: number;
	segmentName: string;
	segmentDescription: string;
	isActive: true;
	isStatic: false;
	staticParentId?: number;
	staticPlayerIds?: string;
	queryForm: string;
	segmentConditions: Array<SegmentConditionModel>;
	segmentVariances: Array<SegmentVarianceModel>;
	InFileSegmentPlayer: Array<InFileSegmentPlayerModel>;
	isReactivated: false;
}
