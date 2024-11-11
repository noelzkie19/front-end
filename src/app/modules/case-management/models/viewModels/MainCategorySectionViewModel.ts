export interface MainCategorySectionViewModel {
    qualityReviewMeasurementId: number,
    qualityReviewMeasurementName: string,
    qualityReviewMeasurementCriteriaId: number,
    qualityReviewMeasurementCriteriaName: string,
    qualityReviewMeasurementScoreAndRanking: string,
    qualityReviewMeasurementIsAutoFailed: string,
    qualityReviewMeasurementScore: number,
    remarks: string,
    suggestions: string,
    isAutoFail?: boolean
};
