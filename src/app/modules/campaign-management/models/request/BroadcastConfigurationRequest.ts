import {RequestModel} from "../../../system/models"
import { BroadcastConfigurationModel } from "./BroadcastConfigurationModel";
import { BroadcastConfigurationRecipientModel } from "./BroadcastConfigurationRecipientModel";

export interface BroadcastConfigurationRequest extends RequestModel {
    broadcastConfiguration?:BroadcastConfigurationModel;
    broadcastConfigurationRecipients?:Array<BroadcastConfigurationRecipientModel>;
}