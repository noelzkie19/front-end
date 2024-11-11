import { MessageResponseStatuses, MessageResponseTypesModel } from "..";

export interface MessageResponseList {
    messageResponseId: number,
    messageResponseName: string,
    messageStatusId: number,
    position: number,
    messageResponseStatus: boolean
    messageResponseStatuses: Array<MessageResponseStatuses>
    action?: string
    messageResponseTypes?: Array<MessageResponseTypesModel>
}