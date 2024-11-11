import {RequestModel} from '../../../system/models';

export interface SurveyAndFeedbackRequestModel extends RequestModel {
	campaignId: number;
	currencyId: number;
	includeDiscardPlayerTo: boolean;
	registrationDateStart: string | undefined;
	registrationDateEnd: string | undefined;
	taggedDateStart: string | undefined;
	taggedDateEnd: string | undefined;
	addedToCampaignStart: string | undefined;
	addedToCampaignEnd: string | undefined;
	exportFormat?: string;
	surveyQuestionId?: number;
	campaignTypeId?: number;
}

export function SurveyAndFeedbackRequestModelFactory() {
	const item: SurveyAndFeedbackRequestModel = {
		campaignId: 0,
		currencyId: 0,
		includeDiscardPlayerTo: false,
		registrationDateStart: '',
		registrationDateEnd: '',
		taggedDateStart: '',
		taggedDateEnd: '',
		addedToCampaignStart: '',
		addedToCampaignEnd: '',
		userId: '',
		queueId: '',
		campaignTypeId: 0,
	};

	return item;
}
