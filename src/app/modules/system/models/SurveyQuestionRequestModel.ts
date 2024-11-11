import { SurveyQuestionModel } from './SurveyQuestionModel';
export interface SurveyQuestionRequestModel extends SurveyQuestionModel {
    updatedBy: number,
    queueId: string,
    userId: string
}