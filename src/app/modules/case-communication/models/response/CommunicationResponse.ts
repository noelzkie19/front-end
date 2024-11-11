export interface CommunicationResponse {
    caseCommunicationId: number
    caseInformationId: number
    purposeId: number
    purposeName: string
    messagetypeId: number
    messageTypeName: string
    messagestatusId: number
    messageStatusName: string
    messageresponseId : number
    messageResponseName: string
    startCommunicationDate: string
    endCommunicationDate: string
    communicationContent: string
    createdBy?: number
    createdByName?:string
    createdDate?: string
    updatedBy?: number
    updatedByName?: string
    updatedDate?:string
    reportedDate: string
}

