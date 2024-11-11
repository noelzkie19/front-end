import {AddCommunicationRequest} from './AddCommunicationRequest';

export interface AddCaseCommunicationRequest {
	queueId: string;
	userId: string;
	playerId: string;
	caseInformationId: number;
	caseCreatorId: number;
	caseTypeId: number;
	campaignId: number;
	caseStatusId: number;
	topicId: number;
	subtopicId: number;
	callListNoteId: number;
	callListNote: string;
	callingCode?: string;
	hasFlyfoneCdr?: boolean;
	caseCommunication: AddCommunicationRequest;
	subscriptionId?: number;
	brandName: string
}
