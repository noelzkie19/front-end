import { CallValidationResponseModel } from './CallValidationResponseModel'
import { AgentValidationsResponseModel } from './AgentValidationsResponseModel'
import { LeaderValidationsResponseModel } from './LeaderValidationsResponseModel'
import { CallEvaluationResponseModel } from './CallEvaluationResponseModel'

export interface CallValidationListResponseModel {
   callValidations: Array<CallValidationResponseModel>
   agentValidations: Array<AgentValidationsResponseModel>
   leaderValidations: Array<LeaderValidationsResponseModel>
   callEvaluations: Array<CallEvaluationResponseModel>
   recordCount: number
}
