import { RequestModel } from "../../../../system/models";
import { AddConfigPointToValueRequestModel } from "./AddConfigPointToValueRequestModel";
import { AddConfigGoalParameterRequestModel } from "./AddConfigGoalParameterRequestModel";

export interface AddUpdatePointIncentiveRequestModel extends RequestModel{
    
    campaignSettingId: number
    campaignSettingTypeId?: number
    campaignSettingName: string
    campaignSettingDescription: string
    settingTypeId?: number
    isActive?: number
    
    goalParameterAmountId?: number
    goalParameterCountId?: number
    
    pointToIncentiveRangeConfigurationType?: Array<AddConfigPointToValueRequestModel>,
    goalParameterRangeConfigurationType?: Array<AddConfigGoalParameterRequestModel>,
    createdDate?: string,
    //campaignPeriodList?: Array<CampaignPeriodDetailsModel>,

}