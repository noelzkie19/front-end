import { ActiveEndedCampaignListModel
    , CampaignGoalSettingListModel
    , CommunicationRecordDepositListModel
    , GoalTypeCommunicationRecordUdtModel
    , GoalTypeDepositCurrencyMinMaxUdtModel
    , GoalTypeDepositUdtModel } from "..";


export interface CampaignGoalSettingIdResponseModel{
    campaignGoalSettingList:  CampaignGoalSettingListModel
    goalTypeCommunicationRecordList: Array<GoalTypeCommunicationRecordUdtModel>
    goalTypeDepositList:Array<GoalTypeDepositUdtModel>
    goalTypeDepositCurrencyMinMaxList: Array<GoalTypeDepositCurrencyMinMaxUdtModel>
    communicationRecordDepositList: Array<CommunicationRecordDepositListModel>
    campaignList: Array<ActiveEndedCampaignListModel>
}