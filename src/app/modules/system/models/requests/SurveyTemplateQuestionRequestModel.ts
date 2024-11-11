export interface SurveyTemplateQuestionRequestModel {
    surveyTemplateQuestionId: number,
    surveyTemplateId: number,
    surveyQuestionId: number,
    orderNo: number,
    status: boolean,
    mandatory: boolean
}