import {RequestModel} from "../../../system/models"
import { BroadcastConfigurationModel } from "../request/BroadcastConfigurationModel";
import { BroadcastConfigurationRecipientModel } from "../request/BroadcastConfigurationRecipientModel";

export interface BroadcastConfigurationResponse extends RequestModel {
    broadcastConfiguration?:BroadcastConfigurationModel;
    broadcastConfigurationRecipients?:Array<BroadcastConfigurationRecipientModel>;
}