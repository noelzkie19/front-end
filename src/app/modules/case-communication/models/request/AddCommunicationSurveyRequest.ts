export interface AddCommunicationSurveyRequest {
    communicationSurveyQuestionId: number
    caseCommunicationId: number
    surveyTemplateId: number
    surveyQuestionId: number
    surveyQuestionAnswersId: number
    surveyAnswer: string
    createdBy: number
    updatedBy: number
}