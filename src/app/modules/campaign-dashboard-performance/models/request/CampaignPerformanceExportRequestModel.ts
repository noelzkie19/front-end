export interface CampaignPerformanceExportRequestModel {
	timePeriod: string;
	periodSelection: string;
	dateFieldStart: string | undefined;
	dateFieldEnd: string | undefined;
	campaignType: string;
	campaignName: string;
	campaignGoal: string;
	includeDiscardPlayerTo: string;
}
