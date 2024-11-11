import { CampaignGoalSettingListModel } from "../CampaignGoalSettingListModel";

export interface CampaignGoalSettingByFilterResponseModel{
    totalRecordCount: number
    campaignGoalSettingList: Array<CampaignGoalSettingListModel>
}