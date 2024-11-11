import { RequestModel } from '../../../../system/models/RequestModel';
export interface SegmentFilterRequestModel extends RequestModel {
    segmentName: string
    segmentTypeId: string
    segmentStatus?: boolean
    pageSize?: number
    offsetValue?: number
    sortColumn?: string
    sortOrder?: string
}