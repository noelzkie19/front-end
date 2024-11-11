import { TeamModel } from '../models/TeamModel'
import { OperatorsMock } from '../../system/_mocks_/OperatorsMock'
import { BrandsMock } from '../../system/_mocks_/BrandsMock'
import { CurrenciesMock } from '../../system/_mocks_/CurrenciesMock'
import { RolesMock } from '../_mocks_/RolesMock'

export class TeamsMock {
    public static table: Array<TeamModel> = [
        {
            id: "1",
            name: "M88 CS Office Indonesia 1",
            status: 1,
            operators: OperatorsMock.table,
            brands: BrandsMock.table,
            currencies: CurrenciesMock.table,
            roles: RolesMock.table,
            createdBy: 'User',
            createdDate: '',
            updatedBy: '',
            updatedDate: '',
            description: 'description1',
            teamRestrictionDetails :  [{ operatorId: 1, accessRestrictionFieldId: 3, accessRestrictionFieldValue : 2 , teamId: 1 }]
        },
        {
            id: "2",
            name: "M88 CS Office Indonesia 2",
            status: 1,
            operators: OperatorsMock.table,
            brands: BrandsMock.table,
            currencies: CurrenciesMock.table,
            roles: RolesMock.table,
            createdBy: 'User',
            createdDate: '',
            updatedBy: '',
            updatedDate: '',
            description: 'description2',
            teamRestrictionDetails : [{ operatorId: 0, accessRestrictionFieldId: 1, accessRestrictionFieldValue : 2 , teamId: 1 }]
        },
        {
            id: "3",
            name: "M88 CS Office Indonesia 3",
            status: 1,
            operators: OperatorsMock.table,
            brands: BrandsMock.table,
            currencies: CurrenciesMock.table,
            roles: RolesMock.table,
            createdBy: 'User',
            createdDate: '',
            updatedBy: '',
            updatedDate: '',
            description: 'description3',
            teamRestrictionDetails :  [{ operatorId: 3, accessRestrictionFieldId: 2, accessRestrictionFieldValue : 1 , teamId: 2 }]
        },
    ]
}
