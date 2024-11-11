import { MessageStatusTypesModel } from "..";

export interface GetMessageStatusListResponse {
    messageStatusId : number,
    messageStatusName: string,
    messageStatusStatus: boolean,
    messageStatusTypes: Array<MessageStatusTypesModel> ,
    position: number,
    action?: string
}