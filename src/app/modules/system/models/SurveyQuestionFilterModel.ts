import { BaseModel } from '../../user-management/models/BaseModel';
export interface SurveyQuestionFilterModel extends BaseModel {
    questionName: string,
    status: string,
    answerName: string
}