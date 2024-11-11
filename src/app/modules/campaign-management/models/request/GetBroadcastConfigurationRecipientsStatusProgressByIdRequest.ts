import { RequestModel } from "../../../system/models";

export interface GetBroadcastConfigurationRecipientsStatusProgressByIdRequest extends RequestModel{
    broadcastConfigurationId: number;
}