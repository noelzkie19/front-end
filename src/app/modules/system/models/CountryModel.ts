export interface CountryModel {
    countryId?: number
    countryName: string
    countryCode: string
    isComplete: boolean
    status?: number
    createdBy: string
    createdDate: string
    updatedBy: string
    updatedDate: string
    iCoreId?: number | null
}