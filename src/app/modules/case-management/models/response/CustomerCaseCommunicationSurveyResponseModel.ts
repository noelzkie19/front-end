export interface CustomerCaseCommunicationSurveyResponseModel {
    communicationSurveyQuestionId: number
    caseCommunicationId: number
    surveyTemplateId: number
    surveyQuestionId: number
    surveyQuestionAnswersId: number
    surveyAnswer: string
    createdBy?: number
    createdDate?: string
    updatedBy?: number
    updatedDate?: string
}