import { RequestModel } from './../RequestModel';

export interface SurveyQuestionFilterModel extends RequestModel {
    questionsName: string,
    questionsStatus: string,
    answerName: string
}