import { LookupModel } from "./LookupModel";

export interface CustomLookupModel extends LookupModel {
    hasTableau:boolean;
    dataSourceId: number;
}