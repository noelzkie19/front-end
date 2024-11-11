import { CampaignCommunicationFeedbackReponseModel } from "./CampaignCommunicationFeedbackReponseModel";
import { CampaignCommunicationResponseModel } from "./CampaignCommunicationResponseModel";
import { CampaignCommunicationSurveyResponseModel } from "./CampaignCommunicationSurveyResponseModel";

export interface CampaignCaseCommunicationResponseModel {
    campaignCommunicationResponseModel: Array<CampaignCommunicationResponseModel>[];
    campaignCommunicationFeedbackReponseModel: Array<CampaignCommunicationFeedbackReponseModel>[];
    campaignCommunicationSurveyResponseModel: Array<CampaignCommunicationSurveyResponseModel>[];
}