export interface SurveyAndFeedbackExportModel {
	CampaignType: string;
	CampaignName: string;
	Currency: string;
	TimePeriod: string;
	PeriodSelection: string;
	DateStart: string | undefined;
	DateEnd: string | undefined;
	IncludeDiscardPlayerTo: string;
}
