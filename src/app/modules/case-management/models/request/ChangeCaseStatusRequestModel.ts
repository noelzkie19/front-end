export interface ChangeCaseStatusRequestModel {
    queueId: string,
    userId: string,
    caseInformationIds: number
    caseStatusId: number
}