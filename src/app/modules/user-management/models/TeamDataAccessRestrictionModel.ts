import { LookupModel } from "../../../common/model"

export interface TeamDataAccessRestrictionModel {
    teamRestrictionId: string //generate tempId for editing but this will not use as PK in table
    operatorId: string  | undefined
    operatorName: string  | undefined
    currencies: Array<LookupModel>
    brands: Array<LookupModel>
    vipLevels:  Array<LookupModel>
    countries:Array<LookupModel>
}

