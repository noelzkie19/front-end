import { RequestModel } from './RequestModel';

export interface CountryResponseModel extends RequestModel {
    id: number | null
    countryName: string
    countryCode: string
    isComplete: boolean
    iCoreId?: number | null
    
    createdBy: string
    createdDate:string
    updatedBy: string
    updatedDate: string
    recordCount?: number
   
}