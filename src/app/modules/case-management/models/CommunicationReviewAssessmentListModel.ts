export interface CommunicationReviewAssessmentListModel {
    communicationReviewAssessmentId: number,
    qualityReviewMeasurementId: number,
    qualityReviewMeasurementName: string,
    qualityReviewMeasurementTypeId: number,
    qualityReviewMeasurementCriteriaId: number,
    qualityReviewMeasurementScore: number,
    remarks: string,
    suggestions: string,
    isAutoFail?: boolean
}