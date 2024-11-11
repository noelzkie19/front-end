import { LookupModel } from "../../../../../common/model";
import { QualityReviewBenchmarkResponseModel } from "./QualityReviewBenchmarkResponseModel";
import { QualityReviewMeasurementResponseModel } from "./QualityReviewMeasurementResponseModel";
import { QualityReviewPeriodResponseModel } from "./QualityReviewPeriodResponseModel";

export interface CommunicationReviewLookupsResponseModel {
    qualityReviewMeasurementList: Array<QualityReviewMeasurementResponseModel>,
    qualityReviewBenchmarkList: Array<QualityReviewBenchmarkResponseModel>,
    qualityReviewPeriodList: Array<QualityReviewPeriodResponseModel>,
    qualityReviewPeriodOptions: Array<LookupModel>,
    qualityReviewRankingOptions: Array<LookupModel>,
    communicationReviewStatus: Array<LookupModel>,
    communicationReviewEvent: Array<LookupModel>,
    qualityReviewMeasurementType: Array<LookupModel>,
    qualityReviewLimit: number,
}