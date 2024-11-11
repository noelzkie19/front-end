export interface AgentResponseModel {
    campaignName: string
    agentName: string
    agentId: number
    campaignID: number
    status: boolean
    taggedCountForTheCampaignPeriod: number
    taggedCountToday: number
    lastTaggedDateAndTime: string
    autoTaggingName: string
    campaignAgentId: number
    campaignStatus: number
}
