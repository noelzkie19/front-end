import { SegmentListModel } from "..";

export interface SegmentFilterResponseModel {
    segments: Array<SegmentListModel>
    recordCount: number
}