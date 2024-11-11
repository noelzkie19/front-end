import { SubMainModuleModel } from '../models/SubMainModuleModel'
import { SECURABLE_NAMES } from '../components/constants/SecurableNames'

export class HomeModuleMock {
    public static table: Array<SubMainModuleModel> = [
        {
            id: 1,
            description: SECURABLE_NAMES.PlayerEngagement,
            read: true,
            write: true,
            subModuleDetails: [],
            createdBy: 1,
            updatedBy: 1
        },
        {
            id: 2,
            description: SECURABLE_NAMES.Marketing,
            read: false,
            write: false,
            subModuleDetails: [],
            createdBy: 1,
            updatedBy: 1
        },

    ];
}