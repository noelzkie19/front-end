export interface CampaignPerformanceRequestModel {
	queueId: string;
	userId: string;
	timePeriod: number;
	periodSelection: number;
	dateFieldStart: string | undefined;
	dateFieldEnd: string | undefined;
	campaignId: number;
	campaignGoalId: number;
	includeDiscardPlayerTo: boolean;
	campaignTypeId?: number;
}
