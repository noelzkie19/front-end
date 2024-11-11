import {BaseModel} from "../../../user-management/models/BaseModel";
import { BroadcastConfigurationModelResponse } from "./BroadcastConfigurationModelResponse";
import { BroadcastConfigurationRecipientModelResponse } from "./BroadcastConfigurationRecipientModelResponse";

export interface GetBroadcastConfigurationByIdResponse extends BaseModel{
    broadcastConfiguration: BroadcastConfigurationModelResponse;
    broadcastConfigurationRecipients:Array<BroadcastConfigurationRecipientModelResponse>;
    recordCount: number;
}