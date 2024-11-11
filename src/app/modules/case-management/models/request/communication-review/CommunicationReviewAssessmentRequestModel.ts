export interface CommunicationReviewAssessmentRequestModel {
    communicationReviewAssessmentId: number,
    qualityReviewMeasurementId: number,
    qualityReviewCriteriaId: number,
    assessmentScore: number,
    remarks: string,
    suggestions: string,
}