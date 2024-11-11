import { SubMainModuleModel } from '../models/SubMainModuleModel'
import { SECURABLE_NAMES } from '../components/constants/SecurableNames'

export class SystemMock {
    public static table: Array<SubMainModuleModel> = [
        {
            id: 1,
            description: SECURABLE_NAMES.OperatorAndBrand,
            read: true,
            write: true,
            subModuleDetails: [],
            createdBy: 1,
            updatedBy: 1
        },
    ];
}