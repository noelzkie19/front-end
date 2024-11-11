export interface CampaignConfigurationAutoTaggingModel {
    campaignConfigurationAutoTaggingId : number,
    campaignConfigurationId : number,
    segmentName: string,
    priorityNumber: number,
    taggingConfigurationId : number,
    isActive : boolean,
    campaignSettingId: number,
    segmentId: number
}


export function CampaignConfigurationAutoTaggingModelFactory() {
    const obj: CampaignConfigurationAutoTaggingModel = {
        campaignConfigurationAutoTaggingId : 0,
        campaignConfigurationId : 0,
        priorityNumber: 0,
        segmentName: '',
        taggingConfigurationId : 0,
        isActive : false,
        campaignSettingId: 0,
        segmentId : 0
    }
    return obj
}