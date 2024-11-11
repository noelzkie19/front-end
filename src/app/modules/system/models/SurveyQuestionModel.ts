import { SurveyQuestionAnswerModel } from './SurveyQuestionAnswerModel';
export interface SurveyQuestionModel {
    surveyQuestionId: number,
    surveyQuestionName: string,
    fieldTypeId: number,
    fieldTypeName: string,
    isActive: boolean,
    surveyQuestionAnswers: Array<SurveyQuestionAnswerModel>,
    createdBy?: number,
    createdByName?: string,
    createdDate?: string,
    updatedBy?: number,
    updatedByName?: string,
    updatedDate?: string
}