export interface CampaignIncentiveDataSourceModel {
    campaignIncentiveDataSourceId : number,
    campaignSettingName: string,
    campaignConfigurationId : number,
    campaignSettingId : number | null,
    amountParameterId :number,
    countParameterId: number,
}

export function CampaignIncentiveDataSourceModelFactory() {
    const obj: CampaignIncentiveDataSourceModel = {
        campaignIncentiveDataSourceId : 0,
        campaignConfigurationId : 0,
        campaignSettingId : null,
        campaignSettingName: '',
        amountParameterId: 0,
        countParameterId : 0
    }
    return obj
}