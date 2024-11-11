import { RetentionCampaignPlayerListModel } from "./RetentionCampaignPlayerListModel";

export interface CampaignImportPlayerResponseModel {
    campaignUploadPlayerList: Array<RetentionCampaignPlayerListModel>;
    recordCount: number;
}