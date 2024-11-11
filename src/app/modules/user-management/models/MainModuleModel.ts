import { SubMainModuleModel } from './SubMainModuleModel'
export interface MainModuleModel {
    id?: number
    description: string
    read: boolean
    write: boolean
    subMainModuleDetails: Array<SubMainModuleModel>
    createdBy: number
    updatedBy: number
}
