export interface CodeListModel {
    id: number
    position?: number
    codeListName: string
    isActive: boolean
    fieldTypeId: number
    fieldTypeName: string
    codeListTypeId: number
    codeListTypeName: string
    parentId: number | null
    parentCodeListName: string
    createdBy: number,
    createdByName?: string
    createdDate?: string
    updatedBy?: number
    updatedByName?: string
    updatedDate?: string
    route?: string
}