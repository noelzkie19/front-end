import { RequestModel } from "../../../system/models"
export interface CustomEventModel  extends RequestModel  {
    campaignEventSettingId: number
    customEventName: string
    createdDate?: Date
    createdBy: string
    createdByName?: string
}