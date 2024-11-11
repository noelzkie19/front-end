export interface CustomerCaseCommunicationInfo {
    caseCommunicationId: number;
    externalCommunicationId: string;
    purpose: string;
    messageType: string;
    messageTypeId?: number;
    communicationOwner: string;
    communicationOwnerName :string;
    messageStatus: string;
    messageResponse: string;
    startCommunicationDate: string;
    endCommunicationDate: string;
    duration: string;
    communicationContent: string;
    createdDate: string;
    updatedDate: string;
    createdByName: string;
    createdBy: string;
    updatedByName: string;
    updatedBy: string;
    surveyTemplateId: number | null;
    reportedDate: string;
}