import { SubMainModuleModel } from '../models/SubMainModuleModel'
import { SECURABLE_NAMES } from '../components/constants/SecurableNames'

export class UserManagementMock {
    public static table: Array<SubMainModuleModel> = [
        {
            id: 1,
            description: SECURABLE_NAMES.Teams,
            read: true,
            write: true,
            subModuleDetails: [],
            createdBy: 1,
            updatedBy: 1
        },
        {
            id: 2,
            description: SECURABLE_NAMES.Roles,
            read: false,
            write: false,
            subModuleDetails: [],
            createdBy: 1,
            updatedBy: 1
        },
        {
            id: 3,
            description: SECURABLE_NAMES.Users,
            read: false,
            write: false,
            subModuleDetails: [],
            createdBy: 1,
            updatedBy: 1
        },
    ];
}