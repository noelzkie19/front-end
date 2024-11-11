import { RequestModel } from "../../../system/models";

export interface UploadPlayerFilterModel  extends RequestModel {
    campaignId: number;
    guid: string;
    playerId: string;
    brand: string;
    status: string;
    lastDepositDateFrom?: string;
    lastDepositDateTo?: string;
    lastDepositAmountFrom: number | undefined;
    lastDepositAmountTo: number | undefined;
    bonusAbuser: number | undefined;
    username: string;
    pageSize?: number,
    offsetValue?: number,
    sortColumn?: string,
    sortOrder?: string
}