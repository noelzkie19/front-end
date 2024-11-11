import { CommunicationReviewModel } from "../models/CommunicationReviewModel"

const transformToCommunicationReview = (data: any) => { 
    const communicationReviewData: CommunicationReviewModel = {
        caseId : data.caseId,
        communicationReviewId: data.communicationReviewId,
        communicationId: data.communicationId,
        reviewStatusId: data.reviewStatusId,
        reviewStatus: data.reviewStatus,
        reviewPeriodId: data.reviewPeriodId,
        reviewId: data.reviewId,
        revieweeId: data.revieweeId,
        reviewee: data.reviewee,
        reviewerId: data.reviewerId,
        reviewer: data.reviewer,
        isRead: data.isRead,
        isPrimary: data.isPrimary,
        totalScore: data.totalScore,
        startCommunicationDate: data.startCommunicationDate
      }

    return communicationReviewData;
}

export default transformToCommunicationReview;