import { CampaignListModel } from "./CampaignListModel";

export interface CampaignFilterResponseModel 
{
    campaignList: Array<CampaignListModel>,
    recordCount : number
}
