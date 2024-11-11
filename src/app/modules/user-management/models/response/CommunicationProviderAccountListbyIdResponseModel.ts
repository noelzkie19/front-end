export interface CommunicationProviderAccountListbyIdResponseModel {
	communicationProviderGuid: string;
	chatUserAccountId: number;
	messageTypeId: number;
	messageTypeName: string;
	accountId: string;
	chatUserAccountStatus: string;
	subscriptionId?: number;
}
