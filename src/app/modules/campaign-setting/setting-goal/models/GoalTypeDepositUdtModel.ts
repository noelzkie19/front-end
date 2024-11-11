import { Guid } from "guid-typescript";

export interface GoalTypeDepositUdtModel {
    goalTypeDepositId: number
    sequenceId: number
    sequenceName: string
    goalTypeId: number
    campaignSettingId: number
    goalTypeTransactionTypeId: number
    goalTypeDataSourceId: number
    goalTypePeriodId: number
    createdBy: number
    //createdDate: string
    updatedBy: number
    //updatedDate: string
    depositGuid?: string
}