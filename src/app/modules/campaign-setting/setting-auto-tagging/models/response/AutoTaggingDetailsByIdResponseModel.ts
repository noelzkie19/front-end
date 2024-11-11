import { TaggingConfigurationModel } from '../TaggingConfigurationModel'   
import { UserTaggingModel } from '../UserTaggingModel'
import { CampaignPeriodDetailsModel } from '../CampaignPeriodDetailsModel'

export interface AutoTaggingDetailsByIdResponseModel {
    campaignSettingId: number
    campaignSettingName: string
    campaignSettingDescription: string
    settingTypeId: number
    isActive: number
    campaignSettingTypeId: number
    goalParameterAmountId: number
    goalParameterCountId: number
    
    taggingConfigurationList?: Array<TaggingConfigurationModel>,
    userTaggingList?: Array<UserTaggingModel>,
    campaignPeriodList?: Array<CampaignPeriodDetailsModel>,

    createdBy: string
    createdDate:string
    updatedBy: string
    updatedDate: string
    // pagesize: number
    // offsetValue: number
}