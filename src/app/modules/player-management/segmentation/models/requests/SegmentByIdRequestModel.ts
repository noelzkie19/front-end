import { RequestModel } from "../../../../system/models";

export interface SegmentByIdRequestModel extends RequestModel {
    segmentId: number
}