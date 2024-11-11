export interface CommunicationReviewCriteriaListResponseModel {
    qualityReviewMeasurementId : number,
    qualityReviewCriteriaId: number,
    criteriaName: string,
    code: string,
    score: number,
    qualityReviewRankingId: number,
    rankingName: string,
    isAutoFailed: boolean,
    order: number
}