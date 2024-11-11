import {CustomerCaseCampaignIdModel} from '../request/CustomerCaseCampaignIdModel';
export interface CustomerServiceCaseInformationResponseModel {
	caseInformatIonId: number;
	playerId: string;
	username: string;
	caseCreatorId: number;
	caseCreatorName: string;
	subject: string;
	caseStatusName: string;
	caseTypeId: number;
	caseTypeName: string;
	topicLanguageId: number;
	topicLanguageTranslation: string;
	subtopicLanguageId: number;
	subtopicLanguageTranslation: string;
	languageId: number;
	languageCode: string;
	currencyCode: string;
	vipLevelName: string;
	paymentGroupName: string;
	brandId: number;
	brandName: string;
	createdBy: number;
	createdByName: string;
	createdDate: string;
	updatedBy: number;
	updatedByName: string;
	updatedDate: string;
	mlabPlayerId: number;
	campaignList: Array<CustomerCaseCampaignIdModel>;
}
