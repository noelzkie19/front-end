import { RequestModel } from "..";

export interface GetSurveyQuestionByIdRequestModel extends RequestModel {
    surveyQuestionId: number
}