import { PointToValueListModel } from "../PointToValueListModel";
import { GoalParameterListModel } from "../GoalParameterListModel";
import { CampaignPeriodDetailsModel } from "../../../setting-auto-tagging/models/CampaignPeriodDetailsModel";

export interface PointIncentiveDetailsByIdResponseModel {
    campaignSettingId?: number
    campaignSettingName?: string
    campaignSettingDescription?: string
    settingTypeId?: number
    isActive?: number
    campaignSettingTypeId?: number
    goalParameterAmountId?: number
    goalParameterCountId?: number
    
    pointToIncentiveRangeConfigurationList?: Array<PointToValueListModel>,
    goalParameterRangeConfigurationList?: Array<GoalParameterListModel>,
    campaignPeriodList?: Array<CampaignPeriodDetailsModel>,

    createdBy?: string
    createdDate?:string
    updatedBy?: string
    updatedDate?: string
}