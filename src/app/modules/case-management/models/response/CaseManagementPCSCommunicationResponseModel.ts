export interface CaseManagementPCSCommunicationResponseModel {
	caseCommunicationId: number;
	externalId: string;
	playerId: string;
	playerName: string;
	agent: string;
	topicId: number;
	topicName: string;
	subtopicId: number;
	subtopicName: string;
	chatSurveyId: number;
	createdDate: string;
	summary: string;
	action: string;
	isOpen: boolean;
	communicationOwner: string;
	caseId: number;
	communicationStartDate: string;
}
