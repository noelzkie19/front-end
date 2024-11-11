import { SubModuleDetailModel } from './SubModuleDetailModel'
export interface SubMainModuleModel {
    id?: number
    description: string
    read: boolean
    write: boolean
    subModuleDetails: Array<SubModuleDetailModel>
    createdBy : number
    updatedBy :  number
}
