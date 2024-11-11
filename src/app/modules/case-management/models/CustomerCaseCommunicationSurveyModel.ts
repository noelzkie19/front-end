export interface CustomerCaseCommunicationSurveyModel {
    communicationSurveyQuestionId : number
    caseCommunicationId: number
    surveyTemplateId: number
    surveyTemplateName: string
    surveyQuestionId: number
    surveyQuestionName: string
    surveyQuestionAnswersId: number
    surveyAnswerName: string
    createdBy?: number
    createdDate?: string
    updatedBy?: number
    updatedDate?: string
}