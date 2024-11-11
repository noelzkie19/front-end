import {CustomerCaseCommunicationRequestModel} from '..';
import {BaseRequest} from '../../../../shared-models/BaseRequest';
import {CustomerCaseCampaignIdModel} from './CustomerCaseCampaignIdModel';

export interface UpSertCustomerServiceCaseCommunicationRequestModel extends BaseRequest {
	mlabPlayerId: number;
	caseInformationId: number;
	caseCreatorId: number;
	caseTypeId: number;
	caseStatusId: number;
	subtopicLanguageId: number;
	topicLanguageId: number;
	subject: string;
	brandId: number;
	languageId: number;
	caseCommunication?: CustomerCaseCommunicationRequestModel;
	campaignIds?: Array<CustomerCaseCampaignIdModel>;
	createdBy: number;
	updatedBy: number;
}
