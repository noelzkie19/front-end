export interface CampaignDetailsModel {
    campaignId: number,
    campaignName: string,
    campaignStatus: string,
    campaignPlayerCount: number,
    campaignEligibility: string,
    campaignPrimaryGoalCount: number,
    campaignCallListCount?: number,
    cardSelected: boolean
}