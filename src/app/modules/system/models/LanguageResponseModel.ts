import { RequestModel } from './RequestModel';

export interface LanguageResponseModel extends RequestModel {
    id: number | null
    languageName: string
    languageCode: string
    isComplete: boolean
    iCoreId?: number | null
    
    createdBy: string
    createdDate:string
    updatedBy: string
    updatedDate: string
    recordCount?: number
   
}