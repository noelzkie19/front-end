export interface GetMessageResponseList {
    queueId: string,
    userId: string,
    messageResponseName: string,
    messageResponseStatus: string,
    messageStatusIds: string,
    messageStatusId: number | null
}