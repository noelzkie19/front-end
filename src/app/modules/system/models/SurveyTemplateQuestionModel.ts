import { SurveyQuestionModel } from './SurveyQuestionModel';
export interface SurveyTemplateQuestionModel {
    id: number,
    orderNo: number
    surveyTemplateId: number,
    surveyQuestionId: number,
    question?: SurveyQuestionModel,
    isMandatory: boolean,
    status: boolean,
    surveyQuestionName?: string,
    surveyQuestionStatus: boolean,
    surveyQuestionUpdatedBy?: string,
    surveyQuestionUpdatedDate?: string,
    surveyQuestionFieldTypeName?: string
}