export interface PostChatSurveyFilterModel {
	brandId?: number;
	licenseId: string;
	skillIds: string;
	messageTypeId?: number;
	questionId: string;
	questionMessage: string;
	questionMessageEN: string;
	status?: number;
	surveyId : string;
}
