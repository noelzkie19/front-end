import { OperatorModel } from '../../system/models/OperatorModel'
import { RoleSelectedModel } from './RoleSelectedModel'
import { TeamRestrictionRequestModel } from './TeamRestrictionRequestModel'
export interface TeamRequestModel {
    teamId: number
    operatorDetail: Array<OperatorModel>,
    roles: Array<RoleSelectedModel>,
    teamRestrictionDetail : Array<TeamRestrictionRequestModel>,
    teamDescription: string,
    teamName: string
    teamStatus: number,
    CreatedBy: number,
    UpdatedBy: number,
    queueId: string,
    userId: string
}
