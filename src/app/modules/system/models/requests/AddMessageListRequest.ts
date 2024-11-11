import { MessageTypeListResponse } from "..";

export interface AddMessageListRequest {
    queueId: string
    userId: string
    codeListId: number
    isActive: boolean
    messageTypes: MessageTypeListResponse
}