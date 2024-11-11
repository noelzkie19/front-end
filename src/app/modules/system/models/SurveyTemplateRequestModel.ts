import { RequestModel } from ".";
import { SurveyTemplateQuestionRequestModel } from "./SurveyTemplateQuestionRequestModel";

export interface SurveyTemplateRequestModel extends RequestModel {
    surveyTemplateId: number,
    surveyTemplateName: string,
    surveyTemplateStatus: boolean,
    surveyTemplateDescription: string,
    caseTypeId: number,
    messageTypeId: number,
    createdDate?: string,
    createdByName?: string,
    updatedDate?: string,
    updatedByName?: string,
    surveyTemplateQuestions: Array<SurveyTemplateQuestionRequestModel>
}