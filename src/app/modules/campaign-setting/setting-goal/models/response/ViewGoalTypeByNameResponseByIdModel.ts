import { GoalTypeCommunicationRecordUdtModel } from "../GoalTypeCommunicationRecordUdtModel";
import { GoalTypeDepositCurrencyMinMaxUdtModel } from "../GoalTypeDepositCurrencyMinMaxUdtModel";
import { GoalTypeDepositUdtModel } from "../GoalTypeDepositUdtModel";

export interface ViewGoalTypeByNameResponseByIdModel{
    goalTypeCommunicationRecordUdt: GoalTypeCommunicationRecordUdtModel
    goalTypeDepositUdt: GoalTypeDepositUdtModel
    goalTypeDepositCurrencyMinMaxUdt: GoalTypeDepositCurrencyMinMaxUdtModel
}