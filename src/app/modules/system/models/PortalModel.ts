export interface PortalModel {
    id: number | null
    signUpPortalName: string
    iCoreId?: number | null
    
    createdBy: string
    createdDate:string
    updatedBy: string
    updatedDate: string
    recordCount?: number
}