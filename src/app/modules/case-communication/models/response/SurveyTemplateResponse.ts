import {SurveyQuestionAnswerResponse, SurveyQuestionResponse, SurveyTemplateInfoResponse} from "..";

export interface SurveyTemplateResponse {
    surveyTemplate: SurveyTemplateInfoResponse
    surveyQuestions: Array<SurveyQuestionResponse>
    surveyQuestionAnswers: Array<SurveyQuestionAnswerResponse>
}