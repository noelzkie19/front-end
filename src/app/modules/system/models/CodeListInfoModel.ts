import { BaseModel } from './../../user-management/models/BaseModel';
export interface CodeListInfoModel extends BaseModel {
    id: number
    codeListName: string
    isActive: boolean
    fieldTypeId: number
    codeListTypeId: number
    parentId: number | null
    createdBy: number
}