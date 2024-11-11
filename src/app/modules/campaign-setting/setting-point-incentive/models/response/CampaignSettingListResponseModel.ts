export interface CampaignSettingListResponseModel {
    campaignSettingId: number
    campaignSettingName: string
    isActive: number
    settingStatusName: string
    campaignSettingTypeId: number
    campaignSettingTypeName: string
    settingTypeId: number
    settingTypeName: string
    campaignSettingDescription: string
    createdBy: string
    createdDate?:string
    updatedBy: string
    updatedDate?: string
    recordCount?: number
    // pagesize: number
    // offsetValue: number

    
}