export interface CaseCampaignByIdRequest {
    queueId: string,
    userId: string,
    playerId: string,
    campaignId: number,
    brandName?: string
}