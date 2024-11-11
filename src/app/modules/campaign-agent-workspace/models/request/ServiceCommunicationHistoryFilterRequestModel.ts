export interface ServiceCommunicationHistoryFilterRequestModel {
    campaignId: number;
	playerId: string;
    pageSize?: number;
	offsetValue?: number;
	sortColumn?: string;
	sortOrder?: string;
	brandName: string;
}