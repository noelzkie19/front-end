import { RequestModel } from "../../../system/models";

export interface CampaignListRequestModel extends RequestModel
{
    campaignCreatedDateFrom? : string,
    campaignCreatedDateTo?: string,
    campaignName : string,
    campaignId? : number,
    campaignStatusIds? :string,
    campaignTypeIds?: string,
    brandIds?: string,
    currencyIds?: string,
    pageSize?: number,
    offsetValue?: number,
    sortColumn?: string,
    sortOrder?: string
}