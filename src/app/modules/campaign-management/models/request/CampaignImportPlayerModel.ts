import { BaseModel } from './../../../user-management/models/BaseModel';
import { CampaignCSVPlayerListModel } from "./CampaignCSVPlayerListModel";

export interface CampaignImportPlayerModel extends BaseModel {
    campaignCSVPlayerListModel : Array<CampaignCSVPlayerListModel>,
    campaignId : number,
    guidId: string,
}