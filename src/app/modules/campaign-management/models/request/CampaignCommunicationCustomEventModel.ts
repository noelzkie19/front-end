export interface CampaignCommunicationCustomEventModel {
	campaignCommunicationCustomEventId: number;
	campaignCommunicationSettingId: number;
	currencyId: number;
	currencyCode: string;
	countryIds: string;
	countryNames: string;
	campaignEventSettingId: number | null;
	campaignEventName?: string;
}
