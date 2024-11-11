export interface CampaignCommunicationResponseModel {
	campaignType: string;
	campaignName: string;
	communicationId: number | string;
	playerId: string;
	callListId: number | string;
	caseId: number | string;
	caseTopic: string;
	caseSubTopic: string;
	caseCreatedDate: string;
	caseUpdatedDate: string;
	caseCreatedBy: string;
	caseUpdatedBy: string;
	commMessageType: string;
	commMessageStatus: string;
	commMessageResponse: string;
	commEndDate: string;
	commStartDate: string;
	commContent: string;
	commCreatedBy: string;
	commCreatedDate: string;
	commUpdatedBy: string;
	commUpdatedDate: string;
}

export function CampaignCommunicationResponseModelFactory() {
	const initialData: CampaignCommunicationResponseModel = {
		campaignType: '',
		campaignName: '',
		communicationId: '',
		playerId: '',
		callListId: '',
		caseId: '',
		caseTopic: '',
		caseSubTopic: '',
		caseCreatedDate: '',
		caseUpdatedDate: '',
		caseCreatedBy: '',
		caseUpdatedBy: '',
		commMessageType: '',
		commMessageStatus: '',
		commMessageResponse: '',
		commEndDate: '',
		commStartDate: '',
		commContent: '',
		commCreatedBy: '',
		commCreatedDate: '',
		commUpdatedBy: '',
		commUpdatedDate: '',
	};

	return initialData;
}
