export interface AgentListRequestModel {
    campaignId?: number
    autoTaggedId?: number
    agentName?: string
    pageSize: number
    offsetValue: number
    sortColumn: string
    sortOrder: string
    agentId?: string
}
