import { LookupModel } from "../../../shared-models/LookupModel";
import { SearchFilterCustomLookupModel } from "./SearchFilterCustomLookupModel";

export interface TicketManagementLookupsModel {
    ticketType: Array<SearchFilterCustomLookupModel>,
    playerUsername: Array<SearchFilterCustomLookupModel>,
    status: Array<LookupModel>,
    assignee: Array<LookupModel>,
    reporter: Array<LookupModel>,
    currency: Array<LookupModel>,
    methodCurrency: Array<LookupModel>,
    vipGroup: Array<LookupModel>,
    vipLevel: Array<LookupModel>,
    userListTeams: Array<LookupModel>
}