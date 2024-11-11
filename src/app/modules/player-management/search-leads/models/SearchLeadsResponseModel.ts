import {LeadsResponse} from "./LeadsResponse";

export interface SearchLeadsResponseModel {
    leadsResult: Array<LeadsResponse>;
    recordCount: number
}