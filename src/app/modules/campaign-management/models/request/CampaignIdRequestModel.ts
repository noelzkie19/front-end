import { RequestModel } from "../../../system/models";

export interface CampaignIdRequestModel extends RequestModel
{
    campaignId : number,
    isClone : boolean
}