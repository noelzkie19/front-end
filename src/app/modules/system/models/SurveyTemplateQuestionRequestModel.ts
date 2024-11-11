export interface SurveyTemplateQuestionRequestModel {
    id: number,
    surveyTemplateId: number,
    surveyQuestionId: number,
    orderNo: number,
    status: boolean,
    isMandatory: boolean
}