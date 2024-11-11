
export interface CampaignInformationModel {
	campaignInformationId: number;
	campaignId: number;
	campaignTypeId: number;
	brandId: number;
	campaignDescription: string;
	campaignPeriodFrom: Date | string;
	campaignPeriodTo: Date | string;
	campaignReportPeriod: number;
	surveyTemplateId: number;
	campaignJourneyName: string;
}

export function CampaignInformationModelFactory() {
	const obj: CampaignInformationModel = {
		campaignInformationId: 0,
		campaignId: 0,
		campaignTypeId: 0,
		brandId: 0,
		campaignDescription: '',
		campaignPeriodFrom: '',
		campaignPeriodTo: '',
		campaignReportPeriod: 0,
		surveyTemplateId: 0,
		campaignJourneyName: '',
	};
	return obj;
}
