export interface CustomerCaseCommunicationFeedbackRequestModel {
    communicationFeedbackId: number
    caseCommunicationId: number
    communicationFeedbackNo: number
    feedbackTypeId: number
    feedbackCategoryId: number
    feedbackAnswerId: number
    feedbackAnswer: string
    communicationFeedbackDetails: string
    communicationSolutionProvided: string
    createdBy: number
    updatedBy: number
}
