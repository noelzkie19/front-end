import { AddCommunicationFeedbackRequest, AddCommunicationSurveyRequest } from "..";

export interface AddCommunicationRequest {
    caseCommunicationId: number,
    caseInformationId: number
    purposeId: number
    messageTypeId: number
    messageStatusId: number
    messageReponseId: number
    startCommunicationDate: string
    endCommunicationDate: string
    communicationContent: string
    communicationSurveyQuestion: Array<AddCommunicationSurveyRequest>
    communicationFeedBackType: Array<AddCommunicationFeedbackRequest>
    createdBy: number
    updatedBy: number
}