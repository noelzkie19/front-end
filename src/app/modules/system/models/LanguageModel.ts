
export interface LanguageModel {
    id?: number 
    languageName: string
    languageCode: string
    isComplete: boolean
    iCoreId?: number | null
    
    createdBy: string
    createdDate:string
    updatedBy: string
    updatedDate: string
}