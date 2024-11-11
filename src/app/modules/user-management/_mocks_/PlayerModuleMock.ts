import { SubMainModuleModel } from '../models/SubMainModuleModel'
import { SECURABLE_NAMES } from '../components/constants/SecurableNames'

export class PlayerModuleMock {
    public static table: Array<SubMainModuleModel> = [
        {
            id: 1,
            description: SECURABLE_NAMES.PlayerSearch,
            read: true,
            write: true,
            subModuleDetails: [],
            createdBy: 1,
            updatedBy: 1
        },
        {
            id: 2,
            description: SECURABLE_NAMES.ImportPlayerList,
            read: false,
            write: false,
            subModuleDetails: [],
            createdBy: 1,
            updatedBy: 1
        },
        {
            id: 3,
            description: SECURABLE_NAMES.DownloadSearchResult,
            read: false,
            write: false,
            subModuleDetails: [],
            createdBy: 1,
            updatedBy: 1
        },
        {
            id: 4,
            description: SECURABLE_NAMES.OutputFilterTemplate,
            read: false,
            write: false,
            subModuleDetails: [],
            createdBy: 1,
            updatedBy: 1
        },
        {
            id: 5,
            description: SECURABLE_NAMES.PlayerProfile,
            read: false,
            write: false,
            subModuleDetails: [],
            createdBy: 1,
            updatedBy: 1
        },

    ];
}