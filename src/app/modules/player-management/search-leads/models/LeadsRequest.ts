import {BaseModel} from "../../../user-management/models/BaseModel";

export interface LeadsRequest extends BaseModel{
    leadName: string;
    linkedPlayerUsername: string;
    stageIDs: string;
    sourceId: string;
    brandIDs: string;
    currencyIDs: string;
    vipLevelIDs: string;
    countryIDs: string;
    pageSize:number;
    offsetValue: number;
    sortColumn: string;
    sortOrder: string;
    leadIds?: string;
}