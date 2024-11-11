import { RequestModel } from './../RequestModel';
import { SurveyTemplateQuestionRequestModel } from './SurveyTemplateQuestionRequestModel';
export interface SaveSurveyTemplateRequestModel extends RequestModel {
    surveyTemplateId: number,
    surveyTemplateName: string,
    surveyTemplateStatus: boolean,
    surveyTemplateQuestions: Array<SurveyTemplateQuestionRequestModel>
}