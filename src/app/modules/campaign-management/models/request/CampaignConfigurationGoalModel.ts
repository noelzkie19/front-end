export interface CampaignConfigurationGoalModel {
   campaignConfigurationGoalId: number;
   campaignConfigurationId: number;
   campaignGoalSettingId: number;
   campaignSettingDescription: string;
   campaignSettingName: string;
   goalParameterAmountId: number;
   goalParameterAmountName: string;
   goalParameterCountId: number;
   goalParameterCountName: string;
   
}

export function CampaignConfigurationGoalModelFactory() {
    const obj: CampaignConfigurationGoalModel = {
        campaignConfigurationGoalId: 0,
        campaignConfigurationId: 0,
        campaignGoalSettingId: 0,
        campaignSettingDescription: '',
        campaignSettingName: '',
        goalParameterAmountId: 0,
        goalParameterAmountName: '',
        goalParameterCountId: 0,
        goalParameterCountName: ''
      
    }
    return obj
}