export interface AgentValidationsRequestModel {
    queueId: string
    userId: string
    agentValidationStatus: boolean
    agentValidationNotes: string
    isAgentValidated: boolean
    campaignPlayerId: number
    createdBy: number
    updatedBy: number
    agentValidationId: number
}
