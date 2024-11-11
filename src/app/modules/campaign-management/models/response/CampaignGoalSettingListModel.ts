export interface CampaignGoalSettingListModel {
    campaignSettingId: number;
    campaignSettingName: string;
    campaignSettingDescription: string;
    goalParameterCountName: string;
    goalParameterAmountName: string;
    goalParameterAmountId: number;
    goalParameterCountId: number;
    selected: boolean
}
export function CampaignGoalSettingListModelFactory() {
    const obj: CampaignGoalSettingListModel = {
        campaignSettingId: 0,
        campaignSettingName:'',
        campaignSettingDescription: '',
        goalParameterAmountName: '',
        goalParameterCountName: '',
        goalParameterAmountId : 0,
        goalParameterCountId: 0,
        selected: false
    }
    return obj
}