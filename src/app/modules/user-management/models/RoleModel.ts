import { MainModuleModel } from './MainModuleModel'
export interface RoleModel {
    roleId: string
    roleName: string
    roleDescription: string
    status: number
    securableObjects?: Array<MainModuleModel>
    createdBy: string
    createdDate?: string
    updatedBy?: string
    updatedDate?: string
}




