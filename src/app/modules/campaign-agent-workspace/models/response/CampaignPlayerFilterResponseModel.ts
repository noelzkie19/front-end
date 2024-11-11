import { CampaignPlayerResponseModel } from "./CampaignPlayerResponseModel";

export interface CampaignPlayerFilterResponseModel {
    campaignPlayers: Array<CampaignPlayerResponseModel>
    recordCount: number
}