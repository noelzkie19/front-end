import { RequestModel } from "../../../../system/models";

export interface AutoTaggingDetailsByIdRequestModel extends RequestModel {
    campaignSettingId: number
    campaignSettingTypeId: number
}