import { BaseRequestModel } from "..";
import { GoalTypeCommunicationRecordUdtModel } from "../GoalTypeCommunicationRecordUdtModel";
import { GoalTypeDepositCurrencyMinMaxUdtModel } from "../GoalTypeDepositCurrencyMinMaxUdtModel";
import { GoalTypeDepositUdtModel } from "../GoalTypeDepositUdtModel";


export interface CampaignGoalSettingRequestModel extends BaseRequestModel{
    campaignSettingId: number
    campaignSettingName: string
    campaignSettingDescription: string
    isActive: boolean
    goalTypeCommunicationRecordList: Array<GoalTypeCommunicationRecordUdtModel>
    goalTypeDepositList:Array<GoalTypeDepositUdtModel>
    goalTypeDepositCurrencyMinMaxList: Array<GoalTypeDepositCurrencyMinMaxUdtModel>
    goalParameterAmountId: number
    goalParameterCountId: number
    createdBy: number
    //createdDate: string
    updatedBy: number
    //updatedDate: string
}