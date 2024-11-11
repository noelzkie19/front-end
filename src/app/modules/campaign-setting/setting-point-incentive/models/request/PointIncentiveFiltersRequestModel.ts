import { RequestModel } from "../../../../system/models";

export interface PointIncentiveFiltersRequestModel extends RequestModel {
    campaignSettingName?: string,
    isActive?: number,
    campaignSettingId?: number,
    campaignSettingTypeId?: number,
    createdDate?: string,
    pageSize: number,
    offsetValue: number,
    sortColumn: string,
    sortOrder: string,
    dateFrom: string,
    dateTo: string,
    settingTypeId?: number,
}