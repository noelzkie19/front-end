export interface CampaignPlayerResponseModel {
	playerId: string;
	username: string;
	status: boolean;
	brand: string;
	currency: string;
	registeredDate: string;
	marketingSource: string;
	campaignType: string;
	campaignId: number;
	campaignName: string;
	campaignStatusId: number;
	ftdAmount: number;
	ftdDate: string;
	agentId: number | undefined;
	agentName: string;
	taggedBy: number | undefined;
	taggedDate: string;
	lastCallStatus: string;
	lastCallResponse: string;
	campaignLastCallDate: string;
	campaignPrimaryGoalReached: string;
	campaignPrimaryGoalCount: number;
	campaignPrimaryGoalAmount: number;
	country: string;
	contactableCaseCount: number;
	campaignLastContactableCaseDate: string;
	callListId: number;
	callListNoteId: number;
	caseInformationId: number;
	caseStatusId: number;
	initialDepositAmount: number;
	initialDepositDate: string;
	intialDepositMethod: string;
	intialDeposited: string;
	totalDepositAmount: number;
	totalDepositCount: number;
	isWithEmailAndWebPushCommumication: number;
	lastLoginDate: string;
	hasServiceCase: boolean;
}
