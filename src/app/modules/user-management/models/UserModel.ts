
import { TeamInfoModel } from '../models/TeamInfoModel'
import { OperatorInfoModel } from '../models/OperatorInfoModel'
import { BrandInfoModel } from '../models/BrandInfoModel'
import { CurrencyInfoModel } from '../models/CurrencyInfoModel'
import { RoleInfoModel } from '../models/RoleInfoModel'
import { TeamModel } from './TeamModel'
import { UserProviderAccount } from './UserProviderAccount'
import { TeamAssignmentResponseModel } from '../../ticket-management/models/response/TeamAssignmentResponseModel'
import { CurrencyModel } from '../../system/models'

export interface UserModel {
    userId: string
    fullname: string
    email: string
    status: number
    teams: Array<TeamModel>
    // operators: Array<OperatorInfoModel>
    // brands: Array<BrandInfoModel>
    // currencies: Array<CurrencyInfoModel>
    // roles: Array<RoleInfoModel>
    createdBy: string
    // createdDate: string
    // updatedBy: string
    // updatedDate: string
    
    providerAccountDetails?: Array<UserProviderAccount>
    ticketTeamAssignments: Array<TeamAssignmentResponseModel>;
    ticketCurrencyAssignments: Array<CurrencyModel>
    mCoreUserId: string
}


