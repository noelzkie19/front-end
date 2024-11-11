import { RequestModel } from "../../../../system/models";
import { AddTaggingConfigurationModel } from '../request/AddTaggingConfigurationModel'   
import { AddUserTaggingModel } from '../request/AddUserTaggingModel'
import { CampaignPeriodDetailsModel } from '../CampaignPeriodDetailsModel'


export interface AddUpdateAutoTaggingRequestModel extends RequestModel{
    
    campaignSettingId: number
    campaignSettingName: string
    campaignSettingDescription: string
    settingTypeId?: number
    isActive?: number
    campaignSettingTypeId?: number
    goalParameterAmountId?: number
    goalParameterCountId?: number
    
    taggingConfigurationList?: Array<AddTaggingConfigurationModel>,
    userTaggingList?: Array<AddUserTaggingModel>,
    //campaignPeriodList?: Array<CampaignPeriodDetailsModel>,

    createdBy?: number
    createdDate?:string
    updatedBy?: number
    updatedDate?: string
}