import {AgentFilterResponseModel} from '../response/AgentFilterResponseModel'
import {LeaderJustificationFilterResponseModel} from '../response/LeaderJustificationFilterResponseModel'


export interface CallValidationFilterResponseModel {
    callCaseStatusOutcomes: Array<string>
    playerIds: Array<string>
    agentNames: Array<AgentFilterResponseModel>
    userNames: Array<string>
    justifications: Array<LeaderJustificationFilterResponseModel>
}