import { MainModuleModel } from '../models/MainModuleModel'
import { SECURABLE_NAMES } from '../components/constants/SecurableNames'
import { HomeModuleMock } from './HomeModuleMock'
import { PlayerModuleMock } from './PlayerModuleMock'
import { UserManagementMock } from './UserManagementMock'
import { SystemMock } from './SystemMock'

export class MainModuleMock {
    public static table: Array<MainModuleModel> = [
        {
            id: 1,
            description: SECURABLE_NAMES.Home,
            read: true,
            write: true,
            subMainModuleDetails: HomeModuleMock.table,
            createdBy : 1,
            updatedBy : 1
        },
        {
            id: 1,
            description: SECURABLE_NAMES.Player,
            read: true,
            write: true,
            subMainModuleDetails: PlayerModuleMock.table,
            createdBy : 1,
            updatedBy : 1
        },
        {
            id: 1,
            description: SECURABLE_NAMES.UserManagement,
            read: true,
            write: true,
            subMainModuleDetails: UserManagementMock.table,
            createdBy : 1,
            updatedBy : 1
        },
        {
            id: 1,
            description: SECURABLE_NAMES.System,
            read: true,
            write: false,
            subMainModuleDetails: SystemMock.table,
            createdBy : 1,
            updatedBy : 1
        },


    ];
}