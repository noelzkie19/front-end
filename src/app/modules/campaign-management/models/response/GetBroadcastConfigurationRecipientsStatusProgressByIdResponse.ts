import {BaseModel} from "../../../user-management/models/BaseModel";

export interface GetBroadcastConfigurationRecipientsStatusProgressByIdResponse extends BaseModel{
    total:number;
    totalPending:number;
    totalDelivered:number;
    totalNotDelivered:number;
    broadcastStatusId:number;
    broadcastStatus:string;
}