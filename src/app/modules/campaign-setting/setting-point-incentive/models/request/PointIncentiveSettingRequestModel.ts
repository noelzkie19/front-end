
import { PointToValueListModel } from "../PointToValueListModel";
import { GoalParameterListModel } from "../GoalParameterListModel";


export interface PointIncentiveRequestModel{
    settingId: number
    campaignSettingTypeId: number 
    settingName: string
    settingDescription: string
    settingTypeId: number
    settingStatus: number
    goalParameterAmountId?: number 
    goalParameterCountId?: number 
    currencyId?: number
    rangeNo: number
    pointIncentiveSettingList: Array<PointToValueListModel>
    goalParameterListList: Array<GoalParameterListModel>
    createdBy: number
    createdDate: string
    updatedBy: number
    updatedDate: string
}