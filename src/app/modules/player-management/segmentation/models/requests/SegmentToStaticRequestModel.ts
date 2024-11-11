import { RequestModel } from './../../../../system/models/RequestModel';
export interface SegmentToStaticRequestModel extends RequestModel {
    segmentId: number
}