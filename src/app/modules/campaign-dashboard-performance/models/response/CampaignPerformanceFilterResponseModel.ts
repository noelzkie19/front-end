import { CampaignActiveAndEndedResponseModel } from './CampaignActiveAndEndedResponseModel'
import { CampaignGoalResponseModel } from './CampaignGoalResponseModel'


export interface CampaignPerformanceFilterResponseModel {
   campaigns: Array<CampaignActiveAndEndedResponseModel>
   campaignGoals: Array<CampaignGoalResponseModel>
}
