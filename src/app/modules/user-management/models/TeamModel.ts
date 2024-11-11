import { OperatorModel } from '../../system/models/OperatorModel'
import { BrandModel } from '../../system/models/BrandModel'
import { CurrencyModel } from '../../system/models/CurrencyModel'
import { RoleModel } from './RoleModel'
import { TeamRestrictionRequestModel } from './TeamRestrictionRequestModel'

export interface TeamModel {
    id: string
    name: string
    status: number
    operators: Array<OperatorModel>
    brands: Array<BrandModel>
    currencies: Array<CurrencyModel>
    roles: Array<RoleModel>
    teamRestrictionDetails: Array<TeamRestrictionRequestModel>
    createdBy: string
    createdDate: string
    updatedBy: string
    updatedDate: string
    description: string
}


