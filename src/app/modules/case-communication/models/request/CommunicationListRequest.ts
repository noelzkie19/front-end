export interface CommunicationListRequest {
    queueId: string,
    userId: string,
    pageSize: number
    offsetValue: number
    sortColumn: string
    sortOrder : string
    caseInformatIonId: number
}