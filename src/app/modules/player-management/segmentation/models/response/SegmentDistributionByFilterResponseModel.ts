import { SegmentDistributionUdtModel } from "./SegmentDistributionUdtModel"

export interface SegmentDistributionByFilterResponseModel {
    totalRecordCount: number
    segmentDistributions: Array<SegmentDistributionUdtModel>
}