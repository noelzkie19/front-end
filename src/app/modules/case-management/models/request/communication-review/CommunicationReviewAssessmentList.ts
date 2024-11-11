export interface CommunicationReviewAssessmentList {
    communicationReviewAssessmentId: number,
    qualityReviewMeasurementId: number,
    qualityReviewCriteriaId: number,
    assessmentScore: number,
    remarks: string,
    suggestions: string,
    qualityReviewCriteriaHighScore: number,
    isAutoFail: boolean
}