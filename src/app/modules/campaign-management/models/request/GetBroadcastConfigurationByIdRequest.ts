import {BaseModel} from "../../../user-management/models/BaseModel";

export interface GetBroadcastConfigurationByIdRequest extends BaseModel{
    broadcastConfigurationId: number;
    pageSize:number;
    offsetValue: number;
    sortColumn: string;
    sortOrder: string;
}