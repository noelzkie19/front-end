import { FormatNumberOptions } from 'react-intl';
import { MainModuleModel } from './MainModuleModel'
export interface RoleRequestModel {
    id: number
    name: string
    description: string
    status: number
    securableObjects?: Array<MainModuleModel>
    createdBy: number
    updatedBy?: number,
    queueId: string,
    userId: string,
}
