import { RequestModel } from "../../../../system/models";

export interface PointIncentiveDetailsByIdRequestModel extends RequestModel {
    campaignSettingId: number
    campaignSettingTypeId?: number
}

