export interface CommunicationReviewHistoryResponseModel {
  communicationReviewId: number
  communicationId: number
  reviewPeriodId: number
  periodName: string
  score: number
  revieweeId: number
  revieweeName: string
  reviewerId: number
  reviewerName: string
  reviewStatusId: number
  reviewStatusName : string
  reviewDate: string
  isPrimary: boolean
}


