export interface CustomerCaseCommunicationFeedbackModel {
    communicationFeedbackId: number
    caseCommunicationId: number
    communicationFeedbackNo: number
    feedbackTypeId: number
    feedbackTypeName: string
    feedbackCategoryId: number
    feedbackCategoryName: string
    feedbackAnswerId: number
    feedbackAnswerName: string
    communicationFeedbackDetails: string
    communicationSolutionProvided: string
}