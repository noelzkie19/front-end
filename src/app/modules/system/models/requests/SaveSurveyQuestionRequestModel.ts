import { RequestModel } from './../RequestModel';
import { SurveyQuestionAnswerModel } from './../SurveyQuestionAnswerModel';


export interface SaveSurveyQuestionRequestModel extends RequestModel {
    surveyQuestionId: number,
    surveyQuestionName: string,
    fieldTypeId: number,
    isActive: boolean,
    surveyQuestionAnswers: Array<SurveyQuestionAnswerModel>
}