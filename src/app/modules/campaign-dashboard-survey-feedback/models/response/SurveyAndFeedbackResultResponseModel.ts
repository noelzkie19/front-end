import {LookupModel} from '../../../../shared-models/LookupModel';
import {CampaignCommunicationFeedbackReponseModel} from './CampaignCommunicationFeedbackReponseModel';
import {CampaignCommunicationResponseModel} from './CampaignCommunicationResponseModel';
import {CampaignCommunicationSurveyResponseModel} from './CampaignCommunicationSurveyResponseModel';
import {FeedbackResultResponseModel} from './FeedbackResultResponseModel';
import {SurveyAndFeedbackReportSummaryReponseModel} from './SurveyAndFeedbackReportSummaryReponseModel';
import {SurveyResultResponseModel} from './SurveyResultResponseModel';

export interface SurveyAndFeedbackResultResponseModel {
	reportSummary: SurveyAndFeedbackReportSummaryReponseModel;
	feedbackResultSummary: Array<LookupModel>;
	feedbackResult: Array<FeedbackResultResponseModel>;
	surveyResult: Array<SurveyResultResponseModel>;
	campaignCommunicationResult: Array<CampaignCommunicationResponseModel>;
	campaignCommunicationFeedbackResult: Array<CampaignCommunicationFeedbackReponseModel>;
	campaignCommunicationSurveyResult: Array<CampaignCommunicationSurveyResponseModel>;
}

export function SurveyAndFeedbackResultResponseModelFactory() {
	const initialData: SurveyAndFeedbackResultResponseModel = {
		reportSummary: {
			startDate: '',
			endDate: '',
			campaignReportPeriod: 0,
			campaignType: '',
			campaignId: 0,
			campaignName: '',
			campaignStatus: '',
			brand: '',
			currency: '',
		} as SurveyAndFeedbackReportSummaryReponseModel,
		feedbackResultSummary: [],
		feedbackResult: [],
		surveyResult: [],
		campaignCommunicationResult: [],
		campaignCommunicationFeedbackResult: [],
		campaignCommunicationSurveyResult: [],
	};

	return initialData;
}
