import {BaseRequest} from '../../../../shared-models/BaseRequest';

export interface UpsertChatSurveyActionAndSummaryRequestModel extends BaseRequest {
	action: string;
	summary: string;
	chatSurveyId: number;
}
