import {CustomerCommunicationFeedBackTypeRequestModel, CustomerCommunicationSurveyQuestionRequestModel} from '..';

export interface CustomerCaseCommunicationRequestModel {
	caseCommunicationId: number;
	caseInformationId: number;
	purposeId: number;
	messageTypeId: number;
	messageStatusId: number;
	messageReponseId: number;
	startCommunicationDate: string;
	endCommunicationDate: string;
	communicationContent: any;
	duration: number;
	surveyTemplateId: number | null;
	communicationSurveyQuestion: Array<CustomerCommunicationSurveyQuestionRequestModel>;
	communicationFeedBackType: Array<CustomerCommunicationFeedBackTypeRequestModel>;
	communicationOwner: number;
	createdBy: number;
	updatedBy: number;
}
