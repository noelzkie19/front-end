export interface AgentStatusRequestModel {
    queueId: string
    userId: string
    agentStatusList: UpsertAgentStatusModel[]
}

export interface UpsertAgentStatusModel {
    campaignAgentId: number
    agentStatus: boolean
    updatedBy: number
}
