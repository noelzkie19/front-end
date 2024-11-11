export interface CustomerCaseCommunicationInfoResponseModel {
    caseInformationId :number
    caseCommunicationId :number
    externalCommunicationId :number
    purpose: number
    purposeId:string
    messageType:number
    messageTypeId: number
    communicationOwnerName:string
    communicationOwner: number
    messageStatus:string
    messageStatusId : number
    messageResponse:string
    messageResponseId: number
    startCommunicationDate :string
    endCommunicationDate :string
    duration :string
    communicationContent :string
    createdDate :string
    updatedDate:string
    createdBy: number
    updatedBy : number
    surveyTemplateId: number | null
    reportedDate: string
}