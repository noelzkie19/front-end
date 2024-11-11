import { MessageStatusPostRequest } from "..";

export interface AddMessageStatusRequest {
    queueId: string,
    userId: string,
    codeListId: number,
    isActive: boolean,
    messageStatus: Array<MessageStatusPostRequest>
}