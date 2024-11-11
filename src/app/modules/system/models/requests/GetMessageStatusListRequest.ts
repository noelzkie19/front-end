export interface GetMessageStatusListRequest {
    queueId: string,
    userId: string,
    messageStatusName: string
    messageStatusStatus: string
    messageTypeId: number
    messageTypeIds: string | null
}