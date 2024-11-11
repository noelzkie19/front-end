import { CustomEventModel } from "./CustomEventModel"

export interface CustomEventFilterResponseModel {
    campaignCustomEventSettingList: Array<CustomEventModel>
    totalRecordCount: number
}