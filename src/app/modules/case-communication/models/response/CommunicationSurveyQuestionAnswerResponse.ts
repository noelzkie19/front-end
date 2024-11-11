export interface CommunicationSurveyQuestionAnswerResponse {
    communicationSurveyQuestionId: number
    caseCommunicationId: number
    surveyTemplateId: number
    surveyQuestionId: number
    surveyQuestionAnswersId: number
    surveyAnswerName: string
    createdBy?: number
    createdDate?: string
    updatedBy?: number
    updatedDate?: string
}