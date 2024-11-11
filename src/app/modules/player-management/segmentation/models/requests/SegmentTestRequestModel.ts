import {RequestModel} from './../../../../system/models/RequestModel';
export interface SegmentTestRequestModel extends RequestModel {
	queryForm: string;
	pageSize?: number;
	offsetValue?: number;
	sortColumn?: string;
	sortOrder?: string;
	segmentId?: number;
	queryJoins?: string;
}
