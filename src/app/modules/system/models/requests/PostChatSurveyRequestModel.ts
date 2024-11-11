import { RequestModel } from "../RequestModel";
import { SkillsUdtModel } from "../udt/SkillsUdtModel";

export interface PostChatSurveyRequestModel extends RequestModel {
    postChatSurveyId: number;
    brandId: number;
    messageTypeId: number;
    licenseId?: string;
    questionId: string;
    questionMessage: string;
    questionMessageEN: string;
    freeText: boolean;
    status: boolean;
    surveyId: string,
    csatTypeId?: number;
    skillsList?: Array<SkillsUdtModel>;
}