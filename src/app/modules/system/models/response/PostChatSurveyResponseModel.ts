import { SkillResponseModel } from "./SkillResponseModel";

export interface PostChatSurveyResponseModel {
    postChatSurveyId: number;
    brand: string;
    brandId: number;
    messageType: string;
    license: string;
    skillName: string;
    questionId: string;
    questionMessage: string;
    questionMessageEN: string;
    answerFormat: string;
    updatedDate: string;
	messageTypeId: number;
	freeText: boolean;
	status: boolean;
    surveyId: string;
    csatTypeId?: number;
	skillsList: Array<SkillResponseModel>;
}