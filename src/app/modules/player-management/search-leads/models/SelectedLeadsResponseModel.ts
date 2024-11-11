import { BroadcastConfigurationRecipientModel } from "../../../campaign-management/models/request/BroadcastConfigurationRecipientModel";

export interface SelectedLeadsResponseModel {
    leadsResult: Array<BroadcastConfigurationRecipientModel>;
}