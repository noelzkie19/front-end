export interface CommunicationReviewModel {
    communicationReviewId: number
    caseId: number;
    communicationId: number
    reviewStatusId: number
    reviewStatus: string
    reviewPeriodId: number
    reviewId: number
    revieweeId: number
    reviewee: string,
    reviewerId: number
    reviewer: string
    isRead: boolean
    isPrimary: boolean
    reviewSummary?: string
    totalScore: number,
    startCommunicationDate: string
}