
export interface PlayerStatusModel {
    id: number
    playerStatusName: string
    iCoreId?: number | null
    
    createdBy: string
    createdDate:string
    updatedBy: string
    updatedDate: string
    recordCount?: number
}