export interface TeamDataAccessRestrictionListModel {
    teamRestrictionId: string //generate tempId for editing but this will not use as PK in table
    operatorId: string  
    operatorName: string 
    currencies: string
    brands: string
    vipLevels:  string
    countries:string
}

